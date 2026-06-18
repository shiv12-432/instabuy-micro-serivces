import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { readImageFile } from '../productImage.jsx';
import { authFetch } from '../authUser';

export default function AddProduct() {
  const navigate = useNavigate();
  const CATEGORIES = ['Mobiles', 'Audio', 'Fashion', 'Beauty', 'Home', 'Fitness'];
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', price: 0, discountPercent: 0, stock: 0, sku: '', category: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await authFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          discountPercent: Number(form.discountPercent),
          stock: Number(form.stock),
        }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t || 'Create failed'); }
      setSuccess('✅ Product created successfully!');
      setTimeout(() => navigate('/products'), 1200);
    } catch (e) { setError(e.message || 'Failed to create product'); }
    finally { setLoading(false); }
  };

  const handleImageFile = async (e) => {
    const imageUrl = await readImageFile(e.target.files?.[0]);
    setForm({ ...form, imageUrl });
  };

  return (
    <div className="page-shell">
      <div className="breadcrumb"><Link to="/">Home</Link> › <Link to="/products">Products</Link> › <span>Add Product</span></div>
      <div className="add-product-wrapper">
        <div className="panel">
          <h2 style={{ marginBottom: 20 }}>➕ Add New Product</h2>
          {error && <div className="alert error" style={{ marginBottom: 14 }}>{error}</div>}
          {success && <div className="alert success" style={{ marginBottom: 14 }}>{success}</div>}
          <form className="order-form" onSubmit={handleSubmit}>
            <label>Product Name <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Wireless Headphones" /></label>
            <label>SKU <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WH-1000XM5" required /></label>
            <label>Category
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">-- Select Category --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Description <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." required /></label>
            <label>Product Image URL <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/product.jpg" /></label>
            <label>Upload Product Image <input type="file" accept="image/*" onChange={handleImageFile} /></label>
            {form.imageUrl && <img className="product-image product-image-preview" src={form.imageUrl} alt="Product preview" />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <label>Price (₹) <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
              <label>Discount (%) <input type="number" min="0" max="95" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} required /></label>
              <label>Stock Quantity <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
