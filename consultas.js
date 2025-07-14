import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "patitasfelices",
  password: "tiago123",
  port: 5432,
});

export const modificarUsuario = async (
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

  const values = [
    nombre,
    email,
    password,
    direccion,
    telefono,
    imgPerfil_url,
    id,
  ];

  const { rowCount, rows } = await pool.query(consulta, values);

  if (rowCount === 0) {
    throw {
      code: 404,
      message: `No se consiguió ningún usuario con id ${id} para modificar`,
    };
  }

  return rows[0];
};

export const agregarPublicacion = async (req, res) => {
  const { articulos, descripcion, precio, disponibilidad, img_url } = req.body;
  console.log("Token decodificado:", req.user)
  const propietario_ID = req.user.id; 
  if (!propietario_ID) {
    return res.status(401).json({error: "No se encontró el ID del usuario en el token"})
  }
  
    try {
      const consulta = `
        INSERT INTO POSTS_PRODUCTOS 
        (ARTICULOS, DESCRIPCION, PRECIO, DISPONIBILIDAD, propietario_ID, fecha_publicacion, img_url) 
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
 export const agregarAFavorito = async (interesado_ID, articulo_ID) => {
  const consulta = `
    INSERT INTO FAVORITOS (interesado_ID, articulo_ID)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [interesado_ID, articulo_ID];
  const result = await pool.query(consulta, values);
  return result.rows[0];
};

export const obtenerFavoritosPorUsuario = async (interesado_ID) => {
  const query = `
    SELECT p.*
    FROM FAVORITOS f
    JOIN POSTS_PRODUCTOS p ON f.articulo_ID = p.id
    WHERE f.interesado_ID = $1
  `;
  const { rows } = await pool.query(query, [interesado_ID]);
  return rows;
};
