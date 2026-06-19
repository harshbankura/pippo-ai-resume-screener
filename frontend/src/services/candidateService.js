// services/candidateService.js
import { processCandidates } from '../utils/candidateUtils';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class CandidateService {
  async fetchAllCandidates(limit = 100) {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return processCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  async fetchCandidateById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      throw error;
    }
  }

  // FIXED: Use the correct upload endpoint that now exists in backend
  async uploadResume(file, jobDescription = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (jobDescription) {
        formData.append('job_description', jobDescription);
      }

      // FIXED: Use the upload-resume endpoint that your backend now supports
      const response = await fetch(`${API_BASE_URL}/upload-resume/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  // Additional enhanced methods
  async searchCandidates(query, filters = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          sort_by: 'match_score',
          order: 'desc'
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return processCandidates(data);
    } catch (error) {
      console.error('Error searching candidates:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`Stats failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  async resetDatabase() {
    try {
      const response = await fetch(`${API_BASE_URL}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Reset failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }

  async updateCandidate(candidateId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }

  async deleteCandidate(candidateId) {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  async bulkDeleteCandidates(candidateIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_ids: candidateIds
        }),
      });

      if (!response.ok) {
        throw new Error(`Bulk delete failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk deleting candidates:', error);
      throw error;
    }
  }

  async exportCandidates(format = 'json', includeResumeText = false) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/export?format=${format}&include_resume_text=${includeResumeText}`
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting candidates:', error);
      throw error;
    }
  }

  async reparseCandidate(candidateId, jobDescription = '') {
    try {
      const formData = new FormData();
      if (jobDescription) {
        formData.append('job_description', jobDescription);
      }

      const response = await fetch(`${API_BASE_URL}/reparse/${candidateId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Reparse failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reparsing candidate:', error);
      throw error;
    }
  }
}

export default new CandidateService();
