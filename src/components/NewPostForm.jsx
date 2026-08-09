import React, { useState } from 'react';

export default function NewPostForm({ categories, onClose, onSubmit, user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState(
    () => user?.name || localStorage.getItem('commons_author_name') || ''
  );
  const [category, setCategory] = useState(categories[0] || 'General');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authorName = user?.name || author;
    if (!title.trim() || !body.trim() || !authorName.trim()) {
      setError('Fill in your name, a title, and a message before posting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (!user) {
        localStorage.setItem('commons_author_name', authorName.trim());
      }
      await onSubmit({ title, body, author: authorName, category });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <div className="modal__header">
          <h2 id="composer-title">Pin something new</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          {error && <div className="banner banner--error">{error}</div>}

          {!user && (
            <label className="field">
              <span>Your name</span>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Priya"
                maxLength={40}
              />
            </label>
          )}
          {user && (
            <div className="field field--readonly">
              <span>Posting as</span>
              <div className="readonly-value">{user.name}</div>
            </div>
          )}

          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this about?"
              maxLength={120}
            />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share the details…"
              rows={6}
            />
          </label>

          <div className="composer__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post to the board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
