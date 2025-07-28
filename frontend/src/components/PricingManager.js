import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PricingManager.css';

const PricingManager = () => {
  const [plans, setPlans] = useState({});
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pricing', {
        headers: { 'admin-email': 'admin@educhain.com' }
      });
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (planId) => {
    const plan = plans[planId];
    setEditingPlan(planId);
    setEditForm({
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      certificatesPerMonth: plan.limits.certificatesPerMonth,
      storageGB: plan.limits.storageGB,
      apiCalls: plan.limits.apiCalls,
      features: plan.features.join('\n')
    });
    setShowEditModal(true);
  };

  const handleSavePlan = async () => {
    try {
      setLoading(true);
      await api.put(`/admin/pricing/plans/${editingPlan}`, editForm, {
        headers: { 'admin-email': 'admin@educhain.com' }
      });
      
      setShowEditModal(false);
      setEditingPlan(null);
      await fetchPricingData();
      alert('Plan updated successfully!');
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('Failed to update plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      setLoading(true);
      await api.post('/admin/pricing/plans', editForm, {
        headers: { 'admin-email': 'admin@educhain.com' }
      });
      
      setShowEditModal(false);
      setEditingPlan(null);
      await fetchPricingData();
      alert('Plan added successfully!');
    } catch (error) {
      console.error('Failed to add plan:', error);
      alert('Failed to add plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/admin/pricing/plans/${planId}`, {
        headers: { 'admin-email': 'admin@educhain.com' }
      });
      
      await fetchPricingData();
      alert('Plan deleted successfully!');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pricing-container">
        <div className="loading-spinner">Loading pricing data...</div>
      </div>
    );
  }

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Pricing Management</h1>
        <p>Manage subscription plans and pricing</p>
        <button 
          className="btn-add-plan"
          onClick={() => {
            setEditingPlan(null);
            setEditForm({
              name: '',
              price: 0,
              currency: 'USD',
              certificatesPerMonth: 100,
              storageGB: 1,
              apiCalls: 1000,
              features: ''
            });
            setShowEditModal(true);
          }}
        >
          Add New Plan
        </button>
      </div>

      <div className="plans-management">
        <h2>Current Plans</h2>
        <div className="plans-grid">
          {Object.entries(plans).map(([planId, plan]) => (
            <div key={planId} className="plan-management-card">
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">${plan.price}/month</div>
              </div>
              
              <div className="plan-limits">
                <div className="limit-item">
                  <span>Certificates:</span>
                  <span>{plan.limits.certificatesPerMonth === -1 ? 'Unlimited' : plan.limits.certificatesPerMonth}</span>
                </div>
                <div className="limit-item">
                  <span>Storage:</span>
                  <span>{plan.limits.storageGB} GB</span>
                </div>
                <div className="limit-item">
                  <span>API Calls:</span>
                  <span>{plan.limits.apiCalls.toLocaleString()}</span>
                </div>
              </div>

              <div className="plan-features">
                <h4>Features:</h4>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="plan-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEditPlan(planId)}
                >
                  Edit Plan
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeletePlan(planId)}
                >
                  Delete Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Plan Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="plan-modal">
            <div className="modal-header">
              <h3>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Plan Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="e.g.,Free tial, Basic, Professional, Enterprise"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                    placeholder="29.99"
                  />
                </div>
                <div className="form-group">
                  <label>Currency:</label>
                  <select
                    value={editForm.currency}
                    onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Certificates per Month:</label>
                  <input
                    type="number"
                    value={editForm.certificatesPerMonth}
                    onChange={(e) => setEditForm({...editForm, certificatesPerMonth: parseInt(e.target.value)})}
                    placeholder="100"
                  />
                  <small>Use -1 for unlimited</small>
                </div>
                <div className="form-group">
                  <label>Storage (GB):</label>
                  <input
                    type="number"
                    value={editForm.storageGB}
                    onChange={(e) => setEditForm({...editForm, storageGB: parseInt(e.target.value)})}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>API Calls:</label>
                <input
                  type="number"
                  value={editForm.apiCalls}
                  onChange={(e) => setEditForm({...editForm, apiCalls: parseInt(e.target.value)})}
                  placeholder="1000"
                />
              </div>

              <div className="form-group">
                <label>Features (one per line):</label>
                <textarea
                  value={editForm.features}
                  onChange={(e) => setEditForm({...editForm, features: e.target.value})}
                  placeholder="Up to 100 certificates per month&#10;Basic verification&#10;Email support"
                  rows="6"
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-save"
                  onClick={editingPlan ? handleSavePlan : handleAddPlan}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Add Plan')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManager; 