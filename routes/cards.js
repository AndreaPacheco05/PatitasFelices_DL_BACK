const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { verificarToken } = require("../middleware");
const {
    crearArticulo,
    obtenerArticulos,
    obtenerArticuloPorId,
    actualizarArticulo,
    eliminarArticulo,
    agregarFavorito,
    obtenerFavoritos,
    eliminarFavorito,
} = require("../consultas");

router.post("/articulos", verificarToken, upload.single("img"), crearArticulo);         // POST /articulos
router.get("/articulos", obtenerArticulos);                                             // GET /articulos
router.get("/articulos/:id", obtenerArticuloPorId);                                     // GET /articulos/:id
router.put("/articulos/:id", verificarToken, upload.single("img"), actualizarArticulo); // PUT /articulos/:id
router.delete("/articulos/:id", verificarToken, eliminarArticulo);                      // DELETE /articulos/:id

router.post("/favoritos", verificarToken, agregarFavorito);           // POST /favoritos
router.get("/favoritos", verificarToken, obtenerFavoritos);           // GET /favoritos
router.delete("/favoritos/:id", verificarToken, eliminarFavorito);    // DELETE /favoritos/:id

module.exports = router;
