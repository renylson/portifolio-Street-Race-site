const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const inscricaoRoutes = require('./routes/inscricao');
const dbConfig = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'street-race-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    secure: false, // HTTP em desenvolvimento, HTTPS apenas com proxy reverso
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas API
app.use('/api', authRoutes);
app.use('/api', inscricaoRoutes);

// Rota raiz redireciona para index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Rotas sem extensão .html
app.get('/edital', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/edital.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚗 Street Race - Mecânica Automotiva');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Página principal: http://localhost:${PORT}/`);
  console.log(`📝 Edital: http://localhost:${PORT}/edital`);
  console.log(`🔐 Painel Admin: http://localhost:${PORT}/admin`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  dbConfig.close();
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  dbConfig.close();
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});