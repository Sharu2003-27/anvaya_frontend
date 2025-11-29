import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leadsAPI, agentsAPI, tagsAPI } from '../services/api';
import { useToast } from './ToastProvider';
import './LeadForm.css';
import '../styles/buttonTheme.css'; // newly added shared button theme

export default function LeadForm({ onSuccess }) {
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    source: 'Website',
    salesAgent: '',
    status: 'New',
    tags: [],
    timeToClose: 30,
    priority: 'Medium',
  });
  const [agents, setAgents] = useState([]);
  // const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const leadSources = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'];
  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];
  const priorities = ['High', 'Medium', 'Low'];

  useEffect(() => {
    loadAgents();
    loadTags();
    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  const loadAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      setAgents(response.data);
    } catch (err) {
      console.error('Error loading agents:', err);
      addToast({ type: 'error', message: 'Unable to load agents.' });
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setAvailableTags(response.data.map(tag => tag.name));
    } catch (err) {
      console.error('Error loading tags:', err);
      addToast({ type: 'error', message: 'Unable to load tags.' });
    }
  };

  const loadLead = async () => {
    try {
      const response = await leadsAPI.getById(leadId);
      const lead = response.data;
      setFormData({
        name: lead.name,
        source: lead.source,
        salesAgent: lead.salesAgent?.id || lead.salesAgent?._id,
        status: lead.status,
        // normalize tags: array of strings or objects
        tags: (lead.tags || []).map(t => (typeof t === 'string' ? t : t.name)),
        timeToClose: lead.timeToClose,
        priority: lead.priority,
      });
    } catch (error) {
      setError('Error loading lead details', error);
      addToast({ type: 'error', message: 'Error loading lead details.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // convert numeric field to number
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeToClose' ? Number(value) : value,
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (leadId) {
        await leadsAPI.update(leadId, formData);
        addToast({ type: 'success', message: 'Lead updated successfully.' });
      } else {
        await leadsAPI.create(formData);
        addToast({ type: 'success', message: 'Lead created successfully.' });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/leads');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Error saving lead';
      setError(message);
      addToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-form-container">
      <h2>{leadId ? 'Update Lead' : 'Add New Lead'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="lead-form">
        <div className="form-group">
          <label>Lead Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Lead Source *</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
          >
            {leadSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Assigned Sales Agent *</label>
          <select
            name="salesAgent"
            value={formData.salesAgent}
            onChange={handleChange}
            required
          >
            <option value="">Select an agent</option>
            {agents.map(agent => (
              <option key={agent.id || agent._id} value={agent.id || agent._id}>{agent.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Lead Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Priority *</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Time to Close (days) *</label>
          <input
            type="number"
            name="timeToClose"
            value={formData.timeToClose}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-container">
            {availableTags.map(tag => (
              <label key={tag} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (leadId ? 'Update Lead' : 'Create Lead')}
          </button>
          <button type="button" onClick={() => navigate('/leads')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

