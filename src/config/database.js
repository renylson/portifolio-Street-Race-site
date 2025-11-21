const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

class DatabaseConfig {
  constructor() {
    this.db = new Database(path.join(__dirname, '../../database/mecanica.db'));
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inscricoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomeCompleto TEXT NOT NULL,
        passaporte TEXT NOT NULL,
        telefone TEXT NOT NULL,
        discord TEXT NOT NULL,
        horarios TEXT NOT NULL,
        experiencia TEXT NOT NULL,
        temIndicacao TEXT NOT NULL,
        indicacao TEXT,
        regrasRP TEXT NOT NULL,
        porqueEntrar TEXT NOT NULL,
        objetivos TEXT NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    this.createDefaultAdmin();
  }

  createDefaultAdmin() {
    const checkAdmin = this.db.prepare('SELECT * FROM usuarios WHERE username = ?').get('admin');
    if (!checkAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      this.db.prepare('INSERT INTO usuarios (username, password) VALUES (?, ?)').run('admin', hashedPassword);
      console.log('✅ Usuário admin criado com senha: admin123');
      console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');
    }
  }

  getDatabase() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

module.exports = new DatabaseConfig();