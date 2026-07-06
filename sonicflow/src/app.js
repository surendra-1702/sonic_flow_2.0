const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      fontSrc: ["'self'", "https:", "data:"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/history', require('./routes/history'));
app.use('/api/queue', require('./routes/queue'));

const mongoose = require('mongoose');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/audio/:songId', async (req, res) => {
  try {
    const Song = require('./models/Song');
    const song = await Song.findById(req.params.songId).lean();
    if (!song || !song.cloudinaryAudioUrl) {
      return res.status(404).json({ error: 'Audio not found' });
    }
    const url = new URL(song.cloudinaryAudioUrl);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      headers: {},
    };
    if (req.headers.range) opts.headers['Range'] = req.headers.range;
    require('https').get(opts, (proxyRes) => {
      res.set({
        'Content-Type': proxyRes.headers['content-type'] || 'audio/mpeg',
        'Content-Length': proxyRes.headers['content-length'],
        'Accept-Ranges': 'bytes',
      });
      if (req.headers.range && proxyRes.headers['content-range']) {
        res.status(206);
        res.set('Content-Range', proxyRes.headers['content-range']);
      }
      proxyRes.pipe(res);
    }).on('error', () => res.status(502).json({ error: 'Audio proxy failed' }));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

module.exports = app;
