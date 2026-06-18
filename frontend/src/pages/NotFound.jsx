import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-shell" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Oops! Page Not Found</h2>
      <p style={{ color: '#565959', marginBottom: 24, fontSize: 15 }}>
        We can't seem to find the page you're looking for.
      </p>
      <Link to="/" className="checkout-btn" style={{ fontSize: 15, padding: '10px 24px' }}>
        ← Back to InstaBuy Home
      </Link>
    </div>
  );
}
