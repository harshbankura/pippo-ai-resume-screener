import { useState, useMemo } from 'react';

export const useSearch = (candidates) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    experienceMin: 0,
    experienceMax: 20,
    matchScoreMin: 0,
    skills: [],
    jobRoles: []
  });

  // Extract all unique skills and job roles from candidates
  const availableSkills = useMemo(() => {
    const allSkills = candidates.flatMap(candidate => candidate.skills || []);
    return [...new Set(allSkills)].sort();
  }, [candidates]);
  const availableJobRoles = useMemo(() => {
    const allRoles = candidates.map(candidate => candidate.job_role || 'General');
    return [...new Set(allRoles)].sort();
  }, [candidates]);

  // Filter and search candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = candidate.name?.toLowerCase().includes(searchLower);
        const matchesJobRole = candidate.job_role?.toLowerCase().includes(searchLower);
        const matchesSkills = candidate.skills?.some(skill => 
          skill.toLowerCase().includes(searchLower)
        );
        const matchesExperience = candidate.experience_years?.toString().includes(searchTerm);
        
        if (!matchesName && !matchesSkills && !matchesExperience && !matchesJobRole) {
          return false;
        }
      }

      // Experience range filter
      const experience = candidate.experience_years || 0;
      if (experience < filters.experienceMin || experience > filters.experienceMax) {
        return false;
      }

      // Match score filter
      const matchScore = candidate.match_score || 0;
      if (matchScore < filters.matchScoreMin) {
        return false;
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const candidateSkills = candidate.skills || [];
        const hasRequiredSkill = filters.skills.some(filterSkill =>
          candidateSkills.includes(filterSkill)
        );
        if (!hasRequiredSkill) {
          return false;
        }
      }

      // Job Roles filter
      if (filters.jobRoles && filters.jobRoles.length > 0) {
        const currentRole = candidate.job_role || 'General';
        if (!filters.jobRoles.includes(currentRole)) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredCandidates,
    availableSkills,
    availableJobRoles,
    totalCandidates: candidates.length,
    filteredCount: filteredCandidates.length
  };
};
