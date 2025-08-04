// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crear carpeta
app.post('/folders', (req, res) => {
  const folderName = req.body.folder;
  if (!folderName) {
    return res.status(400).json({ message: 'Nombre de carpeta requerido' });
  }

  const folderPath = path.join(__dirname, 'uploads', folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('📁 Carpeta creada:', folderPath);
    return res.status(201).json({ message: 'Carpeta creada' });
  } else {
    return res.status(200).json({ message: 'La carpeta ya existe' });
  }
});
// Listar carpetas en /uploads
app.get('/folders', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    return res.json([]); // sin carpetas
  }

  const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
  const folders = items
    .filter(item => item.isDirectory())
    .map(dir => dir.name);

  res.json(folders);
});

// Subir imagen a carpeta
app.post('/upload/:folder', (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(__dirname, 'uploads', folder);

  const dynamicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname.toLowerCase();
      cb(null, uniqueName);
    }
  });

  const uploadToFolder = multer({ storage: dynamicStorage }).single('image');

  uploadToFolder(req, res, function (err) {
    if (err || !req.file) {
      return res.status(500).json({ error: 'Error subiendo archivo' });
    }

    const fileUrl = `http://localhost:${PORT}/uploads/${folder}/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });
});

// Listar imagenes de una carpeta
app.get('/images/:folder', (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(__dirname, 'uploads', folder);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ message: 'Carpeta no encontrada' });
  }

  const files = fs.readdirSync(folderPath);
  const images = files.map(file => ({
    filename: file,
    url: `http://localhost:${PORT}/uploads/${folder}/${file}`
  }));

  res.json(images);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
