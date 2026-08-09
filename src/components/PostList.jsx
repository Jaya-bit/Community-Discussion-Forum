import React from 'react';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function PostCard({ post, index, onOpen, onToggleLike, userId }) {
  const liked = post.likedBy?.includes(userId);
  const rotation = index % 2 === 0 ? '-0.6deg' : '0.5deg';

  return (
    <article className="notice" style={{ '--tilt': rotation }}>
      <span className="notice__pin" aria-hidden="true" />
      <button className="notice__body" onClick={() => onOpen(post.id)}>
        <div className="notice__meta">
          <span className="tag">{post.category}</span>
          <span className="dot-sep">·</span>
          <span className="notice__time">{timeAgo(post.createdAt)}</span>
        </div>
        <h3 className="notice__title">{post.title}</h3>
        <p className="notice__excerpt">{post.body}</p>
      </button>
      <div className="notice__footer">
        <div className="notice__author">
          <span className="avatar">{initials(post.author)}</span>
          {post.author}
        </div>
        <div className="notice__actions">
          <button
            className={liked ? 'like-btn is-liked' : 'like-btn'}
            onClick={() => onToggleLike(post.id)}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike post' : 'Like post'}
          >
            ♥ {post.likes}
          </button>
          <button className="comment-btn" onClick={() => onOpen(post.id)}>
            💬 {post.commentCount}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PostList({ posts, loading, onOpenPost, onToggleLike, userId }) {
  if (loading) {
    return (
      <div className="board__grid">
        {[...Array(4)].map((_, i) => (
          <div className="notice notice--skeleton" key={i} />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="empty-state">
        <h3>Nothing here yet</h3>
        <p>Be the first to pin something to the board.</p>
      </div>
    );
  }

  return (
    <div className="board__grid">
      {posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          index={i}
          onOpen={onOpenPost}
          onToggleLike={onToggleLike}
          userId={userId}
        />
      ))}
    </div>
  );
}
