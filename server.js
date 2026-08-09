const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { readDB, writeDB } = require('./db');
const { nanoid } = require('./utils');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

const CATEGORIES = ['General', 'Help & Support', 'Announcements', 'Off-Topic', 'Ideas'];

// ---------- Helpers ----------
function summarizePost(post, db) {
  const comments = db.comments.filter((c) => c.postId === post.id);
  return { ...post, commentCount: comments.length };
}

function notFound(res, what = 'Resource') {
  return res.status(404).json({ error: `${what} not found` });
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

// ---------- Routes ----------

// POST /api/auth/signup
app.post('/api/auth/signup', (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !username.trim()) return badRequest(res, 'Username is required');
  if (!password || !password.trim()) return badRequest(res, 'Password is required');
  if (!name || !name.trim()) return badRequest(res, 'Name is required');

  const db = readDB();
  const normalized = username.trim().toLowerCase();
  if (db.users.some((user) => user.username === normalized)) {
    return badRequest(res, 'That username is already taken');
  }

  const newUser = {
    id: nanoid(),
    username: normalized,
    password: password.trim(),
    name: name.trim(),
    createdAt: Date.now(),
  };

  db.users.push(newUser);
  writeDB(db);

  const { id, name: savedName, username: savedUsername, createdAt } = newUser;
  res.status(201).json({ id, name: savedName, username: savedUsername, createdAt });
});

// POST /api/auth/signin
app.post('/api/auth/signin', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !username.trim()) return badRequest(res, 'Username is required');
  if (!password || !password.trim()) return badRequest(res, 'Password is required');

  const db = readDB();
  const normalized = username.trim().toLowerCase();
  const user = db.users.find((u) => u.username === normalized);
  if (!user || user.password !== password.trim()) {
    return badRequest(res, 'Invalid username or password');
  }

  const { id, name, username: savedUsername, createdAt } = user;
  res.json({ id, name, username: savedUsername, createdAt });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

// GET /api/posts  (supports ?category=&search=&sort=new|top)
app.get('/api/posts', (req, res) => {
  const db = readDB();
  let posts = [...db.posts];

  const { category, search, sort } = req.query;

  if (category && category !== 'All') {
    posts = posts.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }

  posts = posts.map((p) => summarizePost(p, db));

  if (sort === 'top') {
    posts.sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
  } else {
    posts.sort((a, b) => b.createdAt - a.createdAt);
  }

  res.json(posts);
});

// GET /api/posts/:id
app.get('/api/posts/:id', (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return notFound(res, 'Post');

  const comments = db.comments
    .filter((c) => c.postId === post.id)
    .sort((a, b) => a.createdAt - b.createdAt);

  res.json({ ...post, comments });
});

// POST /api/posts
app.post('/api/posts', (req, res) => {
  const { title, body, author, category } = req.body || {};

  if (!title || !title.trim()) return badRequest(res, 'Title is required');
  if (!body || !body.trim()) return badRequest(res, 'Post body is required');
  if (!author || !author.trim()) return badRequest(res, 'Author name is required');
  if (!CATEGORIES.includes(category)) return badRequest(res, 'Invalid category');

  const db = readDB();
  const newPost = {
    id: nanoid(),
    title: title.trim(),
    body: body.trim(),
    author: author.trim(),
    category,
    likes: 0,
    likedBy: [],
    createdAt: Date.now(),
  };

  db.posts.push(newPost);
  writeDB(db);

  res.status(201).json(summarizePost(newPost, db));
});

// PATCH /api/posts/:id  (edit title/body/category)
app.patch('/api/posts/:id', (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return notFound(res, 'Post');

  const { title, body, category } = req.body || {};
  if (title !== undefined) {
    if (!title.trim()) return badRequest(res, 'Title cannot be empty');
    post.title = title.trim();
  }
  if (body !== undefined) {
    if (!body.trim()) return badRequest(res, 'Body cannot be empty');
    post.body = body.trim();
  }
  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) return badRequest(res, 'Invalid category');
    post.category = category;
  }

  writeDB(db);
  res.json(summarizePost(post, db));
});

// DELETE /api/posts/:id
app.delete('/api/posts/:id', (req, res) => {
  const db = readDB();
  const idx = db.posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return notFound(res, 'Post');

  db.posts.splice(idx, 1);
  db.comments = db.comments.filter((c) => c.postId !== req.params.id);
  writeDB(db);

  res.status(204).end();
});

// POST /api/posts/:id/like  { userId }
app.post('/api/posts/:id/like', (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return notFound(res, 'Post');

  const { userId } = req.body || {};
  if (!userId) return badRequest(res, 'userId is required');

  const alreadyLiked = post.likedBy.includes(userId);
  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((id) => id !== userId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(userId);
    post.likes += 1;
  }

  writeDB(db);
  res.json({ likes: post.likes, likedBy: post.likedBy });
});

// GET /api/posts/:id/comments
app.get('/api/posts/:id/comments', (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return notFound(res, 'Post');

  const comments = db.comments
    .filter((c) => c.postId === post.id)
    .sort((a, b) => a.createdAt - b.createdAt);

  res.json(comments);
});

// POST /api/posts/:id/comments  { author, body }
app.post('/api/posts/:id/comments', (req, res) => {
  const db = readDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return notFound(res, 'Post');

  const { author, body } = req.body || {};
  if (!author || !author.trim()) return badRequest(res, 'Author name is required');
  if (!body || !body.trim()) return badRequest(res, 'Comment body is required');

  const comment = {
    id: nanoid(),
    postId: post.id,
    author: author.trim(),
    body: body.trim(),
    createdAt: Date.now(),
  };

  db.comments.push(comment);
  writeDB(db);

  res.status(201).json(comment);
});

// DELETE /api/comments/:id
app.delete('/api/comments/:id', (req, res) => {
  const db = readDB();
  const idx = db.comments.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return notFound(res, 'Comment');

  db.comments.splice(idx, 1);
  writeDB(db);
  res.status(204).end();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    res.status(404).send('Not found');
  });
}

app.listen(PORT, () => {
  console.log(`Community Forum API running on http://localhost:${PORT}`);
});
