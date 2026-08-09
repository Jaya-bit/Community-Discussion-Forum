const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function seedDB() {
  const now = Date.now();
  return {
    posts: [
      {
        id: 'p1',
        title: 'Welcome to the community — introduce yourself!',
        body: "This is the place to say hello. Tell us where you're from and what brought you here.",
        author: 'Moderator',
        category: 'Announcements',
        likes: 3,
        likedBy: [],
        createdAt: now - 1000 * 60 * 60 * 24 * 3,
      },
      {
        id: 'p2',
        title: 'What are you working on this week?',
        body: 'Share a small win or something you\'re stuck on. Someone here has probably run into it before.',
        author: 'Priya',
        category: 'General',
        likes: 5,
        likedBy: [],
        createdAt: now - 1000 * 60 * 60 * 24,
      },
      {
        id: 'p3',
        title: 'Feature idea: dark mode toggle',
        body: 'Would love an easy way to switch themes. Anyone else want this?',
        author: 'Sam',
        category: 'Ideas',
        likes: 8,
        likedBy: [],
        createdAt: now - 1000 * 60 * 60 * 5,
      },
    ],
    comments: [
      {
        id: 'c1',
        postId: 'p1',
        author: 'Alex',
        body: 'Hey everyone, glad to be here!',
        createdAt: now - 1000 * 60 * 60 * 20,
      },
    ],
    users: [],
  };
}

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seedDB(), null, 2));
  }
}

function readDB() {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const data = JSON.parse(raw);

  let changed = false;
  if (!Array.isArray(data.posts)) {
    data.posts = [];
    changed = true;
  }
  if (!Array.isArray(data.comments)) {
    data.comments = [];
    changed = true;
  }
  if (!Array.isArray(data.users)) {
    data.users = [];
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  return data;
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
