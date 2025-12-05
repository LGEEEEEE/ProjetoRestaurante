const jwt = require('jsonwebtoken');
const config = require('../config'); // Importa o config.js que você enviou

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  // Tenta verificar com o segredo de usuário
  jwt.verify(token, config.jwt.userSecret, (err, user) => {
    if (!err) {
      req.user = user;
      // Adiciona o tipo de token para controle posterior se necessário
      req.user.tokenType = 'user';
      return next();
    }

    // Se falhar, tenta verificar com o segredo de dispositivo
    jwt.verify(token, config.jwt.deviceSecret, (err2, device) => {
      if (err2) {
        console.log('Falha na verificação do token:', err2.message);
        return res.sendStatus(403);
      }
      
      req.user = device;
      req.user.tokenType = 'device';
      next();
    });
  });
};

module.exports = authenticateToken; // Exporta diretamente a função, não um objeto
// Se precisar do requireAccess, adicione-o aqui também.