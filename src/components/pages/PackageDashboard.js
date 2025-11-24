// PackageDashboard.js
import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import '../../assets/css/Dashboard.css';
import { PackageService } from '../../service/api/api';

Chart.register(...registerables);

const PackageDashboard = () => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const [packageData, setPackageData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, summary] = await Promise.all([
          PackageService.getStats(),
          PackageService.getSummary(),
        ]);

        const dailySummary = summary.daily_summary || [];
        const typeDistribution = summary.type_distribution || [];

        const chartData = {
          pending: stats.pending,
          picked: stats.picked,
          shelves_occupied: stats.shelves_occupied,
          total: stats.total,
          weekly: dailySummary.slice(-7).map(day => day.total),
          types: typeDistribution.map(item => item.type),
          typeCounts: typeDistribution.map(item => item.count)
        };

        setPackageData(chartData);
      } catch (error) {
        console.error('Error loading package data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!packageData) return;
    const charts = [];

    const barChart = new Chart(barChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Packages Received',
          data: packageData.weekly,
          backgroundColor: 'rgba(67, 97, 238, 0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
    charts.push(barChart);

    const pieChart = new Chart(pieChartRef.current, {
      type: 'pie',
      data: {
        labels: packageData.types,
        datasets: [{
          data: packageData.typeCounts,
          backgroundColor: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    charts.push(pieChart);

    return () => charts.forEach(chart => chart.destroy());
  }, [packageData]);

  if (!packageData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Package Delivery Card with Bar Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">📦</div>
          <h3 className="card-title">Package Delivery</h3>
        </div>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">{packageData.total}</div>
            <div className="stat-label">Total Packages</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{packageData.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{packageData.picked}</div>
            <div className="stat-label">Picked</div>
          </div>
        </div>
        <div className="chart-container">
          <canvas ref={barChartRef}></canvas>
        </div>
      </div>

      {/* Package Types with Pie Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">📊</div>
          <h3 className="card-title">Package Types</h3>
        </div>
        <div className="chart-container">
          <canvas ref={pieChartRef}></canvas>
        </div>
      </div>

      {/* Announcements Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">📢</div>
          <h3 className="card-title">Announcements</h3>
        </div>
        <div style={{ marginTop: '15px' }}>
          <div style={{ 
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(67, 97, 238, 0.05)',
            marginBottom: '10px'
          }}>
            <div style={{ fontWeight: '500', color: '#4361ee' }}>Package Pickup Reminder</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>Please pick up packages within 3 business days.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDashboard;