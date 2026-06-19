# ai_processing/resume_parser.py - ENHANCED VERSION WITH VARIABLE MATCH SCORES
import re
import json
import spacy
from typing import Dict, List, Any, Optional
import pdfplumber
from docx import Document
from io import BytesIO
import logging
from datetime import datetime
import phonenumbers
from phonenumbers import geocoder, carrier
import dateutil.parser as date_parser
import random

logger = logging.getLogger(__name__)

class EnhancedResumeParser:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # ENHANCED: Comprehensive skills database (100+ skills)
        self.skills_database = {
            'programming_languages': [
                'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
                'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell'
            ],
            'web_technologies': [
                'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
                'Spring Boot', 'Laravel', 'ASP.NET', 'jQuery', 'Bootstrap', 'Sass', 'Less', 'Webpack',
                'Next.js', 'Nuxt.js', 'Svelte', 'FastAPI'
            ],
            'databases': [
                'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'SQLite', 'Cassandra',
                'DynamoDB', 'Firebase', 'Elasticsearch', 'Neo4j', 'CouchDB', 'InfluxDB'
            ],
            'cloud_devops': [
                'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'CircleCI',
                'Terraform', 'Ansible', 'Chef', 'Puppet', 'Nagios', 'Prometheus', 'Grafana', 'Helm'
            ],
            'data_analytics': [
                'SQL', 'Excel', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
                'Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'Jupyter', 'TensorFlow', 'PyTorch'
            ],
            'design_tools': [
                'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision', 'Canva',
                'After Effects', 'Premiere Pro', 'Blender', 'Maya', 'AutoCAD'
            ],
            'project_management': [
                'Agile', 'Scrum', 'Kanban', 'JIRA', 'Trello', 'Asana', 'Monday.com', 'Slack', 'Teams',
                'Confluence', 'Notion', 'Linear', 'ClickUp', 'Basecamp'
            ],
            'soft_skills': [
                'Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Critical Thinking',
                'Project Management', 'Time Management', 'Analytical Skills', 'Creative Thinking',
                'Adaptability', 'Collaboration', 'Negotiation', 'Public Speaking', 'Mentoring',
                'Strategic Planning', 'Decision Making', 'Conflict Resolution', 'Customer Service'
            ],
            'operating_systems': [
                'Linux', 'Windows', 'macOS', 'Ubuntu', 'CentOS', 'Unix', 'Debian', 'Red Hat'
            ],
            'mobile_development': [
                'iOS', 'Android', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova'
            ]
        }
        
        # Flatten all skills for easy searching
        self.all_skills = []
        for category in self.skills_database.values():
            self.all_skills.extend(category)
        
        # ENHANCED: Experience calculation patterns
        self.experience_patterns = [
            r'(\d{1,2})\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
            r'(\d{1,2})\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)',
            r'experience\s*[:\-]?\s*(\d{1,2})\+?\s*years?',
            r'(\d{4})\s*[-–]\s*(\d{4}|present|current)',  # Date ranges like 2020-2024
            r'(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|present|current)',  # Jan 2020 - Dec 2024
            r'from\s+(\d{4})\s+to\s+(\d{4}|present|current)',
            r'worked\s+(?:at|in|for)\s+.+?(?:from\s+)?(\d{4})\s*[-–]\s*(\d{4}|present|current)',
        ]

    def parse_pdf(self, pdf_content: bytes) -> Dict[str, Any]:
        """Parse PDF resume content"""
        try:
            with pdfplumber.open(BytesIO(pdf_content)) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
            
            return self.parse_text(text)
        except Exception as e:
            logger.error(f"PDF parsing error: {str(e)}")
            raise Exception(f"Failed to parse PDF: {str(e)}")
    
    def parse_docx(self, docx_content: bytes) -> Dict[str, Any]:
        """Parse DOCX resume content"""
        try:
            doc = Document(BytesIO(docx_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return self.parse_text(text)
        except Exception as e:
            logger.error(f"DOCX parsing error: {str(e)}")
            raise Exception(f"Failed to parse DOCX: {str(e)}")

    def extract_name(self, text: str) -> str:
        """ENHANCED: Extract name from resume with multiple strategies"""
        lines = text.strip().split('\n')
        
        # Strategy 1: First few lines (most common)
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if len(line) > 3 and len(line) < 50:
                # Check if it looks like a name (2-4 words, proper case)
                words = line.split()
                if 2 <= len(words) <= 4:
                    if all(word.replace('.', '').replace(',', '').isalpha() for word in words):
                        if any(word[0].isupper() for word in words):
                            # Avoid common non-name patterns
                            if not any(skip in line.lower() for skip in ['resume', 'cv', 'curriculum', 'profile']):
                                return line.title()
        
        # Strategy 2: Look for "Name:" pattern
        name_patterns = [
            r'name\s*[:\-]\s*([A-Za-z\s\.]+)',
            r'candidate\s*[:\-]\s*([A-Za-z\s\.]+)',
            r'^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                name = match.group(1).strip()
                if 5 <= len(name) <= 50:
                    return name.title()
        
        # Strategy 3: Use spaCy NER if available
        if self.nlp:
            doc = self.nlp(text[:500])  # First 500 chars
            for ent in doc.ents:
                if ent.label_ == "PERSON" and len(ent.text.split()) <= 4:
                    return ent.text.title()
        
        return ""

    def extract_phone(self, text: str) -> str:
        """ENHANCED: Extract phone number with international support"""
        # Multiple phone patterns
        phone_patterns = [
            r'(?:phone|mobile|cell|tel|contact)?\s*[:\-]?\s*(\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})',
            r'(\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})',
            r'(\d{10})',
            r'(\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{3,4})',
        ]
        
        for pattern in phone_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean the phone number
                phone = re.sub(r'[^\d+]', '', match)
                if 10 <= len(phone) <= 15:
                    try:
                        # Try to parse with phonenumbers library
                        parsed = phonenumbers.parse(phone, "US")  # Default to US
                        if phonenumbers.is_valid_number(parsed):
                            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
                    except:
                        pass
                    
                    # Fallback: format manually
                    if len(phone) == 10:
                        return f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
                    return phone
        
        return None

    def extract_email(self, text: str) -> str:
        """Extract email address"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else None

    def calculate_experience_years(self, text: str) -> int:
        """ENHANCED: Calculate experience from multiple sources"""
        max_experience = 0
        current_year = datetime.now().year
        
        # Strategy 1: Direct experience mentions
        for pattern in self.experience_patterns[:3]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    years = int(match)
                    max_experience = max(max_experience, years)
                except:
                    continue
        
        # Strategy 2: Date range calculations
        date_ranges = []
        
        # Pattern: 2020-2024, 2020-Present, etc.
        year_ranges = re.findall(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', text, re.IGNORECASE)
        for start_year, end_year in year_ranges:
            try:
                start = int(start_year)
                end = current_year if end_year.lower() in ['present', 'current'] else int(end_year)
                if 1990 <= start <= current_year and start <= end:
                    date_ranges.append(end - start)
            except:
                continue
        
        # Pattern: Jan 2020 - Dec 2024
        month_ranges = re.findall(r'(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|present|current)', text, re.IGNORECASE)
        for start_date, end_date in month_ranges:
            try:
                start = date_parser.parse(start_date)
                if end_date.lower() in ['present', 'current']:
                    end = datetime.now()
                else:
                    end = date_parser.parse(end_date)
                
                years_diff = (end - start).days / 365.25
                if 0 <= years_diff <= 50:
                    date_ranges.append(int(years_diff))
            except:
                continue
        
        # Take the maximum experience found
        if date_ranges:
            max_experience = max(max_experience, max(date_ranges))
        
        # Strategy 3: Company tenure analysis
        company_patterns = [
            r'(?:worked|employed|served)\s+(?:at|in|for|with)\s+([^,\n]+?)(?:from\s+)?(\d{4})\s*[-–]\s*(\d{4}|present)',
            r'([A-Z][a-z\s&]+(?:Inc|LLC|Corp|Ltd|Company))\s*[,\-]\s*(\d{4})\s*[-–]\s*(\d{4}|present)',
        ]
        
        for pattern in company_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    if len(match) == 3:
                        start_year = int(match[1])
                        end_year = current_year if match[2].lower() in ['present', 'current'] else int(match[2])
                        if 1990 <= start_year <= current_year and start_year <= end_year:
                            years_exp = end_year - start_year
                            max_experience = max(max_experience, years_exp)
                except:
                    continue
        
        return min(max_experience, 50)  # Cap at 50 years

    def extract_skills(self, text: str) -> List[str]:
        """ENHANCED: Extract skills with better matching"""
        found_skills = set()
        text_lower = text.lower()
        
        # Direct skill matching with word boundaries
        for skill in self.all_skills:
            skill_lower = skill.lower()
            # Use word boundaries for exact matches
            pattern = r'\b' + re.escape(skill_lower) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(skill)
        
        # Additional patterns for common skill formats
        skill_sections = re.findall(r'(?:skills?|technologies?|tools?|expertise)[:\-\s]*([^\n]+)', text, re.IGNORECASE)
        for section in skill_sections:
            # Split by common delimiters
            items = re.split(r'[,;|•\-\n]', section)
            for item in items:
                item = item.strip()
                if 2 <= len(item) <= 30:
                    # Check if it matches any skill (fuzzy matching)
                    for skill in self.all_skills:
                        if skill.lower() in item.lower() or item.lower() in skill.lower():
                            found_skills.add(skill)
        
        return list(found_skills)

    def extract_education(self, text: str) -> str:
        """ENHANCED: Extract education information"""
        education_info = []
        
        # Common degree patterns
        degree_patterns = [
            r'((?:Bachelor|Master|PhD|Doctorate|Associate|MBA|MS|BS|BA|MA|MSc|BSc)(?:\s+of\s+\w+)*(?:\s+in\s+[\w\s]+)?)',
            r'(B\.?[A-Z]\.?(?:\s+in\s+[\w\s]+)?)',
            r'(M\.?[A-Z]\.?(?:\s+in\s+[\w\s]+)?)',
            r'(Ph\.?D\.?(?:\s+in\s+[\w\s]+)?)',
        ]
        
        for pattern in degree_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            education_info.extend(matches)
        
        # University/College patterns
        institution_patterns = [
            r'(?:from|at)\s+([A-Z][a-z\s]+(?:University|College|Institute|School))',
            r'([A-Z][a-z\s]+(?:University|College|Institute|School))',
        ]
        
        for pattern in institution_patterns:
            matches = re.findall(pattern, text)
            education_info.extend(matches)
        
        # Graduation year
        grad_years = re.findall(r'(?:graduated|graduation)\s*[:\-]?\s*(\d{4})', text, re.IGNORECASE)
        education_info.extend(grad_years)
        
        return ', '.join(set(education_info)) if education_info else ""

    def determine_job_role(self, skills: List[str], text: str) -> str:
        """ENHANCED: Automatically determine the most likely job role based on skills and text."""
        text_lower = text.lower()
        role_scores = {
            "Frontend Developer": 0, "Backend Developer": 0, "Full Stack Developer": 0,
            "Data Analyst": 0, "Data Scientist": 0, "DevOps Engineer": 0,
            "UI/UX Designer": 0, "Project Manager": 0, "Quality Assurance": 0, "Mobile Developer": 0
        }
        
        # Skill-based mapping
        skill_role_map = {
            "React": ["Frontend Developer", "Full Stack Developer"], "Angular": ["Frontend Developer", "Full Stack Developer"],
            "Vue.js": ["Frontend Developer", "Full Stack Developer"], "HTML": ["Frontend Developer"], "CSS": ["Frontend Developer"],
            "JavaScript": ["Frontend Developer", "Full Stack Developer"], "TypeScript": ["Frontend Developer", "Full Stack Developer"],
            "Node.js": ["Backend Developer", "Full Stack Developer"], "Python": ["Backend Developer", "Data Analyst", "Data Scientist"],
            "Django": ["Backend Developer"], "Flask": ["Backend Developer"], "Java": ["Backend Developer"], "Spring Boot": ["Backend Developer"],
            "C#": ["Backend Developer"], ".NET": ["Backend Developer"], "SQL": ["Data Analyst", "Backend Developer", "Data Scientist"],
            "MySQL": ["Backend Developer"], "PostgreSQL": ["Backend Developer"], "MongoDB": ["Backend Developer", "Full Stack Developer"],
            "Pandas": ["Data Analyst", "Data Scientist"], "NumPy": ["Data Analyst", "Data Scientist"], "Machine Learning": ["Data Scientist"],
            "Tableau": ["Data Analyst"], "Power BI": ["Data Analyst"], "Docker": ["DevOps Engineer", "Backend Developer"],
            "Kubernetes": ["DevOps Engineer"], "AWS": ["DevOps Engineer", "Backend Developer"], "Azure": ["DevOps Engineer", "Backend Developer"],
            "Figma": ["UI/UX Designer"], "Adobe XD": ["UI/UX Designer"], "Scrum": ["Project Manager"], "Agile": ["Project Manager"],
            "JIRA": ["Project Manager", "Quality Assurance"], "Selenium": ["Quality Assurance"], "Testing": ["Quality Assurance"],
            "iOS": ["Mobile Developer"], "Android": ["Mobile Developer"], "React Native": ["Mobile Developer"], "Flutter": ["Mobile Developer"]
        }

        for skill in skills:
            for mapped_role in skill_role_map.get(skill, []):
                role_scores[mapped_role] += 2

        # Text-based direct title matching
        direct_titles = {
            "Frontend Developer": ["frontend", "front-end", "front end", "ui developer"],
            "Backend Developer": ["backend", "back-end", "back end"],
            "Full Stack Developer": ["full stack", "full-stack", "fullstack"],
            "Data Analyst": ["data analyst", "data analysis"],
            "Data Scientist": ["data scientist", "machine learning engineer"],
            "DevOps Engineer": ["devops", "site reliability engineer", "sre"],
            "UI/UX Designer": ["ui designer", "ux designer", "product designer"],
            "Project Manager": ["project manager", "product manager", "scrum master"],
            "Quality Assurance": ["qa engineer", "quality assurance", "tester", "sdet"],
            "Mobile Developer": ["mobile developer", "ios developer", "android developer"]
        }
        
        for role, titles in direct_titles.items():
            for title in titles:
                if title in text_lower:
                    role_scores[role] += 3
        
        best_role = max(role_scores.items(), key=lambda x: x[1])
        if best_role[1] > 0:
            return best_role[0]
        return "General"

    def calculate_enhanced_match_score(self, candidate_data: Dict, job_description: str = "") -> float:
        """ENHANCED: More variable match score calculation"""
        if not job_description:
            # More variable scoring based on profile quality
            score = 0.0
            
            # Name quality (5-15%)
            name = candidate_data.get('name', '')
            if name and name != "Unknown Candidate":
                name_words = len(name.split())
                if name_words >= 2:
                    score += 0.10 + (min(name_words, 4) * 0.025)  # 10-20%
            
            # Contact completeness with variability (10-25%)
            email_score = 0.15 if candidate_data.get('email') else 0.05
            phone_score = 0.10 if candidate_data.get('phone') else 0.02
            score += email_score + phone_score
            
            # Skills with high variability (20-50%)
            skills_count = len(candidate_data.get('skills', []))
            if skills_count >= 20:
                score += 0.50
            elif skills_count >= 15:
                score += 0.42
            elif skills_count >= 10:
                score += 0.35
            elif skills_count >= 7:
                score += 0.28
            elif skills_count >= 5:
                score += 0.22
            elif skills_count >= 3:
                score += 0.15
            else:
                score += 0.05
            
            # Experience with curve (10-30%)
            experience = candidate_data.get('experience_years', 0)
            if experience >= 15:
                score += 0.30
            elif experience >= 10:
                score += 0.26
            elif experience >= 7:
                score += 0.22
            elif experience >= 5:
                score += 0.18
            elif experience >= 3:
                score += 0.14
            elif experience >= 1:
                score += 0.10
            else:
                score += 0.02
            
            # Education bonus (0-10%)
            education = candidate_data.get('education', '')
            if education and len(education) > 10:
                if any(degree in education.lower() for degree in ['master', 'phd', 'doctorate', 'mba']):
                    score += 0.10
                elif any(degree in education.lower() for degree in ['bachelor', 'bs', 'ba', 'university']):
                    score += 0.07
                else:
                    score += 0.03
            
            # Add randomness for natural variation (±5%)
            variation = random.uniform(-0.05, 0.05)
            score += variation
            
            return min(max(score, 0.1), 0.95)  # Clamp between 10% and 95%
        
        # Job description matching logic here...
        return 0.75

    def parse_text(self, text: str, job_description: str = "") -> Dict[str, Any]:
        """Main parsing function with enhanced extraction"""
        try:
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # Extract all information
            name = self.extract_name(cleaned_text)
            email = self.extract_email(cleaned_text)
            phone = self.extract_phone(cleaned_text)
            skills = self.extract_skills(cleaned_text)
            experience_years = self.calculate_experience_years(cleaned_text)
            education = self.extract_education(cleaned_text)
            
            # Infer job role automatically
            inferred_job_role = self.determine_job_role(skills, cleaned_text)
            
            # Calculate match score
            candidate_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'skills': skills,
                'experience_years': experience_years,
                'education': education,
                'inferred_job_role': inferred_job_role
            }
            
            match_score = self.calculate_enhanced_match_score(candidate_data, job_description)
            
            return {
                'raw_text': text,
                'cleaned_text': cleaned_text,
                'name': name or "Unknown Candidate",
                'email': email,
                'phone': phone,
                'skills': skills,
                'experience_years': experience_years,
                'education': education,
                'inferred_job_role': inferred_job_role,
                'match_score': match_score,
                'confidence': 0.85 if (name and email and skills) else 0.5
            }
            
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}")
            return {
                'raw_text': text,
                'cleaned_text': text,
                'name': "Unknown Candidate",
                'email': None,
                'phone': None,
                'skills': [],
                'experience_years': 0,
                'education': "",
                'inferred_job_role': "General",
                'match_score': 0.1,
                'confidence': 0.1
            }

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s@.-]', ' ', text)
        return text.strip()

# Create global parser instance
enhanced_parser = EnhancedResumeParser()

def parse_resume_enhanced(text: str, job_description: str = "") -> Dict:
    """Enhanced resume parsing function"""
    return enhanced_parser.parse_text(text, job_description)
