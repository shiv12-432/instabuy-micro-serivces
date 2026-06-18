import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TermsAgreement from '../components/TermsAgreement';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const updateForm = (key, value) => {
    setForm({ ...form, [key]: value });

    if (key === 'email') {
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const sendOtp = async () => {
    setError('');

    if (!form.name || !form.email) {
      setError('Enter your name and email before requesting OTP.');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          purpose: 'REGISTRATION',
        }),
      });

      if (!res.ok) {
        let t = await res.text();
        try {
          const j = JSON.parse(t);
          t = j.message || j.error || t;
        } catch {}
        throw new Error(t || 'Failed to send OTP');
      }

      setOtpSent(true);
    } catch (e) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');

    if (!otp.trim()) {
      setError('Enter the OTP sent to your email.');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          otp,
        }),
      });

      if (!res.ok) {
        let t = await res.text();
        try {
          const j = JSON.parse(t);
          t = j.message || j.error || t;
        } catch {}
        throw new Error(t || 'Invalid OTP');
      }

      setOtpVerified(true);
    } catch (e) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }

    if (!otpVerified) {
      setError('Please verify your email OTP before creating account.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept InstaBuy terms and privacy notice before creating account.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'CUSTOMER',
        }),
      });

      if (!res.ok) {
        let t = await res.text();

        try {
          const j = JSON.parse(t);
          t = j.message || j.error || t;
        } catch {}

        throw new Error(t);
      }

      const data = await res.json();

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          token: data.token,
          refreshToken: data.refreshToken,
          email: data.email,
          name: data.name,
          role: data.role,
        })
      );

      navigate('/');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box" style={{ maxWidth: 420 }}>
        <h2>Create Account</h2>

        {error && (
          <div className="alert error" style={{ marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form className="order-form" onSubmit={registerUser}>
          <label>
            Your name
            <input
              value={form.name}
              onChange={(e) =>
                updateForm('name', e.target.value)
              }
              placeholder="First and last name"
              required
              autoFocus
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                updateForm('email', e.target.value)
              }
              required
            />
          </label>

          <div className="seller-form-benefits">
            <button
              className="checkout-btn"
              type="button"
              onClick={sendOtp}
              disabled={otpLoading || otpVerified}
            >
              {otpVerified ? 'Email Verified' : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>

            {otpSent && !otpVerified && (
              <>
                <label>
                  Email OTP
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6 digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </label>

                <button
                  className="btn-primary"
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Checking OTP...' : 'Verify OTP'}
                </button>
              </>
            )}

            {otpVerified && <span>Email OTP verified. You can create your account.</span>}
          </div>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="At least 6 characters"
              required
            />
          </label>

          <TermsAgreement checked={termsAccepted} onChange={setTermsAccepted} mode="creating an account" />

          <button className="btn-primary" type="submit" disabled={loading || !otpVerified}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">Already have an account?</div>

        <Link
          to="/login"
          className="checkout-btn auth-secondary-btn"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 12,
            background: 'linear-gradient(to bottom,#fff,#f3f3f3)',
            border: '1px solid #ddd',
          }}
        >
          Sign In
        </Link>

        <div className="auth-divider">Want to sell on InstaBuy?</div>

        <Link
          to="/seller-register"
          className="checkout-btn"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Open Seller Registration
        </Link>
      </div>
    </div>
  );
}
