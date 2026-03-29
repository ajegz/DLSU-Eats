const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../model/Review');
const Restaurant = require('../model/Restaurant');
const User = require('../model/User');
const { requireOwner } = require('../middleware/auth');

async function findUserByIdentifier(userId) {
  const normalizedUserId = userId ? userId.toString() : '';
  if (!normalizedUserId) return null;

  const query = [{ id: normalizedUserId }];
  if (mongoose.Types.ObjectId.isValid(normalizedUserId)) {
    query.push({ _id: normalizedUserId });
  }

  return User.findOne(query.length === 1 ? query[0] : { $or: query }).lean();
}

// GET /owner/dashboard
router.get('/dashboard', requireOwner, async (req, res, next) => {
  try {
    const ownerRestaurantId = (req.session.user.restaurantIds || [])[0];
    const restaurants = ownerRestaurantId
      ? await Restaurant.find({ id: ownerRestaurantId }).lean()
      : [];

    const allReviews = [];
    for (const restaurant of restaurants) {
      const reviews = await Review.find({ restaurantId: restaurant.id }).sort({ date: -1 }).lean();
      for (const rv of reviews) {
        const reviewer = await findUserByIdentifier(rv.userId);
        allReviews.push({ ...rv, restaurant, reviewer });
      }
    }

    res.render('owner-dashboard', {
      title: 'Owner Dashboard - DLSU Eats',
      restaurants,
      reviews: allReviews,
      reviewCount: allReviews.length,
      error: req.query.error
    });
  } catch (err) {
    next(err);
  }
});

// POST /owner/reviews/:id/reply
router.post('/reviews/:id/reply', requireOwner, async (req, res, next) => {
  try {
    const { responseText } = req.body;

    if (!responseText || !responseText.trim()) {
      return res.redirect('/owner/dashboard?error=Response+cannot+be+empty');
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).render('404', { title: 'Review Not Found' });

    // Verify this owner actually owns the restaurant
    const ownerRestaurantId = (req.session.user.restaurantIds || [])[0] || '';
    if (!ownerRestaurantId || ownerRestaurantId !== review.restaurantId) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }

    review.ownerResponse = {
      text: responseText.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    await review.save();

    res.redirect('/owner/dashboard');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
