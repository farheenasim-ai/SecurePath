import re
from urllib.parse import urlparse
from typing import Set, List, Dict, Optional, Tuple
from backend.database import get_db

# Layer 1: Domain Trust (From SafeBrowse AI)
TRUSTED_TLDS = ['.edu', '.gov', '.mil', '.ac.uk', '.edu.au', '.gov.au']
EDUCATIONAL_DOMAINS = [
    'wikipedia.org', 'webmd.com', 'mayoclinic.org', 'nih.gov', 'cdc.gov',
    'who.int', 'britannica.com', 'khanacademy.org', 'coursera.org', 'edx.org',
    'stackoverflow.com', 'github.com', 'w3schools.com', 'mdn.io', 'mozilla.org'
]

# Ethical / Hate Speech Keywords (From SafeBrowse AI)
HATE_KEYWORDS = [
  'white power', 'aryan', 'jihad', 'crusade', 'incel', 'chads', 'stacy',
  'kike', 'nigger', 'faggot', 'tranny', 'dyke', 'retard', 'subhuman',
  'pure blood', 'ethnic cleansing', 'genocide hoax', 'race realism'
]

class PolicyEngine:
    def __init__(self):
        self.blacklist: List[Dict] = []
        self.blacklist_domains: Set[str] = set()
        self.keywords: List[Dict] = []
        self.categories_state: Dict[str, bool] = {}
        self.is_initialized = False
        self.hate_pattern = self.compile_safe_pattern(HATE_KEYWORDS)

    def compile_safe_pattern(self, keywords: List[str]) -> re.Pattern:
        """Compile keywords into a regex with word boundaries for precision."""
        # Ensure we don't have empty strings and escape special characters
        valid_keywords = [re.escape(k.strip()) for k in keywords if k.strip()]
        if not valid_keywords:
            return re.compile(r'$.^') # Matches nothing
        pattern = r'\b(' + '|'.join(valid_keywords) + r')\b'
        return re.compile(pattern, re.IGNORECASE)

    def normalize_text(self, text: str) -> str:
        """Remove obfuscation (dots, spaces) to catch things like p.o.r.n."""
        # Only normalize if we think it might be obfuscated (short segments)
        # For simplicity, we just lower and strip common symbols
        return re.sub(r'[\s\._\-]', '', text).lower()

    def calculate_domain_trust(self, url: str) -> float:
        """Returns a trust score between 0.0 and 1.0."""
        try:
            parsed = urlparse(url.lower())
            hostname = parsed.hostname or ""
            if not hostname: return 0.0
            
            if any(hostname.endswith(tld) for tld in TRUSTED_TLDS):
                return 1.0
            if any(hostname == d or hostname.endswith('.' + d) for d in EDUCATIONAL_DOMAINS):
                return 0.8
            return 0.0
        except:
            return 0.0

    async def refresh_policies(self):
        """Load policies and categories from MongoDB into memory."""
        db = get_db()
        
        # Load categories
        cat_cursor = db.categories.find()
        self.categories_state = {c["name"]: c["enabled"] for c in await cat_cursor.to_list(length=100)}
        
        # Load blacklist
        blacklist_cursor = db.policies.find({"type": "blacklist"})
        self.blacklist = []
        blacklist_data = await blacklist_cursor.to_list(length=10000)
        
        for p in blacklist_data:
            cat = p.get("category", "General")
            if self.categories_state.get(cat, True):
                self.blacklist.append({
                    "domain": p["value"].lower().strip(),
                    "category": cat,
                    "reason": p.get("reason", "Blacklisted domain")
                })
        
        self.blacklist_domains = {p["domain"] for p in self.blacklist}
        
        # Load keywords and compile them
        keyword_cursor = db.policies.find({"type": "keyword"})
        keywords_data = await keyword_cursor.to_list(length=10000)
        
        self.keywords = []
        for p in keywords_data:
            cat = p.get("category", "Restricted")
            if self.categories_state.get(cat, True):
                self.keywords.append({
                    "pattern": p["value"].lower().strip(),
                    "regex": self.compile_safe_pattern([p["value"]]),
                    "reason": p.get("reason", "Keyword match"),
                    "category": cat
                })
        
        self.is_initialized = True
        print(f"Policy Engine upgraded: {len(self.blacklist_domains)} domains, {len(self.keywords)} smart keywords")

    def normalize_url_domain(self, url: str) -> str:
        """Extract domain from URL."""
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        try:
            domain = urlparse(url).netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain.lower()
        except:
            return url.lower()

    async def evaluate(self, url: str) -> Dict:
        """Advanced evaluation using Regex, Normalization, and Domain Trust."""
        if not self.is_initialized:
            await self.refresh_policies()

        domain = self.normalize_url_domain(url)
        url_lower = url.lower()
        trust_score = self.calculate_domain_trust(url)
        
        # 1. Check Blacklist (Fast O(1) check)
        if domain in self.blacklist_domains:
            policy = next(p for p in self.blacklist if p["domain"] == domain)
            return {
                "status": "BLOCK",
                "reason": f"Access Denied: {policy['category']} domain. {policy['reason']}",
                "matched_rule": domain,
                "category": policy["category"],
                "layer": "Policy Engine"
            }

        # 2. Ethical/Hate Speech Layer (Global Heuristic)
        hate_match = self.hate_pattern.search(url_lower)
        if hate_match and trust_score < 0.8:
            return {
                "status": "BLOCK",
                "reason": "Ethical Violation: Harmful/Extremist content detected.",
                "matched_rule": hate_match.group(),
                "category": "Ethical Filter",
                "layer": "Heuristic Layer"
            }

        # 3. Smart Keyword Layer (Regex + Normalization)
        # Check standard text first
        for kw in self.keywords:
            if kw["regex"].search(url_lower):
                # If it's a trusted domain and the keyword is common, we might allow it
                # Example: wikipedia.org/wiki/Sex
                if trust_score >= 0.8 and kw["pattern"] in ["sex", "adult"]:
                    continue
                    
                return {
                    "status": "BLOCK",
                    "reason": f"Content Restriction: {kw['category']} pattern detected. {kw['reason']}",
                    "matched_rule": kw["pattern"],
                    "category": kw["category"],
                    "layer": "Smart Policy Layer"
                }

        # Check for Obfuscation (e.g., p.o.r.n)
        normalized_url = self.normalize_text(url_lower)
        if normalized_url != url_lower:
            for kw in self.keywords:
                # Only check short, critical keywords for obfuscation to avoid noise
                if len(kw["pattern"]) <= 5 and kw["pattern"] in normalized_url:
                    return {
                        "status": "BLOCK",
                        "reason": "Security Alert: Obfuscated restricted content detected.",
                        "matched_rule": kw["pattern"],
                        "category": kw["category"],
                        "layer": "De-obfuscation Layer"
                    }

        # 4. Default Allow
        return {
            "status": "ALLOW",
            "reason": "Verified safe by hybrid security engine.",
            "matched_rule": None,
            "category": "Safe",
            "layer": "Decision Engine"
        }

    async def intercept_request(self, url: str, role: str) -> Dict:
        print(f"Intercepting {url} for {role}")
        return await self.evaluate(url)

policy_engine = PolicyEngine()
