import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authFetch, getStoredUser } from '../authUser';
import { fmt } from '../currency';
import { ProductImage, readImageFile } from '../productImage.jsx';

const packages = [
  { orderLimit: 10, packageName: '10 orders shipment', price: 399 },
  { orderLimit: 25, packageName: '25 orders shipment', price: 799 },
  { orderLimit: 50, packageName: '50 orders shipment', price: 1499 },
];

const formatDateRange = (start, end) => {
  if (!start || !end) return 'Not scheduled';
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-IN', opts)} - ${new Date(end).toLocaleDateString('en-IN', opts)}`;
};

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [requests, setRequests] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    sellerName: '', storeName: '', gstNumber: '',
    phone: '', accountNumber: '', ifscCode: '', pickupAddress: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingPackage, setLoadingPackage] = useState(null);
  const [savingProductId, setSavingProductId] = useState(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    discountPercent: 0,
    stock: 0,
    category: '',
  });

  const CATEGORIES = ['Mobiles', 'Audio', 'Fashion', 'Beauty', 'Home', 'Fitness'];
  const user = getStoredUser();

  const loadDashboard = async (resetDrafts = true) => {
    try {
      setError('');
      const [analyticsRes, ordersRes, productsRes, requestsRes, profileRes] = await Promise.all([
        authFetch('/api/seller/analytics'),
        authFetch('/api/seller/orders'),
        authFetch('/api/seller/products'),
        authFetch('/api/seller/shipment-packages'),
        authFetch('/api/seller/profile').catch(() => null),
      ]);

      if (!analyticsRes.ok || !ordersRes.ok || !productsRes.ok || !requestsRes.ok) {
        throw new Error('Seller dashboard could not be loaded');
      }

      setAnalytics(await analyticsRes.json());
      setOrders(await ordersRes.json());
      const sellerProducts = await productsRes.json();
      setProducts(sellerProducts);
      if (resetDrafts) {
        setDrafts(
          sellerProducts.reduce((acc, product) => {
            acc[product.id] = {
              sku: product.sku || '',
              name: product.name || '',
              description: product.description || '',
              imageUrl: product.imageUrl || '',
              price: product.price ?? 0,
              discountPercent: product.discountPercent ?? 0,
              stock: product.stock ?? 0,
              category: product.category || '',
            };
            return acc;
          }, {})
        );
      }
      setRequests(await requestsRes.json());
      if (profileRes && profileRes.ok) {
        const profile = await profileRes.json();
        setSellerProfile(profile);
        setProfileForm({
          sellerName: profile.sellerName || '',
          storeName: profile.storeName || '',
          gstNumber: profile.gstNumber || '',
          phone: profile.phone || '',
          accountNumber: profile.accountNumber || '',
          ifscCode: profile.ifscCode || '',
          pickupAddress: profile.pickupAddress || '',
        });
      }
    } catch (e) {
      setError(e.message || 'Failed to load seller dashboard');
    }
  };

  const updateProductForm = (key, value) => {
    setProductForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateDraft = (id, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const handleNewImage = async (file) => {
    const imageUrl = await readImageFile(file);
    updateProductForm('imageUrl', imageUrl);
  };

  const handleDraftImage = async (id, file) => {
    const imageUrl = await readImageFile(file);
    updateDraft(id, 'imageUrl', imageUrl);
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingProduct(true);
    try {
      const res = await authFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          discountPercent: Number(productForm.discountPercent),
          stock: Number(productForm.stock),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Product added to your seller catalog.');
      setProductForm({ sku: '', name: '', description: '', imageUrl: '', price: 0, discountPercent: 0, stock: 0, category: '' });
      await loadDashboard(true);
    } catch (e) {
      setError(e.message || 'Failed to add product');
    } finally {
      setCreatingProduct(false);
    }
  };

  const saveProduct = async (id) => {
    const draft = drafts[id];
    setError('');
    setSuccess('');
    setSavingProductId(id);
    try {
      const res = await authFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          price: Number(draft.price),
          discountPercent: Number(draft.discountPercent),
          stock: Number(draft.stock),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Product updated.');
      await loadDashboard(true);
    } catch (e) {
      setError(e.message || 'Failed to update product');
    } finally {
      setSavingProductId(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product from your seller catalog?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Product deleted.');
      await loadDashboard(true);
    } catch (e) {
      setError(e.message || 'Failed to delete product');
    }
  };

  const saveProfile = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await authFetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Profile updated successfully.');
      setEditingProfile(false);
      await loadDashboard(false);
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    }
  };

  const updateOrder = async (id, action, method = 'PUT') => {
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/orders/${id}/${action}`, { method });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Order updated.');
      await loadDashboard();
    } catch (e) {
      setError(e.message || 'Failed to update order');
    }
  };

  const setOrderStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/orders/${id}/status?status=${status}`, { method: 'PUT' });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Order status updated.');
      await loadDashboard();
    } catch (e) {
      setError(e.message || 'Failed to update order status');
    }
  };

  useEffect(() => {
    loadDashboard(true);
    const intervalId = setInterval(() => loadDashboard(false), 3000);
    return () => clearInterval(intervalId);
  }, []);

  const requestPackage = async (pkg) => {
    setLoadingPackage(pkg.orderLimit);
    setError('');
    try {
      const res = await authFetch('/api/seller/shipment-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: pkg.packageName, orderLimit: pkg.orderLimit }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadDashboard();
    } catch (e) {
      setError(e.message || 'Failed to request shipment package');
    } finally {
      setLoadingPackage(null);
    }
  };

  const maxMonthlyRevenue = useMemo(() => {
    const values = analytics?.monthlySales?.map((m) => Number(m.revenue) || 0) || [];
    return Math.max(1, ...values);
  }, [analytics]);

  const cards = [
    { label: 'Products Listed', value: analytics?.totalProductsListed || 0 },
    { label: 'Customer Orders', value: analytics?.totalCustomerOrders || 0 },
    { label: 'Units Sold', value: analytics?.totalUnitsSold || 0 },
    { label: 'Pending Orders', value: analytics?.pendingOrders || 0 },
    { label: 'Approved Orders', value: analytics?.approvedOrders || 0 },
    { label: 'Delivered Orders', value: analytics?.deliveredOrders || 0 },
  ];
  const pendingOrders = orders.filter((order) => order.status === 'PENDING');
  const lowStockProducts = products.filter((product) => Number(product.stock) <= 5);
  const recentActivity = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="page-shell seller-dashboard">
      <div className="seller-dashboard-hero">
        <div>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Seller Dashboard</span>
          </div>
          <h1>{sellerProfile?.storeName || user?.name || 'Seller'} Dashboard</h1>
          <p>Manage your catalog, orders, revenue, and shipment packages from one seller-only workspace.</p>
        </div>
        <div className="seller-header-actions">
          <a className="hero-secondary dark" href="#seller-products">Products</a>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="seller-analytics-grid">
        {cards.map((card) => (
          <div className="snapshot-card" key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </div>
        ))}
      </section>

      <section className="seller-revenue-grid">
        <div className="panel revenue-panel">
          <span className="eyebrow">Total Revenue</span>
          <strong>{fmt(analytics?.totalRevenueGenerated)}</strong>
          <p>Gross sales from approved, shipped, and delivered orders.</p>
        </div>
        <div className="panel revenue-panel seller-money">
          <span className="eyebrow">Seller Earnings 90%</span>
          <strong>{fmt(analytics?.sellerEarnings)}</strong>
          <p>Amount payable to your seller account.</p>
        </div>
        <div className="panel revenue-panel commission-money">
          <span className="eyebrow">InstaBuy Commission 10%</span>
          <strong>{fmt(analytics?.instabuyCommission)}</strong>
          <p>Platform commission retained by InstaBuy.</p>
        </div>
      </section>

      <section className="seller-dashboard-grid">
        <div className="panel seller-alert-panel">
          <div className="panel-heading">
            <div>
              <h2>Pending Order Notifications</h2>
              <p>Orders waiting for seller approval.</p>
            </div>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="empty-state">No pending orders right now.</p>
          ) : (
            <div className="seller-alert-list">
              {pendingOrders.slice(0, 4).map((order) => (
                <div className="seller-alert-item" key={order.id}>
                  <strong>Order #{order.id}</strong>
                  <span>{order.productName || 'Product'} for {order.customerName}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="order-accept-btn" onClick={() => updateOrder(order.id, 'accept')}>Approve</button>
                    <button className="order-decline-btn" onClick={() => updateOrder(order.id, 'cancel', 'POST')}>Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel seller-alert-panel">
          <div className="panel-heading">
            <div>
              <h2>Stock Warnings</h2>
              <p>Products at 5 units or below.</p>
            </div>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="empty-state">Inventory levels look good.</p>
          ) : (
            <div className="seller-alert-list">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div className="seller-alert-item" key={product.id}>
                  <strong>{product.name}</strong>
                  <span>{product.stock} units left</span>
                  <a className="text-link" href="#seller-products">Update stock</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="panel seller-chart-panel">
        <div className="panel-heading">
          <div>
            <h2>Monthly Sales Analysis</h2>
            <p>Revenue trend from seller-owned products.</p>
          </div>
        </div>
        <div className="sales-chart">
          {(analytics?.monthlySales || []).length === 0 ? (
            <p className="empty-state">Monthly sales will appear after approved orders.</p>
          ) : (
            analytics.monthlySales.map((month) => (
              <div className="sales-bar-row" key={month.month}>
                <span>{month.month}</span>
                <div className="sales-bar-track">
                  <div style={{ width: `${(Number(month.revenue) / maxMonthlyRevenue) * 100}%` }} />
                </div>
                <strong>{fmt(month.revenue)}</strong>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="seller-dashboard-grid">
        <div className="panel" id="seller-add-product">
          <div className="panel-heading">
            <div>
              <h2>Add Product</h2>
              <p>Create a seller-owned product without leaving this dashboard.</p>
            </div>
          </div>
          <form className="order-form seller-dashboard-form" onSubmit={createProduct}>
            <div className="seller-form-grid">
              <label>SKU <input value={productForm.sku} onChange={(e) => updateProductForm('sku', e.target.value)} required /></label>
              <label>Name <input value={productForm.name} onChange={(e) => updateProductForm('name', e.target.value)} required /></label>
              <label>Price <input type="number" step="0.01" min="0" value={productForm.price} onChange={(e) => updateProductForm('price', e.target.value)} required /></label>
              <label>Discount % <input type="number" min="0" max="95" value={productForm.discountPercent} onChange={(e) => updateProductForm('discountPercent', e.target.value)} required /></label>
              <label>Stock <input type="number" min="0" value={productForm.stock} onChange={(e) => updateProductForm('stock', e.target.value)} required /></label>
              <label>Category
                <select value={productForm.category} onChange={(e) => updateProductForm('category', e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>Upload Image <input type="file" accept="image/*" onChange={(e) => handleNewImage(e.target.files?.[0])} /></label>
            </div>
            <label>Description <textarea value={productForm.description} onChange={(e) => updateProductForm('description', e.target.value)} required /></label>
            <label>Image URL <input value={productForm.imageUrl} onChange={(e) => updateProductForm('imageUrl', e.target.value)} /></label>
            {productForm.imageUrl && <img className="product-image product-image-preview" src={productForm.imageUrl} alt="New product preview" />}
            <button className="checkout-btn" type="submit" disabled={creatingProduct}>
              {creatingProduct ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Seller Orders</h2>
            <Link to="/orders" className="text-link">Full page</Link>
          </div>
          <div className="seller-order-card-grid">
            {orders.map((order) => (
              <article key={order.id} className="seller-order-card">
                <div className="seller-order-card-head">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span>{order.productName || 'Product'}</span>
                  </div>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                </div>
                <div className="seller-order-card-meta">
                  <span>Customer <strong>{order.customerName}</strong></span>
                  <span>Quantity <strong>{order.quantity}</strong></span>
                  <span>Expected <strong>{formatDateRange(order.expectedDeliveryStart, order.expectedDeliveryEnd)}</strong></span>
                </div>
                <div className="order-timeline">
                  {['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].map((step) => (
                    <span key={step} className={['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].indexOf(step) ? 'done' : ''}>
                      {step}
                    </span>
                  ))}
                </div>
                <div className="seller-order-actions">
                  {order.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="order-accept-btn" onClick={() => updateOrder(order.id, 'accept')}>Approve Order</button>
                      <button className="order-decline-btn" onClick={() => updateOrder(order.id, 'cancel', 'POST')}>Cancel Order</button>
                    </div>
                  )}
                  {order.status === 'APPROVED' && (
                    <button className="order-ship-btn" onClick={() => setOrderStatus(order.id, 'SHIPPED')}>Mark Shipped</button>
                  )}
                </div>
              </article>
            ))}
            {orders.length === 0 && <p className="empty-state">No seller orders yet.</p>}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest order movement for your seller account.</p>
          </div>
        </div>
        <div className="compact-table">
          {recentActivity.map((order) => (
            <div className="compact-row seller-activity-row" key={order.id}>
              <strong>Order #{order.id}</strong>
              <span>{order.productName || 'Product'}</span>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
              <span>{formatDateRange(order.expectedDeliveryStart, order.expectedDeliveryEnd)}</span>
            </div>
          ))}
          {recentActivity.length === 0 && <p className="empty-state">Activity will appear after customer orders.</p>}
        </div>
      </section>

      <section className="panel" id="seller-products">
        <div className="panel-heading">
          <div>
            <h2>Product Management</h2>
            <p>Update product details, stock, discount, image, or remove products from the same seller page.</p>
          </div>
        </div>
        <div className="seller-product-manage-grid">
          {products.map((product) => {
            const draft = drafts[product.id] || {};
            return (
              <div key={product.id} className="seller-product-manage-card">
                <ProductImage product={{ ...product, imageUrl: draft.imageUrl || product.imageUrl }} />
                <div className="seller-product-form">
                  <div className="seller-form-grid">
                    <label>SKU <input value={draft.sku || ''} onChange={(e) => updateDraft(product.id, 'sku', e.target.value)} /></label>
                    <label>Name <input value={draft.name || ''} onChange={(e) => updateDraft(product.id, 'name', e.target.value)} /></label>
                    <label>Price <input type="number" step="0.01" min="0" value={draft.price ?? 0} onChange={(e) => updateDraft(product.id, 'price', e.target.value)} /></label>
                    <label>Discount % <input type="number" min="0" max="95" value={draft.discountPercent ?? 0} onChange={(e) => updateDraft(product.id, 'discountPercent', e.target.value)} /></label>
                    <label>Stock <input type="number" min="0" value={draft.stock ?? 0} onChange={(e) => updateDraft(product.id, 'stock', e.target.value)} /></label>
                    <label>Category
                      <select value={draft.category || ''} onChange={(e) => updateDraft(product.id, 'category', e.target.value)}>
                        <option value="">-- Select Category --</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label>Upload Image <input type="file" accept="image/*" onChange={(e) => handleDraftImage(product.id, e.target.files?.[0])} /></label>
                  </div>
                  <label>Description <textarea value={draft.description || ''} onChange={(e) => updateDraft(product.id, 'description', e.target.value)} /></label>
                  <label>Image URL <input value={draft.imageUrl || ''} onChange={(e) => updateDraft(product.id, 'imageUrl', e.target.value)} /></label>
                  <div className="seller-order-actions">
                    <button className="checkout-btn" onClick={() => saveProduct(product.id)} disabled={savingProductId === product.id}>
                      {savingProductId === product.id ? 'Saving...' : 'Update'}
                    </button>
                    <button className="order-decline-btn" onClick={() => deleteProduct(product.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {products.length === 0 && <p className="empty-state">Add your first seller product.</p>}
        </div>
      </section>

      <section className="panel package-section">
        <div className="panel-heading">
          <div>
            <h2>Seller Profile</h2>
            <p>Your business, banking, and pickup details stored securely.</p>
          </div>
          <button className="hero-secondary dark" onClick={() => setEditingProfile(!editingProfile)}>
            {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        {sellerProfile ? (
          editingProfile ? (
            <div className="seller-product-form">
              <div className="seller-form-grid">
                <label>Seller Name <input value={profileForm.sellerName} onChange={e => setProfileForm(p => ({ ...p, sellerName: e.target.value }))} /></label>
                <label>Store Name <input value={profileForm.storeName} onChange={e => setProfileForm(p => ({ ...p, storeName: e.target.value }))} /></label>
                <label>GST Number <input value={profileForm.gstNumber} onChange={e => setProfileForm(p => ({ ...p, gstNumber: e.target.value }))} /></label>
                <label>Phone <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} /></label>
                <label>Account Number <input value={profileForm.accountNumber} onChange={e => setProfileForm(p => ({ ...p, accountNumber: e.target.value }))} /></label>
                <label>IFSC Code <input value={profileForm.ifscCode} onChange={e => setProfileForm(p => ({ ...p, ifscCode: e.target.value }))} /></label>
              </div>
              <label>Pickup Address <textarea value={profileForm.pickupAddress} onChange={e => setProfileForm(p => ({ ...p, pickupAddress: e.target.value }))} /></label>
              <button className="checkout-btn" onClick={saveProfile}>Save Profile</button>
            </div>
          ) : (
            <div className="compact-table">
              <div className="compact-row"><strong>Seller Name</strong><span>{sellerProfile.sellerName}</span></div>
              <div className="compact-row"><strong>Store Name</strong><span>{sellerProfile.storeName}</span></div>
              <div className="compact-row"><strong>Email</strong><span>{sellerProfile.email}</span></div>
              <div className="compact-row"><strong>Phone</strong><span>{sellerProfile.phone}</span></div>
              <div className="compact-row"><strong>GST Number</strong><span>{sellerProfile.gstNumber}</span></div>
              <div className="compact-row"><strong>Account Number</strong><span>{sellerProfile.accountNumber}</span></div>
              <div className="compact-row"><strong>IFSC Code</strong><span>{sellerProfile.ifscCode}</span></div>
              <div className="compact-row"><strong>Pickup Address</strong><span>{sellerProfile.pickupAddress}</span></div>
            </div>
          )
        ) : (
          <p className="empty-state">No profile found. Please re-register to save your seller profile.</p>
        )}
      </section>

      <section className="panel package-section">
        <div className="panel-heading">
          <div>
            <h2>Shipment Packages</h2>
            <p>Request package capacity for upcoming shipments. Admin approval activates the package.</p>
          </div>
        </div>
        <div className="package-grid">
          {packages.map((pkg) => (
            <div className="package-card" key={pkg.orderLimit}>
              <strong>{pkg.packageName}</strong>
              <span>{fmt(pkg.price)}</span>
              <button className="checkout-btn" onClick={() => requestPackage(pkg)} disabled={loadingPackage === pkg.orderLimit}>
                {loadingPackage === pkg.orderLimit ? 'Requesting...' : 'Request Package'}
              </button>
            </div>
          ))}
        </div>
        <div className="compact-table package-history">
          {requests.map((request) => (
            <div className="compact-row" key={request.id}>
              <strong>{request.packageName}</strong>
              <span>{fmt(request.price)}</span>
              <span className={`status-badge ${request.status}`}>{request.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
