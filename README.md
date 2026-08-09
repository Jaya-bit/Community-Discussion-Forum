# The Commons — Community Discussion Forum

A full-stack, responsive community discussion board:

- **Backend:** Node.js + Express REST API (JSON-file storage, no DB setup needed)
- **Frontend:** React (Vite), plain CSS — fully responsive, mobile-first
- **Features:** browse posts by category, search, sort by newest/most-liked, create posts, like/unlike, threaded comments, delete post/comment

## Project structure

```
community-forum/
├── server/              Express API
│   ├── server.js        Routes
│   ├── db.js            JSON file "database" (auto-seeds on first run)
│   ├── utils.js
│   ├── data/db.json      created automatically
│   └── package.json
└── client/              React app (Vite)
    ├── index.html
    ├── vite.config.js    dev proxy → localhost:4000
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js        fetch wrapper for the API
        ├── index.css      full design system
        └── components/
```

## Run it

Open two terminals.

**1. Start the API**
```bash
cd server
npm install
npm run dev        # or: npm start
```
Runs at `http://localhost:4000`. A `data/db.json` file is created automatically with a few seed posts the first time it runs.

**2. Start the React app**
```bash
cd client
npm install
npm run dev
```
Runs at `http://localhost:5173` and proxies all `/api/*` requests to the Express server (configured in `vite.config.js`), so there's no CORS setup needed in dev.

Open `http://localhost:5173` in your browser.

## API reference

| Method | Route                        | Description                          |
|--------|-------------------------------|---------------------------------------|
| GET    | `/api/categories`             | List categories                       |
| GET    | `/api/posts`                  | List posts (`?category=&search=&sort=new\|top`) |
| GET    | `/api/posts/:id`               | Get one post with its comments        |
| POST   | `/api/posts`                   | Create a post `{ title, body, author, category }` |
| PATCH  | `/api/posts/:id`               | Edit a post                           |
| DELETE | `/api/posts/:id`               | Delete a post (and its comments)      |
| POST   | `/api/posts/:id/like`          | Toggle a like `{ userId }`            |
| GET    | `/api/posts/:id/comments`      | List comments for a post              |
| POST   | `/api/posts/:id/comments`      | Add a comment `{ author, body }`      |
| DELETE | `/api/comments/:id`            | Delete a comment                      |

## Notes / next steps

- Storage is a flat JSON file for simplicity — swap `server/db.js` for a real database (Postgres, MongoDB, etc.) by keeping the same `readDB()`/`writeDB()` interface if you outgrow it.
- There's no auth — `userId` is a random ID generated in the browser and stored in `localStorage`, used only to track who liked what. Add real accounts/JWT if you need it.
- To deploy: build the client (`npm run build` in `client/`, output in `client/dist`) and serve it separately, or have Express serve the built files as static assets and drop the Vite proxy.
