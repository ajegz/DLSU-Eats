const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../model/Review');
const Restaurant = require('../model/Restaurant');
const User = require('../model/User');
const { requireLogin } = require('../middleware/auth');
const { reviewMediaUpload } = require('../middleware/upload');

function mediaPathFromFile(file) {
  return `/assets/images/uploads/${file.filename}`;
}

function isVideoPath(filePath) {
  return /\.(mp4|webm|ogg|mov)$/i.test(filePath);
}

function validateReviewInput(title, rating, body) {
  const trimmedTitle = (title || '').trim();
  const trimmedBody = (body || '').trim();
  const parsedRating = parseInt(rating, 10);

  if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
    return { error: 'Title must be between 3 and 200 characters.' };
  }

  if (trimmedBody.length < 10 || trimmedBody.length > 5000) {
    return { error: 'Review body must be between 10 and 5000 characters.' };
  }

  if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return { error: 'Please select a rating.' };
  }

  return {
    trimmedTitle,
    trimmedBody,
    parsedRating,
    error: null
  };
}

async function findUserByIdentifier(userId) {
  const normalizedUserId = userId ? userId.toString() : '';
  if (!normalizedUserId) return null;

  const query = [{ id: normalizedUserId }];
  if (mongoose.Types.ObjectId.isValid(normalizedUserId)) {
    query.push({ _id: normalizedUserId });
  }

  return User.findOne(query.length === 1 ? query[0] : { $or: query }).lean();
}

async function recalculateRestaurantRating(restaurantId) {
  const restaurant = await Restaurant.findOne({ id: restaurantId });
  if (!restaurant) return;

  const allReviews = await Review.find({ restaurantId });
  if (allReviews.length === 0) {
    restaurant.rating = 0;
    restaurant.ratingCount = 0;
  } else {
    const avg = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
    restaurant.rating = Math.round(avg * 10) / 10;
    restaurant.ratingCount = allReviews.length;
  }

  await restaurant.save();
}

function handleReviewMediaUpload(req, res, next) {
  reviewMediaUpload.array('media', 6)(req, res, async (err) => {
    if (!err) return next();

    if (err.name !== 'MulterError' && err.message !== 'Invalid file type uploaded.') {
      return next(err);
    }

    try {
      if (req.params.restaurantId) {
        const restaurant = await Restaurant.findOne({ id: req.params.restaurantId }).lean();
        if (!restaurant) return res.status(404).render('404', { title: 'Restaurant Not Found' });

        return res.status(400).render('create-review', {
          title: 'Write a Review - DLSU Eats',
          restaurant,
          error: err.message,
          formData: {
            title: req.body.title,
            rating: req.body.rating,
            body: req.body.body
          }
        });
      }

      if (req.params.id) {
        const review = await Review.findById(req.params.id).lean();
        if (!review) return res.status(404).render('404', { title: 'Review Not Found' });

        if (review.userId.toString() !== req.session.user._id) {
          return res.status(403).render('403', { title: 'Access Denied' });
        }

        const restaurant = await Restaurant.findOne({ id: review.restaurantId }).lean();
        const reviewForView = {
          ...review,
          title: req.body.title || review.title,
          rating: req.body.rating || (review.rating ? review.rating.toString() : ''),
          body: req.body.body || review.body,
          mediaItems: (review.media || []).map((filePath) => ({
            path: filePath,
            isVideo: isVideoPath(filePath)
          }))
        };

        return res.status(400).render('edit-review', {
          title: 'Edit Review - DLSU Eats',
          review: reviewForView,
          restaurant,
          error: err.message
        });
      }

      return next(err);
    } catch (uploadError) {
      return next(uploadError);
    }
  });
}

// GET /reviews/create/:restaurantId
// IMPORTANT: This route must be declared BEFORE GET /:id, otherwise Express
// will match "create" as the :id parameter and return a 404.
router.get('/create/:restaurantId', requireLogin, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.restaurantId }).lean();
    if (!restaurant) return res.status(404).render('404', { title: 'Restaurant Not Found' });
    res.render('create-review', { title: 'Write a Review - DLSU Eats', restaurant });
  } catch (err) {
    next(err);
  }
});

// POST /reviews/create/:restaurantId
router.post('/create/:restaurantId', requireLogin, handleReviewMediaUpload, async (req, res, next) => {
  try {
    const { title, rating, body } = req.body;
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findOne({ id: restaurantId }).lean();
    if (!restaurant) return res.status(404).render('404', { title: 'Restaurant Not Found' });

    const { trimmedTitle, trimmedBody, parsedRating, error } = validateReviewInput(title, rating, body);
    if (error) {
      return res.status(400).render('create-review', {
        title: 'Write a Review - DLSU Eats',
        restaurant,
        error,
        formData: { title, rating, body }
      });
    }

    const media = (req.files || []).map(mediaPathFromFile);

    const review = new Review({
      restaurantId,
      userId: req.session.user._id,
      title: trimmedTitle,
      rating: parsedRating,
      body: trimmedBody,
      media,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      unhelpful: 0,
      edited: false
    });
    await review.save();

    await recalculateRestaurantRating(restaurantId);

    // Add to user's visited restaurants
    await User.findByIdAndUpdate(req.session.user._id, {
      $addToSet: { visitedRestaurants: restaurantId }
    });

    res.redirect(`/restaurants/${restaurantId}`);
  } catch (err) {
    next(err);
  }
});

// GET /reviews/:id
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render('404', { title: 'Review Not Found' });
    }

    const review = await Review.findById(req.params.id).lean();
    if (!review) return res.status(404).render('404', { title: 'Review Not Found' });

    const restaurant = await Restaurant.findOne({ id: review.restaurantId }).lean();
    const user = await findUserByIdentifier(review.userId);

    const isAuthor = req.session.user && req.session.user._id === (review.userId?.toString() || review.userId);
    const currentUserId = req.session.user ? req.session.user._id : null;
    const hasVoted = currentUserId ? (review.votedBy || []).includes(currentUserId) : false;

    review.mediaItems = (review.media || []).map((filePath) => ({
      path: filePath,
      isVideo: isVideoPath(filePath)
    }));

    res.render('review', {
      title: `${review.title} - DLSU Eats`,
      review,
      restaurant,
      reviewer: user,
      isAuthor,
      hasVoted
    });
  } catch (err) {
    next(err);
  }
});

// GET /reviews/:id/edit
router.get('/:id/edit', requireLogin, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).lean();
    if (!review) return res.status(404).render('404', { title: 'Review Not Found' });

    if (review.userId.toString() !== req.session.user._id) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }

    const restaurant = await Restaurant.findOne({ id: review.restaurantId }).lean();
    review.rating = review.rating ? review.rating.toString() : '';
    review.mediaItems = (review.media || []).map((filePath) => ({
      path: filePath,
      isVideo: isVideoPath(filePath)
    }));
    res.render('edit-review', { title: 'Edit Review - DLSU Eats', review, restaurant });
  } catch (err) {
    next(err);
  }
});

// POST /reviews/:id/edit
router.post('/:id/edit', requireLogin, handleReviewMediaUpload, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).render('404', { title: 'Review Not Found' });

    if (review.userId.toString() !== req.session.user._id) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }

    const { title, rating, body } = req.body;
    const { trimmedTitle, trimmedBody, parsedRating, error } = validateReviewInput(title, rating, body);
    if (error) {
      const restaurant = await Restaurant.findOne({ id: review.restaurantId }).lean();
      const reviewForView = review.toObject();
      reviewForView.title = title;
      reviewForView.rating = rating;
      reviewForView.body = body;
      reviewForView.mediaItems = (reviewForView.media || []).map((filePath) => ({
        path: filePath,
        isVideo: isVideoPath(filePath)
      }));

      return res.status(400).render('edit-review', {
        title: 'Edit Review - DLSU Eats',
        review: reviewForView,
        restaurant,
        error
      });
    }

    review.title = trimmedTitle;
    review.rating = parsedRating;
    review.body = trimmedBody;

    if (req.files && req.files.length > 0) {
      review.media = req.files.map(mediaPathFromFile);
    }

    review.edited = true;
    await review.save();

    await recalculateRestaurantRating(review.restaurantId);

    res.redirect(`/reviews/${review._id}`);
  } catch (err) {
    next(err);
  }
});

// POST /reviews/:id/vote
router.post('/:id/vote', requireLogin, async (req, res, next) => {
  try {
    const { vote } = req.body; // 'helpful' or 'unhelpful'
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const voterId = req.session.user._id;
    if ((review.votedBy || []).includes(voterId)) {
      return res.status(409).json({
        helpful: review.helpful,
        unhelpful: review.unhelpful,
        alreadyVoted: true,
        error: 'You have already voted on this review.'
      });
    }

    if (vote === 'helpful') review.helpful += 1;
    else if (vote === 'unhelpful') review.unhelpful += 1;
    else return res.status(400).json({ error: 'Invalid vote type.' });

    review.votedBy.push(voterId);
    await review.save();

    res.json({ helpful: review.helpful, unhelpful: review.unhelpful, alreadyVoted: true });
  } catch (err) {
    next(err);
  }
});

// POST /reviews/:id/delete
router.post('/:id/delete', requireLogin, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).render('404', { title: 'Review Not Found' });

    // Only the author can delete their review
    if (review.userId.toString() !== req.session.user._id) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }

    const restaurantId = review.restaurantId;
    await Review.findByIdAndDelete(req.params.id);

    await recalculateRestaurantRating(restaurantId);

    res.redirect(`/restaurants/${restaurantId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;