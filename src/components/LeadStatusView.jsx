import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { leadsAPI, agentsAPI } from '../services/api';
import './LeadStatusView.css';

export default function LeadStatusView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allLeads, setAllLeads] = useState([]); // Store all leads for count calculation
  const [leads, setLeads] = useState([]); // Filtered leads for display
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'New');
  const [filters, setFilters] = useState({
    salesAgent: searchParams.get('salesAgent') || '',
    priority: searchParams.get('priority') || '',
  });
  const [sortBy, setSortBy] = useState('timeToClose');

  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];

  useEffect(() => {
    loadAgents();
    loadAllLeads(); // Load all leads for count calculation
  }, []);

  useEffect(() => {
    loadLeads();
  }, [selectedStatus, filters, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStatus) params.set('status', selectedStatus);
    if (filters.salesAgent) params.set('salesAgent', filters.salesAgent);
    if (filters.priority) params.set('priority', filters.priority);
    setSearchParams(params);
  }, [selectedStatus, filters]);

  const loadAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      setAgents(response.data);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };

  const loadAllLeads = async () => {
    try {
      const response = await leadsAPI.getAll();
      setAllLeads(response.data);
    } catch (err) {
      console.error('Error loading all leads:', err);
    }
  };

  const loadLeads = async () => {
    setLoading(true);
    try {
      const filterParams = {
        status: selectedStatus,
        ...filters,
      };
      // Remove empty filters
      Object.keys(filterParams).forEach(key => {
        if (!filterParams[key]) delete filterParams[key];
      });

      const response = await leadsAPI.getAll(filterParams);
      let leadsData = response.data;

      // Sort by time to close
      leadsData.sort((a, b) => {
        if (sortBy === 'timeToClose') {
          return a.timeToClose - b.timeToClose;
        } else if (sortBy === 'priority') {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        return 0;
      });

      setLeads(leadsData);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low',
    };
    return priorityClasses[priority] || '';
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      'New': 'status-new',
      'Contacted': 'status-contacted',
      'Qualified': 'status-qualified',
      'Proposal Sent': 'status-proposal',
      'Closed': 'status-closed',
    };
    return statusClasses[status] || '';
  };

  if (loading) {
    return <div className="loading">Loading leads...</div>;
  }

  const filteredLeads = leads.filter(lead => {
    if (filters.priority && lead.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="lead-status-view-container">
      <div className="status-view-header">
        <h2>Leads by Status</h2>
        <button onClick={() => navigate('/leads/new')} className="btn-primary">
          Add New Lead
        </button>
      </div>

      <div className="status-selector">
        {statuses.map(status => (
          <button
            key={status}
            className={`status-tab ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {status} ({allLeads.filter(l => l.status === status).length})
          </button>
        ))}
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Sales Agent:</label>
          <select
            value={filters.salesAgent}
            onChange={(e) => handleFilterChange('salesAgent', e.target.value)}
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Priority:</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="timeToClose">Time to Close</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <div className="status-leads-section">
        <h3>Status: {selectedStatus}</h3>
        <div className="leads-list">
          {filteredLeads.length === 0 ? (
            <div className="no-leads">No leads found for this status.</div>
          ) : (
            filteredLeads.map(lead => (
              <div key={lead.id} className="lead-item">
                <div className="lead-item-header">
                  <h4 onClick={() => navigate(`/leads/${lead.id}`)} className="lead-name">
                    {lead.name}
                  </h4>
                  <span className={`priority-badge ${getPriorityClass(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </div>
                <div className="lead-item-body">
                  <p><strong>Sales Agent:</strong> {lead.salesAgent?.name || 'N/A'}</p>
                  <p><strong>Time to Close:</strong> {lead.timeToClose} days</p>
                  <p><strong>Source:</strong> {lead.source}</p>
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="lead-tags">
                      {lead.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="lead-item-actions">
                  <button onClick={() => navigate(`/leads/${lead.id}`)}>View Details</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
