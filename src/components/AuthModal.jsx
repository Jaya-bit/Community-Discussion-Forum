import React, { useState } from 'react';

export default function AuthModal({ mode, onClose, onSignIn, onSignUp, onSwitchMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const isSignup = mode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim() || (isSignup && !name.trim())) {
      setError('Please complete every field.');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    try {
      if (isSignup) {
        await onSignUp({ username: username.trim(), password, name: name.trim() });
      } else {
        await onSignIn({ username: username.trim(), password });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="modal__header">
          <div>
            <h2 id="auth-title">{isSignup ? 'Create an account' : 'Sign in'}</h2>
            <p className="auth-modal__subtitle">
              {isSignup
                ? 'Join the forum and start posting with your profile.'
                : 'Access your account and join the conversation.'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="banner banner--error">{error}</div>}

          {isSignup && (
            <label className="field">
              <span>Your full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                maxLength={40}
              />
            </label>
          )}

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="choose a username"
              maxLength={24}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </label>

          {isSignup && (
            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="repeat password"
              />
            </label>
          )}

          <div className="composer__actions auth-form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="auth-modal__switch">
          {isSignup ? (
            <p>
              Already have an account?{' '}
              <button type="button" className="auth-switch" onClick={() => onSwitchMode('signin')}>
                Sign in
              </button>
            </p>
          ) : (
            <p>
              New here?{' '}
              <button type="button" className="auth-switch" onClick={() => onSwitchMode('signup')}>
                Create account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
