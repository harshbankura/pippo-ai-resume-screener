// frontend/src/components/analytics/MatchScoreAnalytics.jsx
import React, { useMemo } from 'react';
import { Line, Scatter, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

const MatchScoreAnalytics = ({ candidates }) => {
  const matchScoreData = useMemo(() => {
    // Match score distribution ranges (based on ATS standards)
    const scoreRanges = {
      'Excellent (80-100%)': 0,
      'Good (60-79%)': 0,
      'Fair (40-59%)': 0,
      'Poor (20-39%)': 0,
      'Very Poor (0-19%)': 0,
    };

    // Score vs Experience correlation
    const scoreExperienceData = [];
    
    // Score trends over time (if you have date_added)
    const scoreTrends = {};

    candidates.forEach(candidate => {
      const matchPercent = (candidate.match_score || 0) * 100;
      const experience = candidate.experience_years || 0;
      
      // Categorize match scores
      if (matchPercent >= 80) scoreRanges['Excellent (80-100%)']++;
      else if (matchPercent >= 60) scoreRanges['Good (60-79%)']++;
      else if (matchPercent >= 40) scoreRanges['Fair (40-59%)']++;
      else if (matchPercent >= 20) scoreRanges['Poor (20-39%)']++;
      else scoreRanges['Very Poor (0-19%)']++;

      // Score vs Experience correlation
      scoreExperienceData.push({
        x: experience,
        y: matchPercent,
        label: candidate.name || 'Anonymous'
      });

      // Score trends (group by month if date available)
      const month = candidate.date_added ? 
        new Date(candidate.date_added).toISOString().slice(0, 7) : 
        '2025-06';
      
      if (!scoreTrends[month]) {
        scoreTrends[month] = { total: 0, count: 0 };
      }
      scoreTrends[month].total += matchPercent;
      scoreTrends[month].count++;
    });

    // Calculate average scores by month
    const trendData = Object.entries(scoreTrends).map(([month, data]) => ({
      month,
      avgScore: data.total / data.count
    })).sort((a, b) => a.month.localeCompare(b.month));

    return { scoreRanges, scoreExperienceData, trendData };
  }, [candidates]);

  // Match Score Distribution Chart
  const distributionData = {
    labels: Object.keys(matchScoreData.scoreRanges),
    datasets: [
      {
        label: 'Number of Candidates',
        data: Object.values(matchScoreData.scoreRanges),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Excellent - Green
          'rgba(59, 130, 246, 0.8)',  // Good - Blue
          'rgba(245, 158, 11, 0.8)',  // Fair - Yellow
          'rgba(249, 115, 22, 0.8)',  // Poor - Orange
          'rgba(239, 68, 68, 0.8)',   // Very Poor - Red
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Score vs Experience Scatter Plot
  const scatterData = {
    datasets: [
      {
        label: 'Match Score vs Experience',
        data: matchScoreData.scoreExperienceData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Score Trends Over Time
  const trendData = {
    labels: matchScoreData.trendData.map(d => d.month),
    datasets: [
      {
        label: 'Average Match Score',
        data: matchScoreData.trendData.map(d => d.avgScore),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
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
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Match Score vs Experience') {
              return `${context.raw.label}: ${context.raw.y.toFixed(1)}% match, ${context.raw.x} years exp`;
            }
            return context.dataset.label + ': ' + context.formattedValue;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Years of Experience'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Match Score (%)'
        },
        min: 0,
        max: 100
      }
    }
  };

  // Calculate insights
  const insights = useMemo(() => {
    const totalCandidates = candidates.length;
    const avgMatchScore = candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / totalCandidates * 100;
    const topPerformers = candidates.filter(c => (c.match_score || 0) >= 0.8).length;
    const lowPerformers = candidates.filter(c => (c.match_score || 0) < 0.4).length;
    
    // Find correlation between experience and match score
    const correlation = calculateCorrelation(
      candidates.map(c => c.experience_years || 0),
      candidates.map(c => (c.match_score || 0) * 100)
    );

    return {
      avgMatchScore: avgMatchScore.toFixed(1),
      topPerformers,
      lowPerformers,
      correlation: correlation.toFixed(2),
      passRate: ((topPerformers / totalCandidates) * 100).toFixed(1)
    };
  }, [candidates]);

  // Simple correlation calculation
  function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Match Score Analytics</h2>
      
      {/* Key Insights */}
      <div className="insights-grid">
        <div className="insight-card excellent">
          <h4>Average Match Score</h4>
          <span className="insight-number">{insights.avgMatchScore}%</span>
        </div>
        <div className="insight-card good">
          <h4>Top Performers (80%+)</h4>
          <span className="insight-number">{insights.topPerformers}</span>
        </div>
        <div className="insight-card warning">
          <h4>ATS Pass Rate</h4>
          <span className="insight-number">{insights.passRate}%</span>
        </div>
        <div className="insight-card info">
          <h4>Experience Correlation</h4>
          <span className="insight-number">{insights.correlation}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Match Score Distribution</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={distributionData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Score vs Experience Correlation</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Scatter data={scatterData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>Match Score Trends Over Time</h3>
        <div className="chart-container" style={{ height: '250px' }}>
          <Line data={trendData} options={{
            ...chartOptions,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Average Match Score (%)'
                },
                min: 0,
                max: 100
              }
            }
          }} />
        </div>
      </div>

      {/* ATS Recommendations */}
      <div className="recommendations-section">
        <h3>ATS Optimization Insights</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <h4>🎯 Keyword Optimization</h4>
            <p>
              {insights.lowPerformers > 0 
                ? `${insights.lowPerformers} candidates have low match scores. Consider keyword optimization training.`
                : 'Great keyword alignment across candidates!'
              }
            </p>
          </div>
          <div className="recommendation-card">
            <h4>📈 Experience Factor</h4>
            <p>
              {Math.abs(insights.correlation) > 0.3
                ? `Strong correlation (${insights.correlation}) between experience and match scores.`
                : 'Experience and match scores show weak correlation - skills matter more than years.'
              }
            </p>
          </div>
          <div className="recommendation-card">
            <h4>🔍 ATS Readiness</h4>
            <p>
              {insights.passRate > 60
                ? `${insights.passRate}% pass rate is excellent for ATS systems.`
                : `${insights.passRate}% pass rate suggests need for resume optimization.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchScoreAnalytics;
