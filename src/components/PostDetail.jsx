import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function PostDetail({ postId, userId, onBack, onDeletePost, onToast }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentAuthor, setCommentAuthor] = useState(
    () => localStorage.getItem('commons_author_name') || ''
  );
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPost(postId);
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLike = async () => {
    try {
      const { likes, likedBy } = await api.toggleLike(postId, userId);
      setPost((p) => ({ ...p, likes, likedBy }));
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentBody.trim()) {
      onToast('Add your name and a message to reply.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      localStorage.setItem('commons_author_name', commentAuthor.trim());
      const comment = await api.addComment(postId, {
        author: commentAuthor,
        body: commentBody,
      });
      setPost((p) => ({ ...p, comments: [...p.comments, comment] }));
      setCommentBody('');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setPost((p) => ({
        ...p,
        comments: p.comments.filter((c) => c.id !== commentId),
      }));
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  if (loading) return <div className="detail detail--loading">Loading post…</div>;
  if (error) return <div className="banner banner--error detail-error">{error}</div>;
  if (!post) return null;

  const liked = post.likedBy?.includes(userId);

  return (
    <main className="detail">
      <button className="back-link" onClick={onBack}>
        ← Back to the board
      </button>

      <article className="detail__post">
        <div className="notice__meta">
          <span className="tag">{post.category}</span>
          <span className="dot-sep">·</span>
          <span className="notice__time">{formatDate(post.createdAt)}</span>
        </div>
        <h2>{post.title}</h2>
        <p className="detail__body">{post.body}</p>

        <div className="detail__footer">
          <div className="notice__author">
            <span className="avatar">{initials(post.author)}</span>
            {post.author}
          </div>
          <div className="notice__actions">
            <button
              className={liked ? 'like-btn is-liked' : 'like-btn'}
              onClick={handleLike}
              aria-pressed={liked}
            >
              ♥ {post.likes}
            </button>
            <button
              className="btn btn--ghost btn--danger"
              onClick={() => {
                if (confirm('Remove this post from the board?')) onDeletePost(post.id);
              }}
            >
              Delete post
            </button>
          </div>
        </div>
      </article>

      <section className="thread">
        <h3>{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</h3>

        <ul className="thread__list">
          {post.comments.map((c) => (
            <li key={c.id} className="thread__item">
              <span className="avatar avatar--sm">{initials(c.author)}</span>
              <div className="thread__content">
                <div className="thread__meta">
                  <strong>{c.author}</strong>
                  <span className="notice__time">{formatDate(c.createdAt)}</span>
                </div>
                <p>{c.body}</p>
              </div>
              <button
                className="thread__delete"
                onClick={() => handleDeleteComment(c.id)}
                aria-label="Delete reply"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <form className="reply-form" onSubmit={handleComment}>
          <input
            type="text"
            placeholder="Your name"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            className="reply-form__name"
            maxLength={40}
          />
          <textarea
            placeholder="Write a reply…"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Reply'}
          </button>
        </form>
      </section>
    </main>
  );
}
