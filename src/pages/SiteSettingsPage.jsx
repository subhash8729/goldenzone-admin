import React, { useState, useEffect } from 'react';
import { adminSettingService, getErrorMessage } from '../services/api';
import { Save, CheckCircle2, AlertCircle, Sparkles, Mail, MessageSquare, RefreshCw } from 'lucide-react';

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'enquiries'
  const [settings, setSettings] = useState({});
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminSettingService.getSettings();
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(getErrorMessage(err, 'Failed to load site settings from database.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const res = await adminSettingService.getEnquiries();
      setEnquiries(res.data?.enquiries || []);
    } catch (err) {
      console.error('Failed to load customer enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'enquiries') {
      fetchEnquiries();
    }
  }, [activeTab]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError('');
    try {
      await adminSettingService.updateSettings(settings);
      setSuccessMsg('Settings updated successfully! Changes reflect immediately across the storefront.');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save settings. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
          Site Settings & Customer Enquiries
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
          Configure homepage hero, announcement bar, contact info, and view submitted customer messages
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'settings' ? '#520612' : '#FFFFFF',
            color: activeTab === 'settings' ? '#FFFFFF' : '#475569',
            border: '1px solid ' + (activeTab === 'settings' ? '#520612' : '#CBD5E1'),
            transition: 'all 0.15s'
          }}
        >
          Brand & Website Configuration
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          style={{
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'enquiries' ? '#520612' : '#FFFFFF',
            color: activeTab === 'enquiries' ? '#FFFFFF' : '#475569',
            border: '1px solid ' + (activeTab === 'enquiries' ? '#520612' : '#CBD5E1'),
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Mail size={14} /> Customer Enquiries {enquiries.length > 0 ? `(${enquiries.length})` : ''}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSettings}
            style={{ backgroundColor: '#991B1B', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: '#DCFCE7',
          border: '1px solid #86EFAC',
          color: '#166534',
          fontSize: '0.82rem',
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {activeTab === 'settings' ? (
        loading ? (
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
            <p style={{ fontSize: '0.86rem' }}>Loading site settings from database...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '20px' }}>
            {/* HERO BANNER SECTION */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#520612', marginBottom: '12px' }}>
                1. Hero Banner Settings
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label className="form-label">Hero Background Video URL (MP4 / WebM)</label>
                  <input
                    type="url"
                    value={settings.hero_video_url || ''}
                    onChange={(e) => handleChange('hero_video_url', e.target.value)}
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                    className="form-input"
                  />
                  <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                    Video autoplays seamlessly in the hero section across mobile and desktop devices.
                  </p>
                </div>

                <div>
                  <label className="form-label">Hero Fallback Image / Poster URL</label>
                  <input
                    type="url"
                    value={settings.hero_image || ''}
                    onChange={(e) => handleChange('hero_image', e.target.value)}
                    placeholder="https://..."
                    className="form-input"
                  />
                  {settings.hero_image && (
                    <img
                      src={settings.hero_image}
                      alt="Hero Preview"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px', border: '1px solid #CBD5E1' }}
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                </div>
                <div>
                  <label className="form-label">Hero Main Title</label>
                  <input
                    type="text"
                    value={settings.hero_title || ''}
                    onChange={(e) => handleChange('hero_title', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={settings.hero_subtitle || ''}
                    onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                    className="form-input"
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* ANNOUNCEMENT STRIP */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#520612', marginBottom: '12px' }}>
                2. Header Announcement Strip
              </h3>
              <div>
                <label className="form-label">Announcement Text</label>
                <input
                  type="text"
                  value={settings.announcement_bar || ''}
                  onChange={(e) => handleChange('announcement_bar', e.target.value)}
                  placeholder="PREMIUM 1 GRAM GOLD-PLATED JEWELLERY | SAME DAY DISPATCH"
                  className="form-input"
                />
              </div>
            </div>

            {/* WHATSAPP & CONTACT DETAILS */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#520612', marginBottom: '12px' }}>
                3. WhatsApp & Social Contacts
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsapp_number || ''}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    placeholder="+91 92861 29921"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">WhatsApp Contact Person</label>
                  <input
                    type="text"
                    value={settings.whatsapp_contact_name || ''}
                    onChange={(e) => handleChange('whatsapp_contact_name', e.target.value)}
                    placeholder="Golden Zone Support"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label className="form-label">Call Support Telephone</label>
                  <input
                    type="text"
                    value={settings.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="9286129921"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Primary Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="goldenzone676@gmail.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label className="form-label">Secondary Support Email</label>
                  <input
                    type="email"
                    value={settings.support_email || ''}
                    onChange={(e) => handleChange('support_email', e.target.value)}
                    placeholder="support@goldenzone.in"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={settings.instagram_url || ''}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    placeholder="https://www.instagram.com/goldenzone.in"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label className="form-label">Store / Company Address</label>
                  <input
                    type="text"
                    value={settings.company_address || ''}
                    onChange={(e) => handleChange('company_address', e.target.value)}
                    placeholder="Jyoti Nagar, Sanchore, Rajasthan, Jalore"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    value={settings.company_pincode || ''}
                    onChange={(e) => handleChange('company_pincode', e.target.value)}
                    placeholder="343041"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label className="form-label">WhatsApp VIP Group Link</label>
                <input
                  type="url"
                  value={settings.whatsapp_group_url || ''}
                  onChange={(e) => handleChange('whatsapp_group_url', e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="form-input"
                />
              </div>
            </div>

            {/* FOOTER & BRAND DESCRIPTION */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#520612', marginBottom: '12px' }}>
                4. Brand Story & Footer Text
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label className="form-label">Brand Description (Footer & About page)</label>
                  <textarea
                    rows={3}
                    value={settings.brand_description || ''}
                    onChange={(e) => handleChange('brand_description', e.target.value)}
                    className="form-input"
                    style={{ resize: 'none' }}
                  />
                </div>
                <div>
                  <label className="form-label">Footer Copyright Line</label>
                  <input
                    type="text"
                    value={settings.footer_text || ''}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.90rem', justifySelf: 'start', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Site Settings'}
            </button>
          </form>
        )
      ) : (
        /* CUSTOMER ENQUIRIES TAB */
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#520612' }}>Customer Inquiries & Messages</h3>
              <p style={{ fontSize: '0.74rem', color: '#64748B' }}>Messages submitted by patrons from the Contact Us page</p>
            </div>
            <button
              onClick={fetchEnquiries}
              title="Refresh Enquiries"
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RefreshCw size={14} className={enquiriesLoading ? 'spin' : ''} />
            </button>
          </div>

          {enquiriesLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              <p>Loading customer enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
              <Mail size={32} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontWeight: 600, color: '#0F172A' }}>No customer enquiries received yet.</p>
              <p style={{ fontSize: '0.76rem', marginTop: '4px' }}>Inquiries sent via the Contact Us form will appear here in real-time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {enquiries.map((enq) => (
                <div key={enq.id} style={{ padding: '16px 18px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{enq.name}</strong>
                      <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '10px' }}>
                        📱 +91 {enq.mobile_number} {enq.email ? `| ✉️ ${enq.email}` : ''}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.70rem', color: '#94A3B8' }}>
                      {enq.created_at ? new Date(enq.created_at).toLocaleString('en-IN') : 'Recent'}
                    </span>
                  </div>
                  {enq.subject && (
                    <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#520612', marginBottom: '4px' }}>
                      Subject: {enq.subject}
                    </div>
                  )}
                  <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px' }}>
                    {enq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
