import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import helmet from 'helmet';

// ES Modules tidak memiliki __dirname, jadi kita perlu membuatnya
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk keamanan
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "cdnjs.cloudflare.com", "cdn.tailwindcss.com"],
            "style-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            "img-src": ["'self'", "data:", "https:"],
            "font-src": ["'self'", "cdnjs.cloudflare.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
}));

// Menggunakan compression middleware
app.use(compression());

// Cache control untuk static files
const cacheTime = 86400000 * 30; // 30 hari
app.use(express.static(join(__dirname, 'public'), {
    maxAge: cacheTime,
    etag: true,
    setHeaders: (res, path) => {
        // Tambahkan header cache-control untuk optimasi
        if (path.endsWith('.html')) {
            // HTML tidak di-cache terlalu lama
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
            // Gambar di-cache lebih lama
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Route utama
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(join(__dirname, 'public'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});