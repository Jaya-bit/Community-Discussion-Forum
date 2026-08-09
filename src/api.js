const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch (_) {
      /* no JSON body */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getCategories: () => request('/categories'),

  getPosts: ({ category, search, sort } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return request(`/posts${qs ? `?${qs}` : ''}`);
  },

  getPost: (id) => request(`/posts/${id}`),

  createPost: (payload) =>
    request('/posts', { method: 'POST', body: JSON.stringify(payload) }),

  updatePost: (id, payload) =>
    request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),

  toggleLike: (id, userId) =>
    request(`/posts/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getComments: (postId) => request(`/posts/${postId}/comments`),

  addComment: (postId, payload) =>
    request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  signUp: (payload) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  signIn: (payload) =>
    request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
