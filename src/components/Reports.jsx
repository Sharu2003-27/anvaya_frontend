import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { useToast } from './ToastProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const { addToast } = useToast();
  const [lastWeekData, setLastWeekData] = useState([]);
  const [pipelineData, setPipelineData] = useState(null);
  const [closedByAgent, setClosedByAgent] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [lastWeek, pipeline, closedByAgentData, statusDist] = await Promise.all([
        reportsAPI.getLastWeek(),
        reportsAPI.getPipeline(),
        reportsAPI.getClosedByAgent(),
        reportsAPI.getStatusDistribution(),
      ]);

      setLastWeekData(lastWeek.data);
      setPipelineData(pipeline.data);
      setClosedByAgent(closedByAgentData.data);
      setStatusDistribution(statusDist.data);
    } catch (err) {
      console.error('Error loading reports:', err);
      addToast({ type: 'error', message: 'Unable to load reports.' });
    } finally {
      setLoading(false);
    }
  };

  // Chart data for leads closed last week
  const lastWeekChartData = {
    labels: lastWeekData.map(lead => lead.name),
    datasets: [
      {
        label: 'Leads Closed Last Week',
        data: lastWeekData.map(() => 1),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for pipeline by status
  const pipelineChartData = pipelineData ? {
    labels: Object.keys(pipelineData.byStatus || {}),
    datasets: [
      {
        label: 'Leads in Pipeline',
        data: Object.values(pipelineData.byStatus || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Chart data for closed leads by agent
  const closedByAgentChartData = {
    labels: closedByAgent.map(item => item.agentName),
    datasets: [
      {
        label: 'Closed Leads',
        data: closedByAgent.map(item => item.closedCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for status distribution
  const statusDistributionChartData = {
    labels: Object.keys(statusDistribution),
    datasets: [
      {
        label: 'Lead Status Distribution',
        data: Object.values(statusDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-container">
      <h2>Anvaya CRM Reports</h2>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Total Leads in Pipeline</h3>
          <div className="stat-number">{pipelineData?.totalLeadsInPipeline || 0}</div>
          {pipelineChartData && (
            <div className="chart-container">
              <Bar data={pipelineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        <div className="report-card">
          <h3>Leads Closed Last Week</h3>
          <div className="stat-number">{lastWeekData.length}</div>
          {lastWeekData.length > 0 && (
            <div className="chart-container">
              <Bar data={lastWeekChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
          {lastWeekData.length === 0 && (
            <p className="no-data">No leads were closed in the last week.</p>
          )}
        </div>

        <div className="report-card">
          <h3>Leads Closed by Sales Agent</h3>
          {closedByAgent.length > 0 ? (
            <>
              <div className="chart-container">
                <Bar data={closedByAgentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="agent-stats">
                {closedByAgent.map(item => (
                  <div key={item.agentId} className="agent-stat-item">
                    <span>{item.agentName}:</span>
                    <strong>{item.closedCount}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="no-data">No closed leads by agents yet.</p>
          )}
        </div>

        <div className="report-card">
          <h3>Lead Status Distribution</h3>
          <div className="chart-container">
            <Pie data={statusDistributionChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

