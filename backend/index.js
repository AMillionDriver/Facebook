
const express = require('express');
const cors = require('cors');
const path = require('path');


const app = express();
// Ganti URL berikut dengan domain frontend Vercel kamu jika sudah pasti
const allowedOrigins = [
  'https://facebook-media-downloader.vercel.app', // contoh, ganti sesuai domain Vercel kamu
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());


// Endpoint untuk mengirim file hasil download ke frontend (REAL)
const fs = require('fs');
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

app.get('/api/file', (req, res) => {
  const file = req.query.filename;
  if (!file) return res.status(400).json({ error: 'Parameter filename wajib diisi' });
  const filePath = path.join(DOWNLOAD_DIR, file);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ error: 'File tidak ditemukan' });
    res.download(filePath, file, (err) => {
      if (err) {
        res.status(500).json({ error: 'Gagal mengirim file' });
      }
    });
  });
});


app.get('/', (req, res) => {
  res.send('Backend Facebook Media Downloader is running!');
});


const { exec } = require('child_process');


// Endpoint untuk menerima URL dari frontend, proses yt-dlp, dan unduh file
app.post('/api/download', (req, res) => {
  const { url, format_id } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validasi URL Facebook
  const isValidFacebookUrl = (input) => {
    return /^https?:\/\/(www\.)?facebook\.com\//.test(input);
  };
  if (!isValidFacebookUrl(url)) {
    return res.status(400).json({ error: 'URL bukan URL Facebook yang valid' });
  }

  // 1. Ambil info media dulu
  exec(`yt-dlp -j "${url}"`, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
    if (error) {
      let message = stderr || error.message || 'Gagal memproses URL';
      return res.status(500).json({ error: message });
    }
    let info;
    try {
      info = JSON.parse(stdout);
    } catch (err) {
      return res.status(500).json({ error: 'Gagal parsing hasil yt-dlp', detail: err.message });
    }
    if (!info || !info.formats || info.formats.length === 0) {
      return res.status(404).json({ error: 'Media tidak ditemukan atau tidak dapat diunduh.' });
    }

    // 2. Pilih format terbaik atau sesuai permintaan user
    let selectedFormat = info.formats[0];
    if (format_id) {
      selectedFormat = info.formats.find(f => f.format_id === format_id) || info.formats[0];
    }

    // 3. Unduh file ke folder downloads
    const safeTitle = (info.title || 'facebook-media').replace(/[^a-z0-9\-_]/gi, '_');
    const ext = selectedFormat.ext || 'mp4';
    const filename = `${safeTitle}_${Date.now()}.${ext}`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);
    const ytdlpCmd = `yt-dlp -f ${selectedFormat.format_id} -o "${outputPath}" "${url}"`;
    exec(ytdlpCmd, { maxBuffer: 1024 * 1024 * 20 }, (err2, stdout2, stderr2) => {
      if (err2) {
        return res.status(500).json({ error: stderr2 || err2.message || 'Gagal mengunduh file' });
      }
      // 4. Kirim info ke frontend, termasuk nama file hasil unduhan
      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        formats: info.formats,
        url: info.webpage_url,
        type: ext,
        filename,
        info,
      });
    });
  });
});

if (require.main === module) {

  if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  module.exports = app;
}

module.exports = app;
