import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentsAPI, tagsAPI } from '../services/api';
import { useToast } from './ToastProvider';
import '../styles/buttonTheme.css';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [newAgent, setNewAgent] = useState({ name: '', email: '' });
  const [creatingAgent, setCreatingAgent] = useState(false);

  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    loadAgents();
    loadTags();
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

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const res = await tagsAPI.getAll();
      setTags(res.data || []);
    } catch (err) {
      console.error('Error loading tags:', err);
      addToast({ type: 'error', message: 'Unable to load tags.' });
    } finally {
      setTagsLoading(false);
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
      await agentsAPI.create({
        name: newAgent.name.trim(),
        email: newAgent.email.trim(),
      });
      addToast({ type: 'success', message: 'Sales agent added successfully.' });
      setNewAgent({ name: '', email: '' });
      loadAgents();
    } catch (err) {
      const message = err.response?.data?.error || 'Error adding sales agent.';
      console.error('Error adding agent:', err);
      addToast({ type: 'error', message });
    } finally {
      setCreatingAgent(false);
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

  const handleCreateTag = async (e) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    setCreatingTag(true);
    try {
      await tagsAPI.create({ name: trimmed });
      addToast({ type: 'success', message: 'Tag added successfully.' });
      setNewTagName('');
      loadTags();
    } catch (err) {
      const message = err.response?.data?.error || 'Error adding tag.';
      console.error('Error adding tag:', err);
      addToast({ type: 'error', message });
    } finally {
      setCreatingTag(false);
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
            Manage your sales agents. Use "View Leads" to see all leads for an agent.
          </p>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <h4>Add New Sales Agent</h4>
            <form onSubmit={handleCreateAgent} className="settings-form">
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
                {creatingAgent ? 'Saving...' : 'Add Agent'}
              </button>
            </form>
          </div>

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
                  {agents.map(agent => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      <td>{agent.email}</td>
                      <td className="settings-actions">
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleViewAgentLeads(agent.id)}
                        >
                          View Leads
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-header">
          <h3>Tags</h3>
          <p className="settings-section-subtitle">
            Define tags here. They will be available to select in the lead form.
          </p>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <h4>Add New Tag</h4>
            <form onSubmit={handleCreateTag} className="settings-form">
              <div className="form-group">
                <label>Tag Name *</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. High Value, Returning Customer"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={creatingTag}>
                {creatingTag ? 'Saving...' : 'Add Tag'}
              </button>
            </form>
          </div>

          <div className="settings-card">
            <h4>Existing Tags</h4>
            {tagsLoading ? (
              <div className="loading">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="no-items">No tags defined yet.</div>
            ) : (
              <ul className="tag-list">
                {tags.map(tag => (
                  <li key={tag._id || tag.id}>{tag.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
