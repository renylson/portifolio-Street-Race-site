const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');
const db = dbConfig.getDatabase();

class AuthController {
  login(req, res) {
    const { username, password } = req.body;
    
    const user = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
    
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ success: true, message: 'Login realizado com sucesso' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  }

  logout(req, res) {
    req.session.destroy();
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  }

  checkAuth(req, res) {
    if (req.session.userId) {
      res.json({ authenticated: true, username: req.session.username });
    } else {
      res.json({ authenticated: false });
    }
  }

  changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.session.userId);
      
      if (bcrypt.compareSync(currentPassword, user.password)) {
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(hashedPassword, req.session.userId);
        res.json({ success: true, message: 'Senha alterada com sucesso' });
      } else {
        res.status(401).json({ success: false, message: 'Senha atual incorreta' });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ success: false, message: 'Erro ao alterar senha' });
    }
  }

  createUser(req, res) {
    try {
      const { username, password, permissions } = req.body;
      
      const existingUser = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Usuário já existe' });
      }
      
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Senha deve ter no mínimo 6 caracteres' });
      }
      
      if (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ success: false, message: 'Nome de usuário inválido (mín. 3 caracteres, apenas letras, números e _)' });
      }
      
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const result = db.prepare('INSERT INTO usuarios (username, password) VALUES (?, ?)').run(username, hashedPassword);
      
      if (result.changes > 0) {
        res.json({ success: true, message: 'Usuário criado com sucesso' });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao criar usuário' });
      }
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AuthController();

module.exports = new AuthController();