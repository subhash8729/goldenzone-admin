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
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink
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

  // Dedicated Product Image Manager Modal State
  const [managingImagesProduct, setManagingImagesProduct] = useState(null);
  const [productImagesList, setProductImagesList] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagesModalMsg, setImagesModalMsg] = useState({ type: '', text: '' });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [addingImage, setAddingImage] = useState(false);
  const [imageActionLoadingId, setImageActionLoadingId] = useState(null);

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

  const handleSetAddImagePrimary = (index) => {
    if (index === 0) return;
    const targetUrl = imageUrls[index];
    const remaining = imageUrls.filter((_, i) => i !== index);
    setImageUrls([targetUrl, ...remaining]);
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

  const handleSetEditImagePrimary = (index) => {
    if (index === 0) return;
    const targetUrl = editImageUrls[index];
    const remaining = editImageUrls.filter((_, i) => i !== index);
    setEditImageUrls([targetUrl, ...remaining]);
  };

  const handleMoveEditImageField = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editImageUrls.length) return;
    const updated = [...editImageUrls];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setEditImageUrls(updated);
  };

  // Dedicated Image Manager Modal Handlers
  const openManageImagesModal = async (prod) => {
    setManagingImagesProduct({ ...prod });
    setNewImageUrl('');
    setImagesModalMsg({ type: '', text: '' });
    const initialImgs = Array.isArray(prod.images) ? prod.images : [];
    setProductImagesList(initialImgs);
    setLoadingImages(true);
    try {
      const res = await adminProductService.getProductImages(prod.id);
      if (res.data?.images) {
        setProductImagesList(res.data.images);
      }
    } catch (err) {
      console.error('Failed to load fresh images for product:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !managingImagesProduct) return;
    setAddingImage(true);
    setImagesModalMsg({ type: '', text: '' });
    try {
      const res = await adminProductService.addProductImage(managingImagesProduct.id, newImageUrl.trim());
      const addedImg = res.data?.image;
      if (addedImg) {
        setProductImagesList((prev) => {
          const updated = [...prev, addedImg];
          if (updated.length === 1) updated[0].is_primary = true;
          return updated;
        });
        setNewImageUrl('');
        setImagesModalMsg({ type: 'success', text: 'Image added successfully to gallery.' });
        fetchProductsAndCategories();
      }
    } catch (err) {
      setImagesModalMsg({ type: 'error', text: getErrorMessage(err, 'Failed to add image.') });
    } finally {
      setAddingImage(false);
    }
  };

  const handleSetPrimaryImage = async (img) => {
    if (!managingImagesProduct || img.is_primary) return;
    setImageActionLoadingId(img.id);
    setImagesModalMsg({ type: '', text: '' });
    try {
      await adminProductService.setPrimaryProductImage(managingImagesProduct.id, img.id);
      setProductImagesList((prev) => {
        const reordered = [
          { ...img, is_primary: true },
          ...prev.filter((i) => i.id !== img.id).map((i) => ({ ...i, is_primary: false }))
        ];
        return reordered;
      });
      setImagesModalMsg({ type: 'success', text: 'Primary image updated successfully! Customers will see this image first.' });
      fetchProductsAndCategories();
    } catch (err) {
      setImagesModalMsg({ type: 'error', text: getErrorMessage(err, 'Failed to set primary image.') });
    } finally {
      setImageActionLoadingId(null);
    }
  };

  const handleDeleteImage = async (img) => {
    if (!managingImagesProduct) return;
    const isPrimary = img.is_primary;
    const confirmText = isPrimary
      ? 'This is currently the PRIMARY image. Deleting it will make the next image the primary image. Proceed? (The product itself will NOT be deleted)'
      : 'Delete this image from the product gallery? (The product itself will NOT be deleted)';

    if (!window.confirm(confirmText)) return;

    setImageActionLoadingId(img.id);
    setImagesModalMsg({ type: '', text: '' });
    try {
      await adminProductService.deleteProductImage(managingImagesProduct.id, img.id);
      setProductImagesList((prev) => {
        const remaining = prev.filter((i) => i.id !== img.id);
        if (remaining.length > 0) {
          remaining[0].is_primary = true;
        }
        return remaining;
      });
      setImagesModalMsg({ type: 'success', text: 'Image deleted successfully. The product remains active.' });
      fetchProductsAndCategories();
    } catch (err) {
      setImagesModalMsg({ type: 'error', text: getErrorMessage(err, 'Failed to delete image.') });
    } finally {
      setImageActionLoadingId(null);
    }
  };

  const handleMoveImage = async (index, direction) => {
    if (!managingImagesProduct) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= productImagesList.length) return;

    const updated = [...productImagesList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((item, idx) => ({ ...item, is_primary: idx === 0 }));
    setProductImagesList(reordered);

    try {
      await adminProductService.reorderProductImages(
        managingImagesProduct.id,
        reordered.map((i) => i.id)
      );
      fetchProductsAndCategories();
    } catch (err) {
      console.error('Failed to save new image order:', err);
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

  // Permanently Delete Product
  const handleDeleteProduct = async (prod) => {
    if (window.confirm(`Delete product "${prod.name}" (SKU: ${prod.sku}) permanently? This will completely remove it from the catalogue and database.`)) {
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
                      <div
                        onClick={() => openManageImagesModal(prod)}
                        title="Click to view and manage all product images"
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        <img
                          src={prod.primary_image || 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600'}
                          alt={prod.name}
                          style={{
                            width: '52px',
                            height: '52px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #C5A059',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600';
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '-4px',
                            backgroundColor: '#520612',
                            color: '#FFFFFF',
                            fontSize: '0.56rem',
                            fontWeight: 800,
                            padding: '1px 4px',
                            borderRadius: '4px',
                            border: '1px solid #C5A059',
                            letterSpacing: '0.03em',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        >
                          ★ MAIN
                        </span>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            backgroundColor: (prod.image_count > 1 || (prod.images && prod.images.length > 1)) ? '#0F172A' : '#475569',
                            color: '#FFFFFF',
                            fontSize: '0.60rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {prod.image_count || (prod.images ? prod.images.length : 1)} {((prod.image_count || (prod.images ? prod.images.length : 1)) === 1) ? 'img' : 'imgs'}
                        </span>
                      </div>
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
                          onClick={() => openManageImagesModal(prod)}
                          title={`Manage All Images (${prod.image_count || (prod.images ? prod.images.length : 1)})`}
                          style={{
                            background: '#FEF3C7',
                            border: '1px solid #FCD34D',
                            padding: '5px 7px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#92400E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          <ImageIcon size={13} />
                          <span>{prod.image_count || (prod.images ? prod.images.length : 1)}</span>
                        </button>
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
                          title="Permanently Delete Product"
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
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      Product Image URLs (1 to 10 images)
                    </label>
                    <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0' }}>
                      Position #1 will be the <strong style={{ color: '#520612' }}>★ Main / Primary Image</strong> across the website and catalogues.
                    </p>
                  </div>
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
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    backgroundColor: idx === 0 ? '#FEFCE8' : 'transparent',
                    padding: idx === 0 ? '6px 8px' : '2px 0',
                    borderRadius: '6px',
                    border: idx === 0 ? '1px solid #FEF08A' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '75px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>#{idx + 1}</span>
                      {idx === 0 ? (
                        <span style={{
                          backgroundColor: '#520612',
                          color: '#FFFFFF',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}>
                          ★ MAIN
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetAddImagePrimary(idx)}
                          title="Make this the main image"
                          style={{
                            background: '#FFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            color: '#92400E',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            cursor: 'pointer'
                          }}
                        >
                          Make Main
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      required={idx === 0}
                      value={url}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder={idx === 0 ? "https://example.com/primary-jewellery-image.jpg" : "https://example.com/gallery-angle-2.jpg"}
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.80rem' }}
                    />
                    {url && (
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                        onError={(e) => (e.target.style.display = 'none')}
                        onLoad={(e) => (e.target.style.display = 'block')}
                      />
                    )}
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(idx)}
                        style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}
                        title="Remove image field"
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
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      Product Images ({editImageUrls.length} / 10)
                    </label>
                    <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0' }}>
                      Position #1 is the <strong style={{ color: '#520612' }}>★ Main Image</strong> seen first by customers.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const prod = editingProduct;
                        setEditingProduct(null);
                        openManageImagesModal(prod);
                      }}
                      style={{
                        background: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        borderRadius: '4px',
                        color: '#92400E',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ImageIcon size={12} /> Manage Gallery
                    </button>
                    {editImageUrls.length < 10 && (
                      <button
                        type="button"
                        onClick={handleAddEditImageField}
                        style={{ background: 'none', border: 'none', color: '#520612', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add URL
                      </button>
                    )}
                  </div>
                </div>

                {editImageUrls.map((url, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    backgroundColor: idx === 0 ? '#FEFCE8' : 'transparent',
                    padding: idx === 0 ? '6px 8px' : '2px 0',
                    borderRadius: '6px',
                    border: idx === 0 ? '1px solid #FEF08A' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '75px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>#{idx + 1}</span>
                      {idx === 0 ? (
                        <span style={{
                          backgroundColor: '#520612',
                          color: '#FFFFFF',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}>
                          ★ MAIN
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetEditImagePrimary(idx)}
                          title="Make this the primary image"
                          style={{
                            background: '#FFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            color: '#92400E',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            cursor: 'pointer'
                          }}
                        >
                          Make Main
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleEditImageUrlChange(idx, e.target.value)}
                      placeholder={idx === 0 ? "https://... (Main Image)" : "https://... (Gallery Image)"}
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.80rem' }}
                    />
                    {url && (
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                        onError={(e) => (e.target.style.display = 'none')}
                        onLoad={(e) => (e.target.style.display = 'block')}
                      />
                    )}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveEditImageField(idx, 'up')}
                        title="Move Up"
                        style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '3px', cursor: 'pointer', color: '#334155' }}
                      >
                        <ArrowUp size={12} />
                      </button>
                    )}
                    {idx < editImageUrls.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveEditImageField(idx, 'down')}
                        title="Move Down"
                        style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '3px', cursor: 'pointer', color: '#334155' }}
                      >
                        <ArrowDown size={12} />
                      </button>
                    )}
                    {editImageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEditImageField(idx)}
                        style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}
                        title="Remove image field"
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

      {/* DEDICATED PRODUCT IMAGES GALLERY & MANAGER MODAL */}
      {managingImagesProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.70)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF7F2'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={20} color="#520612" />
                  <h3 style={{ fontSize: '1.2rem', color: '#520612', fontWeight: 700, margin: 0 }}>
                    Manage Product Images
                  </h3>
                  <span style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #FCD34D'
                  }}>
                    {productImagesList.length} / 10 Images
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '3px', margin: 0 }}>
                  <strong>{managingImagesProduct.name}</strong> • SKU: <span style={{ fontFamily: 'monospace' }}>{managingImagesProduct.sku}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setManagingImagesProduct(null);
                  setImagesModalMsg({ type: '', text: '' });
                }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                title="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {/* Feedback message banner */}
              {imagesModalMsg.text && (
                <div style={{
                  backgroundColor: imagesModalMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${imagesModalMsg.type === 'success' ? '#BBF7D0' : '#FCA5A5'}`,
                  color: imagesModalMsg.type === 'success' ? '#166534' : '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{imagesModalMsg.text}</span>
                  <button
                    onClick={() => setImagesModalMsg({ type: '', text: '' })}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Add New Image Form */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px dashed #CBD5E1',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '22px'
              }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} color="#520612" /> Add New Image URL
                </h4>
                <p style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '12px' }}>
                  Provide an image URL (HTTPS / CDN link). Up to 10 images supported per piece.
                </p>

                <form onSubmit={handleAddImage} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      required
                      disabled={productImagesList.length >= 10 || addingImage}
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://pashupati.co/cdn/shop/files/..."
                      className="form-input"
                      style={{ fontSize: '0.82rem', width: '100%' }}
                    />
                    {newImageUrl && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={newImageUrl}
                          alt="New preview"
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          onLoad={(e) => { e.target.style.display = 'block'; }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                          Image link ready to add
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!newImageUrl.trim() || productImagesList.length >= 10 || addingImage}
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      opacity: (!newImageUrl.trim() || productImagesList.length >= 10 || addingImage) ? 0.6 : 1
                    }}
                  >
                    {addingImage ? 'Adding...' : '+ Add Image'}
                  </button>
                </form>
                {productImagesList.length >= 10 && (
                  <p style={{ fontSize: '0.74rem', color: '#DC2626', marginTop: '6px', fontWeight: 600 }}>
                    Maximum 10 images limit reached for this product. Delete an existing image to add a new one.
                  </p>
                )}
              </div>

              {/* Gallery Grid */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Current Images ({productImagesList.length})
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '2px 0 0' }}>
                      The <span style={{ color: '#C5A059', fontWeight: 700 }}>★ Main Image</span> is shown first on all customer catalogues, search cards, and as the initial gallery photo.
                    </p>
                  </div>
                </div>

                {loadingImages ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '0.82rem' }}>Loading images...</p>
                  </div>
                ) : productImagesList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', border: '1px dashed #CBD5E1', borderRadius: '10px', color: '#64748B' }}>
                    <ImageIcon size={32} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: 600, color: '#334155', fontSize: '0.86rem' }}>No images found for this product.</p>
                    <p style={{ fontSize: '0.76rem', marginTop: '4px' }}>Paste an image URL above to add the primary photo.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: '14px'
                  }}>
                    {productImagesList.map((img, idx) => {
                      const isPrimary = idx === 0 || img.is_primary;
                      const isLoadingThis = imageActionLoadingId === img.id;

                      return (
                        <div
                          key={img.id || idx}
                          style={{
                            border: isPrimary ? '2px solid #C5A059' : '1px solid #E2E8F0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: isPrimary ? '#FFFDF8' : '#FFFFFF',
                            boxShadow: isPrimary ? '0 4px 12px rgba(197, 160, 89, 0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          {/* Top Status Bar */}
                          <div style={{
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: isPrimary ? '#FAF3E3' : '#F8FAFC',
                            borderBottom: isPrimary ? '1px solid #F6E6BF' : '1px solid #F1F5F9'
                          }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isPrimary ? '#854D0E' : '#64748B' }}>
                              #{idx + 1}
                            </span>
                            {isPrimary ? (
                              <span style={{
                                backgroundColor: '#520612',
                                color: '#FFFFFF',
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                padding: '2px 7px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <Star size={10} fill="#C5A059" color="#C5A059" /> Main Image
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.66rem', color: '#94A3B8' }}>
                                Gallery Photo
                              </span>
                            )}
                          </div>

                          {/* Image View */}
                          <div style={{ position: 'relative', width: '100%', paddingTop: '80%', backgroundColor: '#F1F5F9' }}>
                            <img
                              src={img.image_url}
                              alt={`Product image ${idx + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.src = 'https://pashupati.co/cdn/shop/files/B35A6888-45CE-4752-A4A2-7951A478EA61.jpg?v=1775994142&width=600';
                              }}
                            />
                          </div>

                          {/* Actions on this image */}
                          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={img.image_url}>
                              {img.image_url}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {!isPrimary ? (
                                <button
                                  type="button"
                                  disabled={isLoadingThis}
                                  onClick={() => handleSetPrimaryImage(img)}
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#FFFBEB',
                                    color: '#B45309',
                                    border: '1px solid #FCD34D',
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Star size={12} /> Set as Main
                                </button>
                              ) : (
                                <div style={{
                                  flex: 1,
                                  backgroundColor: '#F0FDF4',
                                  color: '#166534',
                                  border: '1px solid #BBF7D0',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  fontSize: '0.70rem',
                                  fontWeight: 700,
                                  textAlign: 'center'
                                }}>
                                  ✓ Primary Photo
                                </div>
                              )}

                              {/* Move Left / Up */}
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'up')}
                                  title="Move Earlier"
                                  style={{
                                    backgroundColor: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    padding: '5px',
                                    cursor: 'pointer',
                                    color: '#334155'
                                  }}
                                >
                                  <ArrowLeft size={13} />
                                </button>
                              )}

                              {/* Move Right / Down */}
                              {idx < productImagesList.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'down')}
                                  title="Move Later"
                                  style={{
                                    backgroundColor: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    padding: '5px',
                                    cursor: 'pointer',
                                    color: '#334155'
                                  }}
                                >
                                  <ArrowRight size={13} />
                                </button>
                              )}

                              {/* Delete Image Button */}
                              <button
                                type="button"
                                disabled={isLoadingThis}
                                onClick={() => handleDeleteImage(img)}
                                title="Delete this image"
                                style={{
                                  backgroundColor: '#FEF2F2',
                                  border: '1px solid #FCA5A5',
                                  color: '#991B1B',
                                  borderRadius: '6px',
                                  padding: '5px 7px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF8F5'
            }}>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                💡 Deleting an image only removes that image file. The product remains untouched in the catalogue.
              </span>
              <button
                onClick={() => {
                  setManagingImagesProduct(null);
                  setImagesModalMsg({ type: '', text: '' });
                }}
                className="btn-primary"
                style={{ padding: '6px 18px', fontSize: '0.80rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
