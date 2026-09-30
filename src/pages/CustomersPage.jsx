import React, { useState, useEffect } from 'react';
import { adminCustomerService, getErrorMessage } from '../services/api';
import { Users, Search, ShoppingBag, Eye, X, Phone, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminCustomerService.getCustomers({ search: search.trim() || undefined });
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(getErrorMessage(err, 'Failed to load customers from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleOpenCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setCustomerOrders([]);
    setModalLoading(true);
    try {
      const res = await adminCustomerService.getCustomerDetail(cust.id);
      if (res.data?.orders) {
        setCustomerOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
            Customer Directory
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Registered mobile users, saved addresses, and confirmed order history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 10px' }}>
              <Search size={14} color="#64748B" style={{ marginRight: '6px' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile, city..."
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.80rem', width: '180px' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              Search
            </button>
          </form>
          <button
            onClick={fetchCustomers}
            title="Refresh Customers"
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
            onClick={fetchCustomers}
            style={{ backgroundColor: '#991B1B', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#520612',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} />
            <p style={{ fontSize: '0.86rem' }}>Loading customer records...</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
            <p style={{ fontWeight: 600, color: '#0F172A' }}>No customer records found.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Try searching with a different mobile or name.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Primary Mobile</th>
                  <th>Secondary Contact</th>
                  <th>Saved Location</th>
                  <th>Paid Orders</th>
                  <th>Total Spent</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{c.full_name || 'Customer'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.80rem', color: '#334155' }}>+91 {c.mobile_number}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                        {c.secondary_mobile ? `+91 ${c.secondary_mobile}` : '—'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ fontSize: '0.76rem', color: '#475569' }}>
                        {c.city || c.village ? `${c.city || c.village}, ${c.state || ''}` : 'Not provided yet'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#520612' }}>{c.total_orders || 0}</span> orders
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#16A34A' }}>
                        ₹{Number(c.total_spent || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{c.relative_registered || 'Recent'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenCustomer(c)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={12} /> View Orders
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.2rem', color: '#520612', fontWeight: 700 }}>
                  {selectedCustomer.full_name || 'Customer Profile'}
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>+91 {selectedCustomer.mobile_number}</span>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.80rem' }}>
              <p><strong>Saved Address:</strong> {selectedCustomer.address || 'None'}</p>
              <p><strong>City / Village:</strong> {selectedCustomer.city || selectedCustomer.village || 'N/A'}</p>
              <p><strong>District & State:</strong> {selectedCustomer.district ? `${selectedCustomer.district}, ` : ''}{selectedCustomer.state || ''} {selectedCustomer.pincode ? `- ${selectedCustomer.pincode}` : ''}</p>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              Confirmed Orders ({customerOrders.length})
            </h4>

            {modalLoading ? (
              <p style={{ fontSize: '0.80rem', color: '#64748B', padding: '10px 0' }}>Loading customer orders...</p>
            ) : customerOrders.length === 0 ? (
              <p style={{ fontSize: '0.80rem', color: '#64748B', fontStyle: 'italic', padding: '10px 0' }}>No confirmed orders placed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customerOrders.map((ord) => (
                  <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#520612', fontSize: '0.82rem' }}>{ord.order_number}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}</div>
                      <span className={`badge-status ${ord.is_delivered ? 'delivered' : ord.is_shipped ? 'shipped' : 'ordered'}`}>
                        {ord.is_delivered ? 'DELIVERED' : ord.is_shipped ? 'SHIPPED' : 'ORDERED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
