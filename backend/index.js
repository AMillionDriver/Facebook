
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint untuk mengirim file hasil download ke frontend (dummy)
app.get('/api/file', (req, res) => {
  // Contoh: kirim file statis dari folder backend (misal: contoh-video.mp4)
  // Nanti ganti dengan file hasil yt-dlp
  const file = req.query.filename || 'contoh-video.mp4';
  const filePath = path.join(__dirname, file);
  res.download(filePath, file, (err) => {
    if (err) {
      res.status(404).json({ error: 'File tidak ditemukan' });
    }
  });
});


app.get('/', (req, res) => {
  res.send('Backend Facebook Media Downloader is running!');
});


const { exec } = require('child_process');

// Endpoint untuk menerima URL dari frontend dan proses yt-dlp
app.post('/api/download', (req, res) => {
  const { url } = req.body;
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

  // Jalankan yt-dlp untuk ambil info media (tanpa download file)
  exec(`yt-dlp -j "${url}"`, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
    if (error) {
      // Cek error umum yt-dlp
      let message = stderr || error.message || 'Gagal memproses URL';
      if (message.includes('unsupported URL')) {
        message = 'URL Facebook tidak didukung atau tidak valid.';
      } else if (message.includes('This video is unavailable')) {
        message = 'Video tidak tersedia atau telah dihapus.';
      } else if (message.includes('Unable to extract')) {
        message = 'Gagal mengekstrak data dari URL. Coba cek kembali URL.';
      }
      return res.status(500).json({ error: message });
    }
    try {
      const info = JSON.parse(stdout);
      if (!info || !info.formats || info.formats.length === 0) {
        return res.status(404).json({ error: 'Media tidak ditemukan atau tidak dapat diunduh.' });
      }
      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        formats: info.formats,
        url: info.webpage_url,
        type: info.ext,
        info,
      });
    } catch (err) {
      res.status(500).json({ error: 'Gagal parsing hasil yt-dlp', detail: err.message });
    }
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
