const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "vocal" || file.fieldname === "fichierJoint") {
            cb(null, "");
        } else {
            cb(new Error("Champ non reconnu"), false);
        }
    },
    filename: (req, file, cb) => {
        // Récupérer le nom du fichier original sans l'extension
        const originalName = path.parse(file.originalname).name;
        // Récupérer l'extension du fichier
        const ext = path.extname(file.originalname);
        // Créer le nouveau nom de fichier avec le chemin complet
        const fullPath = path.join(originalName + ext);
        cb(null, fullPath);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = {
        vocal: ["audio/mp3", "audio/mpeg"],
        fichierJoint: ["application/pdf", "image/png", "image/jpeg"],
    };

    if (allowedMimeTypes[file.fieldname]?.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non accepté"), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;