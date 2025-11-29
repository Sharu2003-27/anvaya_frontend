import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { leadsAPI, agentsAPI } from '../services/api';
import { getTimeToCloseLabel, getTimeToCloseValue } from '../utils/leadUtils';
import { useToast } from './ToastProvider';
import './SalesAgentView.css';

export default function SalesAgentView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAgent, setNewAgent] = useState({ name: '', email: '' });
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(searchParams.get('salesAgent') || '');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
  });
  const [sortBy, setSortBy] = useState('timeToClose');

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [selectedAgent, filters, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAgent) params.set('salesAgent', selectedAgent);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    setSearchParams(params);
  }, [selectedAgent, filters]);

  const loadAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      setAgents(response.data);
      // If no agent selected from URL, select first agent
      if (response.data.length > 0 && !selectedAgent) {
        setSelectedAgent(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
      addToast({ type: 'error', message: 'Unable to load agents.' });
    }
  };

  const handleNewAgentChange = (e) => {
    const { name, value } = e.target;
    setNewAgent(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!newAgent.name.trim() || !newAgent.email.trim()) return;

    setCreatingAgent(true);
    try {
      const response = await agentsAPI.create({
        name: newAgent.name.trim(),
        email: newAgent.email.trim(),
      });
      addToast({ type: 'success', message: 'Sales agent added successfully.' });
      setNewAgent({ name: '', email: '' });
      setShowNewAgentForm(false);
      await loadAgents();
      // Optionally auto-select the newly created agent if returned
      const createdId = response.data?.id;
      if (createdId) {
        setSelectedAgent(createdId);
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Error adding sales agent.';
      console.error('Error adding agent:', err);
      addToast({ type: 'error', message });
    } finally {
      setCreatingAgent(false);
    }
  };

  const loadLeads = async () => {
    if (!selectedAgent) {
      setLeads([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const filterParams = {
        salesAgent: selectedAgent,
        ...filters,
      };
      // Remove empty filters
      Object.keys(filterParams).forEach(key => {
        if (!filterParams[key]) delete filterParams[key];
      });

      const response = await leadsAPI.getAll(filterParams);
      let leadsData = response.data;

      // Sort leads
      leadsData.sort((a, b) => {
        if (sortBy === 'timeToClose') {
          return getTimeToCloseValue(a) - getTimeToCloseValue(b);
        } else if (sortBy === 'status') {
          const statusOrder = { 'New': 1, 'Contacted': 2, 'Qualified': 3, 'Proposal Sent': 4, 'Closed': 5 };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        } else if (sortBy === 'priority') {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        return 0;
      });

      setLeads(leadsData);
    } catch (err) {
      console.error('Error loading leads:', err);
      addToast({ type: 'error', message: 'Unable to load leads for this agent.' });
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

  const currentAgent = agents.find(a => a.id === selectedAgent);

  if (loading) {
    return <div className="loading">Loading leads...</div>;
  }

  const filteredLeads = leads.filter(lead => {
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.priority && lead.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="sales-agent-view-container">
      <div className="agent-view-header">
        <h2>Leads by Sales Agent</h2>
        <button
          onClick={() => setShowNewAgentForm(prev => !prev)}
          className="btn-primary"
        >
          {showNewAgentForm ? 'Close' : 'Add New Sales Agent'}
        </button>
      </div>

      {showNewAgentForm && (
        <div className="agent-add-form">
          <h3>Add New Sales Agent</h3>
          <form onSubmit={handleCreateAgent} className="agent-add-form-inner">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={newAgent.name}
                onChange={handleNewAgentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={newAgent.email}
                onChange={handleNewAgentChange}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={creatingAgent}>
              {creatingAgent ? 'Saving...' : 'Save Agent'}
            </button>
          </form>
        </div>
      )}

      <div className="agent-selector">
        <label>Select Sales Agent:</label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="agent-select"
        >
          <option value="">Select an agent</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>

      {selectedAgent && currentAgent && (
        <>
          <div className="agent-info">
            <h3>Sales Agent: {currentAgent.name}</h3>
            {currentAgent.email && (
              <p>Email: {currentAgent.email}</p>
            )}
            <p>Total Leads: {filteredLeads.length}</p>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <label>Filter by Status:</label>
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
                <option value="status">Status</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          <div className="agent-leads-section">
            <div className="leads-list">
              {filteredLeads.length === 0 ? (
                <div className="no-leads">No leads found for this agent.</div>
              ) : (
                filteredLeads.map(lead => (
                  <div key={lead.id} className="lead-item">
                    <div className="lead-item-header">
                      <h4 onClick={() => navigate(`/leads/${lead.id}`)} className="lead-name">
                        {lead.name}
                      </h4>
                      <div className="badges">
                        <span className={`status-badge ${getStatusClass(lead.status)}`}>
                          {lead.status}
                        </span>
                        <span className={`priority-badge ${getPriorityClass(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                  </div>
                  <div className="lead-item-body">
                    <p><strong>Status:</strong> {lead.status}</p>
                    <p><strong>Time to Close:</strong> {getTimeToCloseLabel(lead)}</p>
                    {currentAgent && (
                      <p><strong>Sales Agent:</strong> {currentAgent.name}{currentAgent.email ? ` (${currentAgent.email})` : ''}</p>
                    )}
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
        </>
      )}

      {!selectedAgent && (
        <div className="no-agent-selected">
          Please select a sales agent to view their leads.
        </div>
      )}
    </div>
  );
}
