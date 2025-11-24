import React, { useState, useEffect } from 'react';
import { FiPrinter, FiFileText, FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import { AuthService, PackageService } from '../../service/api/api';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ReportsDashboard = () => {
  const [eventLogs, setEventLogs] = useState([]);
  const [packageReports, setPackageReports] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [logsOpen, setLogsOpen] = useState(false);
  const [packageData, setPackageData] = useState({
    pending: [],
    picked: [],
    summary: {},
    stats: {},
    allPackages: []
  });

  // Fetch Event Logs on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logs = await AuthService.getEventLogs();
        const formattedLogs = logs.map((log) => {
          const username = log.user?.username || (log.user ? `User #${log.user}` : 'System');
          const timestamp = new Date(log.timestamp).toLocaleString();
          return `[${timestamp}] ${username} ${log.action.toLowerCase()}${log.object_type ? ` ${log.object_type}` : ''}${log.object_id ? ` #${log.object_id}` : ''}`;
        });
        setEventLogs(formattedLogs);
      } catch (error) {
        console.error('Failed to load event logs:', error);
      }
    };
    fetchLogs();
  }, []);

  // Fetch all package data
  useEffect(() => {
    const fetchAllPackageReports = async () => {
      try {
        const pendingPackages = await PackageService.getPackages({});
        const pickedPackages = await PackageService.getPickedPackages({});
        const summary = await PackageService.getSummary({});
        const stats = await PackageService.getStats({});
        const allPackages = await PackageService.searchPackages({});

        setPackageData({
          pending: pendingPackages,
          picked: pickedPackages,
          summary,
          stats,
          allPackages
        });

        // Create report entries for display
        const packageReportsFormatted = [
          ...pendingPackages.map(pkg => createPackageReport(pkg, 'Pending')),
          ...pickedPackages.map(pkg => createPackageReport(pkg, 'Picked'))
        ];

        // Add summary reports
        const summaryReports = [
          {
            id: 'summary-total',
            module: 'Drop Package',
            type: 'Summary Report',
            description: `Total packages: ${stats.total} (Pending: ${stats.pending}, Picked: ${stats.picked})`,
            dateRange: 'All Time',
            data: stats,
            reportType: 'stats'
          },
          {
            id: 'summary-daily',
            module: 'Drop Package',
            type: 'Daily Summary',
            description: `Daily package summary for last ${summary.daily_summary.length} days`,
            dateRange: `Last ${summary.daily_summary.length} days`,
            data: summary.daily_summary,
            reportType: 'daily'
          },
          {
            id: 'summary-type',
            module: 'Drop Package',
            type: 'Type Distribution',
            description: `Package type distribution: ${summary.type_distribution.map(t => `${t.type}: ${t.count}`).join(', ')}`,
            dateRange: 'All Time',
            data: summary.type_distribution,
            reportType: 'type'
          }
        ];

        setPackageReports([...packageReportsFormatted, ...summaryReports]);
      } catch (error) {
        console.error('Failed to load package reports:', error);
      }
    };

    const createPackageReport = (pkg, status) => ({
      id: `package-${pkg.id}`,
      module: 'Drop Package',
      type: `${status} Package`,
      description: `${pkg.package_type} #${pkg.id} - ${pkg.description || 'No description'}`,
      dateRange: new Date(pkg.created_at || pkg.updated_at).toLocaleDateString(),
      data: pkg,
      reportType: 'package'
    });

    fetchAllPackageReports();
  }, []);

  // Static reports example
  const staticReports = [
    {
      id: 1,
      module: 'Lost Items/Cards',
      type: 'Daily Summary',
      description: 'Summary of all lost items reported today',
      dateRange: 'Today',
      reportType: 'static'
    },
    {
      id: 2,
      module: 'Lost Items/Cards',
      type: 'Weekly Summary',
      description: 'Summary of all lost items reported this week',
      dateRange: 'This Week',
      reportType: 'static'
    },
  ];

  const allReports = [...staticReports, ...packageReports];

  const filteredReports = allReports.filter((report) => {
    const moduleMatch = selectedModule === 'all' || report.module === selectedModule;
    const dateMatch =
      selectedDateRange === 'all' ||
      report.dateRange.toLowerCase().includes(selectedDateRange.toLowerCase()) ||
      (selectedDateRange === 'custom' && report.dateRange === 'Custom');
    return moduleMatch && dateMatch;
  });

  const handlePrintReport = (report) => {
    if (report.reportType === 'package') {
      generatePackagePDF(report.data);
    } else if (report.reportType === 'stats') {
      generateStatsPDF(report.data);
    } else if (report.reportType === 'daily') {
      generateDailySummaryPDF(report.data);
    } else if (report.reportType === 'type') {
      generateTypeDistributionPDF(report.data);
    } else {
      alert(`Printing report: ${report.module} - ${report.type}`);
    }
  };

  const handleExportCSV = (report) => {
    if (report.reportType === 'package') {
      exportPackageCSV([report.data]);
    } else if (report.reportType === 'stats') {
      exportStatsCSV(report.data);
    } else if (report.reportType === 'daily') {
      exportDailySummaryCSV(report.data);
    } else if (report.reportType === 'type') {
      exportTypeDistributionCSV(report.data);
    } else {
      alert(`Exporting report: ${report.module} - ${report.type}`);
    }
  };

  const generatePackagePDF = (pkg) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Package Report - #${pkg.id}`, 14, 20);
    doc.setFontSize(12);
    
    const data = [
      ['Field', 'Value'],
      ['Package Type', pkg.package_type],
      ['Code', pkg.code],
      ['Description', pkg.description || 'N/A'],
      ['Status', pkg.status],
      ['Dropped By', pkg.dropped_by || 'N/A'],
      ['Dropper Phone', pkg.dropper_phone || 'N/A'],
      ['Recipient Name', pkg.recipient_name || 'N/A'],
      ['Recipient Phone', pkg.recipient_phone || 'N/A'],
      ['Shelf', pkg.shelf || 'N/A'],
      ['Created At', new Date(pkg.created_at).toLocaleString()],
      ['Updated At', new Date(pkg.updated_at).toLocaleString()],
    ];

    doc.autoTable({
      startY: 30,
      head: [data[0]],
      body: data.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`package_report_${pkg.id}.pdf`);
  };

  const generateStatsPDF = (stats) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Package Statistics Report', 14, 20);
    doc.setFontSize(12);
    
    const data = [
      ['Statistic', 'Value'],
      ['Total Packages', stats.total],
      ['Pending Packages', stats.pending],
      ['Picked Packages', stats.picked],
      ['Shelves Occupied', stats.shelves_occupied || 'N/A'],
    ];

    doc.autoTable({
      startY: 30,
      head: [data[0]],
      body: data.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save('package_statistics_report.pdf');
  };

  const generateDailySummaryPDF = (dailySummary) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Daily Package Summary Report', 14, 20);
    doc.setFontSize(12);
    
    const data = [
      ['Date', 'Total', 'Pending', 'Picked'],
      ...dailySummary.map(day => [
        day.created_at__date,
        day.total,
        day.pending,
        day.picked
      ])
    ];

    doc.autoTable({
      startY: 30,
      head: [data[0]],
      body: data.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save('daily_package_summary_report.pdf');
  };

  const generateTypeDistributionPDF = (typeDistribution) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Package Type Distribution Report', 14, 20);
    doc.setFontSize(12);
    
    const data = [
      ['Package Type', 'Count'],
      ...typeDistribution.map(type => [
        type.type,
        type.count
      ])
    ];

    doc.autoTable({
      startY: 30,
      head: [data[0]],
      body: data.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save('package_type_distribution_report.pdf');
  };

  const exportPackageCSV = (packages) => {
    const headers = [
      'ID', 'Code', 'Package Type', 'Type', 'Description', 'Status', 
      'Dropped By', 'Dropper Phone', 'Recipient Name', 'Recipient Phone',
      'Shelf', 'Created At', 'Updated At', 'Picked At', 'Picked By'
    ];
    
    const rows = packages.map(pkg => [
      pkg.id,
      pkg.code,
      pkg.package_type,
      pkg.type,
      pkg.description || '',
      pkg.status,
      pkg.dropped_by || '',
      pkg.dropper_phone || '',
      pkg.recipient_name || '',
      pkg.recipient_phone || '',
      pkg.shelf || '',
      new Date(pkg.created_at).toISOString(),
      new Date(pkg.updated_at).toISOString(),
      pkg.picked_at ? new Date(pkg.picked_at).toISOString() : '',
      pkg.picked_by || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, packages.length === 1 ? `package_${packages[0].id}.csv` : 'packages.csv');
  };

  const exportStatsCSV = (stats) => {
    const csvContent = `Statistic,Value\nTotal Packages,${stats.total}\nPending Packages,${stats.pending}\nPicked Packages,${stats.picked}\nShelves Occupied,${stats.shelves_occupied || 'N/A'}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'package_statistics.csv');
  };

  const exportDailySummaryCSV = (dailySummary) => {
    const headers = ['Date', 'Total', 'Pending', 'Picked'];
    const rows = dailySummary.map(day => [
      day.created_at__date,
      day.total,
      day.pending,
      day.picked
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'daily_package_summary.csv');
  };

  const exportTypeDistributionCSV = (typeDistribution) => {
    const headers = ['Package Type', 'Count'];
    const rows = typeDistribution.map(type => [type.type, type.count]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'package_type_distribution.csv');
  };

  const handleExportAllPackages = () => {
    exportPackageCSV(packageData.allPackages);
  };

  return (
    <div className="lost-items-dashboard" style={{ paddingBottom: '80px' }}>
      <div className="dashboard-header">
        <h2><FiFileText size={18} /> Generate Reports</h2>
        <button 
          onClick={handleExportAllPackages}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiDownload /> Export All Packages (CSV)
        </button>
      </div>

      <div className="report-filters" style={{ marginBottom: '20px' }}>
        <div className="filter-group">
          <label>Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="Lost Items/Cards">Lost Items/Cards</option>
            <option value="Drop Package">Drop Package</option>
            <option value="Today's Events">Today's Events</option>
            <option value="Clamping Records">Clamping Records</option>
            <option value="Announcements">Announcements</option>
            <option value="Security Control">Security Control</option>
            <option value="Report an Issue">Report an Issue</option>
            <option value="System Logs">System Logs</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {selectedDateRange === 'custom' && (
          <div className="custom-date-range">
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) =>
                setCustomDateRange({ ...customDateRange, start: e.target.value })
              }
            />
            <span>to</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) =>
                setCustomDateRange({ ...customDateRange, end: e.target.value })
              }
            />
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Module</th>
              <th>Report Type</th>
              <th>Description</th>
              <th>Date Range</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{report.module}</td>
                  <td>{report.type}</td>
                  <td>{report.description}</td>
                  <td>{report.dateRange}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="icon-button"
                      onClick={() => handlePrintReport(report)}
                      title="Print Report"
                      style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      <FiPrinter />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleExportCSV(report)}
                      title="Export as CSV"
                      style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      <FiDownload />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                  No reports match your selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* System Logs Bar - fixed at bottom */}
      <div
        className="system-logs-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#222',
          color: '#eee',
          fontFamily: 'monospace',
          fontSize: '13px',
          maxHeight: logsOpen ? '400px' : '40px',
          overflowY: 'auto',
          transition: 'max-height 0.3s ease',
          borderTop: '3px solid #0af',
          zIndex: 1000,
          padding: '10px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={() => setLogsOpen(!logsOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0af',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: logsOpen ? '10px' : '0',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          aria-expanded={logsOpen}
          aria-controls="system-logs-content"
        >
          System Logs {logsOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        <div id="system-logs-content" style={{ whiteSpace: 'pre-wrap' }}>
          {eventLogs.length > 0 ? eventLogs.join('\n') : 'Loading logs...'}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;