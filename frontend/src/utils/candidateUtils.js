// utils/candidateUtils.js - ENHANCED SCORING WITH FIXES
export const generateAnonymizedId = (candidateId) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seed = candidateId * 12345;
  let result = '';
  let tempSeed = seed;
  
  for (let i = 0; i < 6; i++) {
    result += chars[tempSeed % chars.length];
    tempSeed = Math.floor(tempSeed / chars.length) + 7;
  }
  return result;
};

export const calculateOverallScore = (candidate) => {
  const matchScore = candidate.match_score || 0;
  const experienceScore = Math.min(candidate.experience_years / 15, 1);
  const skillsScore = Math.min((candidate.skills?.length || 0) / 12, 1);
  const contactScore = (candidate.email ? 0.5 : 0) + (candidate.phone ? 0.5 : 0);
  const educationScore = candidate.education && candidate.education !== "" && candidate.education !== "Not specified" ? 1 : 0;
  
  // ENHANCED: More variable weighted calculation
  const rawScore = (
    matchScore * 0.40 +           // Increased match score weight
    experienceScore * 0.25 +      
    skillsScore * 0.20 +          
    contactScore * 0.10 +         
    educationScore * 0.05         
  );
  
  // ENHANCED: More variable score distribution (15-95 range)
  let finalScore = 15 + (rawScore * 80);
  
  // Variable bonuses based on profile quality
  if (candidate.experience_years >= 10 && (candidate.skills?.length || 0) >= 15) {
    finalScore += 8;
  } else if (candidate.experience_years >= 5 && (candidate.skills?.length || 0) >= 10) {
    finalScore += 5;
  }
  
  // Education bonuses
  if (candidate.education && candidate.education.toLowerCase().includes('master')) {
    finalScore += 4;
  } else if (candidate.education && candidate.education.toLowerCase().includes('bachelor')) {
    finalScore += 2;
  }
  
  // Contact completeness bonus
  if (candidate.email && candidate.phone) {
    finalScore += 3;
  }
  
  // Penalty for very incomplete profiles
  if (!candidate.email && !candidate.phone) {
    finalScore -= 10;
  }
  
  // Add slight randomness for natural variation
  const variation = Math.random() * 4 - 2; // ±2 points
  finalScore += variation;
  
  return Math.min(Math.max(Math.round(finalScore), 15), 95);
};

export const getScoreColor = (score) => {
  if (score >= 70) return '#22c55e';  // Green for 70+
  if (score >= 40) return '#f59e0b';  // Yellow for 40-69
  return '#ef4444';                   // Red for below 40
};

export const getScoreLabel = (score) => {
  if (score >= 70) return 'Excellent';
  if (score >= 40) return 'Good';
  return 'Needs Improvement';
};

export const formatExperience = (years) => {
  if (years === 0) return 'Entry Level';
  if (years === 1) return '1 Year';
  return `${years} Years`;
};

export const processCandidate = (candidate) => {
  const processed = {
    ...candidate,
    anonymized_id: generateAnonymizedId(candidate.id),
    formatted_experience: formatExperience(candidate.experience_years || 0)
  };
  
  // FIXED: Always recalculate overall score
  processed.overall_score = calculateOverallScore(processed);
  
  return processed;
};

export const processCandidates = (candidates) => {
  return candidates.map(processCandidate);
};
