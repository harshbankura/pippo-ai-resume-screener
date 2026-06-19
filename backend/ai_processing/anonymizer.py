import re
import hashlib
from typing import Dict, Any, Union

class Anonymizer:
    def __init__(self):
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\b',
            'id': r'\b(?:[A-Z]{2}\d{4,}[A-Z]{2}|\d{4}-\d{4}-\d{4}-\d{4})\b',
            'name': r'\b(Mr\.|Mrs\.|Ms\.|Dr\.)?\s*([A-Z][a-z]+)\s+([A-Z][a-z]+)\b'
        }

    def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main anonymization entry point. It hashes top-level string fields 
        and redacts sensitive information from the raw resume text.
        """
        anonymized_data = self._anonymize_top_level(data)
        anonymized_data["resume_text"] = self._anonymize_text(data.get("raw_text", ""))
        return anonymized_data

    def _anonymize_top_level(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymizes top-level fields, correctly skipping non-string values 
        like the 'entities' dictionary.
        """
        result = {}
        for key, value in data.items():
            # Skip keys that contain non-PII complex objects or are handled separately
            if key in ["raw_text", "entities"]:
                continue
            
            # Only attempt to hash string values
            if isinstance(value, str):
                result[key] = self._hash_value(value)
            # You can decide how to handle other types, but for now, we will skip them
            # to prevent errors.
            else:
                result[key] = None # or pass `value` if it's safe

        return result

    def _hash_value(self, value: str) -> Union[str, None]:
        """Hashes a string value, returning None if the value is empty or None."""
        if not value:
            return None
        return f"ANON_{hashlib.sha256(value.encode('utf-8')).hexdigest()[:8]}"

    def _anonymize_text(self, text: str) -> str:
        """Redacts sensitive patterns from a block of text using regex."""
        for label, pattern in self.patterns.items():
            text = re.sub(pattern, f"[{label.upper()}_REDACTED]", text, flags=re.IGNORECASE)
        return text

# Create a singleton instance for easy, consistent importing
anonymizer = Anonymizer()

