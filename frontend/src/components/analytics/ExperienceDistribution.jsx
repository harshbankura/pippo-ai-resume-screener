// frontend/src/components/analytics/ExperienceDistribution.jsx
import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ExperienceDistribution = ({ candidates }) => {
  const experienceData = useMemo(() => {
    const experienceRanges = {
      'Entry Level (0-2 years)': 0,
      'Junior (3-5 years)': 0,
      'Mid-level (6-10 years)': 0,
      'Senior (11-15 years)': 0,
      'Expert (15+ years)': 0,
    };

    const experienceByYear = {};

    candidates.forEach(candidate => {
      const years = candidate.experience_years || 0;
      
      // Count by ranges
      if (years <= 2) experienceRanges['Entry Level (0-2 years)']++;
      else if (years <= 5) experienceRanges['Junior (3-5 years)']++;
      else if (years <= 10) experienceRanges['Mid-level (6-10 years)']++;
      else if (years <= 15) experienceRanges['Senior (11-15 years)']++;
      else experienceRanges['Expert (15+ years)']++;

      // Count by exact years
      experienceByYear[years] = (experienceByYear[years] || 0) + 1;
    });

    return { experienceRanges, experienceByYear };
  }, [candidates]);

  const barChartData = {
    labels: Object.keys(experienceData.experienceRanges),
    datasets: [
      {
        label: 'Number of Candidates',
        data: Object.values(experienceData.experienceRanges),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: Object.keys(experienceData.experienceByYear).sort((a, b) => a - b),
    datasets: [
      {
        label: 'Candidates by Experience Years',
        data: Object.keys(experienceData.experienceByYear)
          .sort((a, b) => a - b)
          .map(year => experienceData.experienceByYear[year]),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const averageExperience = useMemo(() => {
    const total = candidates.reduce((sum, candidate) => sum + (candidate.experience_years || 0), 0);
    return (total / candidates.length).toFixed(1);
  }, [candidates]);

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Experience Distribution</h2>
      
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Experience Levels</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Experience Distribution Curve</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="experience-summary">
        <div className="summary-card">
          <h4>Average Experience</h4>
          <span className="summary-number">{averageExperience} years</span>
        </div>
        <div className="summary-card">
          <h4>Most Common Level</h4>
          <span className="summary-text">
            {Object.entries(experienceData.experienceRanges)
              .sort(([,a], [,b]) => b - a)[0]?.[0]?.split(' ')[0] || 'N/A'}
          </span>
        </div>
        <div className="summary-card">
          <h4>Senior+ Candidates</h4>
          <span className="summary-number">
            {experienceData.experienceRanges['Senior (11-15 years)'] + 
             experienceData.experienceRanges['Expert (15+ years)']}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDistribution;
