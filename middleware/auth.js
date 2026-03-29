// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireOwner(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (!req.session.user.isOwner) {
    return res.status(403).render('403', { title: 'Access Denied' });
  }
  next();
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect(req.session.user.isOwner ? '/owner/dashboard' : '/');
  }
  next();
}

module.exports = { requireLogin, requireOwner, redirectIfLoggedIn };
