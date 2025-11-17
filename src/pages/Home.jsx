import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI, reportsAPI } from '../services/api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [pipelineTotal, setPipelineTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsResponse, pipelineResponse] = await Promise.all([
        leadsAPI.getAll(),
        reportsAPI.getPipeline(),
      ]);

      const allLeads = leadsResponse.data;
      setLeads(allLeads);

      // Calculate status counts
      const counts = {};
      allLeads.forEach(lead => {
        counts[lead.status] = (counts[lead.status] || 0) + 1;
      });
      setStatusCounts(counts);

      setPipelineTotal(pipelineResponse.data.totalLeadsInPipeline || 0);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Anvaya CRM Dashboard</h1>
        <button onClick={() => navigate('/leads/new')} className="btn-primary">
          Add New Lead
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Leads in Pipeline</h3>
          <div className="stat-number">{pipelineTotal}</div>
        </div>
        <div className="stat-card">
          <h3>Total Leads</h3>
          <div className="stat-number">{leads.length}</div>
        </div>
      </div>

      <div className="lead-status-section">
        <h2>Lead Status Overview</h2>
        <div className="status-cards">
          {statuses.map(status => (
            <div
              key={status}
              className="status-card"
              onClick={() => navigate(`/leads/status?status=${status}`)}
            >
              <h3>{status}</h3>
              <div className="status-count">{statusCounts[status] || 0}</div>
              <p>Leads</p>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-filters">
        <h3>Quick Filters</h3>
        <div className="filter-buttons">
          <button onClick={() => navigate('/leads?status=New')} className="filter-btn">
            New Leads
          </button>
          <button onClick={() => navigate('/leads?status=Contacted')} className="filter-btn">
            Contacted
          </button>
          <button onClick={() => navigate('/leads?status=Qualified')} className="filter-btn">
            Qualified
          </button>
          <button onClick={() => navigate('/leads?status=Proposal Sent')} className="filter-btn">
            Proposal Sent
          </button>
          <button onClick={() => navigate('/leads?status=Closed')} className="filter-btn">
            Closed
          </button>
        </div>
      </div>

      <div className="recent-leads">
        <h3>Recent Leads</h3>
        <div className="leads-preview">
          {leads.slice(0, 5).map(lead => (
            <div
              key={lead.id}
              className="lead-preview-item"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <div className="preview-header">
                <span className="preview-name">{lead.name}</span>
                <span className={`status-badge status-${lead.status.toLowerCase().replace(' ', '-')}`}>
                  {lead.status}
                </span>
              </div>
              <p className="preview-agent">Agent: {lead.salesAgent?.name || 'N/A'}</p>
            </div>
          ))}
          {leads.length === 0 && (
            <p className="no-leads">No leads yet. Create your first lead!</p>
          )}
        </div>
        {leads.length > 5 && (
          <button onClick={() => navigate('/leads')} className="btn-secondary">
            View All Leads
          </button>
        )}
      </div>
    </div>
  );
}
