import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentsAPI } from '../services/api';
import { useToast } from './ToastProvider';
import '../styles/buttonTheme.css';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setAgentsLoading(true);
    try {
      const res = await agentsAPI.getAll();
      setAgents(res.data || []);
    } catch (err) {
      console.error('Error loading agents:', err);
      addToast({ type: 'error', message: 'Unable to load sales agents.' });
    } finally {
      setAgentsLoading(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await agentsAPI.delete(id);
      addToast({ type: 'success', message: 'Agent deleted successfully.' });

      loadAgents(); 
    } catch (err) {
      const message = err.response?.data?.error || 'Error deleting agent.';
      console.error('Error deleting agent:', err);
      addToast({ type: 'error', message });
    }
  };

  const handleViewAgentLeads = (agentId) => {
    navigate(`/leads/agents?salesAgent=${agentId}`);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <section className="settings-section">
        <div className="settings-section-header">
          <h3>Sales Agents</h3>
          <p className="settings-section-subtitle">
            View and delete existing sales agents. Use "View Leads" to see all leads for an agent.
          </p>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <h4>All Sales Agents</h4>

            {agentsLoading ? (
              <div className="loading">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="no-items">No agents added yet.</div>
            ) : (
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {agents.map((agent) => {
                    const agentId = agent.id || agent._id;

                    return (
                      <tr key={agentId}>
                        <td>{agent.name}</td>
                        <td>{agent.email}</td>

                        <td className="settings-actions">
                          <button className="btn" onClick={() => handleViewAgentLeads(agentId)}>
                            View Leads
                          </button>

                          <button className="btn" onClick={() => handleDeleteAgent(agentId)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
