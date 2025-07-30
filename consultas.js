const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "patitasfelices",
  password: "0407AE",
  port: 5432,
});

const modificarUsuario = async (
  id,
  nombre,
  email,
  password,
  direccion,
  telefono,
  imgPerfil_url
) => {
  const consulta = `
      UPDATE usuarios 
      SET nombre = $1, email = $2, password = $3, direccion = $4, telefono = $5, imgPerfil_url = $6 
      WHERE id = $7
      RETURNING *;
    `;
  const values = [nombre, email, password, direccion, telefono, imgPerfil_url, id];

  const { rowCount, rows } = await pool.query(consulta, values);

  if (rowCount === 0) {
    throw {
      code: 404,
      message: `No se consiguió ningún usuario con id ${id} para modificar`,
    };
  }

  return rows[0];
};

const agregarPublicacion = async (req, res) => {
  const { articulos, descripcion, precio, disponibilidad, img_url } = req.body;
  const propietario_ID = req.usuario.id;

  try {
    const consulta = `
      INSERT INTO posts_productos 
      (articulos, descripcion, precio, disponibilidad, propietario_ID, fecha_publicacion, img_url) 
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING *;
    `;
    const values = [articulos, descripcion, precio, disponibilidad, propietario_ID, img_url];
    const { rows } = await pool.query(consulta, values);

    res.status(201).json({
      mensaje: "Producto publicado exitosamente",
      producto: rows[0],
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al publicar el producto" });
  }
};

module.exports = {
  modificarUsuario,
  agregarPublicacion,
};
