require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "clavePorDefectoSiNoHayEnv";

module.exports = JWT_SECRET;
