require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDatabase = require('./configs/database');
const path = require("path");
const fs = require("fs");
const cookieParser = require('cookie-parser')

const http = require('http');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://zelzec.com', 'https://admin.zelzec.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
});

app.use(sessionMiddleware);

// Initialize Socket.IO
initializeSocket(server, sessionMiddleware);

const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/admin', require('./routes/admin.route'));
app.use('/api/v1/category', require('./routes/category.routes'));
app.use('/api/v1/product', require('./routes/product.routes'));
app.use('/api/v1/visitor', require('./routes/visitor.route'));
app.use('/api/v1/chat', require('./routes/chat.route'));

app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(filepath)) {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: "Image not found" });
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server Running On Port : ${PORT}`);
  console.log(`Checking Admin Routes...`);
  connectDatabase();
});