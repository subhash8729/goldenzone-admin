import React, { useState, useEffect } from 'react';
import { adminPaymentService, adminOrderService, getErrorMessage } from '../services/api';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  X,
  Package,
  MapPin,
  Eye,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Order Details Modal state
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderModalData, setOrderModalData] = useState(null);
  const [loadingOrderModal, setLoadingOrderModal] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminPaymentService.getPayments({
        search: search.trim() || undefined,
        payment_status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setPayments(res.data?.data || []);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(getErrorMessage(err, 'Failed to load payments from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  // Open related order modal
  const handleViewOrder = async (orderId) => {
    if (!orderId) return;
    setSelectedOrderId(orderId);
    setLoadingOrderModal(true);
    try {
      const res = await adminOrderService.getOrderDetail(orderId);
      if (res.data?.order) {
        setOrderModalData(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoadingOrderModal(false);
    }
  };

  const closeOrderModal = () => {
    setSelectedOrderId(null);
    setOrderModalData(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
            Razorpay Payment Transactions
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Live Razorpay transactions, gateway logs, verified customer payments, and order linkages
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {['all', 'PAID', 'PENDING', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  border: 'none',
                  backgroundColor: statusFilter === st ? '#520612' : 'transparent',
                  color: statusFilter === st ? '#FFFFFF' : '#475569',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'all' ? 'All Transactions' : st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 10px' }}>
              <Search size={14} color="#64748B" style={{ marginRight: '6px' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order #, Razorpay ID, name..."
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.80rem', width: '180px' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              Search
            </button>
          </form>

          <button
            onClick={fetchPayments}
            title="Refresh Transactions"
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchPayments}
            style={{ backgroundColor: '#991B1B', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="admin-table" style={{ minWidth: '1100px' }}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Razorpay Order ID</th>
              <th>Razorpay Payment ID</th>
              <th>Amount Paid</th>
              <th>Mode / Type</th>
              <th>Remaining COD</th>
              <th>Method</th>
              <th>Status</th>
              <th>Refund Info</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #E2E8F0',
                    borderTopColor: '#520612',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 12px'
                  }} />
                  <p style={{ fontSize: '0.86rem' }}>Loading real transactions from database...</p>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748B' }}>
                  <ShieldCheck size={36} color="#C5A059" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.92rem' }}>
                    No Razorpay Transactions Recorded
                  </p>
                  <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    Payments made via website checkout or verified via webhooks will appear here in real-time.
                  </p>
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const isPaid = p.payment_status === 'PAID';
                const isFailed = p.payment_status === 'FAILED';
                const isCod = p.payment_mode === 'COD' || p.payment_type === 'COD_ADVANCE';
                const remaining = Number(p.remaining_cod_amount ?? p.order_remaining_cod_amount ?? 0);

                return (
                  <tr key={p.id}>
                    <td>
                      <button
                        onClick={() => handleViewOrder(p.order_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#520612',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                          fontSize: '0.84rem'
                        }}
                      >
                        {p.order_number || `#${p.order_id || 'N/A'}`}
                      </button>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{p.full_name || 'Customer'}</span>
                      <p style={{ fontSize: '0.72rem', color: '#64748B' }}>+91 {p.primary_mobile}</p>
                    </td>

                    <td>
                      {p.razorpay_order_id ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#334155' }}>
                          {p.razorpay_order_id}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.70rem', color: '#94A3B8' }}>-</span>
                      )}
                    </td>

                    <td>
                      {p.razorpay_payment_id ? (
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          backgroundColor: '#F1F5F9',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {p.razorpay_payment_id}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.70rem', color: '#94A3B8' }}>Awaiting callback</span>
                      )}
                      {p.error_reason && (
                        <p style={{ fontSize: '0.66rem', color: '#DC2626', marginTop: '2px', maxWidth: '160px' }}>
                          {p.error_reason}
                        </p>
                      )}
                    </td>

                    <td style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.90rem' }}>
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{
                          backgroundColor: isCod ? '#FEF3C7' : '#DCFCE7',
                          color: isCod ? '#92400E' : '#166534',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          width: 'fit-content'
                        }}>
                          {isCod ? 'COD' : 'ONLINE'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                          {isCod ? '₹200 Advance' : 'Full Payment'}
                        </span>
                      </div>
                    </td>

                    <td>
                      {isCod ? (
                        <span style={{ fontWeight: 700, color: '#B45309', fontSize: '0.84rem' }}>
                          ₹{remaining.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>₹0</span>
                      )}
                    </td>

                    <td>
                      <span style={{
                        backgroundColor: '#F8FAFC',
                        color: '#334155',
                        border: '1px solid #E2E8F0',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.70rem',
                        fontWeight: 600
                      }}>
                        {p.payment_method || 'RAZORPAY'}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        backgroundColor: isPaid ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#FEF3C7',
                        color: isPaid ? '#166534' : isFailed ? '#991B1B' : '#92400E',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isPaid ? <CheckCircle2 size={11} /> : isFailed ? <AlertCircle size={11} /> : <Clock size={11} />}
                        {p.payment_status}
                      </span>
                    </td>

                    <td>
                      {p.refund_id ? (
                        <div style={{ fontSize: '0.70rem' }}>
                          <span style={{
                            backgroundColor: '#E0E7FF',
                            color: '#3730A3',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            ₹{p.refund_amount} ({p.refund_status})
                          </span>
                          <span style={{ display: 'block', fontFamily: 'monospace', color: '#64748B', fontSize: '0.64rem', marginTop: '2px' }}>
                            {p.refund_id}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>None</span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {p.formatted_date || (p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : 'Recent')}
                    </td>

                    <td>
                      {p.order_id ? (
                        <button
                          onClick={() => handleViewOrder(p.order_id)}
                          style={{
                            background: 'none',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#520612',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} /> Open
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Linked Order Modal */}
      {selectedOrderId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #E2E8F0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF7F2'
            }}>
              <div>
                <h3 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.15rem', color: '#520612', fontWeight: 700 }}>
                  Order Details: {orderModalData?.order_number || `#${selectedOrderId}`}
                </h3>
                <p style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Linked Razorpay transaction details and delivery address
                </p>
              </div>
              <button
                onClick={closeOrderModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {loadingOrderModal ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                  <p>Loading linked order information...</p>
                </div>
              ) : !orderModalData ? (
                <p style={{ color: '#EF4444', fontSize: '0.84rem' }}>Could not load order details.</p>
              ) : (
                <>
                  {/* Order Overview & Payment Info */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '14px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '16px',
                    fontSize: '0.80rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>CUSTOMER</span>
                        <strong style={{ color: '#0F172A' }}>{orderModalData.full_name}</strong>
                        <p style={{ color: '#475569' }}>+91 {orderModalData.primary_mobile}</p>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>PAYMENT STATUS</span>
                        <span style={{
                          fontWeight: 700,
                          color: orderModalData.payment_status === 'PAID' ? '#16A34A' : '#DC2626'
                        }}>
                          {orderModalData.payment_status}
                        </span>
                        <p style={{ color: '#64748B', fontSize: '0.72rem' }}>
                          Mode: {orderModalData.payment_mode === 'COD' ? 'Cash on Delivery (₹200 Adv)' : 'Online Prepaid'}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>DELIVERY DESTINATION</span>
                      <p style={{ color: '#1E293B', marginTop: '2px' }}>{orderModalData.address}</p>
                      <p style={{ color: '#64748B', fontSize: '0.74rem' }}>
                        {orderModalData.city || orderModalData.village}, {orderModalData.district}, {orderModalData.state} - {orderModalData.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                    Purchased Jewellery Items ({orderModalData.items?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                    {orderModalData.items?.map((it) => (
                      <div key={it.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                        <img
                          src={it.product_image || 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600'}
                          alt={it.product_name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.80rem', fontWeight: 600, color: '#0F172A' }}>{it.product_name}</p>
                          <span style={{ fontSize: '0.70rem', color: '#64748B' }}>Qty: {it.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#520612', fontSize: '0.84rem' }}>
                          ₹{Number(it.subtotal_price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #E2E8F0',
                    paddingTop: '14px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Grand Total:</span>
                      <strong style={{ fontSize: '1.15rem', color: '#520612', marginLeft: '6px' }}>
                        ₹{Number(orderModalData.total_amount || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <button onClick={closeOrderModal} className="btn-secondary">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
