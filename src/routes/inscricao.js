const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');
const { requireAuth } = require('../middleware/auth');

// Rotas de inscrição
router.post('/inscricao', (req, res) => inscricaoController.create(req, res));
router.get('/inscricoes', requireAuth, (req, res) => inscricaoController.list(req, res));
router.delete('/inscricao/:id', requireAuth, (req, res) => inscricaoController.delete(req, res));
router.patch('/inscricao/:id/status', requireAuth, (req, res) => inscricaoController.updateStatus(req, res));

module.exports = router;

module.exports = router;