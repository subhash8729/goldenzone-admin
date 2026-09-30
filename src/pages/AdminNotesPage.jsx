import React, { useState, useEffect } from 'react';
import { adminNoteService, getErrorMessage } from '../services/api';
import { Pin, Trash2, Edit2, Plus, Save, X, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminNoteService.getNotes();
      setNotes(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin notes:', err);
      setError(getErrorMessage(err, 'Failed to load notes from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await adminNoteService.createNote({
        note_text: noteText.trim(),
        is_pinned: isPinned ? 1 : 0
      });
      setNoteText('');
      setIsPinned(false);
      fetchNotes();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save note'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNote || !editingNote.note_text.trim()) return;
    try {
      await adminNoteService.updateNote(editingNote.id, {
        note_text: editingNote.note_text.trim(),
        is_pinned: editingNote.is_pinned ? 1 : 0
      });
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update note'));
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this admin remark?')) {
      try {
        await adminNoteService.deleteNote(id);
        fetchNotes();
      } catch (err) {
        alert(getErrorMessage(err, 'Failed to delete note'));
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontSize: '1.45rem', color: '#520612', fontWeight: 700 }}>
            Admin Remarks & General Notebook
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Record emergency reminders, stock procurement notes, and special customer requests
          </p>
        </div>
        <button
          onClick={fetchNotes}
          title="Refresh Notes"
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
            onClick={fetchNotes}
            style={{ backgroundColor: '#991B1B', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* New Note Form */}
      <form onSubmit={handleCreateNote} style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <label className="form-label" style={{ marginBottom: '8px' }}>
          Create New Remark / Reminder
        </label>
        <textarea
          rows={3}
          required
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="e.g. Special dispatch instruction for customer XYZ (+91 9286129921)..."
          className="form-input"
          style={{ resize: 'none', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            <Pin size={14} color="#C5A059" /> Pin to top
          </label>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.80rem' }}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>

      {/* Notes Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#520612',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} />
            <p style={{ fontSize: '0.86rem' }}>Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#64748B' }}>
            <p style={{ fontWeight: 600, color: '#0F172A' }}>No notes or remarks saved yet.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Use the form above to record delivery notes and reminders.</p>
          </div>
        ) : (
          notes.map((nt) => (
            <div
              key={nt.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: nt.is_pinned ? '1.5px solid #C5A059' : '1px solid #E2E8F0',
                padding: '14px',
                boxShadow: nt.is_pinned ? '0 2px 8px rgba(197, 160, 89, 0.15)' : 'none',
                position: 'relative'
              }}
            >
              {nt.is_pinned && (
                <div style={{ position: 'absolute', top: '10px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#C5A059', fontSize: '0.70rem', fontWeight: 700 }}>
                  <Pin size={12} /> PINNED
                </div>
              )}

              <p style={{ fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.5, marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                {nt.note_text}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                <span style={{ fontSize: '0.70rem', color: '#94A3B8' }}>
                  Recorded: {nt.formatted_created || (nt.created_at ? new Date(nt.created_at).toLocaleString('en-IN') : 'Recent')}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingNote({ ...nt })}
                    title="Edit Note"
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(nt.id)}
                    title="Delete Note"
                    style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#520612' }}>Edit Note</h3>
              <button onClick={() => setEditingNote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateNote}>
              <textarea
                rows={4}
                required
                value={editingNote.note_text}
                onChange={(e) => setEditingNote({ ...editingNote, note_text: e.target.value })}
                className="form-input"
                style={{ resize: 'none', marginBottom: '10px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', marginBottom: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingNote.is_pinned)}
                  onChange={(e) => setEditingNote({ ...editingNote, is_pinned: e.target.checked })}
                />
                Pin to top
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setEditingNote(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Update Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
