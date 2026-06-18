import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { normalizeSellerUser } from '../authUser';
import TermsAgreement from '../components/TermsAgreement';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted) {
      setError('Please accept InstaBuy terms and privacy notice before signing in.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { let t = await res.text(); try { const j = JSON.parse(t); t = j.message || j.error || t; } catch {} throw new Error(t || 'Login failed'); }
      const data = await res.json();
      if (data.role === 'ADMIN') {
        // verify it's the real admin
      }
      const user = normalizeSellerUser({ id: data.id, token: data.token, refreshToken: data.refreshToken, email: data.email, name: data.name, role: data.role });
      localStorage.setItem('user', JSON.stringify(user));
      navigate(user.role === 'SELLER' ? '/seller-dashboard' : '/');
    } catch (e) {
      const ADMIN_ID = 'admin';
      if (email.trim().toLowerCase() === ADMIN_ID) {
        setError('Incorrect admin credentials. Use admin as both ID and password.');
      } else {
        setError(e.message || 'Login failed');
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Sign In</h2>
        {error && <div className="alert error" style={{ marginBottom: 14 }}>{error}</div>}
        <form className="order-form" onSubmit={handle}>
          <label>
            Email or admin ID
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>

          <TermsAgreement checked={termsAccepted} onChange={setTermsAccepted} mode="continuing" />

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-divider">New to InstaBuy?</div>
        <Link to="/register" className="checkout-btn auth-secondary-btn" style={{ display: 'block', textAlign: 'center', marginTop: 12, background: 'linear-gradient(to bottom,#fff,#f3f3f3)', border: '1px solid #ddd' }}>
          Create your InstaBuy account
        </Link>
      </div>
    </div>
  );
}
