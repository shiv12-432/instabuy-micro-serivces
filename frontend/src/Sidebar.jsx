import { Link, useLocation } from 'react-router-dom';
import { getStoredUser } from './authUser';

const guestLinks = [
  { to: '/register', label: 'Create Account', iconClass: 'create', hint: 'Start shopping' },
  { to: '/login', label: 'Sign In', iconClass: 'signin', hint: 'Access your cart' },
  { to: '/seller-register', label: 'Seller Registration', iconClass: 'seller', hint: 'Open your store' },
  { to: '/faq', label: 'FAQ', iconClass: 'faq', hint: 'Quick answers' },
];

export default function Sidebar() {
  const location = useLocation();
  const user = getStoredUser();
  const role = user?.role?.toUpperCase();
  const quickLinks = user
    ? role === 'SELLER'
      ? [
          { to: '/seller-dashboard', label: 'Dashboard', iconClass: 'seller', hint: 'Seller workspace' },
          { to: '/add-product', label: 'Add Product', iconClass: 'create', hint: 'Create listing' },
          { to: '/orders', label: 'Orders', iconClass: 'signin', hint: 'Customer orders' },
          { to: '/faq', label: 'FAQ', iconClass: 'faq', hint: 'Quick answers' },
        ]
      : role === 'ADMIN'
        ? [
            { to: '/orders', label: 'All Orders', iconClass: 'signin', hint: 'Admin review' },
            { to: '/faq', label: 'FAQ', iconClass: 'faq', hint: 'Quick answers' },
          ]
        : [
            { to: '/products', label: 'Products', iconClass: 'create', hint: 'Start shopping' },
            { to: '/cart', label: 'Cart', iconClass: 'signin', hint: 'Checkout items' },
            { to: '/orders', label: 'My Orders', iconClass: 'seller', hint: 'Track orders' },
            { to: '/faq', label: 'FAQ', iconClass: 'faq', hint: 'Quick answers' },
          ]
    : guestLinks;

  return (
    <aside className="sidebar compact-sidebar" aria-label="InstaBuy quick access">
      <div className="sidebar-header">
        <p className="sidebar-kicker">Shop Menu</p>
        <h2 className="sidebar-logo">Quick paths</h2>
      </div>

      <nav className="sidebar-quick-grid" aria-label="Public navigation">
        {quickLinks.map((link) => (
          <Link
            key={`${link.label}-${link.to}`}
            to={link.to}
            className={location.pathname === link.to ? 'active' : ''}
          >
            <span className={`sidebar-icon ${link.iconClass}`} aria-hidden="true" />
            <span>
              <strong>{link.label}</strong>
              <small>{link.hint}</small>
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
