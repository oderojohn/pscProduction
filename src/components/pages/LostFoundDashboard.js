// LostFoundDashboard.js
import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import '../../assets/css/Dashboard.css';
import { LostFoundService } from '../../service/api/api';

Chart.register(...registerables);

const LostFoundDashboard = () => {
  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const [lostFoundData, setLostFoundData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyReport] = await Promise.all([
          LostFoundService.getFoundWeeklyReport(),
        ]);
        
        console.log("📊 Weekly Report Response:", weeklyReport);
        
        // Process the daily data for the line chart
        const dailyFoundData = Array(7).fill(0);
        const dailyLostData = Array(7).fill(0);
        
        // Convert dates to day names (Mon, Tue, etc.)
        //const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Process found items daily data
        weeklyReport.found_items_daily.forEach(item => {
          const date = new Date(item.day);
          const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
          dailyFoundData[dayOfWeek] = item.count;
        });
        
        // Process lost items daily data
        weeklyReport.lost_items_daily.forEach(item => {
          const date = new Date(item.day);
          const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
          dailyLostData[dayOfWeek] = item.count;
        });
        
        // Reorder the array to start with Monday
        const reorderedFoundData = [...dailyFoundData.slice(1), dailyFoundData[0]];
        const reorderedLostData = [...dailyLostData.slice(1), dailyLostData[0]];
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const processedData = {
          startDate: new Date(weeklyReport.start_date).toLocaleDateString(),
          endDate: new Date(weeklyReport.end_date).toLocaleDateString(),
          lostItemsTotal: weeklyReport.lost_items_total,
          foundItemsTotal: weeklyReport.found_items_total,
          claimedItemsCount: weeklyReport.claimed_items_count,
          claimRate: weeklyReport.claim_rate,
          cardStats: {
            lost: weeklyReport.lost_items_by_type.find(item => item.type === 'card')?.count || 0,
            found: weeklyReport.found_items_by_type.find(item => item.type === 'card')?.count || 0
          },
          itemStats: {
            lost: weeklyReport.lost_items_by_type.find(item => item.type === 'item')?.count || 0,
            found: weeklyReport.found_items_by_type.find(item => item.type === 'item')?.count || 0
          },
          dailyFoundData: reorderedFoundData,
          dailyLostData: reorderedLostData,
          chartLabels: labels
        };

        const chartData = {
          total: processedData.foundItemsTotal,
          thisWeek: processedData.foundItemsTotal,
          weeklyData: processedData.dailyFoundData,
          categories: ['Cards', 'Other Items'],
          categoryCounts: [
            processedData.cardStats.found,
            processedData.itemStats.found
          ],
          weeklyStats: processedData
        };

        setLostFoundData(chartData);
      } catch (error) {
        console.error('Error loading lost & found data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!lostFoundData) return;
    const charts = [];

    const lineChart = new Chart(lineChartRef.current, {
      type: 'line',
      data: {
        labels: lostFoundData.weeklyStats.chartLabels,
        datasets: [
          {
            label: 'Found Items',
            data: lostFoundData.weeklyData,
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Lost Items',
            data: lostFoundData.weeklyStats.dailyLostData,
            borderColor: '#f8961e',
            backgroundColor: 'rgba(248, 150, 30, 0.1)',
            tension: 0.3,
            fill: true,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
    charts.push(lineChart);

    const doughnutChart = new Chart(doughnutChartRef.current, {
      type: 'doughnut',
      data: {
        labels: lostFoundData.categories,
        datasets: [{
          data: lostFoundData.categoryCounts,
          backgroundColor: ['#4361ee', '#3f37c9'],
          hoverBackgroundColor: ['#5a75f0', '#5750d4']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    charts.push(doughnutChart);

    return () => charts.forEach(chart => chart.destroy());
  }, [lostFoundData]);

  if (!lostFoundData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Found Items Card with Line Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">📈</div>
          <h3 className="card-title">Weekly Activity</h3>
          <div className="date-range">
            {lostFoundData.weeklyStats.startDate} - {lostFoundData.weeklyStats.endDate}
          </div>
        </div>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.foundItemsTotal}</div>
            <div className="stat-label">Total Found</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.lostItemsTotal}</div>
            <div className="stat-label">Total Lost</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Math.round(lostFoundData.weeklyStats.claimRate * 100)}%</div>
            <div className="stat-label">Claim Rate</div>
          </div>
        </div>
        <div className="chart-container" style={{ height: '250px' }}>
          <canvas ref={lineChartRef}></canvas>
        </div>
      </div>

      {/* Found Items Categories with Doughnut Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">🔍</div>
          <h3 className="card-title">Found Items Breakdown</h3>
        </div>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.cardStats.found}</div>
            <div className="stat-label">Cards Found</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.itemStats.found}</div>
            <div className="stat-label">Other Items</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.claimedItemsCount}</div>
            <div className="stat-label">Claimed</div>
          </div>
        </div>
        <div className="chart-container" style={{ height: '200px' }}>
          <canvas ref={doughnutChartRef}></canvas>
        </div>
      </div>

      {/* Lost Items Summary Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">⚠️</div>
          <h3 className="card-title">Lost Items Summary</h3>
        </div>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.lostItemsTotal}</div>
            <div className="stat-label">Total Lost</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.cardStats.lost}</div>
            <div className="stat-label">Cards Lost</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{lostFoundData.weeklyStats.itemStats.lost}</div>
            <div className="stat-label">Other Items</div>
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
          <div style={{ 
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(248, 150, 30, 0.05)',
            marginBottom: '10px'
          }}>
            <div style={{ fontWeight: '500', color: '#f8961e' }}>Lost & Found Policy</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              Unclaimed items will be donated after 30 days. Current claim rate: {Math.round(lostFoundData.weeklyStats.claimRate * 100)}%
            </div>
          </div>
          <div style={{ 
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(67, 97, 238, 0.05)',
            fontSize: '14px'
          }}>
            <strong>Recent Activity:</strong> {lostFoundData.weeklyStats.foundItemsTotal} items found and {lostFoundData.weeklyStats.lostItemsTotal} items reported lost in the last 2 weeks.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFoundDashboard;