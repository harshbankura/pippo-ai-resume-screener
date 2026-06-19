import io
import re
from typing import Dict, Any, Optional

from docx import Document
import spacy
from transformers import pipeline

nlp = spacy.load("en_core_web_sm")
hf_ner = pipeline("ner", model="Nucha/Nucha_ITSkillNER_BERT", aggregation_strategy="simple")

EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
PHONE_REGEX = r"\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}(?: x\d+)?"
NAME_REGEX = r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b"

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Robust DOCX text extraction with error handling"""
    try:
        with io.BytesIO(file_bytes) as buffer:
            doc = Document(buffer)
            return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise ValueError(f"DOCX processing failed: {str(e)}")

def extract_pii(text: str):
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

def parse_docx_resume(text: str) -> Dict[str, Any]:
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
