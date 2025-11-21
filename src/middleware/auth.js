function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Não autorizado' });
  }
}

module.exports = { requireAuth };

module.exports = { requireAuth };