import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import Header from './components/Header.jsx';
import CategoryTabs from './components/CategoryTabs.jsx';
import PostList from './components/PostList.jsx';
import NewPostForm from './components/NewPostForm.jsx';
import PostDetail from './components/PostDetail.jsx';
import Toast from './components/Toast.jsx';
import AuthModal from './components/AuthModal.jsx';

const AUTH_STORAGE_KEY = 'commons_user';

function getGuestId() {
  let id = localStorage.getItem('commons_guest_id');
  if (!id) {
    id = 'guest-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('commons_guest_id', id);
  }
  return id;
}

export default function App() {
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const guestId = getGuestId();

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const showToast = (message, tone = 'info') => {
    setToast({ message, tone, key: Date.now() });
  };

  const loadCategories = useCallback(async () => {
    try {
      const cats = await api.getCategories();
      setCategories(['All', ...cats]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPosts({ category: activeCategory, search, sort });
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, sort]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const handleAuthOpen = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleSignUp = async (payload) => {
    const newUser = await api.signUp(payload);
    saveUser(newUser);
    setShowAuth(false);
    showToast(`Welcome, ${newUser.name}!`, 'success');
  };

  const handleSignIn = async (payload) => {
    const existingUser = await api.signIn(payload);
    saveUser(existingUser);
    setShowAuth(false);
    showToast(`Welcome back, ${existingUser.name}!`, 'success');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('Signed out successfully.', 'info');
  };

  const handleCreatePost = async (payload) => {
    if (!user) {
      handleAuthOpen('signin');
      return;
    }

    const created = await api.createPost({ ...payload, author: user.name });
    setShowComposer(false);
    showToast('Your post is up on the board.', 'success');
    if (activeCategory !== 'All' && activeCategory !== created.category) {
      setActiveCategory('All');
    } else {
      loadPosts();
    }
  };

  const handleToggleLike = async (postId) => {
    if (!user) {
      handleAuthOpen('signin');
      return;
    }

    try {
      const { likes, likedBy } = await api.toggleLike(postId, user.id);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes, likedBy } : p))
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(postId);
      setSelectedPostId(null);
      showToast('Post removed from the board.', 'info');
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenComposer = () => {
    if (!user) {
      handleAuthOpen('signin');
      return;
    }
    setShowComposer(true);
  };

  const currentUserId = user?.id || guestId;

  if (selectedPostId) {
    return (
      <div className="app-shell">
        <Header
          user={user}
          onNewPost={handleOpenComposer}
          onAuth={handleAuthOpen}
          onSignOut={handleSignOut}
        />
        <PostDetail
          postId={selectedPostId}
          user={user}
          userId={currentUserId}
          onBack={() => setSelectedPostId(null)}
          onDeletePost={handleDeletePost}
          onToast={showToast}
          onAuth={handleAuthOpen}
        />
        {showComposer && (
          <NewPostForm
            categories={categories.filter((c) => c !== 'All')}
            onClose={() => setShowComposer(false)}
            onSubmit={handleCreatePost}
            user={user}
          />
        )}
        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onSwitchMode={setAuthMode}
          />
        )}
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        onNewPost={handleOpenComposer}
        onAuth={handleAuthOpen}
        onSignOut={handleSignOut}
      />

      <main className="board">
        <div className="board__controls">
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
          <div className="board__filters">
            <input
              type="search"
              className="search-input"
              placeholder="Search the board…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search posts"
            />
            <div className="sort-toggle" role="group" aria-label="Sort posts">
              <button
                className={sort === 'new' ? 'sort-toggle__btn is-active' : 'sort-toggle__btn'}
                onClick={() => setSort('new')}
              >
                Newest
              </button>
              <button
                className={sort === 'top' ? 'sort-toggle__btn is-active' : 'sort-toggle__btn'}
                onClick={() => setSort('top')}
              >
                Most liked
              </button>
            </div>
          </div>
        </div>

        {error && <div className="banner banner--error">Couldn't load the board: {error}</div>}

        <PostList
          posts={posts}
          loading={loading}
          onOpenPost={setSelectedPostId}
          onToggleLike={handleToggleLike}
          userId={currentUserId}
        />
      </main>

      <button
        className="fab"
        onClick={handleOpenComposer}
        aria-label="Start a new discussion"
      >
        <span className="fab__plus">+</span>
        <span className="fab__label">New post</span>
      </button>

      {showComposer && (
        <NewPostForm
          categories={categories.filter((c) => c !== 'All')}
          onClose={() => setShowComposer(false)}
          onSubmit={handleCreatePost}
          user={user}
        />
      )}

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onSwitchMode={setAuthMode}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
