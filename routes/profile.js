const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Review = require('../model/Review');
const Restaurant = require('../model/Restaurant');
const { requireLogin } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

async function getProfileRenderData(profileUserId, sessionUser) {
  const profileUser = await User.findById(profileUserId).lean();
  if (!profileUser) return null;

  const userReviews = await Review.find({ userId: profileUserId }).sort({ date: -1 }).lean();
  const reviewsWithRestaurants = [];
  for (const rv of userReviews) {
    const restaurant = await Restaurant.findOne({ id: rv.restaurantId }).lean();
    reviewsWithRestaurants.push({ ...rv, restaurant });
  }

  const visitedRestaurants = [];
  for (const rid of (profileUser.visitedRestaurants || [])) {
    const restaurant = await Restaurant.findOne({ id: rid }).lean();
    if (restaurant) visitedRestaurants.push(restaurant);
  }

  const totalReviews = userReviews.length;
  const avgRating = totalReviews > 0
    ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return {
    title: `${profileUser.name} - DLSU Eats`,
    profileUser,
    reviews: reviewsWithRestaurants,
    visitedRestaurants,
    totalReviews,
    avgRating,
    visitedCount: visitedRestaurants.length,
    isOwnProfile: sessionUser ? sessionUser._id === profileUserId : false
  };
}

function handleProfilePictureUpload(req, res, next) {
  avatarUpload.single('profilePicture')(req, res, async (err) => {
    if (!err) return next();

    if (err.name === 'MulterError' || err.message === 'Invalid file type uploaded.') {
      try {
        const viewData = await getProfileRenderData(req.params.id, req.session.user);
        if (!viewData) return res.status(404).render('404', { title: 'User Not Found' });

        if (!viewData.isOwnProfile) {
          return res.status(403).render('403', { title: 'Access Denied' });
        }

        return res.status(400).render('profile', {
          ...viewData,
          error: err.message
        });
      } catch (uploadError) {
        return next(uploadError);
      }
    }

    return next(err);
  });
}

async function recalculateRestaurantRating(restaurantId) {
  const restaurant = await Restaurant.findOne({ id: restaurantId });
  if (!restaurant) return;

  const remainingReviews = await Review.find({ restaurantId });
  if (remainingReviews.length === 0) {
    restaurant.rating = 0;
    restaurant.ratingCount = 0;
  } else {
    const avg = remainingReviews.reduce((sum, review) => sum + review.rating, 0) / remainingReviews.length;
    restaurant.rating = Math.round(avg * 10) / 10;
    restaurant.ratingCount = remainingReviews.length;
  }

  await restaurant.save();
}

// GET /profile/:id  (view any user's profile)
router.get('/:id', async (req, res, next) => {
  try {
    const viewData = await getProfileRenderData(req.params.id, req.session.user);
    if (!viewData) return res.status(404).render('404', { title: 'User Not Found' });

    res.render('profile', {
      ...viewData,
      error: req.query.error || null
    });
  } catch (err) {
    next(err);
  }
});

// POST /profile/:id/edit
router.post('/:id/edit', requireLogin, handleProfilePictureUpload, async (req, res, next) => {
  try {
    if (req.session.user._id !== req.params.id) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }

    const { name, bio } = req.body;
    const trimmedName = name ? name.trim() : '';
    const trimmedBio = bio ? bio.trim() : '';

    const viewData = await getProfileRenderData(req.params.id, req.session.user);
    if (!viewData) {
      return res.status(404).render('404', { title: 'User Not Found' });
    }

    viewData.profileUser.name = trimmedName || viewData.profileUser.name;
    viewData.profileUser.bio = trimmedBio;

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).render('profile', {
        ...viewData,
        error: 'Name must be between 2 and 100 characters.'
      });
    }

    if (trimmedBio.length > 500) {
      return res.status(400).render('profile', {
        ...viewData,
        error: 'Bio cannot exceed 500 characters.'
      });
    }

    const updates = {
      name: trimmedName,
      bio: trimmedBio
    };

    if (req.file) {
      updates.profilePicture = `/assets/images/uploads/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(req.params.id, updates);

    // Update session
    req.session.user.name = trimmedName;
    if (updates.profilePicture) {
      req.session.user.profilePicture = updates.profilePicture;
    }
    res.redirect(`/profile/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

// POST /profile/:id/delete
router.post('/:id/delete', requireLogin, async (req, res, next) => {
  try {
    if (req.session.user._id !== req.params.id) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('404', { title: 'User Not Found' });
    }

    const userReviews = await Review.find({ userId: req.params.id }).lean();
    const affectedRestaurantIds = [...new Set(userReviews.map((review) => review.restaurantId))];

    await Review.deleteMany({ userId: req.params.id });
    for (const restaurantId of affectedRestaurantIds) {
      await recalculateRestaurantRating(restaurantId);
    }

    await User.findByIdAndDelete(req.params.id);

    req.session.destroy(() => {
      res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
