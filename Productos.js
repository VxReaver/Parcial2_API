const pool = require("./connection");

async function ejecutarSeed() {
  try {
    const crearTabla = `CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100),
      description VARCHAR(255),
      price DECIMAL(10,2),
      stock INT,
      created_at DATETIME
    )`;
    await pool.query(crearTabla);

    const crearUsers = `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      created_at DATETIME,
      status INT
    )`;
    const crearPaymentTypes = `CREATE TABLE IF NOT EXISTS payment_types (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50),
      description VARCHAR(150)
    )`;
    await pool.query(crearUsers);
    await pool.query(crearPaymentTypes);

    const insertPaymentTypes = `INSERT IGNORE INTO payment_types (name, description) VALUES
      ('Efectivo', 'Pago realizado en efectivo en tienda'),
      ('Tarjeta de Débito', 'Pago con tarjeta de débito bancaria'),
      ('Transferencia Bancaria', 'Pago mediante transferencia interbancaria'),
      ('PayPal', 'Pago realizado por plataforma PayPal'),
      ('Apple Pay', 'Pago mediante Apple Pay'),
      ('Google Pay', 'Pago mediante Google Pay')`;
    await pool.query(insertPaymentTypes);

    const insertUsers = `INSERT IGNORE INTO users (name, email, created_at, status) VALUES
      ('Juan Pérez', 'juan.perez@example.com', NOW(), 1),
      ('María López', 'maria.lopez@example.com', NOW(), 1),
      ('Carlos Hernández', 'carlos.hernandez@example.com', NOW(), 1),
      ('Ana Torres', 'ana.torres@example.com', NOW(), 1),
      ('Luis Gómez', 'luis.gomez@example.com', NOW(), 1),
      ('Laura Jiménez', 'laura.jimenez@example.com', NOW(), 1),
      ('Pedro Sánchez', 'pedro.sanchez@example.com', NOW(), 1),
      ('Sofía Vargas', 'sofia.vargas@example.com', NOW(), 0),
      ('Miguel Díaz', 'miguel.diaz@example.com', NOW(), 0),
      ('Daniela Cruz', 'daniela.cruz@example.com', NOW(), 0)`;
    await pool.query(insertUsers);

    await pool.query("SET FOREIGN_KEY_CHECKS=0");
    await pool.query("DELETE FROM products");
    await pool.query("SET FOREIGN_KEY_CHECKS=1");

    // 🎮 PRODUCTOS DE TIENDA DE VIDEOJUEGOS
    const productos = [
      [
        "PlayStation 5",
        "Consola PS5 con lector de discos y mando DualSense incluido",
        13999.0,
        20,
      ],
      [
        "Xbox Series X",
        "Consola Xbox Series X 1TB con mando inalámbrico",
        13499.0,
        15,
      ],
      [
        "Nintendo Switch OLED",
        "Consola Nintendo Switch modelo OLED color blanco",
        8999.0,
        25,
      ],
      [
        "The Legend of Zelda: Tears of the Kingdom",
        "Videojuego para Nintendo Switch, aventura de mundo abierto",
        1699.0,
        40,
      ],
      [
        "Call of Duty: Modern Warfare III",
        "Shooter en primera persona para PS5",
        1799.0,
        30,
      ],
      [
        "FIFA 25",
        "Simulador de fútbol con licencias oficiales, versión PS5",
        1599.0,
        35,
      ],
      [
        "Mando DualSense PS5",
        "Control inalámbrico original para PlayStation 5",
        1799.0,
        50,
      ],
      [
        "Control Xbox Series X/S",
        "Mando inalámbrico compatible con Xbox y PC",
        1599.0,
        45,
      ],
      [
        "Headset Logitech G435",
        "Audífonos gamer inalámbricos con micrófono",
        1899.0,
        25,
      ],
      [
        "Silla Gamer Razer Iskur",
        "Silla ergonómica de cuero sintético con soporte lumbar",
        7999.0,
        10,
      ],
      [
        "Teclado Mecánico HyperX Alloy Origins",
        "Teclado RGB switches Red lineales",
        2299.0,
        20,
      ],
      [
        "Mouse Gamer Logitech G502 Hero",
        "Mouse óptico programable RGB",
        1299.0,
        35,
      ],
      [
        'Monitor ASUS TUF Gaming 27"',
        "Monitor Full HD 165Hz con FreeSync Premium",
        5299.0,
        12,
      ],
      [
        "Tarjeta de Regalo PlayStation 1000 MXN",
        "Código digital canjeable en PlayStation Store",
        1000.0,
        100,
      ],
      [
        "Tarjeta de Regalo Xbox 1000 MXN",
        "Código digital canjeable en Microsoft Store",
        1000.0,
        100,
      ],
      [
        "Control Pro Nintendo Switch",
        "Control oficial inalámbrico para Switch",
        1999.0,
        30,
      ],
      [
        "Spider-Man 2 PS5",
        "Videojuego exclusivo de PlayStation 5, acción y aventura",
        1799.0,
        25,
      ],
      [
        "Grand Theft Auto V (GTA V)",
        "Juego de mundo abierto para Xbox Series X/S",
        999.0,
        40,
      ],
      [
        "God of War Ragnarök",
        "Videojuego para PS5, secuela del aclamado God of War",
        1799.0,
        35,
      ],
      ["Minecraft", "Videojuego sandbox para todas las plataformas", 599.0, 80],
    ];

    const placeholders = productos.map(() => "(?, ?, ?, ?)").join(", ");
    const valores = productos.flat();
    const sqlInsert = `INSERT INTO products (name, description, price, stock) VALUES ${placeholders}`;
    await pool.query(sqlInsert, valores);

    return { success: true, inserted: productos.length };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

if (require.main === module) {
  ejecutarSeed().then((r) => {
    if (!r.success) process.exit(1);
    process.exit(0);
  });
}

module.exports = { ejecutarSeed };
