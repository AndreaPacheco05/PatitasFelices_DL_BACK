const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { verificarToken } = require("../middlewares")
const {agregarPublicacion, agregarAFavorito, obtenerFavoritosPorUsuario} = require("../consultas")
//aqui deben cambiar a su usuario y contraseña para que les funcione, este es el mío
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "patitasfelices",
    password: "tiago123",
    port: 5432,
});

router.get("/publicaciones", async (req, res) => {
    try {
        const consulta = "SELECT * FROM POSTS_PRODUCTOS ORDER BY fecha_publicacion DESC;";
        const {rows} = await pool.query(consulta)
        res.status(200).json(rows)
    } catch (err) {
        console.error("Error al obtener publicaciones", err)
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

router.get("/publicaciones/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM posts_productos WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.post("/publicaciones", verificarToken, agregarPublicacion);


router.post("/favoritos", verificarToken, async (req, res) => {
  const interesado_ID = req.user.id;
  const { articulo_ID } = req.body;

  try {
    const nuevoFavorito = await agregarAFavorito(interesado_ID, articulo_ID);
    res
      .status(201)
      .json({ mensaje: "Agregado a favoritos", favorito: nuevoFavorito });
  } catch (error) {
    console.error("Error al guardar favorito:", error);
    res.status(500).json({ error: "No se pudo guardar el favorito" });
  }
});

router.get("/favoritos", verificarToken, async (req, res) => {
     const interesado_ID = req.user.id;

     try {
       const favoritos = await obtenerFavoritosPorUsuario(interesado_ID);
       res.status(200).json(favoritos);
     } catch (error) {
       console.error("Error al obtener favoritos:", error);
       res.status(500).json({ error: "Error al obtener favoritos" });
     }
})

router.delete("/favoritos/:articuloId", verificarToken, async (req, res) => {
  const interesado_ID = req.user.id;
  const articulo_ID = parseInt(req.params.articuloId);

  try {
    const result = await pool.query(
      "DELETE FROM favoritos WHERE interesado_id = $1 AND articulo_id = $2 RETURNING *",
      [interesado_ID, articulo_ID]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorito no encontrado" });
    }
    res.json({ mensaje: "Favorito eliminado", favorito: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ error: "Error al eliminar favorito" });
  }
});

module.exports = router;
