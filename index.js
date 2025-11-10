const express = require("express");
const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware base
app.use(express.json());

// Configuración CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Conexión MySQL
const pool = require("./connection");

// Rutas principales
app.get("/", (req, res) => res.send("API de productos - funcionando"));

// ==========================
// RUTAS DE PRODUCTOS
// ==========================
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, stock, created_at FROM products"
    );
    res.json(rows);
  } catch (e) {
    console.error("GET /api/products error:", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, stock, created_at FROM products WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (e) {
    console.error("GET /api/products/:id error:", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/api/products", async (req, res) => {
  const { name, description, price, stock } = req.body;
  if (!name || price == null)
    return res
      .status(400)
      .json({ error: "Los campos name y price son obligatorios" });

  try {
    const sql =
      "INSERT INTO products (name, description, price, stock, created_at) VALUES (?, ?, ?, ?, NOW())";
    const [result] = await pool.query(sql, [
      name,
      description || null,
      price,
      stock || 0,
    ]);
    res.status(201).json({ id: result.insertId, message: "Producto creado" });
  } catch (e) {
    console.error("POST /api/products error:", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE products SET name=?, description=?, price=?, stock=? WHERE id=?",
      [name, description, price, stock, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto actualizado correctamente" });
  } catch (e) {
    console.error("PUT /api/products/:id error:", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (e) {
    console.error("DELETE /api/products/:id error:", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================
// RUTAS DE USUARIOS
// ==========================
app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, created_at, status FROM users"
    );
    res.json(rows);
  } catch (e) {
    console.error("/usuarios GET error", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/usuarios", async (req, res) => {
  const { nombre, name, email, status } = req.body;
  const userName = nombre || name;
  if (!userName || !email)
    return res.status(400).json({ error: "nombre y email son obligatorios" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "email inválido" });

  try {
    const userStatus = status == null ? 1 : status;
    const [result] = await pool.query(
      "INSERT INTO users (name, email, created_at, status) VALUES (?, ?, NOW(), ?)",
      [userName, email, userStatus]
    );
    res.status(201).json({ id: result.insertId, message: "Usuario creado" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "email duplicado" });
    console.error("/usuarios POST error", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================
// EJECUTAR SEED (productos)
// ==========================
app.post("/setup/run", async (req, res) => {
  try {
    console.log("setup/run: start");
    const { ejecutarSeed } = require("./Productos");
    const result = await ejecutarSeed();
    console.log("setup/run: seed finished", result && result.success);

    if (result.success)
      return res.json({
        message: "Seed ejecutado correctamente",
        inserted: result.inserted,
      });

    res.status(500).json({ error: result.error || "Error al ejecutar seed" });
  } catch (e) {
    console.error("setup/run error", e);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================
// RUTAS DE COMPRAS
// ==========================
const purchasesRouter = require("./purchases");
app.use(purchasesRouter);

// ==========================
// INICIO DEL SERVIDOR
// ==========================
app.listen(port, () =>
  console.log(`✅ Servidor corriendo en: http://localhost:${port}`)
);
