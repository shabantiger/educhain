import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './SubscriptionManager.css';

const SubscriptionManager = () => {
  const [plans, setPlans] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usage, setUsage] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        api.get('/subscription/plans'),
        api.get('/subscription/current')
      ]);

      setPlans({
        basic: {
          name: 'Basic',
          price: 29.99,
          currency: 'USD',
          features: [
            'Up to 100 certificates per month',
            'Basic verification',
            'Email support',
            'Standard templates'
          ],
          limits: {
            certificatesPerMonth: 100,
            storageGB: 1,
            apiCalls: 1000,
            customBranding: false,
            whiteLabel: false
          }
        },
        professional: {
          name: 'Professional',
          price: 99.99,
          currency: 'USD',
          features: [
            'Up to 500 certificates per month',
            'Advanced verification',
            'Priority support',
            'Custom templates',
            'Analytics dashboard',
            'Bulk operations',
            'Custom branding'
          ],
          limits: {
            certificatesPerMonth: 500,
            storageGB: 10,
            apiCalls: 5000,
            customBranding: true,
            whiteLabel: false
          }
        },
        enterprise: {
          name: 'Enterprise',
          price: 299.99,
          currency: 'USD',
          features: [
            'Unlimited certificates',
            'Premium verification',
            '24/7 support',
            'Custom branding',
            'Advanced analytics',
            'API access',
            'White-label solution',
            'Dedicated account manager'
          ],
          limits: {
            certificatesPerMonth: -1,
            storageGB: 100,
            apiCalls: 50000,
            customBranding: true,
            whiteLabel: true
          }
        }
      });
      setCurrentSubscription(subscriptionResponse.data.subscription);
      setUsage(subscriptionResponse.data.usage);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await api.post('/subscription/subscribe', {
        planId: selectedPlan,
        paymentMethod
      });

      setCurrentSubscription(response.data.subscription);
      setShowPaymentModal(false);
      setSelectedPlan(null);
      
      // Refresh subscription data
      await fetchSubscriptionData();
      
      alert('Subscription activated successfully!');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to activate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/subscription/cancel');
      
      setCurrentSubscription(null);
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="subscription-container">
        <div className="loading-spinner">Loading subscription data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-container">
        <div className="error-message">
          <h3>Error Loading Subscription</h3>
          <p>{error}</p>
          <button onClick={fetchSubscriptionData} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="subscription-header">
        <h1>Subscription Management</h1>
        <p>Choose the perfect plan for your institution</p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="current-subscription">
          <div className="subscription-status">
            <h3>Current Plan</h3>
            <div className="plan-details">
              <span className="plan-name">{plans[currentSubscription.planId]?.name}</span>
              <span className="plan-price">${plans[currentSubscription.planId]?.price}/month</span>
              <span className={`status-badge ${currentSubscription.status}`}>
                {currentSubscription.status}
              </span>
            </div>
            <div className="usage-stats">
              <div className="usage-item">
                <span className="usage-label">Certificates this month:</span>
                <span className="usage-value">{usage.certificatesThisMonth}</span>
              </div>
              <div className="usage-item">
                <span className="usage-label">Storage used:</span>
                <span className="usage-value">{usage.storageUsed} GB</span>
              </div>
              <div className="usage-item">
                <span className="usage-label">API calls:</span>
                <span className="usage-value">{usage.apiCallsThisMonth}</span>
              </div>
            </div>
            <button 
              onClick={handleCancelSubscription}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="plans-section">
        <h2>Available Plans</h2>
        <div className="plans-grid" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', width: '100%' }}>
          {Object.entries(plans).map(([planId, plan]) => (
            <div 
              key={planId} 
              className={`plan-card ${currentSubscription?.planId === planId ? 'current' : ''}`}
            >
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">${plan.price}</span>
                  <span className="period">/month</span>
                </div>
              </div>
              
              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="plan-limits">
                <div className="limit-item">
                  <span className="limit-label">Certificates:</span>
                  <span className="limit-value">
                    {plan.limits.certificatesPerMonth === -1 ? 'Unlimited' : plan.limits.certificatesPerMonth}
                  </span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Storage:</span>
                  <span className="limit-value">{plan.limits.storageGB} GB</span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">API Calls:</span>
                  <span className="limit-value">{plan.limits.apiCalls.toLocaleString()}</span>
                </div>
              </div>

              {currentSubscription?.planId === planId ? (
                <button className="btn-current" disabled>
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn-subscribe"
                  onClick={() => {
                    setSelectedPlan(planId);
                    setShowPaymentModal(true);
                  }}
                >
                  {currentSubscription ? 'Upgrade' : 'Subscribe'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>Complete Subscription</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="selected-plan">
                <h4>Selected Plan: {plans[selectedPlan]?.name}</h4>
                <p className="plan-price">${plans[selectedPlan]?.price}/month</p>
              </div>

              <div className="payment-method">
                <h4>Payment Method</h4>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="option-label">Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="crypto"
                      checked={paymentMethod === 'crypto'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="option-label">Cryptocurrency</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager; 