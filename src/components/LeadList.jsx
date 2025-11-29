import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { leadsAPI, agentsAPI } from '../services/api';
import './LeadList.css';

export default function LeadList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    salesAgent: searchParams.get('salesAgent') || '',
    status: searchParams.get('status') || '',
    source: searchParams.get('source') || '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      try {
        const filterParams = {};
        if (filters.salesAgent) filterParams.salesAgent = filters.salesAgent;
        if (filters.status) filterParams.status = filters.status;
        if (filters.source) filterParams.source = filters.source;

        const response = await leadsAPI.getAll(filterParams);
        let leadsData = response.data;

        // Sort leads
        leadsData.sort((a, b) => {
          let aVal, bVal;
          if (sortBy === 'timeToClose') {
            aVal = a.timeToClose;
            bVal = b.timeToClose;
          } else if (sortBy === 'priority') {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            aVal = priorityOrder[a.priority] || 0;
            bVal = priorityOrder[b.priority] || 0;
          } else {
            aVal = new Date(a.createdAt);
            bVal = new Date(b.createdAt);
          }

          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });

        setLeads(leadsData);
      } catch (_err) {
        console.error('Error loading leads:', _err);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (filters.salesAgent) params.set('salesAgent', filters.salesAgent);
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    setSearchParams(params);
  }, [filters]);

  const loadAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      setAgents(response.data);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.salesAgent) filterParams.salesAgent = filters.salesAgent;
      if (filters.status) filterParams.status = filters.status;
      if (filters.source) filterParams.source = filters.source;

      const response = await leadsAPI.getAll(filterParams);
      let leadsData = response.data;

      // Sort leads
      leadsData.sort((a, b) => {
        let aVal, bVal;
        if (sortBy === 'timeToClose') {
          aVal = a.timeToClose;
          bVal = b.timeToClose;
        } else if (sortBy === 'priority') {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aVal = priorityOrder[a.priority] || 0;
          bVal = priorityOrder[b.priority] || 0;
        } else {
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      setLeads(leadsData);
    } catch (_err) {
      console.error('Error loading leads:', _err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(id);
        loadLeads();
      } catch (err) {
        alert('Error deleting lead');
      }
    }
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

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low',
    };
    return priorityClasses[priority] || '';
  };

  if (loading) {
    return <div className="loading">Loading leads...</div>;
  }

  return (
    <div className="lead-list-container">
      <div className="lead-list-header">
        <h2>Lead List</h2>
        <button onClick={() => navigate('/leads/new')} className="btn-primary">
          Add New Lead
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Sales Agent:</label>
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
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Source:</label>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Email">Email</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Date Created</option>
            <option value="timeToClose">Time to Close</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="leads-grid">
        {leads.length === 0 ? (
          <div className="no-leads">No leads found</div>
        ) : (
          leads.map(lead => (
            <div key={lead.id} className="lead-card">
              <div className="lead-card-header">
                <h3 onClick={() => navigate(`/leads/${lead.id}`)} className="lead-name">
                  {lead.name}
                </h3>
                <span className={`status-badge ${getStatusClass(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
              <div className="lead-card-body">
                <p><strong>Sales Agent:</strong> {lead.salesAgent?.name || 'N/A'}</p>
                <p><strong>Source:</strong> {lead.source}</p>
                <p><strong>Priority:</strong> 
                  <span className={`priority-badge ${getPriorityClass(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </p>
                <p><strong>Time to Close:</strong> {lead.timeToClose} days</p>
                {lead.tags && lead.tags.length > 0 && (
                  <div className="lead-tags">
                    {lead.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="lead-card-actions">
                <button onClick={() => navigate(`/leads/${lead.id}`)}>View</button>
                <button onClick={() => navigate(`/leads/${lead.id}/edit`)}>Edit</button>
                <button onClick={() => handleDelete(lead.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

