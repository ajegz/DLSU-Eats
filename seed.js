// DLSU Eats - Database Seeder
// Run with: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User');
const bcrypt = require('bcryptjs');
const Restaurant = require('./model/Restaurant');
const Review = require('./model/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dlsu-eats';

// ─── Raw seed data (migrated from js/data.js) ─────────────────────────────────

const restaurants = [
  { id: 'R001', name: 'Chef Babs (Inside)', location: 'Bloemen Hall', insideCampus: true, address: 'Bloemen Hall, DLSU Manila', description: 'Popular snack stall serving delicious siomai and other affordable Filipino street food favorites. Perfect for quick bites between classes.', foodStyles: ['Chinese', 'Filipino', 'Snacks'], priceRange: '₱', rating: 4.6, ratingCount: 89, hours: 'Mon-Sat: 7:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R001.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U011' },
  { id: 'R002', name: "Colonel's Curry", location: 'Bloemen Hall', insideCampus: true, address: 'Bloemen Hall, DLSU Manila', description: 'Serving delicious curry dishes and quick bites at affordable prices. Perfect for students looking for flavorful comfort food between classes.', foodStyles: ['Indian', 'Curry', 'Quick Bites'], priceRange: '₱', rating: 4.4, ratingCount: 72, hours: 'Mon-Sat: 7:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R002.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U011' },
  { id: 'R003', name: 'Kitchen City', location: 'Bloemen Hall', insideCampus: true, address: 'Bloemen Hall, DLSU Manila', description: 'Student-favorite canteen offering affordable Filipino rice meals with generous servings. Perfect for budget-conscious students looking for filling meals.', foodStyles: ['Filipino', 'Rice Meals', 'Canteen'], priceRange: '₱', rating: 4.5, ratingCount: 112, hours: 'Mon-Sat: 7:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R003.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U012' },
  { id: 'R004', name: 'Potato Corner', location: 'Bloemen Hall', insideCampus: true, address: 'Bloemen Hall, DLSU Manila', description: 'Famous flavored fries and snacks stall. Perfect for quick snacking with multiple flavors to choose from. Affordable and delicious!', foodStyles: ['Snacks', 'American', 'Fast Food'], priceRange: '₱', rating: 4.3, ratingCount: 95, hours: 'Mon-Sat: 8:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R004.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U013' },
  { id: 'R005', name: 'Dairy Queen', location: 'Bloemen Hall', insideCampus: true, address: 'Bloemen Hall, DLSU Manila', description: 'International ice cream chain famous for their Blizzards, soft-serve ice cream, and frozen treats. Perfect for dessert or a sweet study break.', foodStyles: ['Dessert', 'Ice Cream', 'American'], priceRange: '₱', rating: 4.5, ratingCount: 76, hours: 'Mon-Sat: 9:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R005.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U014' },
  { id: 'R006', name: 'Fruitas', location: 'Bloemen Hall', insideCampus: true, address: 'Bloemen Hall, DLSU Manila', description: 'Fresh fruit juice and shake bar offering healthy and refreshing beverages. Perfect for staying hydrated and energized throughout the day.', foodStyles: ['Beverages', 'Healthy', 'Juice'], priceRange: '₱', rating: 4.4, ratingCount: 88, hours: 'Mon-Sat: 8:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R006.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U015' },
  { id: 'R007', name: 'Kitchen City (Razon)', location: '2/F Razon Sports Center', insideCampus: true, address: '2nd Floor, Razon Sports Center, DLSU Manila', description: 'Another branch of Kitchen City located at the sports center. Offers the same great Filipino rice meals perfect for post-workout refueling.', foodStyles: ['Filipino', 'Rice Meals', 'Canteen'], priceRange: '₱', rating: 4.4, ratingCount: 68, hours: 'Mon-Sat: 7:00 AM - 6:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R007.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U012' },
  { id: 'R008', name: 'Coffee Bean & Tea Leaf (Library)', location: '6/F Henry Sy Sr. Hall', insideCampus: true, address: '6th Floor, Henry Sy Sr. Hall, DLSU Manila', description: 'Premium coffee shop perfect for studying with a view. Offers specialty coffee, teas, and pastries in a comfortable study-friendly environment.', foodStyles: ['Cafe', 'Coffee', 'Beverages'], priceRange: '₱₱', rating: 4.7, ratingCount: 93, hours: 'Mon-Sat: 7:00 AM - 8:00 PM', phone: '(02) 8123-4567', image: 'assets/images/restaurants/R008.jpg', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U016' },
  { id: 'R009', name: 'Andrew Canteen', location: 'G/F Br. Andrew Gonzalez Hall', insideCampus: true, address: 'Ground Floor, Br. Andrew Gonzalez Hall, DLSU Manila', description: 'Popular campus canteen offering a wide selection of Filipino rice meals and snacks. Known for fast service and student-friendly prices.', foodStyles: ['Filipino', 'Rice Meals', 'Canteen'], priceRange: '₱', rating: 4.4, ratingCount: 108, hours: 'Mon-Sat: 7:00 AM - 7:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R009.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U017' },
  { id: 'R010', name: "Perico's Canteen", location: '2/F Razon Sports Center', insideCampus: true, address: '2nd Floor, Razon Sports Center, DLSU Manila', description: 'Traditional Filipino canteen serving home-style rice meals at affordable prices. Known for their generous portions and classic Pinoy comfort food.', foodStyles: ['Filipino', 'Rice Meals', 'Canteen'], priceRange: '₱', rating: 4.6, ratingCount: 84, hours: 'Mon-Sat: 7:00 AM - 6:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R010.jpg', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U018' },
  { id: 'R011', name: "Ate Rica's Bacsilog", location: 'Agno Food Court, Agno St.', insideCampus: false, address: 'Agno Food Court, Agno Street, Malate, Manila', description: 'Serving authentic Filipino breakfast favorites all day. Famous for their flavorful bacsilog with perfectly seasoned bacon.', foodStyles: ['Filipino', 'Breakfast', 'Quick Bites'], priceRange: '₱', rating: 4.5, ratingCount: 78, hours: 'Daily: 7:00 AM - 9:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R011.jpg', walkingTime: '2 mins', distance: '150m', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U019' },
  { id: 'R012', name: 'Good Munch', location: 'Agno Food Court, Agno St.', insideCampus: false, address: 'Agno Food Court, Agno Street, Malate, Manila', description: 'Variety of quick bites and snacks at student-friendly prices. Perfect for grabbing a quick meal between classes.', foodStyles: ['Filipino', 'Quick Bites', 'Snacks'], priceRange: '₱', rating: 4.3, ratingCount: 65, hours: 'Daily: 8:00 AM - 8:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R012.jpg', walkingTime: '2 mins', distance: '150m', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U020' },
  { id: 'R013', name: "Kuya Mel's Kitchen", location: 'Agno Food Court, Agno St.', insideCampus: false, address: 'Agno Food Court, Agno Street, Malate, Manila', description: "Home-cooked style Filipino meals with generous portions. Known for their tasty ulam and affordable combo meals.", foodStyles: ['Filipino', 'Rice Meals', 'Quick Bites'], priceRange: '₱', rating: 4.4, ratingCount: 71, hours: 'Daily: 8:00 AM - 8:00 PM', phone: 'N/A', image: 'assets/images/restaurants/R013.jpg', walkingTime: '2 mins', distance: '150m', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U021' },
  { id: 'R014', name: "Dixie's", location: 'Castro St., Malate', insideCampus: false, address: 'Castro Street, Malate, Manila', description: 'Casual dining spot offering Filipino favorites and comfort food. Great ambiance for group meals and hangouts.', foodStyles: ['Filipino', 'Casual Dining', 'Comfort Food'], priceRange: '₱', rating: 4.5, ratingCount: 89, hours: 'Daily: 10:00 AM - 10:00 PM', phone: '(02) 8234-5678', image: 'assets/images/restaurants/R014.jpg', walkingTime: '3 mins', distance: '250m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U022' },
  { id: 'R015', name: 'Babe Mike Shawarma', location: '770 Pablo Ocampo St.', insideCampus: false, address: '770 Pablo Ocampo Street, Malate, Manila', description: 'Popular shawarma spot serving generous portions of flavorful Middle Eastern wraps and rice meals.', foodStyles: ['Middle Eastern', 'Shawarma', 'Quick Bites'], priceRange: '₱', rating: 4.6, ratingCount: 124, hours: 'Daily: 10:00 AM - 11:00 PM', phone: '(02) 8345-6789', image: 'assets/images/restaurants/R015.jpg', walkingTime: '7 mins', distance: '500m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U023' },
  { id: 'R016', name: '24 Chicken', location: '2472 Leon Guinto St., Malate', insideCampus: false, address: '2472 Leon Guinto Street, Malate, Manila', description: 'Korean-style fried chicken restaurant offering various flavors and crispy chicken. Great for sharing with friends.', foodStyles: ['Korean', 'Chicken', 'Quick Service'], priceRange: '₱₱', rating: 4.5, ratingCount: 101, hours: 'Daily: 11:00 AM - 10:00 PM', phone: '(02) 8901-2345', image: 'assets/images/restaurants/R016.jpg', walkingTime: '6 mins', distance: '450m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U024' },
  { id: 'R017', name: "Zark's Burgers", location: '2/F University Mall, Taft Avenue', insideCampus: false, address: '2nd Floor, University Mall, Taft Avenue', description: 'Filipino burger chain serving oversized gourmet burgers. Known for their Tombstone burger and unlimited rice meals.', foodStyles: ['Burgers', 'American', 'Filipino Fusion'], priceRange: '₱₱', rating: 4.6, ratingCount: 134, hours: 'Daily: 10:00 AM - 10:00 PM', phone: '(02) 8234-5678', image: 'assets/images/restaurants/R017.jpg', walkingTime: '1 min', distance: '20m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U025' },
  { id: 'R018', name: 'Bonchon Chicken', location: 'G/F University Mall, Taft Avenue', insideCampus: false, address: 'Ground Floor, University Mall, Taft Avenue', description: 'Korean fried chicken chain famous for their crispy double-fried chicken and signature sauces. A must-try for Korean food lovers.', foodStyles: ['Korean', 'Chicken', 'Fast Food'], priceRange: '₱₱', rating: 4.8, ratingCount: 156, hours: 'Daily: 10:00 AM - 10:00 PM', phone: '(02) 8567-8901', image: 'assets/images/restaurants/R018.jpg', walkingTime: '1 min', distance: '10m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com/ph/en/restaurant/bonchon-chicken-university-mall-delivery/1-CYZGWWWHJYTXCE', foodPandaLink: 'https://www.foodpanda.ph/restaurant/s5lq/bonchon-chicken-university-mall', ownerId: 'U026' },
  { id: 'R019', name: 'KFC', location: 'G/F University Mall, Taft Avenue', insideCampus: false, address: 'Ground Floor, University Mall, Taft Avenue', description: "World-famous fried chicken fast food chain. Offering the Colonel's secret recipe with various chicken meals and sides.", foodStyles: ['American', 'Chicken', 'Fast Food'], priceRange: '₱₱', rating: 4.4, ratingCount: 142, hours: 'Daily: 9:00 AM - 10:00 PM', phone: '(02) 8678-9012', image: 'assets/images/restaurants/R019.jpg', walkingTime: '1 min', distance: '10m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U027' },
  { id: 'R020', name: 'Burger King', location: 'Taft Ave. cor Castro, Malate', insideCampus: false, address: 'Taft Avenue corner Castro Street, Malate, Manila', description: 'International fast-food chain famous for their flame-grilled Whopper burgers. Quick service and consistent quality.', foodStyles: ['American', 'Fast Food', 'Burgers'], priceRange: '₱₱', rating: 4.4, ratingCount: 87, hours: 'Daily: 8:00 AM - 11:00 PM', phone: '(02) 8678-9012', image: 'assets/images/restaurants/R020.jpg', walkingTime: '2 mins', distance: '150m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U028' },
  { id: 'R021', name: 'Sbarro', location: 'G/F Green Mall, Taft Avenue', insideCampus: false, address: 'Ground Floor, Green Mall, Taft Avenue', description: 'New York style pizza and Italian fast food. Famous for their large pizza slices and pasta dishes.', foodStyles: ['Italian', 'Pizza', 'Fast Food'], priceRange: '₱₱', rating: 4.3, ratingCount: 76, hours: 'Daily: 10:00 AM - 9:00 PM', phone: '(02) 8789-0123', image: 'assets/images/restaurants/R021.jpg', walkingTime: '2 mins', distance: '150m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U029' },
  { id: 'R022', name: 'Bok Chicken', location: 'Leon Guinto St., Malate', insideCampus: false, address: 'Leon Guinto Street, Malate, Manila', description: 'Korean fried chicken spot offering crispy chicken with various sauces. Great for quick meals and takeout.', foodStyles: ['Korean', 'Chicken', 'Quick Service'], priceRange: '₱₱', rating: 4.4, ratingCount: 88, hours: 'Daily: 11:00 AM - 10:00 PM', phone: '(02) 8890-1234', image: 'assets/images/restaurants/R022.jpg', walkingTime: '6 mins', distance: '450m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U030' },
  { id: 'R023', name: 'Gang Gang Chicken', location: "1/F One Archer's Place, Taft Avenue", insideCampus: false, address: "1st Floor, One Archer's Place, Taft Avenue", description: 'Popular Korean chicken spot with various flavors. Perfect for quick service chicken meals and sharing platters.', foodStyles: ['Korean', 'Chicken', 'Quick Service'], priceRange: '₱₱', rating: 4.5, ratingCount: 95, hours: 'Daily: 11:00 AM - 9:00 PM', phone: '(02) 8901-2345', image: 'assets/images/restaurants/R023.jpg', walkingTime: '2 mins', distance: '50m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U031' },
  { id: 'R024', name: 'Kuh Meal', location: '2 Torre Lorenzo, Taft Avenue', insideCampus: false, address: '2 Torre Lorenzo, Taft Avenue', description: 'Korean quick service restaurant offering affordable rice meals and Korean favorites.', foodStyles: ['Korean', 'Rice Meals', 'Quick Service'], priceRange: '₱₱', rating: 4.3, ratingCount: 67, hours: 'Daily: 10:00 AM - 9:00 PM', phone: '(02) 8012-3456', image: 'assets/images/restaurants/R024.jpg', walkingTime: '1 min', distance: '50m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U011' },
  { id: 'R025', name: 'Subway', location: "One Archer's Place, Taft Avenue", insideCampus: false, address: "One Archer's Place, Taft Avenue", description: 'Customizable submarine sandwich chain offering fresh ingredients and healthy options. Build your own sandwich your way.', foodStyles: ['American', 'Sandwiches', 'Healthy'], priceRange: '₱₱', rating: 4.5, ratingCount: 78, hours: 'Daily: 9:00 AM - 9:00 PM', phone: '(02) 8890-1234', image: 'assets/images/restaurants/R025.jpg', walkingTime: '2 mins', distance: '50m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U012' },
  { id: 'R026', name: 'Samgyupsalamat', location: '911 Kapitan Tikong St., Malate', insideCampus: false, address: '911 Kapitan Tikong Street, Malate, Manila', description: 'Unlimited Korean BBQ restaurant offering premium meat selections and authentic Korean side dishes. Perfect for group dining.', foodStyles: ['Korean', 'BBQ', 'Unlimited'], priceRange: '₱₱₱', rating: 4.8, ratingCount: 203, hours: 'Daily: 11:00 AM - 11:00 PM', phone: '(02) 8567-8902', image: 'assets/images/restaurants/R026.jpg', walkingTime: '8 mins', distance: '500m', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U013' },
  { id: 'R027', name: 'Seolhajung', location: "2/F One Archer's Place, Taft Avenue", insideCampus: false, address: "2nd Floor, One Archer's Place, Taft Avenue", description: 'Korean BBQ restaurant offering quality meats and authentic Korean dining experience. Great ambiance for dates and group meals.', foodStyles: ['Korean', 'BBQ', 'Sit-down'], priceRange: '₱₱₱', rating: 4.7, ratingCount: 118, hours: 'Daily: 11:00 AM - 10:00 PM', phone: '(02) 8678-9013', image: 'assets/images/restaurants/R027.jpg', walkingTime: '2 mins', distance: '50m', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U014' },
  { id: 'R028', name: 'El Poco Cantina', location: '1806 Estrada St., Malate', insideCampus: false, address: '1806 Estrada Street, Malate, Manila', description: 'Mexican restaurant offering authentic tacos, burritos, and more. Great atmosphere for casual dining and hangouts.', foodStyles: ['Mexican', 'Casual Dining', 'Sit-down'], priceRange: '₱₱₱', rating: 4.6, ratingCount: 92, hours: 'Daily: 11:00 AM - 11:00 PM', phone: '(02) 8789-0124', image: 'assets/images/restaurants/R028.jpg', walkingTime: '6 mins', distance: '400m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U015' },
  { id: 'R029', name: "Coffee Bean & Tea Leaf (Archer's)", location: 'G/F Vista Residence, Taft Avenue', insideCampus: false, address: 'Ground Floor, Vista Residence, Taft Avenue', description: 'Premium coffee shop chain offering specialty coffee, teas, and light meals. Perfect for study sessions and meetings.', foodStyles: ['Cafe', 'Coffee', 'Sit-down'], priceRange: '₱₱₱', rating: 4.6, ratingCount: 87, hours: 'Daily: 7:00 AM - 10:00 PM', phone: '(02) 8890-1235', image: 'assets/images/restaurants/R029.jpg', walkingTime: '2 mins', distance: '50m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U016' },
  { id: 'R030', name: 'Eat Fresh HK Street Food', location: '2471 Leon Guinto St., Malate', insideCampus: false, address: '2471 Leon Guinto Street, Malate, Manila', description: 'Hong Kong style street food restaurant offering authentic dim sum, noodles, and rice dishes. Casual dining atmosphere.', foodStyles: ['Chinese', 'Hong Kong', 'Sit-down'], priceRange: '₱₱₱', rating: 4.5, ratingCount: 73, hours: 'Daily: 10:00 AM - 10:00 PM', phone: '(02) 8901-2346', image: 'assets/images/restaurants/R030.jpg', walkingTime: '6 mins', distance: '400m', grabAvailable: true, foodPandaAvailable: true, grabLink: 'https://food.grab.com', foodPandaLink: 'https://www.foodpanda.ph', ownerId: 'U017' },
  { id: 'R031', name: 'Romantic Baboy', location: 'Taft Avenue, Malate', insideCampus: false, address: 'Taft Avenue, Malate, Manila', description: 'Popular unlimited Korean BBQ chain. Offers great value with unlimited meat, side dishes, and drinks. Perfect for groups.', foodStyles: ['Korean', 'BBQ', 'Unlimited'], priceRange: '₱₱₱', rating: 4.7, ratingCount: 167, hours: 'Daily: 11:00 AM - 11:00 PM', phone: '(02) 8012-3457', image: 'assets/images/restaurants/R031.jpg', walkingTime: '5 mins', distance: '300m', grabAvailable: false, foodPandaAvailable: false, ownerId: 'U018' }
];

const usersRaw = [
  { id: 'U001', name: 'Miguel Tan', email: 'miguel.tan@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'assets/images/profiles/U001.png', joinedDate: 'January 2025', bio: 'Food enthusiast and DLSU student. Always on the hunt for the best food around campus!', visitedRestaurants: ['R001', 'R018', 'R026', 'R003', 'R008'] },
  { id: 'U002', name: 'Samantha Lim', email: 'samantha.lim@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=5', joinedDate: 'December 2024', bio: 'Coffee addict ☕ and dessert lover 🍰 | Sharing my food adventures around DLSU', visitedRestaurants: ['R008', 'R005', 'R017', 'R020'] },
  { id: 'U003', name: 'Ethan Uy', email: 'ethan.uy@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=8', joinedDate: 'November 2024', bio: "Budget eats specialist. Finding the best meals that won't break the bank 💰", visitedRestaurants: ['R003', 'R007', 'R009', 'R013', 'R004'] },
  { id: 'U004', name: 'Nicole Chua', email: 'nicole.chua@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=9', joinedDate: 'October 2024', bio: 'Korean food fanatic 🇰🇷 | KBBQ is life | Let\'s eat!', visitedRestaurants: ['R018', 'R026', 'R016'] },
  { id: 'U005', name: 'Joshua Ong', email: 'joshua.ong@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=13', joinedDate: 'September 2024', bio: 'Foodie. Photographer. Student. In that order. 📸🍴', visitedRestaurants: ['R017', 'R014', 'R025', 'R030', 'R002'] },
  { id: 'U006', name: 'Andrea Go', email: 'andrea.go@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=10', joinedDate: 'August 2024', bio: 'Healthy eating advocate 🥗 | Finding nutritious options around campus', visitedRestaurants: ['R025', 'R019', 'R008'] },
  { id: 'U007', name: 'Daniel Yap', email: 'daniel.yap@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=14', joinedDate: 'July 2024', bio: 'Engineering student fueled by good food and great vibes ⚙️🍜', visitedRestaurants: ['R001', 'R015', 'R013', 'R020'] },
  { id: 'U008', name: 'Bianca Yu', email: 'bianca.yu@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=16', joinedDate: 'June 2024', bio: 'Part-time student, full-time foodie 🎓🍕', visitedRestaurants: ['R006', 'R005', 'R030', 'R018'] },
  { id: 'U009', name: 'Gabriel Ang', email: 'gabriel.ang@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=15', joinedDate: 'May 2024', bio: 'Trying every restaurant around DLSU, one meal at a time 🍽️', visitedRestaurants: ['R007', 'R009', 'R010', 'R014', 'R016', 'R002'] },
  { id: 'U010', name: 'Hannah Lee', email: 'hannah.lee@dlsu.test', password: 'password123', isOwner: false, profilePicture: 'https://i.pravatar.cc/150?img=20', joinedDate: 'April 2024', bio: 'Milk tea connoisseur 🧋 | Rating every drink I try', visitedRestaurants: ['R006', 'R008', 'R030'] },
  { id: 'U011', name: 'Robert Chen', email: 'robert.chen@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R001', 'R002', 'R024'], profilePicture: 'https://i.pravatar.cc/150?img=33', bio: "Owner of Chef Babs, Colonel's Curry & Kuh Meal" },
  { id: 'U012', name: 'Maria Santos', email: 'maria.santos@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R003', 'R007', 'R025'], profilePicture: 'https://i.pravatar.cc/150?img=44', bio: 'Kitchen City (both locations) & Subway owner' },
  { id: 'U013', name: 'David Wong', email: 'david.wong@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R004', 'R026'], profilePicture: 'https://i.pravatar.cc/150?img=51', bio: 'Potato Corner & Samgyupsalamat proprietor' },
  { id: 'U014', name: 'Patricia Reyes', email: 'patricia.reyes@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R005', 'R027'], profilePicture: 'https://i.pravatar.cc/150?img=47', bio: 'Dairy Queen & Seolhajung owner' },
  { id: 'U015', name: 'James Lim', email: 'james.lim@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R006', 'R028'], profilePicture: 'https://i.pravatar.cc/150?img=56', bio: 'Fruitas & El Poco Cantina franchise owner' },
  { id: 'U016', name: 'Catherine Tan', email: 'catherine.tan@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R008', 'R029'], profilePicture: 'https://i.pravatar.cc/150?img=38', bio: 'Coffee Bean (both locations) manager' },
  { id: 'U017', name: 'Michael Cruz', email: 'michael.cruz@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R009', 'R030'], profilePicture: 'https://i.pravatar.cc/150?img=52', bio: 'Andrew Canteen & Eat Fresh HK owner' },
  { id: 'U018', name: 'Jennifer Dela Cruz', email: 'jennifer.delacruz@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R010', 'R031'], profilePicture: 'https://i.pravatar.cc/150?img=41', bio: "Perico's Canteen & Romantic Baboy proprietor" },
  { id: 'U019', name: 'Richard Gomez', email: 'richard.gomez@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R011'], profilePicture: 'https://i.pravatar.cc/150?img=60', bio: "Ate Rica's Bacsilog owner" },
  { id: 'U020', name: 'Sophia Garcia', email: 'sophia.garcia@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R012'], profilePicture: 'https://i.pravatar.cc/150?img=45', bio: 'Good Munch proprietor' },
  { id: 'U021', name: 'Anthony Rivera', email: 'anthony.rivera@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R013'], profilePicture: 'https://i.pravatar.cc/150?img=34', bio: "Kuya Mel's Kitchen owner" },
  { id: 'U022', name: 'Diana Mendoza', email: 'diana.mendoza@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R014'], profilePicture: 'https://i.pravatar.cc/150?img=42', bio: "Dixie's proprietor" },
  { id: 'U023', name: 'Carlos Bautista', email: 'carlos.bautista@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R015'], profilePicture: 'https://i.pravatar.cc/150?img=53', bio: 'Babe Mike Shawarma owner' },
  { id: 'U024', name: 'Lorena Villanueva', email: 'lorena.villanueva@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R016'], profilePicture: 'https://i.pravatar.cc/150?img=46', bio: '24 Chicken proprietor' },
  { id: 'U025', name: 'Fernando Ramos', email: 'fernando.ramos@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R017'], profilePicture: 'https://i.pravatar.cc/150?img=57', bio: "Zark's Burgers franchise owner" },
  { id: 'U026', name: 'Angela Torres', email: 'angela.torres@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R018'], profilePicture: 'https://i.pravatar.cc/150?img=39', bio: 'Bonchon Chicken manager' },
  { id: 'U027', name: 'Roberto Flores', email: 'roberto.flores@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R019'], profilePicture: 'https://i.pravatar.cc/150?img=54', bio: 'KFC franchise owner' },
  { id: 'U028', name: 'Melissa Aquino', email: 'melissa.aquino@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R020'], profilePicture: 'https://i.pravatar.cc/150?img=43', bio: 'Burger King manager' },
  { id: 'U029', name: 'Eduardo Santos', email: 'eduardo.santos@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R021'], profilePicture: 'https://i.pravatar.cc/150?img=58', bio: 'Sbarro proprietor' },
  { id: 'U030', name: 'Cristina Navarro', email: 'cristina.navarro@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R022'], profilePicture: 'https://i.pravatar.cc/150?img=40', bio: 'Bok Chicken owner' },
  { id: 'U031', name: 'Benjamin Cruz', email: 'benjamin.cruz@business.test', password: 'owner123', isOwner: true, restaurantIds: ['R023'], profilePicture: 'https://i.pravatar.cc/150?img=55', bio: 'Gang Gang Chicken proprietor' }
];

// Phase rule: one owner account maps to exactly one restaurant.
const ownerRestaurantPairs = usersRaw
  .filter((user) => user.isOwner)
  .map((owner) => ({ ownerId: owner.id, restaurantId: (owner.restaurantIds || [])[0] || '' }))
  .filter((pair) => pair.restaurantId);

const ownerByRestaurantId = new Map(
  ownerRestaurantPairs.map((pair) => [pair.restaurantId, pair.ownerId])
);

for (const user of usersRaw) {
  if (!user.isOwner) {
    user.restaurantIds = [];
    continue;
  }

  const assignedRestaurantId = (user.restaurantIds || [])[0] || '';
  user.restaurantIds = assignedRestaurantId ? [assignedRestaurantId] : [];
}

for (const restaurant of restaurants) {
  restaurant.ownerId = ownerByRestaurantId.get(restaurant.id) || '';
}

function createRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function buildReviewDate(baseDate, dayOffset) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - dayOffset);
  return d.toISOString().split('T')[0];
}

function sampleRating(rng) {
  const roll = rng();
  if (roll < 0.10) return 1;
  if (roll < 0.25) return 2;
  if (roll < 0.50) return 3;
  if (roll < 0.80) return 4;
  return 5;
}

function titleForRating(rating, cuisine, rng) {
  const byRating = {
    5: [
      `Excellent ${cuisine} spot near campus`,
      'Highly recommended for students',
      'Consistently great food and service',
      'One of the best meals I had this term'
    ],
    4: [
      `Very good ${cuisine} option`,
      'Great value and satisfying meal',
      'Solid choice for lunch break',
      'Would definitely come back'
    ],
    3: [
      'Decent overall, some room to improve',
      'Average experience but acceptable',
      'Good enough for a quick bite',
      'Mixed experience this visit'
    ],
    2: [
      'Below expectations this time',
      'Food was okay but service needs work',
      'Not great value for the price',
      'Probably will try a different place next time'
    ],
    1: [
      'Very disappointing visit',
      'Would not recommend right now',
      'Quality and service were both poor',
      'Needs major improvement'
    ]
  };
  return pick(byRating[rating], rng);
}

function bodyForRating(restaurant, cuisine, rating, rng) {
  const positives = [
    'food came out hot and well-prepared',
    'portion size was sulit for the price',
    'staff were friendly and attentive',
    'the flavors were balanced and satisfying',
    'waiting time was reasonable even during peak hours'
  ];
  const neutrals = [
    'taste was okay but not very memorable',
    'serving size was fair for what I paid',
    'service was average and a bit slow',
    'place can get crowded around lunch time',
    'menu has enough options for most students'
  ];
  const negatives = [
    'food arrived lukewarm and lacked flavor',
    'serving size felt small for the price',
    'service was slow and staff looked overwhelmed',
    'cleanliness and table turnover need improvement',
    'queue management during rush hour was poor'
  ];

  let first;
  let second;
  let close;
  if (rating >= 4) {
    first = pick(positives, rng);
    second = pick(positives, rng);
    close = 'Overall, I would recommend this place and will likely return.';
  } else if (rating === 3) {
    first = pick(neutrals, rng);
    second = rng() < 0.5 ? pick(positives, rng) : pick(negatives, rng);
    close = 'It is acceptable for a quick meal, but there is room for improvement.';
  } else {
    first = pick(negatives, rng);
    second = pick(neutrals, rng);
    close = 'I hope they improve because the location is convenient for students.';
  }

  const deliveryNote = restaurant.grabAvailable || restaurant.foodPandaAvailable
    ? 'Delivery options are available, which is convenient when campus is busy.'
    : 'This place is dine-in or walk-in focused, so timing your visit helps.';

  return `${restaurant.name} is a ${cuisine.toLowerCase()} option near DLSU. On this visit, ${first}. Also, ${second}. ${deliveryNote} ${close}`;
}

function maybeOwnerResponse(rating, date, rng) {
  const shouldRespond = rating <= 2 ? rng() < 0.60 : rng() < 0.18;
  if (!shouldRespond) return undefined;

  const messages = rating <= 2
    ? [
      'Thank you for the honest feedback. We are reviewing this with our team and will improve our service.',
      'We appreciate you sharing this experience. We will work on the issues you mentioned.',
      'Sorry to hear about your visit. We are taking action to improve quality and turnaround time.'
    ]
    : [
      'Thank you for your support. We are glad you enjoyed your meal.',
      'We appreciate your review and look forward to serving you again soon.',
      'Thanks for dining with us. Your feedback helps our team stay consistent.'
    ];

  const responseOffset = 1 + Math.floor(rng() * 2);
  return {
    text: pick(messages, rng),
    date: buildReviewDate(new Date(`${date}T12:00:00.000Z`), -responseOffset)
  };
}

function generateReviews(targetCount) {
  const rng = createRng(20260314);
  const studentUserIds = usersRaw.filter((u) => !u.isOwner).map((u) => u.id);
  const reviewList = [];
  const baseDate = new Date('2026-03-14T12:00:00.000Z');

  // First pass: ensure every restaurant has multiple reviews.
  for (const restaurant of restaurants) {
    for (let i = 0; i < 4; i += 1) {
      const rating = sampleRating(rng);
      const cuisine = pick(restaurant.foodStyles, rng);
      const date = buildReviewDate(baseDate, Math.floor(rng() * 240));
      const helpfulBase = rating >= 4 ? 8 : rating === 3 ? 4 : 1;
      const helpful = helpfulBase + Math.floor(rng() * 18);
      const unhelpful = rating <= 2 ? Math.floor(rng() * 8) : Math.floor(rng() * 4);
      const ownerResponse = maybeOwnerResponse(rating, date, rng);

      reviewList.push({
        restaurantId: restaurant.id,
        userId: pick(studentUserIds, rng),
        rating,
        title: titleForRating(rating, cuisine, rng),
        body: bodyForRating(restaurant, cuisine, rating, rng),
        date,
        helpful,
        unhelpful,
        edited: rng() < 0.12,
        ...(ownerResponse ? { ownerResponse } : {})
      });
    }
  }

  // Second pass: add random reviews until target count is reached.
  while (reviewList.length < targetCount) {
    const restaurant = pick(restaurants, rng);
    const rating = sampleRating(rng);
    const cuisine = pick(restaurant.foodStyles, rng);
    const date = buildReviewDate(baseDate, Math.floor(rng() * 300));
    const helpfulBase = rating >= 4 ? 6 : rating === 3 ? 3 : 1;
    const helpful = helpfulBase + Math.floor(rng() * 16);
    const unhelpful = rating <= 2 ? Math.floor(rng() * 9) : Math.floor(rng() * 5);
    const ownerResponse = maybeOwnerResponse(rating, date, rng);

    reviewList.push({
      restaurantId: restaurant.id,
      userId: pick(studentUserIds, rng),
      rating,
      title: titleForRating(rating, cuisine, rng),
      body: bodyForRating(restaurant, cuisine, rating, rng),
      date,
      helpful,
      unhelpful,
      edited: rng() < 0.10,
      ...(ownerResponse ? { ownerResponse } : {})
    });
  }

  return reviewList;
}

const reviews = generateReviews(200);

// ─── Seeder ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear collections
  await Promise.all([User.deleteMany({}), Restaurant.deleteMany({}), Review.deleteMany({})]);
  console.log('Cleared existing data');

  // Insert restaurants (no password hashing needed)
  await Restaurant.insertMany(restaurants);
  console.log(`Inserted ${restaurants.length} restaurants`);

  // Insert users one by one
  for (const rawUser of usersRaw) {
    const user = new User(rawUser);
    await user.save();
  }
  console.log(`Inserted ${usersRaw.length} users`);

  // Insert reviews
  await Review.insertMany(reviews);
  console.log(`Inserted ${reviews.length} reviews`);

  // Sync restaurant rating stats with actual seeded reviews.
  const reviewStats = await Review.aggregate([
    {
      $group: {
        _id: '$restaurantId',
        ratingCount: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  const statsByRestaurantId = new Map(
    reviewStats.map((stat) => [
      stat._id,
      {
        ratingCount: stat.ratingCount,
        rating: Math.round(stat.avgRating * 10) / 10
      }
    ])
  );

  const restaurantRatingUpdates = restaurants.map((restaurant) => {
    const stat = statsByRestaurantId.get(restaurant.id);
    return {
      updateOne: {
        filter: { id: restaurant.id },
        update: {
          $set: {
            ratingCount: stat ? stat.ratingCount : 0,
            rating: stat ? stat.rating : 0
          }
        }
      }
    };
  });
  await Restaurant.bulkWrite(restaurantRatingUpdates);
  console.log('Synced restaurant rating counts and averages from seeded reviews');

  console.log('\n✅ Seed complete!');
  console.log('Test credentials:');
  console.log('  Regular user: miguel.tan@dlsu.test / password123');
  console.log('  Owner:        robert.chen@business.test / owner123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
