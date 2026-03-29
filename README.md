# DLSU Eats

A restaurant review web application for the DLSU community. Built with Express.js, MongoDB, and Handlebars.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally on port 27017

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` if you need to change the MongoDB URI, session secret, or port.

### 3. Seed the database

```bash
npm run seed
```

This clears and repopulates all collections with:
- 31 restaurants
- 31 users (passwords hashed with bcrypt)
- 20 reviews

### 4. Start the server

```bash
npm start
```

The app will be available at **http://localhost:3000**

---

## Deployment Checklist (Render/Railway/Cyclic)

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. Set `MONGO_URI` in your hosting platform environment variables to the Atlas URI.
3. Set a strong `SESSION_SECRET` in the hosting platform environment variables.
4. Push this project to a GitHub repository.
5. Connect the repository to Render, Railway, or Cyclic and enable auto-deploy.
6. Confirm `.env` and `node_modules/` are ignored by Git before pushing.

Notes:
- `seed.js` already uses environment-based MongoDB connection, so it works with Atlas when `MONGO_URI` is set.
- Files in `public/assets/images/uploads/` may not persist on free hosting tiers. Use cloud storage (for example, Cloudinary) for production-grade media persistence.

---

## Test Credentials

| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Student | miguel.tan@dlsu.test           | password123 |
| Owner   | robert.chen@business.test      | owner123    |

Any user in the seed data uses `password123` (students) or `owner123` (owners).

---

## Project Structure

```
├── app.js                  # Express server entry point
├── seed.js                 # Database seeder
├── models/
│   ├── User.js
│   ├── Restaurant.js
│   └── Review.js
├── routes/
│   ├── pages.js            # Static/info pages
│   ├── auth.js             # Login, register, logout
│   ├── restaurants.js      # Restaurant listing + detail
│   ├── reviews.js          # Review CRUD + voting
│   ├── profile.js          # User profile
│   └── owner.js            # Owner dashboard + replies
├── middleware/
│   └── auth.js             # requireLogin, requireOwner, redirectIfLoggedIn
├── views/
│   ├── layouts/main.hbs
│   ├── partials/
│   └── *.hbs               # Page templates
└── public/
    ├── css/styles.css
    ├── js/client.js
    └── assets/
```
