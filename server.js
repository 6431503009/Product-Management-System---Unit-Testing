const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const cors = require("cors");
const mysql = require("mysql");
module.exports = app; // ตรวจสอบว่ามีบรรทัดนี้อยู่หลังจากกำหนดการประมวลผลคำขอ


const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'pms'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
});

// จุดสิ้นสุดการให้บริการ (Endpoint) สำหรับเพิ่มสินค้าใหม่
app.post('/products', (req, res) => {
  const { name, category, price, stock } = req.body;

  // ตรวจสอบค่าว่างเปล่า
  if (!name || !category || !price || !stock) {
    return res.status(400).json({ message: 'กรุณาระบุค่าทุกฟิลด์ที่จำเป็น' });
  }

  // ตรวจสอบประเภทของค่า
  const invalidFields = [];
  if (typeof name !== 'string') invalidFields.push('name');
  if (typeof category !== 'string') invalidFields.push('category');
  if (typeof price !== 'number') invalidFields.push('price');
  if (typeof stock !== 'number') invalidFields.push('stock');
  if (invalidFields.length > 0) {
    return res.status(400).json({ message: `ประเภทของค่าไม่ถูกต้องสำหรับฟิลด์: ${invalidFields.join(', ')}` });
  }

  // ตรวจสอบเงื่อนไขอื่นๆ
  if (price <= 0 || stock <= 0) {
    return res.status(400).json({ message: 'ราคาและจำนวนสินค้าคงคลังต้องมากกว่า 0' });
  }

  // เพิ่มสินค้าใหม่ลงในฐานข้อมูล
  connection.query(
    'INSERT INTO product (name, category, price, stock) VALUES (?, ?, ?, ?)',
    [name, category, price, stock],
    (err, result) => {
      if (err) throw err;
      const newProduct = { id: result.insertId, name, category, price, stock };
      res.status(201).json(newProduct);
    }
  );
});

// จุดสิ้นสุดการให้บริการ (Endpoint) สำหรับดูรายการสินค้าทั้งหมด
app.get('/products', (req, res) => {
  connection.query('SELECT * FROM product', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// จุดสิ้นสุดการให้บริการ (Endpoint) สำหรับแก้ไขสินค้า
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, price, stock } = req.body;

  // ตรวจสอบค่าว่างเปล่า
  if (!name || !category || !price || !stock) {
    return res.status(400).json({ message: 'กรุณาระบุค่าทุกฟิลด์ที่จำเป็น' });
  }

  // ตรวจสอบประเภทของค่า
  const invalidFields = [];
  if (typeof name !== 'string') invalidFields.push('name');
  if (typeof category !== 'string') invalidFields.push('category');
  if (typeof price !== 'number') invalidFields.push('price');
  if (typeof stock !== 'number') invalidFields.push('stock');
  if (invalidFields.length > 0) {
    return res.status(400).json({ message: `ประเภทของค่าไม่ถูกต้องสำหรับฟิลด์: ${invalidFields.join(', ')}` });
  }

  // ตรวจสอบเงื่อนไขอื่นๆ
  if (price <= 0 || stock <= 0) {
    return res.status(400).json({ message: 'ราคาและจำนวนสินค้าคงคลังต้องมากกว่า 0' });
  }

  // อัปเดตข้อมูลสินค้าในฐานข้อมูล
  connection.query(
    'UPDATE product SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?',
    [name, category, price, stock, id],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการ' });
      }
      const updatedProduct = { id, name, category, price, stock };
      res.json(updatedProduct);
    }
  );
});

// จุดสิ้นสุดการให้บริการ (Endpoint) สำหรับลบสินค้า
app.delete('/products', (req, res) => {
  // ลบสินค้าทั้งหมด
  connection.query('DELETE FROM product', (err, result) => {
    if (err) throw err;

    // ตรวจสอบว่าไม่มีสินค้าเหลืออยู่
    connection.query('SELECT COUNT(*) AS count FROM product', (err, countResult) => {
      if (err) throw err;

      if (countResult[0].count === 0) {
        // รีไอดีสินค้าทั้งหมดใหม่
        connection.query('ALTER TABLE product AUTO_INCREMENT = 1', (err) => {
          if (err) throw err;
          
          res.json({ message: 'สินค้าทั้งหมดถูกลบแล้ว และได้รีไอดีสินค้าทั้งหมดใหม่' });
        });
      } else {
        // ควรไม่เกิดกรณีนี้ เพราะลบสินค้าทั้งหมดแล้ว
        res.json({ message: 'พบปัญหาในการลบสินค้า' });
      }
    });
  });
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // ลบสินค้าที่มีไอดีที่ต้องการ
  connection.query('DELETE FROM product WHERE id = ?', [id], (err, result) => {
    if (err) throw err;

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการ' });
    }

    // ตรวจสอบว่าหากลบสินค้าหมดเหลือ ให้ทำการรีไอดีสินค้าทั้งหมดใหม่
    connection.query('SELECT COUNT(*) AS count FROM product', (err, countResult) => {
      if (err) throw err;

      if (countResult[0].count === 0) {
        // รีไอดีสินค้าทั้งหมดใหม่
        connection.query('ALTER TABLE product AUTO_INCREMENT = 1', (err) => {
          if (err) throw err;

          res.json({ message: 'สินค้าถูกลบแล้ว และได้รีไอดีสินค้าทั้งหมดใหม่' });
        });
      } else {
        // ถ้ายังมีสินค้าเหลือ ให้เรียงไอดีใหม่ตามลำดับ
        connection.query('SELECT id FROM product ORDER BY id', (err, idResult) => {
          if (err) throw err;

          // ปรับปรุงลำดับไอดีสินค้าใหม่
          for (let i = 0; i < idResult.length; i++) {
            // ตรวจสอบว่าไอดีปัจจุบันตรงกับที่ต้องการลบ
            if (idResult[i].id > id) {
              // ปรับปรุงไอดีสินค้าที่มีค่าสูงกว่าค่าที่ต้องการลบ
              connection.query('UPDATE product SET id = ? WHERE id = ?', [i + 1, idResult[i].id], (err) => {
                if (err) throw err;
              });
            }
          }

          res.json({ message: 'สินค้าถูกลบแล้ว และได้รีไอดีสินค้าทั้งหมดใหม่' });
        });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังรันที่ พอร์ต ${port}`);
});