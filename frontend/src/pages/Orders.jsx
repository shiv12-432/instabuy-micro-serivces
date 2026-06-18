import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authFetch, getStoredUser } from '../authUser';
import { fmt } from '../currency';

const salePrice = (product) =>
  Number(product?.price || 0) * (1 - (Number(product?.discountPercent) || 0) / 100);

const STATUS_LABEL = {
  PENDING: { text: 'Pending Review', color: '#92400e' },
  APPROVED: { text: 'Approved by Seller', color: '#15803d' },
  DECLINED: { text: 'Declined', color: '#b91c1c' },
  SHIPPED: { text: 'Shipped', color: '#1d4ed8' },
  DELIVERED: { text: 'Delivered', color: '#047857' },
};

const TABS = ['All', 'Pending', 'Approved', 'Shipped', 'Delivered', 'Declined'];
const PAGE_SIZE = 8;

const formatDateRange = (start, end) => {
  if (!start || !end) return 'Not scheduled';
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-IN', opts)} - ${new Date(end).toLocaleDateString('en-IN', opts)}`;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [shipmentRequests, setShipmentRequests] = useState([]);
  const [currentUser] = useState(() => getStoredUser());
  const role = currentUser?.role?.toUpperCase();
  const isSellerMode = role === 'SELLER';
  const isAdmin = role === 'ADMIN';

  const loadOrders = () => {
    if (!currentUser) {
      setError('Please sign in to view orders');
      return;
    }

    const url = isSellerMode
      ? '/api/seller/orders'
      : isAdmin
        ? '/api/orders'
      : `/api/orders?customerName=${encodeURIComponent((currentUser.name || currentUser.email || '').trim())}`;

    authFetch(url)
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => setError('Failed to load orders'));

    if (isAdmin) {
      authFetch('/api/admin/shipment-packages')
        .then((r) => (r.ok ? r.json() : []))
        .then(setShipmentRequests)
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadOrders();
    const refreshId = window.setInterval(loadOrders, 5000);
    const refreshOnFocus = () => loadOrders();
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      window.clearInterval(refreshId);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const doAction = async (url, method) => {
    setActionError('');
    try {
      const res = await authFetch(url, { method });
      if (!res.ok) throw new Error(await res.text());
      loadOrders();
    } catch (e) {
      setActionError(e.message || 'Action failed');
    }
  };

  const acceptOrder = (id) => doAction(`/api/orders/${id}/accept`, 'PUT');
  const shipOrder = (id) => doAction(`/api/orders/${id}/ship`, 'PUT');
  const deliverOrder = (id) => doAction(`/api/orders/${id}/deliver`, 'PUT');
  const declineOrder = (id) => {
    setConfirmId(null);
    doAction(`/api/orders/${id}/cancel`, 'POST');
  };
  const restoreOrder = (id) => doAction(`/api/orders/${id}/restore`, 'PUT');
  const updateShipmentRequest = (id, status) => doAction(`/api/admin/shipment-packages/${id}/status?status=${status}`, 'PUT');

  const filteredOrders = orders.filter((order) => {
    if ((!isSellerMode && !isAdmin) || activeTab === 'All') return true;
    if (activeTab === 'Pending') return order.status === 'PENDING';
    if (activeTab === 'Approved') return order.status === 'APPROVED';
    if (activeTab === 'Shipped') return order.status === 'SHIPPED';
    if (activeTab === 'Delivered') return order.status === 'DELIVERED';
    if (activeTab === 'Declined') return order.status === 'DECLINED';
    return true;
  }).filter((order) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [
      order.id,
      order.customerName,
      order.status,
      order.productName,
      order.productSku,
    ].some((value) => String(value || '').toLowerCase().includes(q));
  });
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pageOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  return (
    <div className="page-shell">
      {confirmId !== null && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ marginBottom: 10 }}>Decline Order #{confirmId}?</h3>
            <p style={{ color: '#565959', fontSize: 13, marginBottom: 20 }}>
              This will cancel the order. You can undo this afterwards if needed.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="order-decline-btn" onClick={() => declineOrder(confirmId)}>
                Yes, Decline
              </button>
              <button className="order-undo-btn" onClick={() => setConfirmId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="breadcrumb">
        <Link to="/">Home</Link> <span>/</span>{' '}
        <span>{isSellerMode ? 'Customer Orders' : isAdmin ? 'All Orders' : 'Your Orders'}</span>
      </div>

      <div className="orders-header">
        <h2>{isSellerMode ? 'Customer Orders' : isAdmin ? 'All Orders' : 'Your Orders'}</h2>
        {(isSellerMode || isAdmin) && <span style={{ fontSize: 13, color: '#565959' }}>{orders.length} total orders</span>}
      </div>

      {error && <div className="alert error" style={{ marginBottom: 16 }}>{error}</div>}
      {actionError && <div className="alert error" style={{ marginBottom: 16 }}>{actionError}</div>}

      {isAdmin && shipmentRequests.length > 0 && (
        <div className="panel package-section" style={{ marginBottom: 20 }}>
          <div className="panel-heading">
            <div>
              <h2>Shipment Package Requests</h2>
              <p>Approve or reject seller shipment package requests.</p>
            </div>
          </div>
          <div className="compact-table package-history">
            {shipmentRequests.map((request) => (
              <div className="compact-row" key={request.id}>
                <strong>Seller #{request.sellerId} - {request.packageName}</strong>
                <span>{fmt(request.price)}</span>
                <span className={`status-badge ${request.status}`}>{request.status}</span>
                {request.status === 'REQUESTED' && (
                  <span className="seller-order-actions">
                    <button className="order-accept-btn" onClick={() => updateShipmentRequest(request.id, 'APPROVED')}>Approve</button>
                    <button className="order-decline-btn" onClick={() => updateShipmentRequest(request.id, 'REJECTED')}>Reject</button>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(isSellerMode || isAdmin) && (
        <div className="order-filter-panel">
          <input
            className="order-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, product, SKU, status"
          />
          <div className="order-tab-row">
          {TABS.map((tab) => {
            const count =
              tab === 'All'
                ? orders.length
                : tab === 'Pending'
                  ? orders.filter((o) => o.status === 'PENDING').length
                  : tab === 'Approved'
                    ? orders.filter((o) => o.status === 'APPROVED').length
                    : tab === 'Shipped'
                      ? orders.filter((o) => o.status === 'SHIPPED').length
                      : tab === 'Delivered'
                        ? orders.filter((o) => o.status === 'DELIVERED').length
                        : orders.filter((o) => o.status === 'DECLINED').length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'tab-btn active' : 'tab-btn'}
              >
                {tab} <span className="tab-count">{count}</span>
              </button>
            );
          })}
          </div>
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
          <h3 style={{ marginBottom: 8 }}>{isSellerMode || isAdmin ? 'No customer orders yet' : 'No orders placed yet'}</h3>
          <p style={{ color: '#565959', marginBottom: 20 }}>
            {isSellerMode || isAdmin
              ? 'Orders will appear here once customers start shopping.'
              : 'When you place an order, it will appear here.'}
          </p>
          {!isSellerMode && !isAdmin && <Link to="/products" className="checkout-btn">Start Shopping</Link>}
        </div>
      ) : (
        <div className="order-list">
          {pageOrders.map((order) => {
            const status = STATUS_LABEL[order.status] || { text: order.status, color: '#565959' };
            const productTotal = salePrice(order.product) * Number(order.quantity || 1);

            return (
              <div key={order.id} className="order-card">
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                  <div className="order-id-tile">
                    #{order.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 15 }}>Order #{order.id}</strong>
                    {order.productName && (
                      <>
                        <p style={{ fontWeight: 600, marginTop: 2 }}>{order.productName}</p>
                        {order.productSku && (
                          <p style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            SKU: {order.productSku}
                          </p>
                        )}
                      </>
                    )}
                    {(isSellerMode || isAdmin) && <p style={{ marginTop: 4 }}>Customer: <strong>{order.customerName}</strong></p>}
                    {order.createdAt && (
                      <p style={{ fontSize: 12, color: 'var(--amz-muted)', marginTop: 2 }}>
                        Order Date: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--amz-muted)', marginTop: 2 }}>
                      Expected Delivery: <strong>{formatDateRange(order.expectedDeliveryStart, order.expectedDeliveryEnd)}</strong>
                    </p>
                    <div className="order-timeline">
                      {['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].map((step) => (
                        <span key={step} className={['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].indexOf(step) ? 'done' : ''}>
                          {step}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: status.color, fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                      {status.text}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 170 }}>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                  <span style={{ fontSize: 13, color: '#565959' }}>Qty: <strong>{order.quantity}</strong></span>
                  {order.product?.price && (
                    <>
                      <span style={{ fontSize: 12, color: 'var(--amz-muted)' }}>
                        {fmt(salePrice(order.product))} x {order.quantity}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#b12704' }}>
                        {fmt(productTotal)}
                      </span>
                    </>
                  )}

                  {isSellerMode && order.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className="order-accept-btn" onClick={() => acceptOrder(order.id)}>Accept</button>
                      <button className="order-decline-btn" onClick={() => setConfirmId(order.id)}>Cancel</button>
                    </div>
                  )}

                  {isSellerMode && order.status === 'APPROVED' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className="order-ship-btn" onClick={() => doAction(`/api/orders/${order.id}/status?status=SHIPPED`, 'PUT')}>Mark Shipped</button>
                      <button className="order-decline-btn" onClick={() => setConfirmId(order.id)}>Cancel</button>
                    </div>
                  )}

                  {isAdmin && order.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className="order-decline-btn" onClick={() => setConfirmId(order.id)}>Cancel</button>
                    </div>
                  )}

                  {isAdmin && order.status === 'APPROVED' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className="order-ship-btn" onClick={() => shipOrder(order.id)}>Ship Order</button>
                      <button className="order-decline-btn" onClick={() => setConfirmId(order.id)}>Cancel</button>
                    </div>
                  )}

                  {isAdmin && order.status === 'SHIPPED' && (
                    <button className="order-accept-btn" onClick={() => deliverOrder(order.id)}>Mark Delivered</button>
                  )}

                  {isAdmin && order.status === 'DECLINED' && (
                    <button className="order-undo-btn" onClick={() => restoreOrder(order.id)}>Undo Decline</button>
                  )}

                  {!isSellerMode && !isAdmin && (order.status === 'PENDING' || order.status === 'APPROVED') && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className="order-decline-btn" onClick={() => setConfirmId(order.id)}>Cancel Order</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredOrders.length > PAGE_SIZE && (
            <div className="pagination-row">
              <button className="tab-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button className="tab-btn" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
