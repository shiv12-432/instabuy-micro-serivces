import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { normalizeSellerUser } from './authUser';
import TermsAgreement from './components/TermsAgreement';

export default function SellerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sellerName: '',
    storeName: '',
    gstNumber: '',
    accountNumber: '',
    ifscCode: '',
    pickupAddress: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!otpVerified) {
      setError('Please verify OTP before creating a seller account.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept InstaBuy terms and privacy notice before creating seller account.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.sellerName,
          email: form.email,
          password: form.password,
          role: 'SELLER',
          otp,
        }),
      });

      if (!res.ok) {
        let t = await res.text();
        try {
          const j = JSON.parse(t);
          t = j.message || j.error || t;
        } catch {}
        throw new Error(t || 'Seller registration failed');
      }

      const data = await res.json();

      // save seller profile to seller-service DB
      await fetch('/api/seller/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.id,
          sellerName: form.sellerName,
          storeName: form.storeName,
          gstNumber: form.gstNumber,
          phone: form.phone,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          pickupAddress: form.pickupAddress,
          email: form.email,
        }),
      });

      // keep localStorage as fallback
      localStorage.setItem(
        'sellerProfile',
        JSON.stringify({
          sellerName: form.sellerName,
          storeName: form.storeName,
          gstNumber: form.gstNumber,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          pickupAddress: form.pickupAddress,
          phone: form.phone,
          email: form.email,
        })
      );
      const sellerUser = normalizeSellerUser({
        id: data.id,
        token: data.token,
        email: data.email,
        name: data.name,
        role: data.role,
      });
      localStorage.setItem('user', JSON.stringify(sellerUser));
      navigate('/seller-dashboard');
    } catch (e) {
      setError(e.message || 'Seller registration failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError('');
    setSuccess('');
    if (!form.email) {
      setError('Enter seller email before requesting OTP.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.sellerName || form.storeName, purpose: 'SELLER_REGISTRATION' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to send OTP');
      }
      setOtpSent(true);
      setOtpVerified(false);
      setSuccess('OTP sent to seller email.');
    } catch (e) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setSuccess('');
    if (!otp) {
      setError('Enter the OTP sent to seller email.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Invalid OTP');
      }
      setOtpVerified(true);
      setSuccess('Seller email verified.');
    } catch (e) {
      setOtpVerified(false);
      setError(e.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="auth-wrapper seller-auth-wrapper">
      <div className="auth-box seller-auth-box">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Seller Register</span>
        </div>
        <h2>Seller Registration</h2>
        <p className="auth-subtitle">
          Enter your business, banking, pickup, and login details to start
          managing products on InstaBuy.
        </p>

        <div className="seller-form-benefits">
          <span>After login, seller can view products and stock available.</span>
          <span>Seller can add products, update stock, set discounts, and manage customer orders.</span>
        </div>

        {error && <div className="alert error" style={{ marginBottom: 14 }}>{error}</div>}
        {success && <div className="alert success" style={{ marginBottom: 14 }}>{success}</div>}

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="seller-form-grid">
            <label>
              Seller Name
              <input
                type="text"
                name="sellerName"
                value={form.sellerName}
                onChange={handleChange}
                required
                autoFocus
              />
            </label>

            <label>
              Store Name
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              GST Number
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                required
                pattern="[A-Za-z0-9]{10,15}"
                title="Enter a valid GST or tax identifier."
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Enter a 10 digit phone number."
              />
            </label>

            <label>
              Account Number
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{9,18}"
                title="Enter a valid bank account number."
              />
            </label>

            <label>
              IFSC Code
              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                required
                pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
                title="Enter a valid IFSC code, such as HDFC0001234."
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              OTP Verification
              <div className="otp-row">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpVerified(false);
                  }}
                  placeholder="6 digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button type="button" className="checkout-btn" onClick={sendOtp} disabled={otpLoading}>
                  {otpSent ? 'Resend' : 'Send'}
                </button>
                <button type="button" className="checkout-btn" onClick={verifyOtp} disabled={otpLoading || !otpSent}>
                  Verify
                </button>
              </div>
              <small className={otpVerified ? 'otp-ok' : 'muted-note'}>
                {otpVerified ? 'Verified' : 'OTP required before seller account creation'}
              </small>
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </label>
          </div>

          <label>
            Pickup Address
            <textarea
              name="pickupAddress"
              value={form.pickupAddress}
              onChange={handleChange}
              required
              minLength={12}
            />
          </label>

          <TermsAgreement checked={termsAccepted} onChange={setTermsAccepted} mode="creating a seller account" />

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registering Seller...' : 'Register Seller'}
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
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
