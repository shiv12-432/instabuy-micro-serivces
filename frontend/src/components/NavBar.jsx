import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getStoredSellerProfile, getStoredUser } from '../authUser';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getStoredUser());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [cartCount, setCartCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]').length; } catch { return 0; }
  });

  useEffect(() => {
    setUser(getStoredUser());
    setCartCount(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]').length; } catch { return 0; } });
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onStorage = () => setCartCount(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]').length; } catch { return 0; } });
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCartCount(0);
    setShowProfileMenu(false);
    setMenuOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/', { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSeller = user?.role === 'SELLER';
  const isAdmin = user?.role === 'ADMIN';
  const sellerProfile = (() => {
    return getStoredSellerProfile();
  })();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="nav premium-nav">
      <div className="nav-left">
        <Link to="/" className="nav-brand">Insta<span>Buy</span></Link>
        <button
          className="nav-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={isActive('/')}>Home</Link>
        {!user && <a href="/#featured-products" className="nav-link">Products</a>}
        {!user && <a href="/#categories" className="nav-link">Categories</a>}
        {!user && <a href="/#why-instabuy" className="nav-link">Why InstaBuy</a>}
        {!user && <Link to="/faq" className={isActive('/faq')}>FAQ</Link>}
        {user && <Link to="/products" className={isActive('/products')}>Products</Link>}
        {user && !isSeller && !isAdmin && (
          <Link to="/cart" className={`cart-badge${location.pathname === '/cart' ? ' active' : ''}`}>
            Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        )}
        {isSeller && (
          <>
            <Link to="/seller-dashboard" className={isActive('/seller-dashboard')}>Dashboard</Link>
            <Link to="/add-product" className={isActive('/add-product')}>Add Product</Link>
            <Link to="/orders" className={isActive('/orders')}>Orders</Link>
          </>
        )}
        {isAdmin && (
          <Link to="/orders" className={isActive('/orders')}>All Orders</Link>
        )}
        {user && !isSeller && !isAdmin && (
          <Link to="/orders" className={isActive('/orders')}>My Orders</Link>
        )}
      </div>

      <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
        {user ? (
          <>
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <span
                className="nav-user-badge"
                title={`${user.name || user.email} (${user.role})`}
                onClick={() => navigate('/orders')}
              >
                {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
              </span>
              {showProfileMenu && (
                <div className="profile-menu">
                  <p className="profile-name">{isSeller ? sellerProfile?.storeName || user.name || user.email : user.name || user.email}</p>
                  <p className="profile-role">{isSeller ? 'Seller Account' : user.role}</p>

                  {isSeller ? (
                    <>
                      <div className="seller-hover-summary">
                        <span>Manage catalog, stock, discounts, and customer orders.</span>
                      </div>
                      {(sellerProfile?.gstNumber || sellerProfile?.accountNumber || sellerProfile?.pickupAddress) && (
                        <div className="seller-hover-summary">
                          {sellerProfile?.gstNumber && <span>GST: {sellerProfile.gstNumber}</span>}
                          {sellerProfile?.accountNumber && <span>Account: {sellerProfile.accountNumber}</span>}
                          {sellerProfile?.pickupAddress && <span>Pickup: {sellerProfile.pickupAddress}</span>}
                        </div>
                      )}
                      <button className="profile-menu-btn" onClick={() => navigate('/seller-dashboard')}>
                        Seller Dashboard
                      </button>
                      <button className="profile-menu-btn" onClick={() => navigate('/products')}>
                        View Products & Stock
                      </button>
                      <button className="profile-menu-btn" onClick={() => navigate('/add-product')}>
                        Add Product
                      </button>
                      <button className="profile-menu-btn" onClick={() => navigate('/products')}>
                        Update Price, Stock & Discount
                      </button>
                      <button className="profile-menu-btn" onClick={() => navigate('/orders')}>
                        Customer Orders
                      </button>
                    </>
                  ) : (
                    <button className="profile-menu-btn" onClick={() => navigate('/orders')}>
                      View Orders
                    </button>
                  )}
                </div>
              )}
            </div>
            <button className="nav-logout" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}
