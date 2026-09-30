import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminAuthService, getErrorMessage } from '../services/api';
import { ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminAccountPage() {
  const { admin } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAuthService.changePassword(currentPassword, newPassword);
      setMessage(res.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 4500);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
          Admin Account & Credentials
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
          Manage your administrative profile and update your secure password
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '18px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
          Profile Details
        </h3>
        <div style={{ display: 'grid', gap: '8px', fontSize: '0.84rem' }}>
          <div>
            <span style={{ color: '#64748B' }}>Administrator:</span>
            <strong style={{ marginLeft: '8px', color: '#0F172A' }}>{admin?.full_name || 'Admin User'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Registered Mobile:</span>
            <strong style={{ marginLeft: '8px', color: '#0F172A' }}>
              {admin?.mobile_number ? `+91 ${admin.mobile_number}` : 'N/A'}
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Security Role:</span>
            <span style={{ marginLeft: '8px', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#520612', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <KeyRound size={16} /> Change Account Password
        </h3>

        {message && (
          <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '10px 12px', borderRadius: '6px', fontSize: '0.80rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: '6px', fontSize: '0.80rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: 'fit-content', padding: '9px 20px', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
