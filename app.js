require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');

const DEFAULT_AVATAR_PATH = '/assets/images/icons/default-avatar.svg';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const MONGO_URI = process.env.MONGO_URI || process.env.mongo_uri || 'mongodb://127.0.0.1:27017/dlsu-eats';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dlsu-eats-dev-secret';

if (isProduction) {
  app.set('trust proxy', 1);
}

// ─── Database ────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── Handlebars ──────────────────────────────────────────────────────────────
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    stars: (rating) => '⭐'.repeat(Math.round(rating)),
    truncate: (str, len) => str && str.length > len ? str.substring(0, len) + '...' : str,
    assetPath: (value) => {
      const pathValue = (value || '').trim();
      if (!pathValue) return '';
      if (/^(?:https?:)?\/\//i.test(pathValue) || pathValue.startsWith('data:')) return pathValue;
      return pathValue.startsWith('/') ? pathValue : `/${pathValue}`;
    },
    avatarUrl: (value) => {
      const pathValue = (value || '').trim();
      if (!pathValue) return DEFAULT_AVATAR_PATH;
      if (/^(?:https?:)?\/\//i.test(pathValue) || pathValue.startsWith('data:')) return pathValue;
      return pathValue.startsWith('/') ? pathValue : `/${pathValue}`;
    },
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    multiply: (a, b) => a * b,
    range: (n) => Array.from({ length: n }, (_, i) => i + 1),
    campusBadge: (inside) => inside ? 'Inside Campus' : 'Outside Campus',
    campusClass: (inside) => inside ? 'inside' : 'outside',
    formatDate: (d) => d,
    json: (ctx) => JSON.stringify(ctx),
    ifOwnsReview: function(reviewUserId, sessionUserId, options) {
      if (reviewUserId && sessionUserId && reviewUserId.toString() === sessionUserId.toString()) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    lte: (a, b) => a <= b,
    gte: (a, b) => a >= b,
    or: (a, b) => a || b,
    not: (a) => !a,
    priceStars: (price) => price
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction
  }
}));

// Expose session user to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Extend remember-me sessions on every request.
app.use((req, _res, next) => {
  if (req.session.user && req.session.user.rememberMe) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21;
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/restaurants', require('./routes/restaurants'));
app.use('/reviews', require('./routes/reviews'));
app.use('/profile', require('./routes/profile'));
app.use('/owner', require('./routes/owner'));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`DLSU Eats running at http://localhost:${PORT}`);
});