import React from 'react';

export default function Header({ user, onNewPost, onAuth, onSignOut }) {
  return (
    <header className="site-header">
      <div className="site-header__mark" aria-hidden="true">
        <span className="pin-dot" />
      </div>
      <div className="site-header__text">
        <h1>Community Discussion Forum</h1>
        <p>A notice board for the community — post it, discuss it, pin the good ones.</p>
      </div>
      <div className="site-header__actions">
        <button className={user ? 'btn btn--ghost btn--badge' : 'btn btn--ghost'} onClick={() => onAuth('signin')}>
          {user ? 'Profile' : 'Sign in'}
          {user && <span className="badge">Signed in</span>}
        </button>
        <button className="btn btn--primary" onClick={onNewPost}>
          Post to the board
        </button>
        {user && (
          <div className="user-chip">
            <span>{user.name}</span>
            <button className="btn btn--ghost" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
