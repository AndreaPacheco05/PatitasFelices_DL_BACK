const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { verificarToken } = require("../middleware");
const {
  registrarUsuario,
  loginUsuario,
  obtenerUsuario,
  actualizarUsuario,
} = require("../consultas");

router.post("/usuarios", upload.single("img"), registrarUsuario); 
router.post("/login", loginUsuario);                              
router.get("/usuarios/:id", verificarToken, obtenerUsuario);      
router.put("/usuarios/:id", verificarToken, upload.single("img"), actualizarUsuario);

module.exports = router;
