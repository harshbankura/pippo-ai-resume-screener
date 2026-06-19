import io
import pdfplumber
import spacy
import re
from transformers import pipeline
from typing import Dict, Any, Optional

nlp = spacy.load("en_core_web_sm")
hf_ner = pipeline("ner", model="Nucha/Nucha_ITSkillNER_BERT", aggregation_strategy="simple")

# Improved regex patterns for PII extraction
EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
PHONE_REGEX = r"\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}(?: x\d+)?"
NAME_REGEX = r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b"

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Robust PDF text extraction with error handling"""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        raise ValueError(f"PDF processing failed: {str(e)}")

def extract_pii(text: str):
    # Try to extract name from the first 5 lines
    lines = text.splitlines()[:5]
    name_match = None
    for line in lines:
        match = re.search(NAME_REGEX, line.strip())
        if match:
            name_match = match
            break
    phone_match = re.search(PHONE_REGEX, text)
    email_match = re.search(EMAIL_REGEX, text)
    return {
        "name": name_match.group(0) if name_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "email": email_match.group(0) if email_match else None
    }

def parse_pdf_resume(text: str) -> Dict[str, Any]:
    pii = extract_pii(text)
    doc = nlp(text)
    hf_results = hf_ner(text)
    raw_skills = [
        ent["word"] for ent in hf_results 
        if ent["entity_group"].upper() in ["HSKILL", "SSKILL"]
    ]
    cleaned_skills = [
        skill.strip(" ·,")
        for skill in raw_skills
        if len(skill) > 2 and skill.lower() not in nlp.Defaults.stop_words
    ]
    return {
        "name": pii["name"],
        "email": pii["email"],
        "phone": pii["phone"],
        "raw_text": text,
        "entities": {
            "skills": list(set(cleaned_skills)),
            "experience": [ent.text for ent in doc.ents if ent.label_ == "DATE"],
            "education": [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        }
    }
