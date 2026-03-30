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

// GET /search/suggestions
router.get('/search/suggestions', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 1) {
      return res.json({ suggestions: [] });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRegex = new RegExp(`^${escaped}`, 'i');
    const containsRegex = new RegExp(escaped, 'i');

    const [prefixMatches, containsMatches] = await Promise.all([
      Restaurant.find({ name: prefixRegex }).select('name').limit(6).lean(),
      Restaurant.find({ name: containsRegex }).select('name').limit(10).lean()
    ]);

    const deduped = [];
    const seen = new Set();
    for (const candidate of [...prefixMatches, ...containsMatches]) {
      const name = (candidate.name || '').trim();
      const key = name.toLowerCase();
      if (name && !seen.has(key)) {
        seen.add(key);
        deduped.push(name);
      }
      if (deduped.length >= 8) break;
    }

    return res.json({ suggestions: deduped });
  } catch (err) {
    return next(err);
  }
});

// GET /top-reviews
router.get('/top-reviews', async (req, res, next) => {
  try {
    const sortBy = ['helpful', 'rating', 'newest'].includes(req.query.sort)
      ? req.query.sort
      : 'helpful';
    const parsedPage = parseInt(req.query.page, 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const perPage = 15;

    let sortField = { helpful: -1 };
    if (sortBy === 'rating') sortField = { rating: -1 };
    if (sortBy === 'newest') sortField = { date: -1 };

    const total = await Review.countDocuments();
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(page, totalPages);
    const rawReviews = await Review.find()
      .sort(sortField)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    const restaurantIds = [...new Set(rawReviews.map((rv) => rv.restaurantId).filter(Boolean))];
    const userIdentifiers = [...new Set(rawReviews.map((rv) => (rv.userId ? rv.userId.toString() : '')).filter(Boolean))];

    const objectIds = userIdentifiers
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const [restaurants, users] = await Promise.all([
      Restaurant.find({ id: { $in: restaurantIds } }).lean(),
      User.find({
        $or: [
          { id: { $in: userIdentifiers } },
          ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : [])
        ]
      }).lean()
    ]);

    const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
    const userByIdentifier = new Map();
    for (const user of users) {
      if (user.id) userByIdentifier.set(user.id.toString(), user);
      if (user._id) userByIdentifier.set(user._id.toString(), user);
    }

    const reviews = rawReviews.map((rv) => ({
      ...rv,
      restaurant: restaurantById.get(rv.restaurantId) || null,
      reviewer: userByIdentifier.get(rv.userId ? rv.userId.toString() : '') || null
    }));

    res.render('top-reviews', {
      title: 'Top Reviews - DLSU Eats',
      reviews,
      sort: sortBy,
      currentPage,
      totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;