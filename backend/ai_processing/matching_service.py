from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

# --- THE NEW, STABLE MATCHING ENGINE ---
# Load a top-tier, powerful model directly through the stable sentence-transformers library.
# This model is excellent for semantic matching tasks.
print("Loading sentence-transformer model: BAAI/bge-large-en-v1.5...")
model = SentenceTransformer("BAAI/bge-large-en-v1.5")
print("Matching service model loaded successfully.")
# --- END OF NEW ENGINE ---

def calculate_similarity(job_desc: str, resume_text: str) -> float:
    """
    Calculates a fine-tuned match score between a job description and a resume
    using a powerful and stable sentence-transformer model.
    """
    # For this model, it's recommended to add a prefix to differentiate
    # the query (job description) from the passage (resume).
    job_desc_with_prefix = "Represent this job description for retrieving relevant resumes: " + job_desc
    
    # Encode both texts into vector embeddings.
    job_emb = model.encode(job_desc_with_prefix, normalize_embeddings=True)
    resume_emb = model.encode(resume_text, normalize_embeddings=True)
    
    # Calculate the cosine similarity between the two embeddings.
    # The result is a score between -1 and 1 (typically 0 to 1 for this task).
    similarity_score = cos_sim(job_emb, resume_emb).item()
    
    # We can scale it to be strictly between 0 and 1 for consistency.
    # (score + 1) / 2 maps the [-1, 1] range to [0, 1].
    final_score = (similarity_score + 1) / 2
    
    return float(final_score)

