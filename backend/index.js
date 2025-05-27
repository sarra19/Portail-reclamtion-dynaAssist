const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MSSQLStore = require('connect-mssql-v2');
const cors = require('cors');
const path = require("path");
const multer = require('multer');
const { sql, connectDB } = require("./config/dbConfig");
const http = require('http'); // Importez le module http
const { Server } = require("socket.io"); // Importez Server de socket.io
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config(); // Charger les variables d'environnement

const app = express();
const indexRouter = require('./routes/index');
const passport = require("passport"); // Import the actual Passport library

app.use(cors({
    origin: ["https://claimflow.onrender.com","https://portail-reclamtion-mern-erp.onrender.com"], // Remplace par ton domaine de production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Permet l'envoi des cookies
}));

// Configuration de la session
// app.use(
//   session({
//     secret: "secret", // Clé secrète pour signer les cookies
//     resave: false,
//     saveUninitialized: false,
//     store: new MSSQLStore({
//         user: "sarra", // Nom d'utilisateur SQL Server
//         password: "0000", // Mot de passe SQL Server
//         server: "SARRA\\BCDEMO", // Nom du serveur SQL Server (escaped backslash)
//         database: "Demo Database BC (24-0)", // Nom de la base de données
//         options: {
//             encrypt: false, // Désactive le chiffrement (pour développement local)
//             trustServerCertificate: true, // Fait confiance au certificat du serveur
//         },
//     }),
//     cookie: {
//         httpOnly: true, // Empêche l'accès aux cookies côté client
//         secure: false, // Set to true only if using HTTPS
//         sameSite: "none", // Assurez-vous que c'est bien en minuscule
//         maxAge: 1000 * 60 * 60 * 24, // Durée de vie du cookie (1 jour)
//     },
// })
// );

app.use(
  session({
      secret: "secret", // Clé secrète pour signer les cookies
      resave: false,
      saveUninitialized: false,
      cookie: {
          httpOnly: true, // Empêche l'accès aux cookies côté client
          secure: true, // Set to true only if using HTTPS
          sameSite: "none", // Assurez-vous que c'est bien en minuscule
          maxAge: 1000 * 60 * 60 * 24, // Durée de vie du cookie (1 jour)
      },
  })
);

// Middleware pour parser les corps des requêtes
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("./controller/passport.js")(passport);
app.use(passport.initialize());



// Routes
app.use('/', indexRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test pour voir les cookies envoyés
app.use((req, res, next) => {
    console.log("🔹 Cookies envoyés:", res.getHeaders()["set-cookie"]);
    next();
});

// Lancer le serveur
const PORT = process.env.PORT || 8081;

const server = http.createServer(app); // Créez un serveur HTTP à partir de l'application Express
const io = require("socket.io")(8800, {
  cors: {
    origin: "https://portail-reclamtion-mern-erp.onrender.com",
  },
});

global.io = io;


let activeUsers = [];

io.on("connection", (socket) => {
  
//   socket.on("joinRoom", (roomID) => {
//     socket.join(roomID);
//     console.log(`User joined room: ${roomID}`);
// });

    // add new User
    socket.on("new-user-add", (newUserId) => {
        // if user is not added previously
        if (!activeUsers.some((user) => user.userId === newUserId)) {
            activeUsers.push({ userId: newUserId, socketId: socket.id });
            console.log("New User Connected", activeUsers);
        }
        // send all active users to new user
        io.emit("get-users", activeUsers);
    });

    socket.on("disconnect", () => {
        // remove user from active users
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);
        // send all active users to all users
        io.emit("get-users", activeUsers);
    });

    // send message to a specific user
    socket.on("send-message", (data) => {
        const { receiverId } = data;
        const user = activeUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to :", receiverId)
        console.log("Data: ", data)
        if (user) {
            io.to(user.socketId).emit("receive-message", data);
        }
    });
//video



socket.on('screenshot', (data) => {
    // Save the image or do something with it
    console.log('Received screenshot for room', data.roomId);
    console.log('Image data:', data.image);
  });

  socket.on('join room', (roomID) => {
    if (rooms.has(roomID)) {
      rooms.get(roomID).push(socket.id);
    } else {
      rooms.set(roomID, [socket.id]);
    }

    const otherUsers = rooms.get(roomID).filter(id => id !== socket.id);
    socket.emit('all users', otherUsers);

    if (roomMessages[roomID]) {
      socket.emit('chatHistory', roomMessages[roomID]);
    }
  });

  socket.on('sending signal', (payload) => {
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on('returning signal', (payload) => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    if (!roomMessages[roomId]) {
      roomMessages[roomId] = [];
    }

    const chatMessage = { message, id: socket.id };
    roomMessages[roomId].push(chatMessage);
    io.in(roomId).emit('receiveMessage', chatMessage);
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    io.to(roomId).emit('syncStickyNotes', stickyNotes);

    if (drawingrooms[roomId]) {
      socket.emit("loadDrawing", drawingrooms[roomId]);
    } else {
      drawingrooms[roomId] = [];
    }

    if (stickyNotesPerRoom[roomId]) {
      socket.emit('syncStickyNotes', stickyNotesPerRoom[roomId]);
    } else {
      stickyNotesPerRoom[roomId] = []; 
    }

    if (pptData[roomId]) {
      socket.emit('pptUploaded', pptData[roomId]);
    }
  });

  socket.on('uploadPpt', (pptData) => {
    const { roomId, pptFileData } = pptData;

    io.to(roomId).emit('pptUploaded', pptFileData);
  });

  socket.on('slideChanged', ({ roomId, currentIndex }) => {
    socket.to(roomId).emit('slideUpdated', currentIndex);
  });

  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  socket.on('drawing', (data) => {
    const { roomId, ...drawingData } = data;
    if (!drawingrooms[roomId]) {
      drawingrooms[roomId] = [];
    }
    drawingrooms[roomId].push(drawingData);

    socket.to(roomId).emit("drawing", drawingData);
  });

  socket.on("clearBoard", (roomId) => {
    if (drawingrooms[roomId]) {
      drawingrooms[roomId] = [];
    }
    io.to(roomId).emit("clearBoard"); 
  });

  socket.on('createStickyNote', (noteData) => {
    const { roomId, note } = noteData;

    if (!stickyNotesPerRoom[roomId]) {
      stickyNotesPerRoom[roomId] = [];
    }

    stickyNotesPerRoom[roomId].push(note);

    io.to(roomId).emit('syncStickyNotes', stickyNotesPerRoom[roomId]);
  });


  socket.on('updateStickyNote', ({ roomId, note }) => {
    const notesInRoom = stickyNotesPerRoom[roomId] || [];
    const index = notesInRoom.findIndex(n => n.id === note.id);
    if (index !== -1) {
      notesInRoom[index] = note; 
      io.to(roomId).emit('syncStickyNotes', notesInRoom);
    }
  });

  socket.on('deleteStickyNote', ({ roomId, noteId }) => {
    const notesInRoom = stickyNotesPerRoom[roomId] || [];
    const updatedNotes = notesInRoom.filter(note => note.id !== noteId);
    stickyNotesPerRoom[roomId] = updatedNotes;
    io.to(roomId).emit('syncStickyNotes', updatedNotes);
  });

  socket.on('screenSignal', (payload) => {
    socket.to(payload.roomId).emit('screenSignal', {
      signal: payload.signal,
      callerID: socket.id,
    });
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    rooms.forEach((value, key) => {
      if (value.includes(socket.id)) {
        rooms.set(key, value.filter(id => id !== socket.id));
        if (rooms.get(key).length === 0) {
          rooms.delete(key);
        }
      }
    });
    socket.broadcast.emit('user left', socket.id);
  });


});


//video
const storage = multer.memoryStorage();  
const upload = multer({ storage: storage });
 
const rooms = new Map();
const drawingrooms = {};
const roomMessages = {};
const stickyNotesPerRoom = {};
let stickyNotes = [];
let pptData = {};

app.post('/uploadPpt', upload.single('file'), async (req, res) => {
  const { roomId } = req.body;
  const pptFile = req.file;

  if (!pptFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  try {
    // Créer un objet FormData
    const formData = new FormData();
    formData.append('file', pptFile.buffer, { 
      filename: pptFile.originalname,
      contentType: pptFile.mimetype 
    });

    // Envoyer le fichier au backend distant
    const response = await axios.post('https://backend-pi-ecru.vercel.app/upload', formData, {
      headers: formData.getHeaders(),
    });

    const { slides, folder, pdf } = response.data;
    pptData[roomId] = { slides, folder, pdf };

    // Émettre l'événement pour informer les clients
    io.to(roomId).emit('pptUploaded', pptData[roomId]);

    res.status(200).json({ slides, folder, pdf });
  } catch (error) {
    console.error('Error uploading PPT:', error.message);
    res.status(500).json({ error: 'Failed to upload PPT' });
  }
});


  
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("🚀 Serveur démarré sur le port " + PORT);
    });
});