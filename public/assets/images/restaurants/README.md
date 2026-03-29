# Restaurant Images Naming Convention

## File Naming Format
Use the restaurant ID from `data.js` as the image filename:

- **Format**: `{RESTAURANT_ID}.jpg` or `{RESTAURANT_ID}.png`
- **Example**: `R001.jpg`, `R002.png`, etc.

## Usage in Application
Restaurant images are dynamically loaded in:
- Homepage (12 featured restaurants)
- Restaurant list page (all restaurants)
- Restaurant detail page (hero image)
- Profile page (visited restaurants)
- Search results

## Current Restaurant IDs

### Inside Campus (R001-R010)
- R001 - Chef Babs
- R002 - Colonel's Curry
- R003 - Kitchen City
- R004 - Potato Corner
- R005 - Dairy Queen
- R006 - Fruitas
- R007 - Kitchen City Razon
- R008 - Coffee Bean & Tea Leaf (Library)
- R009 - Andrew Canteen
- R010 - Perico's Canteen

### Outside Campus (R011-R031)
- R011 - Ate Rica's
- R012 - Good Munch
- R013 - Kuya Mel's Kitchen
- R014 - Dixie's
- R015 - Babe Mike Shawarma
- R016 - 24 Chicken
- R017 - Zark's Burgers
- R018 - Bonchon
- R019 - KFC
- R020 - Burger King
- R021 - Sbarro
- R022 - Bok Chicken
- R023 - Gang Gang Chicken
- R024 - Kuh Meal
- R025 - Subway
- R026 - Samgyupsalamat
- R027 - Seolhajung
- R028 - El Poco Cantina
- R029 - Coffee Bean & Tea Leaf (Archer's)
- R030 - Eat Fresh HK
- R031 - Romantic Baboy

## Recommended Image Specifications
- **Format**: JPG or PNG
- **Dimensions**: 400x300px (4:3 aspect ratio)
- **File Size**: Keep under 500KB for fast loading
- **Optimization**: Compress images before uploading

## Fallback
If no image is found, the system will display a placeholder image with the restaurant name.

## Related Folders
- **Profile Images**: `../profiles/` - User avatars (150x150px)
- **Logos**: `../logos/` - DLSU Eats branding assets
- **Icons**: `../icons/` - UI icons and graphics
