import React, { useState, useEffect } from 'react';
import { adminCategoryService, getErrorMessage } from '../services/api';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminCategoryService.getCategories();
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(getErrorMessage(err, 'Failed to load categories from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }
    try {
      await adminCategoryService.createCategory({
        name: name.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null
      });
      setName('');
      setDescription('');
      setImageUrl('');
      setIsAddOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create category'));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await adminCategoryService.updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        description: editingCategory.description ? editingCategory.description.trim() : null,
        image_url: editingCategory.image_url ? editingCategory.image_url.trim() : null,
        is_active: editingCategory.is_active ? 1 : 0
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update category'));
    }
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Delete category "${cat.name}"?`)) {
      try {
        await adminCategoryService.deleteCategory(cat.id);
        fetchCategories();
      } catch (err) {
        alert(getErrorMessage(err, 'Cannot delete category with associated products.'));
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
            Category Management
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Organize jewellery collections (Rings, Chains, Balis, Kadas, Bracelets)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchCategories}
            title="Refresh Categories"
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
          <button onClick={() => { setIsAddOpen(true); setFormError(''); }} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <Plus size={15} /> Add Category
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
            onClick={fetchCategories}
            style={{ backgroundColor: '#991B1B', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#520612' }}>Create Category</h3>
              <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', fontSize: '0.80rem', marginBottom: '12px' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kada"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Royal Rajputi & Punjabi 1 gram gold-plated kadas"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Table */}
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
            <p style={{ fontSize: '0.86rem' }}>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
            <p style={{ fontWeight: 600, color: '#0F172A' }}>No categories created yet.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Click "Add Category" to create your first collection.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products Linked</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <img
                      src={cat.image_url || 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600'}
                      alt={cat.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                      onError={(e) => {
                        e.target.src = 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600';
                      }}
                    />
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{cat.name}</span>
                    {cat.description && <p style={{ fontSize: '0.72rem', color: '#64748B' }}>{cat.description}</p>}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748B' }}>{cat.slug}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{cat.total_products || 0}</span> pieces
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: cat.is_active ? '#DCFCE7' : '#F1F5F9',
                      color: cat.is_active ? '#166534' : '#64748B',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.70rem',
                      fontWeight: 700
                    }}>
                      {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setEditingCategory({ ...cat })}
                        title="Edit Category"
                        style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        title="Delete Category"
                        style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '4px', borderRadius: '4px', cursor: 'pointer', color: '#991B1B' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#520612' }}>Edit Category</h3>
              <button onClick={() => setEditingCategory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Thumbnail URL</label>
                <input
                  type="url"
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  className="form-input"
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingCategory.is_active)}
                  onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                />
                Active on Storefront
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setEditingCategory(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
