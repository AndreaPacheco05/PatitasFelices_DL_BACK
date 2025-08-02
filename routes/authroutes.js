const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadmiddlewares");
const {
  registrarUsuario,
  loginUsuario,
  obtenerUsuario,
  modificarUsuario,
} = require("../consultas");

router.post("/usuarios", upload.single("img"), registrarUsuario); 
router.post("/login", loginUsuario);                              
router.get("/usuarios/:id", verificarToken, obtenerUsuario);      
router.put("/usuarios/:id", verificarToken, upload.single("img"), modificarUsuario);

module.exports = router;
