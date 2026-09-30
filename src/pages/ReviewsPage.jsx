import React, { useState, useEffect } from 'react';
import { adminReviewService, getErrorMessage } from '../services/api';
import { Star, Eye, EyeOff, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminReviewService.getReviews();
      setReviews(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(getErrorMessage(err, 'Failed to load reviews from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggle = async (rev) => {
    const nextVal = !rev.is_approved;
    try {
      await adminReviewService.toggleApproval(rev.id, nextVal);
      fetchReviews();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update review approval status'));
    }
  };

  const handleDelete = async (rev) => {
    if (window.confirm(`Delete review from "${rev.customer_name}"?`)) {
      try {
        await adminReviewService.deleteReview(rev.id);
        fetchReviews();
      } catch (err) {
        alert(getErrorMessage(err, 'Failed to delete review'));
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
            Customer Reviews Moderation
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Approve, hide, or remove customer feedback submitted on jewellery pieces
          </p>
        </div>
        <button
          onClick={fetchReviews}
          title="Refresh Reviews"
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

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchReviews}
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
            <p style={{ fontSize: '0.86rem' }}>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
            <p style={{ fontWeight: 600, color: '#0F172A' }}>No customer reviews submitted yet.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Reviews submitted on product pages will appear here for moderation.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review Text</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{rev.customer_name}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.80rem', color: '#520612', fontWeight: 600 }}>{rev.product_name}</span>
                      <p style={{ fontSize: '0.70rem', color: '#64748B' }}>SKU: {rev.product_sku}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', color: '#EAB308' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="#EAB308" />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>"{rev.review_text}"</p>
                    </td>
                    <td>
                      <span style={{
                        backgroundColor: rev.is_approved ? '#DCFCE7' : '#FEF2F2',
                        color: rev.is_approved ? '#166534' : '#991B1B',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.70rem',
                        fontWeight: 700
                      }}>
                        {rev.is_approved ? 'APPROVED' : 'HIDDEN'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleToggle(rev)}
                          title={rev.is_approved ? 'Hide Review' : 'Approve Review'}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem'
                          }}
                        >
                          {rev.is_approved ? <EyeOff size={13} /> : <Eye size={13} />}
                          {rev.is_approved ? 'Hide' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDelete(rev)}
                          title="Delete Review"
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#991B1B'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
