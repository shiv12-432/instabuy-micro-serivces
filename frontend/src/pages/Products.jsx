import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch, getStoredUser } from '../authUser';
import { fmt } from '../currency';
import { ProductImage, readImageFile } from '../productImage.jsx';
import ProductDescription from '../components/ProductDescription.jsx';

const getSalePrice = (product) => {
  const discount = Number(product.discountPercent) || 0;
  return Number(product.price) * (1 - discount / 100);
};

const getRating = (id) => (3.5 + ((id * 7) % 15) / 10).toFixed(1);
const getReviews = (id) => 50 + ((id * 13) % 151);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const role = currentUser?.role?.toUpperCase();
  const CATEGORIES = ['Mobiles', 'Audio', 'Fashion', 'Beauty', 'Home', 'Fitness'];
  const canManageProducts = role === 'SELLER';
  const canShop = role !== 'ADMIN' && role !== 'SELLER';
  const isInCart = (id) => cartItems.some((item) => Number(item.id || item.productId) === Number(id));

  const catalogStats = useMemo(() => {
    const inStock = products.filter((p) => Number(p.stock) > 0).length;
    const discounted = products.filter((p) => Number(p.discountPercent) > 0).length;
    return { inStock, discounted };
  }, [products]);

  const orderStats = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'PENDING').length;
    return { total: orders.length, pending };
  }, [orders]);

  useEffect(() => {
    fetchProducts();
    if (canManageProducts) {
      fetchOrders();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setError('');
      const res = await authFetch(canManageProducts ? '/api/seller/products' : '/api/products');
      const data = await res.json();
      setProducts(data);
      setDrafts(
        data.reduce((acc, p) => {
          acc[p.id] = {
            sku: p.sku || '',
            name: p.name || '',
            description: p.description || '',
            imageUrl: p.imageUrl || '',
            price: p.price ?? 0,
            stock: p.stock ?? 0,
            discountPercent: p.discountPercent ?? 0,
            category: p.category || '',
          };
          return acc;
        }, {})
      );
    } catch {
      setError('Failed to load products. Is the backend running?');
    }
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

  const fetchOrders = async () => {
    try {
      const res = await authFetch('/api/seller/orders');
      if (!res.ok) return;
      setOrders(await res.json());
    } catch {}
  };

  const saveProduct = async (id) => {
    const draft = drafts[id];
    setError('');
    setSuccess('');
    setSavingId(id);

    try {
      const res = await authFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          price: Number(draft.price),
          stock: Number(draft.stock),
          discountPercent: Number(draft.discountPercent),
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Update failed');
      }

      setSuccess('Product updated. Customers will see the new price and stock.');
      await fetchProducts();
    } catch (e) {
      setError(e.message || 'Failed to update product');
    } finally {
      setSavingId(null);
    }
  };

  const updateDraftImageFile = async (id, file) => {
    const imageUrl = await readImageFile(file);
    updateDraft(id, 'imageUrl', imageUrl);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product from your seller catalog?')) return;
    setError('');
    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Product deleted from your catalog.');
      await fetchProducts();
    } catch (e) {
      setError(e.message || 'Failed to delete product');
    }
  };

  const updateOrderStatus = async (id, action, method = 'PUT') => {
    setError('');
    try {
      const res = await authFetch(`/api/orders/${id}/${action}`, {
        method,
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchOrders();
    } catch (e) {
      setError(e.message || 'Failed to update order');
    }
  };

  const addToCart = (p) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find((c) => Number(c.id) === Number(p.id));
    const salePrice = getSalePrice(p);

    if (ex) {
      ex.quantity = Math.min((Number(ex.quantity) || 1) + 1, p.stock);
      ex.price = salePrice;
      ex.discountPercent = p.discountPercent || 0;
      ex.imageUrl = p.imageUrl || ex.imageUrl || '';
    } else {
      cart.push({
        id: p.id,
        productId: p.id,
        name: p.name,
        description: p.description,
        price: salePrice,
        originalPrice: Number(p.price),
        discountPercent: p.discountPercent || 0,
        quantity: 1,
        stock: p.stock,
        imageUrl: p.imageUrl || '',
        sellerId: p.sellerId || null,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCartItems(cart);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="page-shell">
      <div className="products-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Products</span>
          </div>
          <h2>{canManageProducts ? 'Product Management' : 'All Products'}</h2>
        </div>
        {canManageProducts && (
          <div className="seller-header-actions">
            <Link to="/orders" className="hero-secondary dark">
              Customer Orders
            </Link>
            <Link to="/add-product" className="checkout-btn">
              Add Product
            </Link>
          </div>
        )}
      </div>

      {canManageProducts && (
        <div className="seller-snapshot product-snapshot">
          <div className="snapshot-card">
            <strong>{products.length}</strong>
            <span>Total Products</span>
          </div>
          <div className="snapshot-card">
            <strong>{catalogStats.inStock}</strong>
            <span>In Stock</span>
          </div>
          <div className="snapshot-card">
            <strong>{catalogStats.discounted}</strong>
            <span>On Discount</span>
          </div>
          <div className="snapshot-card">
            <strong>{orderStats.total}</strong>
            <span>Customer Orders</span>
          </div>
          <div className="snapshot-card">
            <strong>{orderStats.pending}</strong>
            <span>Pending Orders</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          {error}
          <button className="checkout-btn" style={{ marginLeft: 12 }} onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}
      {success && <div className="alert success" style={{ marginBottom: 16 }}>{success}</div>}

      {canManageProducts && (
        <div className="panel seller-orders-panel">
          <div className="panel-heading">
            <div>
              <h2>Orders Placed by Customers</h2>
              <p>Review new customer orders while managing your catalog.</p>
            </div>
            <Link to="/orders" className="text-link">
              Open full orders
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="empty-state">No customer orders placed yet.</p>
          ) : (
            <div className="seller-order-table">
              <div className="seller-order-row seller-order-head">
                <span>Order</span>
                <span>Customer</span>
                <span>Product</span>
                <span>Qty</span>
                <span>Total</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {orders.slice(0, 5).map((order) => {
                const product = order.product || {};
                const salePrice = getSalePrice(product);

                return (
                  <div key={order.id} className="seller-order-row">
                    <span>#{order.id}</span>
                    <span>{order.customerName || 'Customer'}</span>
                    <span>{product.name || 'Product'}</span>
                    <span>{order.quantity}</span>
                    <span>{fmt(salePrice * Number(order.quantity || 1))}</span>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                    <span className="seller-order-actions">
                      {order.status === 'PENDING' && (
                        <>
                          <button className="order-accept-btn" onClick={() => updateOrderStatus(order.id, 'accept')}>
                            Accept
                          </button>
                          <button className="order-decline-btn" onClick={() => updateOrderStatus(order.id, 'cancel', 'POST')}>
                            Decline
                          </button>
                        </>
                      )}
                      {order.status === 'APPROVED' && <span className="muted-note">Waiting for shipment</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="product-grid">
        {products.map((p) => {
          const draft = drafts[p.id] || {};
          const discount = Number(p.discountPercent) || 0;
          const salePrice = getSalePrice(p);

          return (
            <div key={p.id} className="product-card">
              <ProductImage product={{ ...p, imageUrl: draft.imageUrl || p.imageUrl }} />

              {canManageProducts ? (
                <div className="seller-product-form">
                  <label>
                    SKU
                    <input
                      value={draft.sku || ''}
                      onChange={(e) => updateDraft(p.id, 'sku', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Product Name
                    <input
                      value={draft.name || ''}
                      onChange={(e) => updateDraft(p.id, 'name', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={draft.description || ''}
                      onChange={(e) => updateDraft(p.id, 'description', e.target.value)}
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={draft.category || ''}
                      onChange={(e) => updateDraft(p.id, 'category', e.target.value)}
                    >
                      <option value="">-- Select Category --</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label>
                    Image URL
                    <input
                      value={draft.imageUrl || ''}
                      onChange={(e) => updateDraft(p.id, 'imageUrl', e.target.value)}
                      placeholder="https://example.com/product.jpg"
                    />
                  </label>
                  <label>
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateDraftImageFile(p.id, e.target.files?.[0])}
                    />
                  </label>
                  <div className="seller-product-grid">
                    <label>
                      Price
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={draft.price}
                        onChange={(e) => updateDraft(p.id, 'price', e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Discount %
                      <input
                        type="number"
                        min="0"
                        max="95"
                        value={draft.discountPercent}
                        onChange={(e) => updateDraft(p.id, 'discountPercent', e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Quantity
                      <input
                        type="number"
                        min="0"
                        value={draft.stock}
                        onChange={(e) => updateDraft(p.id, 'stock', e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={() => saveProduct(p.id)}
                    disabled={savingId === p.id}
                  >
                    {savingId === p.id ? 'Saving...' : 'Update Product'}
                  </button>
                  <button
                    className="order-decline-btn"
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete Product
                  </button>
                </div>
              ) : (
                <>
                  <p className="product-sku">{p.sku}</p>
                  <h3>{p.name}</h3>
                  <ProductDescription text={p.description} productName={p.name} />
                  <div className="stars">{'★'.repeat(Math.round(getRating(p.id)))}{'☆'.repeat(5 - Math.round(getRating(p.id)))} <span className="rating-text">{getRating(p.id)} · {getReviews(p.id)} reviews</span></div>
                  <div className="price-box">
                    {discount > 0 && <span className="old-price">{fmt(p.price)}</span>}
                    <span className="new-price">{fmt(salePrice)}</span>
                  </div>
                  {discount > 0 && <span className="discount-badge">{discount}% off</span>}
                  <div className="product-meta">
                    <span>{p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}</span>
                  </div>
                  {!isInCart(p.id) && <span className="prime-badge">Fast Delivery</span>}
                  {canShop && (
                    <button
                      className="checkout-btn"
                      style={{ width: '100%', marginTop: 8 }}
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                    >
                      {p.stock === 0 ? 'Out of Stock' : isInCart(p.id) ? 'Added' : 'Add to Cart'}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
