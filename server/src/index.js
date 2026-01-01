require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDatabase = require('./configs/database');
const path = require("path");
const fs = require("fs");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const MongoStore = require('connect-mongo').default;

const http = require('http');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// 1. Security Headers & Compression
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow loading images from uploads
}));
app.use(compression());
app.use(morgan('dev')); // Use 'common' or 'combined' in production

// 2. Body Parser & Cookie Parser
app.use(express.json());
app.use(cookieParser());

// 3. CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'https://zelzec.com', 'https://admin.zelzec.com'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// 4. Rate Limiting (DDoS Protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

// Apply rate limiting to all requests that start with /api
app.use('/api/', apiLimiter);

// 5. Session Management with MongoStore
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // = 14 days. Default
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
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
app.use('/api/v1/bug', require('./routes/bug.route'));

app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(filepath)) {
    // Manually handle CORS for images if needed, though Helmet handles resource policy now
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: "Image not found" });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);

  if (err.message === "Only .jpeg, .jpg, .png and .webp format allowed!") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB."
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server Running On Port : ${PORT}`);
  console.log(`Checking Admin Routes...`);
  connectDatabase();
});