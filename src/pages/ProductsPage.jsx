import React, { useState, useEffect } from 'react';
import { adminProductService, adminCategoryService, getErrorMessage } from '../services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Image as ImageIcon,
  X,
  Star,
  Flame,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedRecommended, setSelectedRecommended] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Add Product Form State
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [isRecommended, setIsRecommended] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Product Form State
  const [editImageUrls, setEditImageUrls] = useState([]);
  const [editFormError, setEditFormError] = useState('');

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, catRes] = await Promise.all([
        adminProductService.getProducts({
          category_id: selectedCategory || undefined,
          is_out_of_stock: selectedStock || undefined,
          is_recommended: selectedRecommended || undefined,
          search: searchQuery.trim() || undefined,
          limit: 100
        }),
        adminCategoryService.getCategories()
      ]);

      const prods = prodRes.data?.data || [];
      const cats = catRes.data?.data || [];
      setProducts(prods);
      setCategories(cats);
      if (!categoryId && cats.length > 0) {
        setCategoryId(cats[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load products or categories:', err);
      setError(getErrorMessage(err, 'Failed to load products catalogue.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [selectedCategory, selectedStock, selectedRecommended]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProductsAndCategories();
  };

  // Add modal Image inputs handling
  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleAddImageField = () => {
    if (imageUrls.length < 10) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const handleRemoveImageField = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  // Edit modal Image inputs handling
  const handleEditImageUrlChange = (index, value) => {
    const updated = [...editImageUrls];
    updated[index] = value;
    setEditImageUrls(updated);
  };

  const handleAddEditImageField = () => {
    if (editImageUrls.length < 10) {
      setEditImageUrls([...editImageUrls, '']);
    }
  };

  const handleRemoveEditImageField = (index) => {
    if (editImageUrls.length > 1) {
      setEditImageUrls(editImageUrls.filter((_, i) => i !== index));
    }
  };

  // Open Edit Modal
  const openEditModal = (prod) => {
    setEditingProduct({ ...prod });
    const existingImgs = prod.images && Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images.map((img) => (typeof img === 'string' ? img : img.image_url))
      : (prod.primary_image ? [prod.primary_image] : ['']);
    setEditImageUrls(existingImgs);
    setEditFormError('');
  };

  // Reset Add Form
  const resetAddForm = () => {
    setProductName('');
    setSku('');
    setDescription('');
    setRegularPrice('');
    setDiscountedPrice('');
    setIsRecommended(false);
    setIsBestseller(false);
    setIsNewArrival(false);
    setIsOutOfStock(false);
    setIsActive(true);
    setTags('');
    setImageUrls(['']);
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Create Product Submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!productName.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const reg = parseFloat(regularPrice);
    const disc = parseFloat(discountedPrice);

    if (isNaN(reg) || reg <= 0 || isNaN(disc) || disc <= 0) {
      setFormError('Please enter valid positive prices.');
      return;
    }

    if (disc > reg) {
      setFormError('Discounted price cannot exceed regular price.');
      return;
    }

    const validUrls = imageUrls.map((u) => u.trim()).filter((u) => u.length > 0);
    if (validUrls.length === 0) {
      setFormError('At least one product image URL is required.');
      return;
    }

    setSubmitting(true);
    try {
      await adminProductService.createProduct({
        name: productName.trim(),
        category_id: parseInt(categoryId, 10),
        sku: sku.trim() || undefined,
        description: description.trim(),
        regular_price: reg,
        discounted_price: disc,
        is_recommended: isRecommended ? 1 : 0,
        is_bestseller: isBestseller ? 1 : 0,
        is_new_arrival: isNewArrival ? 1 : 0,
        is_out_of_stock: isOutOfStock ? 1 : 0,
        is_active: isActive ? 1 : 0,
        tags: tags.trim(),
        images: validUrls
      });

      resetAddForm();
      fetchProductsAndCategories();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create product.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Update Product Submit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditFormError('');

    const reg = parseFloat(editingProduct.regular_price);
    const disc = parseFloat(editingProduct.discounted_price);

    if (isNaN(reg) || reg <= 0 || isNaN(disc) || disc <= 0) {
      setEditFormError('Please enter valid positive prices.');
      return;
    }

    if (disc > reg) {
      setEditFormError('Discounted price cannot exceed regular price.');
      return;
    }

    const validImgs = editImageUrls.map((u) => u.trim()).filter((u) => u.length > 0);

    setSubmitting(true);
    try {
      const payload = {
        name: editingProduct.name.trim(),
        category_id: parseInt(editingProduct.category_id, 10),
        description: editingProduct.description ? editingProduct.description.trim() : '',
        regular_price: reg,
        discounted_price: disc,
        is_recommended: editingProduct.is_recommended ? 1 : 0,
        is_bestseller: editingProduct.is_bestseller ? 1 : 0,
        is_new_arrival: editingProduct.is_new_arrival ? 1 : 0,
        is_out_of_stock: editingProduct.is_out_of_stock ? 1 : 0,
        is_active: editingProduct.is_active ? 1 : 0,
        tags: editingProduct.tags ? editingProduct.tags.trim() : ''
      };

      if (validImgs.length > 0) {
        payload.images = validImgs;
      }

      await adminProductService.updateProduct(editingProduct.id, payload);

      setEditingProduct(null);
      fetchProductsAndCategories();
    } catch (err) {
      setEditFormError(getErrorMessage(err, 'Failed to update product.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Out of Stock
  const handleToggleStock = async (prod) => {
    const nextVal = !prod.is_out_of_stock;
    try {
      await adminProductService.toggleFlag(prod.id, 'is_out_of_stock', nextVal);
      fetchProductsAndCategories();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update stock status'));
    }
  };

  // Toggle Recommended
  const handleToggleRecommended = async (prod) => {
    const nextVal = !prod.is_recommended;
    try {
      await adminProductService.toggleFlag(prod.id, 'is_recommended', nextVal);
      fetchProductsAndCategories();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update recommendation'));
    }
  };

  // Soft Delete Product
  const handleDeleteProduct = async (prod) => {
    if (window.confirm(`Delete product "${prod.name}" (SKU: ${prod.sku})? This will soft delete it from client view.`)) {
      try {
        await adminProductService.deleteProduct(prod.id);
        fetchProductsAndCategories();
      } catch (err) {
        alert(getErrorMessage(err, 'Failed to delete product'));
      }
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
            Product Catalogue Management
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Add, update pricing, toggle stock, and manage multi-image jewellery pieces
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.84rem' }}
        >
          <Plus size={16} /> Add New Product
        </button>
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
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProductsAndCategories}
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

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '16px'
      }}>
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.76rem',
            color: '#334155'
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.76rem',
            color: '#334155'
          }}
        >
          <option value="">Stock: All</option>
          <option value="0">In Stock</option>
          <option value="1">Out of Stock</option>
        </select>

        {/* Recommended Filter */}
        <select
          value={selectedRecommended}
          onChange={(e) => setSelectedRecommended(e.target.value)}
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.76rem',
            color: '#334155'
          }}
        >
          <option value="">Featured: All</option>
          <option value="1">Recommended Only</option>
        </select>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '4px 8px'
          }}>
            <Search size={14} color="#64748B" style={{ marginRight: '6px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU or name..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', width: '160px' }}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.76rem' }}>
            Filter
          </button>
          <button
            type="button"
            onClick={fetchProductsAndCategories}
            title="Refresh Products"
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '5px 8px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </form>
      </div>

      {/* Product Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {loading ? (
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
            <p style={{ fontSize: '0.86rem' }}>Loading products from database...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <p style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0F172A' }}>No products matching filters.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>SKU & Name</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Discount</th>
                  <th>Badges / Flags</th>
                  <th>Stock Toggle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <img
                        src={prod.primary_image || 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600'}
                        alt={prod.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                        onError={(e) => {
                          e.target.src = 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600';
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>{prod.name}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>SKU: {prod.sku}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#334155' }}>{prod.category_name}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#520612', fontSize: '0.86rem' }}>
                        ₹{Number(prod.discounted_price || 0).toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{Number(prod.regular_price || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      {prod.discount_percentage > 0 ? (
                        <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {prod.discount_percentage}% OFF
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>0%</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {prod.is_bestseller ? (
                          <span style={{ backgroundColor: '#C5A059', color: '#1F1A17', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                            BEST
                          </span>
                        ) : null}
                        {prod.is_recommended ? (
                          <span style={{ backgroundColor: '#520612', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                            REC
                          </span>
                        ) : null}
                        {prod.is_new_arrival ? (
                          <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                            NEW
                          </span>
                        ) : null}
                        {!prod.is_active ? (
                          <span style={{ backgroundColor: '#E2E8F0', color: '#475569', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                            INACTIVE
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStock(prod)}
                        style={{
                          backgroundColor: prod.is_out_of_stock ? '#FEF2F2' : '#F0FDF4',
                          color: prod.is_out_of_stock ? '#991B1B' : '#166534',
                          border: prod.is_out_of_stock ? '1px solid #FCA5A5' : '1px solid #BBF7D0',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {prod.is_out_of_stock ? 'OUT OF STOCK' : 'IN STOCK'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(prod)}
                          title="Edit Product Details"
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            padding: '5px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#334155'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          title="Soft Delete Product"
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            padding: '5px',
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

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
            padding: '24px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.25rem', color: '#520612', fontWeight: 700 }}>
                Add New 1 Gram Gold-Plated Piece
              </h3>
              <button onClick={resetAddForm} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', fontSize: '0.80rem', marginBottom: '16px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Royal Sovereign 1 Gram Gold-Plated Chain"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-input"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Custom SKU (Optional)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Leave empty for auto (KAL-CHA-001)"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Regular Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    placeholder="1500"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Discounted Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    placeholder="1200"
                    className="form-input"
                  />
                  {regularPrice && discountedPrice && parseFloat(discountedPrice) < parseFloat(regularPrice) && (
                    <span style={{ fontSize: '0.70rem', color: '#16A34A', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      Auto Discount: {Math.round(((parseFloat(regularPrice) - parseFloat(discountedPrice)) / parseFloat(regularPrice)) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Designed for everyday styling, this 1 gram gold-plated piece combines a classic look with a lightweight and versatile design."
                  className="form-input"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Multi-Image URL Section with live previews */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Product Image URLs (1 to 10 images)
                  </label>
                  {imageUrls.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddImageField}
                      style={{ background: 'none', border: 'none', color: '#520612', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Another Image URL
                    </button>
                  )}
                </div>

                {imageUrls.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', width: '20px' }}>{idx + 1}.</span>
                    <input
                      type="url"
                      required={idx === 0}
                      value={url}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder="https://example.com/jewellery-image.jpg"
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.80rem' }}
                    />
                    {url && (
                      <img
                        src={url}
                        alt="Preview"
                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    )}
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(idx)}
                        style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Status Toggles */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', padding: '6px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)} />
                  Recommended
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} />
                  Bestseller
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
                  New Arrival
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isOutOfStock} onChange={(e) => setIsOutOfStock(e.target.checked)} />
                  Out of Stock
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={resetAddForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.25rem', color: '#520612', fontWeight: 700 }}>
                Edit Product Details
              </h3>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {editFormError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', fontSize: '0.80rem', marginBottom: '14px' }}>
                {editFormError}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="form-input"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    disabled
                    value={editingProduct.sku}
                    className="form-input"
                    style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Regular Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editingProduct.regular_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, regular_price: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Discounted Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editingProduct.discounted_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discounted_price: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="form-input"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Images in edit modal */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Product Images (Optional to update)
                  </label>
                  {editImageUrls.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddEditImageField}
                      style={{ background: 'none', border: 'none', color: '#520612', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Image URL
                    </button>
                  )}
                </div>

                {editImageUrls.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', width: '20px' }}>{idx + 1}.</span>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleEditImageUrlChange(idx, e.target.value)}
                      placeholder="https://..."
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.80rem' }}
                    />
                    {url && (
                      <img
                        src={url}
                        alt="Preview"
                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    )}
                    {editImageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEditImageField(idx)}
                        style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* All Toggles (including is_new_arrival!) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_out_of_stock)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_out_of_stock: e.target.checked })}
                  />
                  Out of Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_recommended)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_recommended: e.target.checked })}
                  />
                  Recommended
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_bestseller)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_bestseller: e.target.checked })}
                  />
                  Bestseller
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_new_arrival)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_new_arrival: e.target.checked })}
                  />
                  New Arrival
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_active)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
