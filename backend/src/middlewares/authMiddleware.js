const jwt = require('jsonwebtoken');

module.exports = (rolesPermitidas = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Token ausente' });

    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
      req.user = decoded;

      // Verifica se o usuário possui pelo menos um dos papéis permitidos
      if (
        rolesPermitidas.length > 0 &&
        !rolesPermitidas.some(role => decoded.roles.includes(role))
      ) {
        return res.status(403).json({ message: 'Permissão negada' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};
