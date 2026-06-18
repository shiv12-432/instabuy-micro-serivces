import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fmt } from '../currency';
import { ProductImage } from '../productImage.jsx';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

export default function Cart() {
  const [cart, setCart] = useState(readCart());
  const [stockWarning, setStockWarning] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  const updateQty = (idx, qty) => {
    const requested = Math.max(1, Number(qty));
    const item = cart[idx];
    const maxStock = item.stock || Infinity;

    if (requested > maxStock) {
      setStockWarning((prev) => ({ ...prev, [idx]: `Only ${maxStock} item${maxStock === 1 ? '' : 's'} available in stock.` }));
      const next = [...cart];
      next[idx] = { ...item, quantity: maxStock };
      setCart(next);
      return;
    }

    setStockWarning((prev) => {
      const nextWarnings = { ...prev };
      delete nextWarnings[idx];
      return nextWarnings;
    });

    const next = [...cart];
    next[idx] = { ...item, quantity: requested };
    setCart(next);
  };

  const stepQty = (idx, delta) => updateQty(idx, (Number(cart[idx]?.quantity) || 1) + delta);

  const removeItem = (idx) => {
    setStockWarning((prev) => {
      const nextWarnings = { ...prev };
      delete nextWarnings[idx];
      return nextWarnings;
    });

    const next = [...cart];
    next.splice(idx, 1);
    setCart(next);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 25 ? 0 : 5.99;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return (
    <div className="page-shell">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <span>Shopping Cart</span>
      </div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 20 }}>Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
          <h3 style={{ marginBottom: 8 }}>Your cart is empty</h3>
          <p style={{ color: 'var(--amz-muted)', marginBottom: 20 }}>Your shopping cart lives here. Start shopping.</p>
          <Link to="/products" className="checkout-btn">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="panel">
            <div className="panel-heading">
              <h2>Shopping Cart</h2>
              <span style={{ fontSize: 13, color: 'var(--amz-muted)' }}>Price</span>
            </div>

            {cart.map((item, idx) => (
              <div key={`${item.id || item.productId}-${idx}`} className="cart-item">
                <ProductImage product={item} className="cart-product-image" />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p style={{ color: '#16a34a', fontSize: 12, marginTop: 4 }}>In Stock</p>

                  <div className="cart-item-controls">
                    <span className="cart-qty-label">Qty</span>
                    <div className="cart-stepper" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" onClick={() => stepQty(idx, -1)} disabled={(Number(item.quantity) || 1) <= 1}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => stepQty(idx, 1)} disabled={item.stock && Number(item.quantity) >= Number(item.stock)}>+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeItem(idx)}>Delete</button>
                  </div>

                  {stockWarning[idx] && (
                    <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                      {stockWarning[idx]}
                    </p>
                  )}
                </div>

                <div className="cart-item-price">{fmt((item.price || 0) * (item.quantity || 1))}</div>
              </div>
            ))}

            <div style={{ textAlign: 'right', paddingTop: 16, borderTop: '1px solid var(--amz-border)', marginTop: 8 }}>
              <span style={{ fontSize: 16 }}>Subtotal ({itemCount} items): </span>
              <strong style={{ fontSize: 18, color: '#b12704' }}>{fmt(subtotal)}</strong>
            </div>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-total-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="cart-total-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: '#16a34a' }}>FREE</span> : fmt(shipping)}</span></div>
            {shipping > 0 && <p style={{ fontSize: 11, color: '#16a34a', marginBottom: 8 }}>Add {fmt(25 - subtotal)} more for FREE shipping</p>}
            <div className="cart-total-row grand"><span>Order Total</span><span style={{ color: '#b12704' }}>{fmt(total)}</span></div>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <p style={{ fontSize: 11, color: 'var(--amz-muted)', textAlign: 'center', marginTop: 10 }}>
              Secure checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
