// frontend/src/components/analytics/SkillsAnalytics.jsx - ENHANCED VERSION
import React, { useMemo } from 'react';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const SkillsAnalytics = ({ candidates }) => {
  const skillsData = useMemo(() => {
    const skillCounts = {};
    const skillMatchScores = {};
    
    // Industry-standard skill categories for ATS optimization
    const skillCategories = {
      'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust'],
      'Frontend Technologies': ['React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'TypeScript', 'jQuery'],
      'Backend Technologies': ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel'],
      'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'SQLite'],
      'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD'],
      'Data & Analytics': ['SQL', 'Excel', 'Tableau', 'Power BI', 'R', 'SPSS', 'Pandas', 'NumPy'],
      'Design & UX': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision'],
      'Project Management': ['Agile', 'Scrum', 'JIRA', 'Trello', 'Asana', 'Monday.com'],
      'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Critical Thinking']
    };

    // High-demand skills based on current job market trends
    const highDemandSkills = [
      'Python', 'JavaScript', 'React', 'AWS', 'SQL', 'Docker', 'Kubernetes',
      'Machine Learning', 'Data Analysis', 'Agile', 'Git', 'Node.js'
    ];

    candidates.forEach(candidate => {
      if (candidate.skills) {
        candidate.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          
          // Track match scores for each skill
          if (!skillMatchScores[skill]) {
            skillMatchScores[skill] = [];
          }
          skillMatchScores[skill].push(candidate.match_score || 0);
        });
      }
    });

    // Calculate average match scores per skill
    const skillPerformance = Object.entries(skillMatchScores).map(([skill, scores]) => ({
      skill,
      avgMatchScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      count: scores.length
    })).sort((a, b) => b.avgMatchScore - a.avgMatchScore);

    // Get top skills by frequency
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);

    // Categorize skills
    const categoryData = {};
    Object.entries(skillCounts).forEach(([skill, count]) => {
      let category = 'Other';
      for (const [cat, skills] of Object.entries(skillCategories)) {
        if (skills.some(s => skill.toLowerCase().includes(s.toLowerCase()) || 
                            s.toLowerCase().includes(skill.toLowerCase()))) {
          category = cat;
          break;
        }
      }
      categoryData[category] = (categoryData[category] || 0) + count;
    });

    // Market demand analysis
    const marketDemandData = highDemandSkills.map(skill => ({
      skill,
      count: skillCounts[skill] || 0,
      demand: 'High'
    }));

    // Skill gap analysis
    const skillGaps = highDemandSkills.filter(skill => (skillCounts[skill] || 0) < candidates.length * 0.2);

    return { 
      topSkills, 
      categoryData, 
      skillPerformance, 
      marketDemandData, 
      skillGaps,
      totalUniqueSkills: Object.keys(skillCounts).length
    };
  }, [candidates]);

  // Top Skills Bar Chart
  const barChartData = {
    labels: skillsData.topSkills.map(([skill]) => skill),
    datasets: [
      {
        label: 'Number of Candidates',
        data: skillsData.topSkills.map(([, count]) => count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Skills Category Doughnut
  const doughnutData = {
    labels: Object.keys(skillsData.categoryData),
    datasets: [
      {
        data: Object.values(skillsData.categoryData),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Market Demand Radar Chart
  const radarData = {
    labels: skillsData.marketDemandData.slice(0, 8).map(d => d.skill),
    datasets: [
      {
        label: 'Current Pool',
        data: skillsData.marketDemandData.slice(0, 8).map(d => d.count),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Market Demand (Normalized)',
        data: skillsData.marketDemandData.slice(0, 8).map(() => candidates.length * 0.6), // Simulated demand
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      }
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

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Advanced Skills Analytics</h2>
      
      {/* Skills Intelligence Summary */}
      <div className="skills-intelligence-grid">
        <div className="intelligence-card">
          <h4>🎯 Total Unique Skills</h4>
          <span className="intelligence-number">{skillsData.totalUniqueSkills}</span>
        </div>
        <div className="intelligence-card">
          <h4>📈 Top Performing Skill</h4>
          <span className="intelligence-text">
            {skillsData.skillPerformance[0]?.skill || 'N/A'}
          </span>
          <small>
            {skillsData.skillPerformance[0] ? 
              `${(skillsData.skillPerformance[0].avgMatchScore * 100).toFixed(1)}% avg match` : ''}
          </small>
        </div>
        <div className="intelligence-card warning">
          <h4>⚠️ Skill Gaps</h4>
          <span className="intelligence-number">{skillsData.skillGaps.length}</span>
          <small>High-demand skills missing</small>
        </div>
        <div className="intelligence-card">
          <h4>🔥 Market Alignment</h4>
          <span className="intelligence-number">
            {((12 - skillsData.skillGaps.length) / 12 * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Top 15 Skills by Frequency</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Skills Distribution by Category</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>Market Demand vs Current Pool</h3>
        <div className="chart-container" style={{ height: '400px' }}>
          <Radar data={radarData} options={{
            ...chartOptions,
            scales: {
              r: {
                beginAtZero: true,
                max: Math.max(...skillsData.marketDemandData.map(d => d.count)) * 1.2
              }
            }
          }} />
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="skill-gaps-section">
        <h3>🎯 ATS & Market Intelligence</h3>
        <div className="gaps-grid">
          <div className="gap-card">
            <h4>High-Demand Skills Missing</h4>
            <div className="skills-list">
              {skillsData.skillGaps.length > 0 ? (
                skillsData.skillGaps.map((skill, index) => (
                  <span key={index} className="missing-skill-tag">{skill}</span>
                ))
              ) : (
                <span className="success-message">✅ All high-demand skills covered!</span>
              )}
            </div>
          </div>
          
          <div className="gap-card">
            <h4>Top Performing Skills (by Match Score)</h4>
            <div className="performance-list">
              {skillsData.skillPerformance.slice(0, 5).map((item, index) => (
                <div key={index} className="performance-item">
                  <span className="skill-name">{item.skill}</span>
                  <span className="performance-score">
                    {(item.avgMatchScore * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsAnalytics;
