import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentsAPI } from '../services/api';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingAgentId, setDeletingAgentId] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await agentsAPI.getAll();
      setAgents(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch sales agents right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId) => {
    const agent = agents.find((a) => (a.id || a._id) === agentId);
    if (!agent) return;
    const confirmed = window.confirm(`Delete ${agent.name}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingAgentId(agentId);
    setError('');
    setSuccess('');
    try {
      await agentsAPI.delete(agentId);
      setSuccess(`${agent.name} was removed.`);
      await loadAgents();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete this agent.');
    } finally {
      setDeletingAgentId(null);
    }
  };

  const handleViewLeads = (agentId) => {
    navigate(`/leads/agents?salesAgent=${agentId}`);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
          <p className="settings-subtitle">
            Manage sales agents from a single place. Jump to the Sales Agent view to
            inspect their pipeline or remove inactive agents below.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/leads/agents')}>
          Go to Sales Agent View
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">Loading agents…</div>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          No agents added yet. Use the <strong>Add New Agent</strong> button in the Sales Agent view to
          create one.
        </div>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => {
            const agentId = agent.id || agent._id;
            const createdAtLabel = agent.createdAt
              ? new Date(agent.createdAt).toLocaleDateString()
              : 'Recently added';
            return (
              <div key={agentId} className="agent-card">
              <div className="agent-card-info">
                <h3>{agent.name}</h3>
                <p>{agent.email}</p>
                <span className="agent-created">Added {createdAtLabel}</span>
              </div>
              <div className="agent-card-actions">
                <button className="btn-secondary" onClick={() => handleViewLeads(agentId)}>
                  View Leads
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(agentId)}
                  disabled={deletingAgentId === agentId}
                >
                  {deletingAgentId === agentId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

