function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/signin");
  }

  next();
}

module.exports = isAuthenticated;
