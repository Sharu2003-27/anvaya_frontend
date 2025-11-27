import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI, commentsAPI, agentsAPI } from '../services/api';
import './LeadDetails.css';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadLead();
    loadComments();
    loadAgents();
  }, [id]);

  const loadLead = async () => {
    try {
      const response = await leadsAPI.getById(id);
      setLead(response.data);
    } catch (err) {
      console.error('Error loading lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getByLeadId(id);
      setComments(response.data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      const fetchedAgents = response.data;
      setAgents(fetchedAgents);

      // Default to the first agent's id (supports both id and _id shapes)
      if (fetchedAgents.length > 0) {
        const firstAgent = fetchedAgents[0];
        setSelectedAgent(firstAgent.id || firstAgent._id);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedAgent) return;

    setSubmittingComment(true);
    try {
      await commentsAPI.create(id, {
        commentText: commentText.trim(),
        author: selectedAgent,
      });
      setCommentText('');
      loadComments();
    } catch (err) {
      alert('Error adding comment: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
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
    return <div className="loading">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="error">Lead not found</div>;
  }

  return (
    <div className="lead-details-container">
      <div className="lead-details-header">
        <button onClick={() => navigate('/leads')} className="btn-back">
          ← Back to Leads
        </button>
        <div className="header-actions">
          <button onClick={() => navigate(`/leads/${id}/edit`)} className="btn-primary">
            Edit Lead
          </button>
        </div>
      </div>

      <div className="lead-details-content">
        <div className="lead-info-section">
          <h2>{lead.name}</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Sales Agent:</label>
              <span>{lead.salesAgent?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Lead Source:</label>
              <span>{lead.source}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge ${getStatusClass(lead.status)}`}>
                {lead.status}
              </span>
            </div>
            <div className="info-item">
              <label>Priority:</label>
              <span className={`priority-badge ${getPriorityClass(lead.priority)}`}>
                {lead.priority}
              </span>
            </div>
            <div className="info-item">
              <label>Time to Close:</label>
              <span>{lead.timeToClose} days</span>
            </div>
            <div className="info-item">
              <label>Created At:</label>
              <span>{formatDate(lead.createdAt)}</span>
            </div>
            {lead.closedAt && (
              <div className="info-item">
                <label>Closed At:</label>
                <span>{formatDate(lead.closedAt)}</span>
              </div>
            )}
          </div>

          {lead.tags && lead.tags.length > 0 && (
            <div className="tags-section">
              <label>Tags:</label>
              <div className="tags-list">
                {lead.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="comments-section">
          <h3>Comments & Updates</h3>
          
          <form onSubmit={handleAddComment} className="comment-form">
            <div className="comment-form-group">
              <label>Add Comment:</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment or update..."
                rows="3"
                required
              />
            </div>
            <div className="comment-form-group">
              <label>Author:</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                required
              >
                {agents.map(agent => {
                  const agentId = agent.id || agent._id;
                  return (
                    <option key={agentId} value={agentId}>
                      {agent.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <button type="submit" disabled={submittingComment} className="btn-primary">
              {submittingComment ? 'Submitting...' : 'Add Comment'}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">No comments yet. Be the first to add one!</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-text">{comment.commentText}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

