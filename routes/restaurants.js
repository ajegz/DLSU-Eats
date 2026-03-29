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

// GET /restaurants
router.get('/', async (req, res, next) => {
  try {
    const { search, campus, foodStyle, price, location, rating, sort } = req.query;

    const filter = {};
    if (campus === 'inside') filter.insideCampus = true;
    if (campus === 'outside') filter.insideCampus = false;
    if (price) filter.priceRange = price;
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    if (location) filter.location = new RegExp(location, 'i');
    if (foodStyle) filter.foodStyles = foodStyle;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    let sortField = { rating: -1 };
    if (sort === 'rating-low') sortField = { ratingCount: -1 };
    if (sort === 'price-low') sortField = { priceRange: 1 };
    if (sort === 'price-high') sortField = { priceRange: -1 };
    if (sort === 'name-asc') sortField = { name: 1 };
    if (sort === 'name-desc') sortField = { name: -1 };

    const allRestaurants = await Restaurant.find(filter).sort(sortField).lean();

    // Collect all unique food styles for filter sidebar
    const allForStyles = await Restaurant.find({}, 'foodStyles').lean();
    const foodStyleSet = new Set();
    allForStyles.forEach(r => r.foodStyles.forEach(s => foodStyleSet.add(s)));
    const foodStyles = Array.from(foodStyleSet).sort();

    res.render('restaurants', {
      title: 'Restaurants - DLSU Eats',
      restaurants: allRestaurants,
      count: allRestaurants.length,
      foodStyles,
      filters: { search, campus, foodStyle, price, location, rating, sort }
    });
  } catch (err) {
    next(err);
  }
});

// GET /restaurants/:id
router.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id }).lean();
    if (!restaurant) {
      return res.status(404).render('404', { title: 'Restaurant Not Found' });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = 5;
    const allReviews = await Review.find({ restaurantId: req.params.id }).sort({ date: -1 }).lean();
    const totalPages = Math.ceil(allReviews.length / perPage);
    const reviewsWithUsers = [];

    for (const rv of allReviews.slice((page - 1) * perPage, page * perPage)) {
      const user = await findUserByIdentifier(rv.userId);
      reviewsWithUsers.push({ ...rv, user });
    }

    res.render('restaurant', {
      title: `${restaurant.name} - DLSU Eats`,
      restaurant,
      reviews: reviewsWithUsers,
      reviewCount: allReviews.length,
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
