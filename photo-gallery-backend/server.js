// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Aumentar el límite de tamaño de las solicitudes
// Esto es útil para subir imágenes grandes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Crear carpeta
app.post("/folders", (req, res) => {
  const folderName = path.normalize(req.body.folder).replace(/^(\.\.(\/|\\|$))+/, '');

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
// Reemplaza tu endpoint actual de /folders con este:
app.get("/folders", (req, res) => {
  const basePath = path.join(__dirname, "uploads");

  const getFoldersRecursively = (dirPath, parent = '') => {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let folders = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const relativePath = parent ? `${parent}/${entry.name}` : entry.name;
        folders.push(relativePath);

        // Buscar subcarpetas recursivamente
        const subFolders = getFoldersRecursively(
          path.join(dirPath, entry.name),
          relativePath
        );

        folders = folders.concat(subFolders);
      }
    }

    return folders;
  };

  try {
    const folders = getFoldersRecursively(basePath);
    res.json(folders);
  } catch (error) {
    console.error("❌ Error leyendo carpetas:", error);
    res.status(500).json({ error: "Error leyendo carpetas" });
  }
});



// Subir imagen a carpeta
app.post('/upload/*', (req, res) => {
  const folder = req.params[0] || ''; // Esto captura 'asd/dos' o cualquier subcarpeta
  const folderPath = path.join(__dirname, 'uploads', folder);

  // Asegurarse que la carpeta exista
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Configuración dinámica de multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname.toLowerCase();
      cb(null, uniqueName);
    },
  });

  const upload = multer({ storage }).single('image');

  upload(req, res, function (err) {
    if (err || !req.file) {
      console.error('❌ Error al subir:', err);
      return res.status(500).json({ error: 'Error al subir archivo' });
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

  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const files = fs.readdirSync(folderPath)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return validExtensions.includes(ext);
  });

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
