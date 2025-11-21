const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de autenticação
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/check-auth', (req, res) => authController.checkAuth(req, res));
router.post('/change-password', (req, res) => authController.changePassword(req, res));
router.post('/create-user', (req, res) => authController.createUser(req, res));

module.exports = router;

module.exports = router;