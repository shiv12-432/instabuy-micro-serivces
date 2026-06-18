import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStoredUser } from '../authUser';
import { fmt } from '../currency';

function readCart() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } }

const PAYMENT_METHODS = [
  { id: 'CARD',       label: 'Credit / Debit Card', icon: '💳' },
  { id: 'UPI',        label: 'UPI',                 icon: '📲' },
  { id: 'NETBANKING', label: 'Net Banking',          icon: '🏦' },
  { id: 'WALLET',     label: 'Wallet',               icon: '👛' },
];

const BANKS   = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'];
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik', 'Freecharge'];

// steps: 1=address  2=payment  3=otp  4=processing  5=success
export default function Checkout() {
  const [cart]    = useState(readCart());
  const navigate  = useNavigate();
  const [step, setStep]       = useState(1);
  const [gateway, setGateway] = useState('CARD');
  const [error, setError]     = useState('');

  const [address, setAddress] = useState({ name: '', address: '', city: '', zip: '' });
  const [card, setCard]       = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [upi, setUpi]         = useState('');
  const [bank, setBank]       = useState(BANKS[0]);
  const [wallet, setWallet]   = useState(WALLETS[0]);

  // OTP state
  const [otpSent, setOtpSent]       = useState(false);
  const [otpValue, setOtpValue]     = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtp, setDevOtp]         = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const OTP_VALIDITY_SECONDS = 300; // 5 minutes — matches backend OTP_VALIDITY_MS

  const subtotal = cart.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  const shipping  = subtotal > 999 ? 0 : 49;
  const total     = subtotal + shipping;

  useEffect(() => { if (!cart || cart.length === 0) navigate('/cart'); }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry     = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; };

  /* ── Step 1 → 2 ── */
  const handleAddressNext = (e) => {
    e.preventDefault();
    if (!address.name || !address.address || !address.city || !address.zip) {
      setError('Please fill all address fields.'); return;
    }
    setError(''); setStep(2);
  };

  /* ── Step 2 → 3: validate payment fields then send OTP ── */
  const handlePayNext = async (e) => {
    e.preventDefault();
    setError('');

    if (gateway === 'CARD') {
      if (card.number.replace(/\s/g, '').length < 16) { setError('Enter a valid 16-digit card number.'); return; }
      if (!card.expiry || card.expiry.length < 7)      { setError('Enter a valid expiry date.'); return; }
      if (!card.cvv || card.cvv.length < 3)            { setError('Enter a valid CVV.'); return; }
      if (!card.holder)                                 { setError('Enter the name on card.'); return; }
    }
    if (gateway === 'UPI' && !upi.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi).'); return; }

    await sendOtp();
    setStep(3);
  };

  /* ── Send OTP to user's registered email ── */
  const sendOtp = async () => {
    const user = getStoredUser();
    setOtpLoading(true);
    setDevOtp('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.name || '', purpose: 'PAYMENT' }),
      });
      const data = await res.json();
      if (data.devOtp) setDevOtp(data.devOtp);   // shown if email fails
      setOtpSent(true);
      setResendTimer(300);
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Step 3: verify OTP then process payment ── */
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpValue || otpValue.length < 6) { setError('Enter the 6-digit OTP.'); return; }

    const user = getStoredUser();
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: otpValue }),
      });
      if (!res.ok) { setError('Invalid or expired OTP. Please try again.'); setOtpLoading(false); return; }

      // OTP verified — now place orders via order-service (Saga: reserve stock → charge payment)
      setStep(4);
      await new Promise(r => setTimeout(r, 2200)); // simulate processing

      const customerName = (user?.name || user?.email || '').trim();
      // Map frontend payment methods to gateway names supported by payment-service
      const gatewayName = (gateway === 'CARD' || gateway === 'UPI' || gateway === 'NETBANKING' || gateway === 'WALLET')
        ? 'STRIPE' : gateway;

      // Place one order per cart item — order-service orchestrates inventory + payment internally
      const results = await Promise.all(
        cart.map(item =>
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: Number(item.id || item.productId),
              quantity: Number(item.quantity),
              customerName,
              totalAmount: Number(((item.price || 0) * (item.quantity || 1)).toFixed(2)),
              paymentGateway: gatewayName,
              paymentMethodToken: 'pm_card_visa',
              sellerId: item.sellerId ? Number(item.sellerId) : null,
            }),
          })
        )
      );

      const failed = results.find(r => !r.ok);
      if (failed) throw new Error(await failed.text() || 'Order placement failed');

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      setStep(5);
    } catch (err) {
      setStep(3);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Step 4: Processing ── */
  if (step === 4) return (
    <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
      <div style={{ width: 64, height: 64, border: '5px solid #e2e8f0', borderTop: '5px solid #e85c2e', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <h2 style={{ fontWeight: 700 }}>Processing your payment…</h2>
      <p style={{ color: '#64748b' }}>Please do not close or refresh this page.</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Step 5: Success ── */
  if (step === 5) return (
    <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #22c55e', display: 'grid', placeItems: 'center', fontSize: '2rem' }}>✅</div>
      <h2 style={{ fontWeight: 800, color: '#15803d' }}>Payment Successful!</h2>
      <p style={{ color: '#64748b', maxWidth: 360 }}>Your order has been placed successfully. You can track it in My Orders.</p>
      <div className="payment-success-summary">
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
          <span><strong>Amount Paid</strong><br /><span style={{ color: '#e85c2e', fontWeight: 800 }}>{fmt(total)}</span></span>
          <span><strong>Method</strong><br />{PAYMENT_METHODS.find(m => m.id === gateway)?.label}</span>
        </div>
      </div>
      <Link to="/orders" className="checkout-btn" style={{ marginTop: 8 }}>View My Orders</Link>
    </div>
  );

  const user = getStoredUser();
  const maskedEmail = user?.email ? user.email.replace(/(.{2}).+(@.+)/, '$1****$2') : '';

  return (
    <div className="page-shell">
      <div className="breadcrumb">
        <Link to="/">Home</Link> › <Link to="/cart">Cart</Link> › <span>Checkout</span>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {['Address', 'Payment', 'Verify OTP'].map((label, i) => (
          <div key={label} style={{ flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 700, textAlign: 'center',
            background: step === i + 1 ? 'linear-gradient(135deg,#e85c2e,#f4a261)' : step > i + 1 ? '#f0fdf4' : '#f8fafc',
            color:      step === i + 1 ? '#fff' : step > i + 1 ? '#15803d' : '#94a3b8' }}>
            {step > i + 1 ? '✓ ' : `${i + 1}. `}{label}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div>

          {/* ── Step 1: Address ── */}
          {step === 1 && (
            <div className="panel checkout-section">
              <h3>Delivery Address</h3>
              {error && <div className="alert error" style={{ marginBottom: 12 }}>{error}</div>}
              <form className="order-form" onSubmit={handleAddressNext}>
                <label>Full Name     <input value={address.name}    onChange={e => setAddress({ ...address, name: e.target.value })}    placeholder="Rahul Sharma"          required /></label>
                <label>Address       <input value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="123, MG Road, Apt 4B"  required /></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>City     <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Mumbai"  required /></label>
                  <label>PIN Code <input value={address.zip}  onChange={e => setAddress({ ...address, zip: e.target.value })}  placeholder="400001" maxLength={6} required /></label>
                </div>
                <button className="btn-primary" type="submit">Continue to Payment →</button>
              </form>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div className="panel checkout-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Payment Method</h3>
                <button type="button" onClick={() => { setStep(1); setError(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← Edit Address</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} type="button" onClick={() => { setGateway(m.id); setError(''); }}
                    style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${gateway === m.id ? '#e85c2e' : '#e2e8f0'}`, background: gateway === m.id ? '#fff7ed' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: gateway === m.id ? '#e85c2e' : '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>

              {error && <div className="alert error" style={{ marginBottom: 12 }}>{error}</div>}

              <form className="order-form" onSubmit={handlePayNext}>
                {gateway === 'CARD' && (
                  <>
                    <label>Card Number
                      <input value={card.number} onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })} placeholder="4242 4242 4242 4242" maxLength={19} inputMode="numeric" required />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <label>Expiry <input value={card.expiry} onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })} placeholder="MM / YY" maxLength={7} required /></label>
                      <label>CVV    <input value={card.cvv}    onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })} placeholder="•••" maxLength={4} inputMode="numeric" required /></label>
                    </div>
                    <label>Name on Card <input value={card.holder} onChange={e => setCard({ ...card, holder: e.target.value })} placeholder="RAHUL SHARMA" required /></label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['VISA','MASTERCARD','RUPAY'].map(b => <span key={b} style={{ padding: '3px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, fontWeight: 800, color: '#475569', background: '#f8fafc' }}>{b}</span>)}
                    </div>
                  </>
                )}
                {gateway === 'UPI' && (
                  <>
                    <label>UPI ID <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi" required /></label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['@okaxis','@ybl','@paytm','@okhdfcbank'].map(s => (
                        <button key={s} type="button" onClick={() => setUpi(p => p.split('@')[0] + s)}
                          style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 999, fontSize: 12, cursor: 'pointer', background: '#f8fafc' }}>{s}</button>
                      ))}
                    </div>
                  </>
                )}
                {gateway === 'NETBANKING' && (
                  <label>Select Bank <select value={bank} onChange={e => setBank(e.target.value)}>{BANKS.map(b => <option key={b}>{b}</option>)}</select></label>
                )}
                {gateway === 'WALLET' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {WALLETS.map(w => (
                      <button key={w} type="button" onClick={() => setWallet(w)}
                        style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${wallet === w ? '#e85c2e' : '#e2e8f0'}`, background: wallet === w ? '#fff7ed' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: wallet === w ? '#e85c2e' : '#475569' }}>{w}</button>
                    ))}
                  </div>
                )}
                <button className="btn-primary" type="submit" disabled={otpLoading} style={{ marginTop: 8 }}>
                  {otpLoading ? 'Sending OTP…' : `🔒 Pay ${fmt(total)}`}
                </button>
                <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: 0 }}>🔒 256-bit SSL encrypted · An OTP will be sent to verify your payment</p>
              </form>
            </div>
          )}

          {/* ── Step 3: OTP Verification ── */}
          {step === 3 && (
            <div className="panel checkout-section">
              <h3>Verify Payment OTP</h3>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
                  📧 OTP sent to <strong>{maskedEmail}</strong>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#3b82f6' }}>
                  Enter the 6-digit code to confirm your payment of <strong>{fmt(total)}</strong>
                </p>
              </div>

              {/* Dev fallback — shown when email fails */}
              {devOtp && (
                <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                  📧 Email delivery failed. Your OTP is: <strong style={{ fontSize: 20, letterSpacing: 6 }}>{devOtp}</strong>
                </div>
              )}

              {error && <div className="alert error" style={{ marginBottom: 12 }}>{error}</div>}

              <form className="order-form" onSubmit={handleOtpVerify}>
                <label>
                  Enter OTP
                  <input
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    inputMode="numeric"
                    maxLength={6}
                    style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center', fontWeight: 800 }}
                    autoFocus
                    required
                  />
                </label>

                <button className="btn-primary" type="submit" disabled={otpLoading || otpValue.length < 6}>
                  {otpLoading ? '⏳ Verifying…' : '✅ Confirm & Pay'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <button type="button" onClick={() => { setStep(2); setOtpValue(''); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    ← Change Payment
                  </button>
                  <button type="button" onClick={sendOtp} disabled={resendTimer > 0 || otpLoading}
                    style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#94a3b8' : '#e85c2e', fontSize: 13, fontWeight: 700, cursor: resendTimer > 0 ? 'default' : 'pointer' }}>
                    {resendTimer > 0 ? `Resend in ${Math.floor(resendTimer/60)}:${String(resendTimer%60).padStart(2,'0')}` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Order summary */}
        <div className="cart-summary" style={{ position: 'sticky', top: 80 }}>
          <h3>Order Summary</h3>
          {cart.map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#565959' }}>{it.name} × {it.quantity}</span>
              <span>{fmt((it.price || 0) * (it.quantity || 1))}</span>
            </div>
          ))}
          <hr style={{ margin: '12px 0', borderColor: '#ddd' }} />
          <div className="cart-total-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="cart-total-row"><span>Delivery</span><span>{shipping === 0 ? <span style={{ color: '#007600', fontWeight: 700 }}>FREE</span> : fmt(shipping)}</span></div>
          <div className="cart-total-row grand"><span>Total</span><span style={{ color: '#b12704' }}>{fmt(total)}</span></div>
          {shipping === 0 && <p style={{ fontSize: 11, color: '#15803d', marginTop: 6, fontWeight: 700 }}>🎉 Free delivery on orders above ₹999!</p>}
        </div>
      </div>
    </div>
  );
}
