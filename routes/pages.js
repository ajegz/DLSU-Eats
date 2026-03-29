const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Restaurant = require('../model/Restaurant');
const Review = require('../model/Review');
const User = require('../model/User');

async function findUserByIdentifier(userId) {
  const normalizedUserId = userId ? userId.toString() : '';
  if (!normalizedUserId) return null;

  const query = [{ id: normalizedUserId }];
  if (mongoose.Types.ObjectId.isValid(normalizedUserId)) {
    query.push({ _id: normalizedUserId });
  }

  return User.findOne(query.length === 1 ? query[0] : { $or: query }).lean();
}

// GET /
router.get('/', async (req, res, next) => {
  try {
    const featured = await Restaurant.find().sort({ rating: -1 }).limit(12).lean();
    res.render('index', { title: 'DLSU Eats - Restaurant Reviews', restaurants: featured });
  } catch (err) {
    next(err);
  }
});

// GET /about
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us - DLSU Eats' });
});

// GET /guidelines
router.get('/guidelines', (req, res) => {
  res.render('guidelines', { title: 'Community Guidelines - DLSU Eats' });
});

// GET /search
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const type = req.query.type || 'all';
  let restaurantResults = [];
  let reviewResults = [];

  if (q) {
    const regex = new RegExp(q, 'i');
    if (type === 'all' || type === 'restaurants') {
      restaurantResults = await Restaurant.find({
        $or: [{ name: regex }, { description: regex }, { foodStyles: regex }, { location: regex }]
      }).lean();
    }
    if (type === 'all' || type === 'reviews') {
      const rawReviews = await Review.find({
        $or: [{ title: regex }, { body: regex }]
      }).lean();
      for (const rv of rawReviews) {
        const restaurant = await Restaurant.findOne({ id: rv.restaurantId }).lean();
        // Use $or to support both seeded reviews (userId = 'U001' string)
        // and new reviews created by logged-in users (userId = MongoDB ObjectId)
        const reviewer = await findUserByIdentifier(rv.userId);
        reviewResults.push({ ...rv, restaurant, reviewer });
      }
    }
  }

  res.render('search', {
    title: 'Search - DLSU Eats',
    query: q,
    type,
    restaurantResults,
    reviewResults,
    totalCount: restaurantResults.length + reviewResults.length,
    hasResults: restaurantResults.length + reviewResults.length > 0
  });
});

// GET /top-reviews
router.get('/top-reviews', async (req, res, next) => {
  try {
    const sortBy = req.query.sort || 'helpful';
    const page = parseInt(req.query.page) || 1;
    const perPage = 15;

    let sortField = { helpful: -1 };
    if (sortBy === 'rating') sortField = { rating: -1 };
    if (sortBy === 'newest') sortField = { date: -1 };

    const total = await Review.countDocuments();
    const totalPages = Math.ceil(total / perPage);
    const rawReviews = await Review.find().sort(sortField).skip((page - 1) * perPage).limit(perPage).lean();

    const reviews = [];
    for (const rv of rawReviews) {
      const restaurant = await Restaurant.findOne({ id: rv.restaurantId }).lean();
      // Use $or to support both seeded reviews (userId = 'U001' string)
      // and new reviews created by logged-in users (userId = MongoDB ObjectId)
      const user = await findUserByIdentifier(rv.userId);
      reviews.push({ ...rv, restaurant, reviewer: user });
    }

    res.render('top-reviews', {
      title: 'Top Reviews - DLSU Eats',
      reviews,
      sort: sortBy,
      currentPage: page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;