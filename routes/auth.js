const express = require('express');
const router = express.Router();
const User = require('../model/User');
const { redirectIfLoggedIn } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

function renderRegisterWithError(res, error, formData = {}) {
  return res.status(400).render('register', {
    title: 'Register - DLSU Eats',
    error,
    formData
  });
}

function handleAvatarUpload(req, res, next) {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (!err) return next();

    if (err.name === 'MulterError' || err.message === 'Invalid file type uploaded.') {
      return renderRegisterWithError(res, err.message, {
        name: req.body.name,
        email: req.body.email,
        bio: req.body.bio
      });
    }

    return next(err);
  });
}

// GET /auth/login
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { title: 'Login - DLSU Eats', error: req.query.error });
});

// POST /auth/login
router.post('/login', redirectIfLoggedIn, async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.render('login', { title: 'Login - DLSU Eats', error: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.render('login', { title: 'Login - DLSU Eats', error: 'No account found with that email.' });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.render('login', { title: 'Login - DLSU Eats', error: 'Incorrect password. Please try again.' });
  }

  // Set session (never store the password hash)
  req.session.user = {
    _id: user._id.toString(),
    id: user.id,
    name: user.name,
    email: user.email,
    isOwner: user.isOwner,
    profilePicture: user.profilePicture,
    restaurantIds: user.isOwner ? (user.restaurantIds || []).slice(0, 1) : [],
    rememberMe: !!rememberMe
  };

  if (rememberMe) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21; // 3 weeks
  }

  if (user.isOwner) {
    return res.redirect('/owner/dashboard');
  }
  res.redirect('/');
});

// GET /auth/register
router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { title: 'Register - DLSU Eats' });
});

// POST /auth/register
router.post('/register', redirectIfLoggedIn, handleAvatarUpload, async (req, res) => {
  const { name, email, password, bio } = req.body;
  const trimmedName = name ? name.trim() : '';
  const trimmedBio = bio ? bio.trim() : '';
  const formData = {
    name,
    email,
    bio
  };

  if (!name || !email || !password) {
    return renderRegisterWithError(res, 'Name, email, and password are required.', formData);
  }

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return renderRegisterWithError(res, 'Name must be between 2 and 100 characters.', formData);
  }

  if (password.length < 6) {
    return renderRegisterWithError(res, 'Password must be at least 6 characters.', formData);
  }

  if (trimmedBio.length > 500) {
    return renderRegisterWithError(res, 'Bio cannot exceed 500 characters.', formData);
  }

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    return renderRegisterWithError(res, 'An account with this email already exists.', formData);
  }

  const user = new User({
    name: trimmedName,
    email: email.toLowerCase().trim(),
    password,
    bio: trimmedBio,
    profilePicture: req.file ? `/assets/images/uploads/${req.file.filename}` : '',
    joinedDate: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    isOwner: false
  });
  await user.save();

  req.session.user = {
    _id: user._id.toString(),
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isOwner: false,
    profilePicture: user.profilePicture,
    restaurantIds: []
  };

  res.redirect('/');
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
