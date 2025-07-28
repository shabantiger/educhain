import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const SubscriptionPlans = ({ user, onPlanChange }) => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
    // eslint-disable-next-line
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Plans are static in backend, so we can hardcode or fetch from a config endpoint
      // For now, hardcode as per backend/server.js
      setPlans([
        {
          id: 'basic',
          name: 'Basic',
          price: 29.99,
          currency: 'USD',
          features: [
            'Up to 100 certificates per month',
            'Basic verification',
            'Email support',
            'Standard templates'
          ]
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 99.99,
          currency: 'USD',
          features: [
            'Up to 500 certificates per month',
            'Advanced verification',
            'Priority support',
            'Custom templates',
            'Analytics dashboard',
            'Bulk operations'
          ]
        },
        {
          id: 'enterprise',
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
            'White-label solution'
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const res = await api.get('/subscription/current');
      setCurrentPlan(res.data.subscription);
    } catch {
      setCurrentPlan(null);
    }
  };

  const handleSubscribe = async (planId) => {
    setError('');
    setMessage('');
    setSubscribing(true);
    try {
      // For demo, use 'credit_card' as payment method
      const res = await api.post('/subscription/subscribe', {
        planId,
        paymentMethod: 'credit_card'
      });
      setMessage('Subscription successful!');
      setCurrentPlan(res.data.subscription);
      if (onPlanChange) onPlanChange(res.data.subscription);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="subscription-plans" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Subscription Plans</h2>
      {loading && <LoadingSpinner message="Loading plans..." />}
      {currentPlan && (
        <div className="current-plan">
          <h4>Your Current Plan: {currentPlan.planId.charAt(0).toUpperCase() + currentPlan.planId.slice(1)}</h4>
          <p>Status: <b>{currentPlan.status}</b></p>
          <p>Valid until: {new Date(currentPlan.currentPeriodEnd).toLocaleDateString()}</p>
        </div>
      )}
      <div className="plans-list" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', width: '100%' }}>
        {plans.map(plan => (
          <div key={plan.id} className={`plan-card${currentPlan?.planId === plan.id ? ' current' : ''}`}>
            <h3>{plan.name}</h3>
            <div className="plan-price">${plan.price} <span>{plan.currency}/mo</span></div>
            <ul className="plan-features">
              {plan.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button
              className="btn btn-primary"
              disabled={currentPlan?.planId === plan.id || subscribing}
              onClick={() => handleSubscribe(plan.id)}
            >
              {currentPlan?.planId === plan.id ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
    </div>
  );
};

export default SubscriptionPlans; 