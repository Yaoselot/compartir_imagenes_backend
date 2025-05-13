const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();

// midleware
app.use(cors());

// configuración de multer (para manejar archivos en la memoria)
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

// configuración de AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// ruta para subir el archivo
app.post('/upload', upload.single('imagen'), (req, res) => {
    if(!req.file) {
        return res.status(400).json({error: 'no se subio ningún archivo'});
    }

    const params = {
        Bucket: process.env.S3_BUCKET_NAME, 
        Key: Date.now() + '_' + req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error al subir a S3:', err);
            return res.status(500).json({error: 'Error al subir el archivo'});
        }
        res.json({url: data.Location});
    });
});

// inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen (PORT, () => {
    console.log(`Servidor corriendo en el puerto:  ${PORT}`);
});