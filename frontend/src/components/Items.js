import React, { useState, useEffect } from 'react';
import { awsConfig } from '../config';
import './Items.css';

function Items({ token, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${awsConfig.apiEndpoint}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editingItem
        ? `${awsConfig.apiEndpoint}/items/${editingItem.id}`
        : `${awsConfig.apiEndpoint}/items`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save item');

      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${awsConfig.apiEndpoint}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete item');
      await fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="items-container">
      <div className="items-header">
        <h1>Items Management</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-actions">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Add New Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="item-form">
          <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                disabled={loading}
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm && <div className="loading">Loading...</div>}

      <div className="items-list">
        {items.length === 0 && !loading && (
          <div className="empty-state">
            <p>No items yet. Click "Add New Item" to create one.</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-content">
              <h3>{item.name}</h3>
              <p>{item.description || 'No description'}</p>
              <div className="item-meta">
                <span>ID: {item.id}</span>
                <span>Updated: {new Date(item.updated_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(item.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Items;
