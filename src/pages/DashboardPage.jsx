import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardService, getErrorMessage } from '../services/api';
import {
  Boxes,
  Users,
  ShoppingBag,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminDashboardService.getStats({ date_filter: dateFilter });
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(getErrorMessage(err, 'Failed to load analytics from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  return (
    <div>
      {/* Top Header & Date Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.5rem', color: '#520612', fontWeight: 700 }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: '0.80rem', color: '#64748B' }}>
            Real-time business performance from database records
          </p>
        </div>

        {/* Date Filter Select & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#64748B" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: '#0F172A',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
          <button
            onClick={fetchStats}
            title="Refresh Analytics"
            disabled={loading}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: loading ? 'not-allowed' : 'pointer',
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
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#991B1B',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStats}
            style={{
              backgroundColor: '#991B1B',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #E2E8F0',
            borderTopColor: '#520612',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ fontSize: '0.86rem' }}>Loading analytics from database...</p>
        </div>
      ) : (
        <>
          {/* Revenue Highlight Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '20px'
          }}>
            {/* Total Revenue */}
            <div className="stat-card" style={{ borderLeft: '4px solid #520612' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase' }}>Gross Revenue</span>
                <IndianRupee size={18} color="#520612" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#520612', margin: '6px 0 2px' }}>
                ₹{Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Sum of all placed orders in range
              </span>
            </div>

            {/* Delivered Revenue */}
            <div className="stat-card" style={{ borderLeft: '4px solid #16A34A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase' }}>Delivered Revenue</span>
                <CheckCircle2 size={18} color="#16A34A" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#16A34A', margin: '6px 0 2px' }}>
                ₹{Number(stats?.revenue?.delivered || 0).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                Confirmed delivered & collected
              </span>
            </div>

            {/* Pending Order Value */}
            <div className="stat-card" style={{ borderLeft: '4px solid #D97706' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Parcel Value</span>
                <Clock size={18} color="#D97706" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#D97706', margin: '6px 0 2px' }}>
                ₹{Number(stats?.revenue?.pending || 0).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                In packaging or transit
              </span>
            </div>

            {/* Today's Revenue */}
            <div className="stat-card" style={{ borderLeft: '4px solid #C5A059' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase' }}>Today's Revenue</span>
                <TrendingUp size={18} color="#C5A059" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', margin: '6px 0 2px' }}>
                ₹{Number(stats?.revenue?.today || 0).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                This Month: ₹{Number(stats?.revenue?.thisMonth || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Operational Metrics Cards (Products, Orders, Customers) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '28px'
          }}>
            {/* Total Orders */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Total Orders</span>
                <ShoppingBag size={16} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.orders?.total || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                {stats?.orders?.pending || 0} Ordered | {stats?.orders?.shipped || 0} Shipped
              </div>
            </div>

            {/* Delivered Orders */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Delivered</span>
                <CheckCircle2 size={16} color="#16A34A" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16A34A' }}>{stats?.orders?.delivered || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Successfully fulfilled
              </div>
            </div>

            {/* Active Products */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Active Catalogue</span>
                <Boxes size={16} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.products?.active || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Out of {stats?.products?.total || 0} total products
              </div>
            </div>

            {/* Out of Stock */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Out of Stock</span>
                <AlertTriangle size={16} color="#EA580C" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: (stats?.products?.outOfStock || 0) > 0 ? '#EA580C' : '#64748B' }}>
                {stats?.products?.outOfStock || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Requires inventory attention
              </div>
            </div>

            {/* Total Customers */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Customers</span>
                <Users size={16} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.customers?.total || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Registered mobile users
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.15rem', color: '#520612', fontWeight: 700 }}>
                Recent Orders
              </h2>
              <Link to="/orders" className="btn-secondary" style={{ fontSize: '0.76rem', padding: '5px 12px' }}>
                View All Orders <ArrowRight size={14} />
              </Link>
            </div>

            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <p style={{ fontSize: '0.84rem', color: '#64748B', fontStyle: 'italic', padding: '16px 0' }}>
                No recent orders found in database.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order Ref</th>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontWeight: 700, color: '#520612' }}>{ord.order_number}</td>
                        <td>{ord.full_name || 'Customer'}</td>
                        <td>+91 {ord.primary_mobile}</td>
                        <td style={{ fontWeight: 600 }}>₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge-status ${ord.is_delivered ? 'delivered' : ord.is_shipped ? 'shipped' : 'ordered'}`}>
                            {ord.is_delivered ? 'DELIVERED' : ord.is_shipped ? 'SHIPPED' : 'ORDERED'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.76rem', color: '#64748B' }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td>
                          <Link to={`/orders?search=${ord.order_number}`} style={{ color: '#520612', fontWeight: 600, fontSize: '0.78rem' }}>
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
