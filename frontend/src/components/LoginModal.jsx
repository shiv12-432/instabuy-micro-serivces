import { useState } from 'react';
import { normalizeSellerUser } from '../authUser';

export default function LoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Login failed');
      }
      const data = await res.json();
      // store simple user object
      const user = normalizeSellerUser({ id: data.id, token: data.token, email: data.email, name: data.name, role: data.role });
      localStorage.setItem('user', JSON.stringify(user));
      onSuccess && onSuccess(user);
      onClose && onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Sign in to continue</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="payment-body">
          <form className="payment-form" onSubmit={handleLogin}>
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            {error && <div className="alert error">{error}</div>}
            <div className="payment-actions">
              <button type="button" onClick={onClose} className="checkout-btn" style={{background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.06)'}}>Cancel</button>
              <button type="submit" className="checkout-btn">{loading ? 'Signing in...' : 'Sign in'}</button>
            </div>
          </form>
          <p className="payment-note">Don't have an account? <a href="/register">Register</a></p>
        </div>
      </div>
    </div>
  );
}
