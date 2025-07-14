const jwt = require("jsonwebtoken");
const SECRET_KEY = require("./secretKey");

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        console.log("Token decodificado:", decoded)
        next();
    } catch (error) {
        console.log("Error al verificar el usuario", err)
        res.status(403).json({ error: "Token inválido" });
    }
};

module.exports = { verificarToken };
