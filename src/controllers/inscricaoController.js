const dbConfig = require('../config/database');
const db = dbConfig.getDatabase();

class InscricaoController {
  create(req, res) {
    try {
      const {
        nomeCompleto,
        passaporte,
        telefone,
        discord,
        horarios,
        experiencia,
        temIndicacao,
        indicacao,
        fichaLimpa,
        regrasRP,
        porqueEntrar,
        objetivos
      } = req.body;

      const stmt = db.prepare(`
        INSERT INTO inscricoes (
          nomeCompleto, passaporte, telefone, discord, horarios,
          experiencia, temIndicacao, indicacao, fichaLimpa, regrasRP, porqueEntrar, objetivos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        nomeCompleto, passaporte, telefone, discord, horarios,
        experiencia, temIndicacao, indicacao || '', fichaLimpa || 'Sim', regrasRP, porqueEntrar, objetivos
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      res.status(500).json({ success: false, message: 'Erro ao salvar inscrição' });
    }
  }

  list(req, res) {
    try {
      const inscricoes = db.prepare('SELECT * FROM inscricoes ORDER BY dataCriacao DESC').all();
      res.json(inscricoes);
    } catch (error) {
      console.error('Erro ao listar inscrições:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar inscrições' });
    }
  }

  delete(req, res) {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM inscricoes WHERE id = ?').run(id);
      res.json({ success: true, message: 'Inscrição deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar inscrição:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar inscrição' });
    }
  }

  updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const statusPermitidos = ['a_analisar', 'aprovado', 'reprovado'];
      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ success: false, message: 'Status inválido' });
      }
      
      db.prepare('UPDATE inscricoes SET status = ? WHERE id = ?').run(status, id);
      res.json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
    }
  }
}

module.exports = new InscricaoController();

module.exports = new InscricaoController();