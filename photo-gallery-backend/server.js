// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Aumentar el límite de tamaño de las solicitudes
// Esto es útil para subir imágenes grandes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Crear carpeta
app.post("/folders", (req, res) => {
  const folderName = req.body.folder;
  if (!folderName) {
    return res.status(400).json({ message: "Nombre de carpeta requerido" });
  }

  const folderPath = path.join(__dirname, "uploads", folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Carpeta creada:", folderPath);
    return res.status(201).json({ message: "Carpeta creada" });
  } else {
    return res.status(200).json({ message: "La carpeta ya existe" });
  }
});
// Listar carpetas en /uploads
app.get("/folders", (req, res) => {
  const uploadsPath = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadsPath)) {
    return res.json([]); // sin carpetas
  }

  const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
  const folders = items
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name);

  res.json(folders);
});

// Subir imagen a carpeta
app.post("/upload/:folder", (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(__dirname, "uploads", folder);

  const dynamicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname.toLowerCase();
      cb(null, uniqueName);
    },
  });

  const uploadToFolder = multer({ storage: dynamicStorage }).single("image");

  uploadToFolder(req, res, function (err) {
    if (err || !req.file) {
      return res.status(500).json({ error: "Error subiendo archivo" });
    }

    const fileUrl = `http://localhost:${PORT}/uploads/${folder}/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });
});

// Listar imágenes de una carpeta ordenadas por fecha de modificación (más reciente primero)
app.get('/images/:folder', (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(__dirname, 'uploads', folder);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ message: 'Carpeta no encontrada' });
  }

  const files = fs.readdirSync(folderPath);

  const images = files
    .map(file => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      return {
        filename: file,
        url: `http://localhost:${PORT}/uploads/${folder}/${file}`,
        mtime: stat.mtime.getTime() // para ordenar
      };
    })
    .sort((a, b) => b.mtime - a.mtime) // más reciente primero
    .map(({ mtime, ...image }) => image); // elimina mtime del JSON final

  res.json(images);
});

// delete pictures
app.delete('/delete/:folder/:filename', (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', folder, filename);

  console.log('Intentando eliminar:', filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Archivo no encontrado' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar archivo' });
    }
    res.json({ message: 'Archivo eliminado correctamente' });
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
