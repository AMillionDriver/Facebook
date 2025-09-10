import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: string }
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('fb-downloader-darkmode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('fb-downloader-darkmode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const isValidFacebookUrl = (input) => {
    // Validasi sederhana: harus mengandung facebook.com dan https?://
    return /^https?:\/\/(www\.)?facebook\.com\//.test(input);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!isValidFacebookUrl(url)) {
      setError('Masukkan URL Facebook yang valid!');
      setNotification({ type: 'error', message: 'URL tidak valid!' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setLoading(true);
    try {
  const response = await fetch('https://facebookbackend-8f0ce7747774.herokuapp.com/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Terjadi kesalahan saat memproses download.');
        setNotification({ type: 'error', message: data.error || 'Download gagal!' });
        setLoading(false);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      setResult({
        type: data.type,
        url: data.formats && data.formats[0] ? data.formats[0].url : '',
        filename: data.title ? data.title + '.' + data.type : 'download',
        title: data.title,
        thumbnail: data.thumbnail,
      });
      setNotification({ type: 'success', message: 'Berhasil mendapatkan data media!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError('Gagal terhubung ke server.');
      setNotification({ type: 'error', message: 'Gagal terhubung ke server.' });
      setTimeout(() => setNotification(null), 3000);
    }
    setLoading(false);
  };

  return (
    <div className={`App${darkMode ? ' dark' : ''}`}>
      {/* Notifikasi sukses/gagal */}
      {notification && (
        <div className={`notification ${notification.type} fade-in`}>
          {notification.message}
        </div>
      )}
      <header className="App-header">
        <button
          onClick={toggleDarkMode}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: darkMode ? '#222' : '#eee',
            color: darkMode ? '#fff' : '#222',
            border: 'none',
            borderRadius: 20,
            padding: '8px 18px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px #0002',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <h1>Facebook Media Downloader</h1>
        <p>Masukkan URL video, reels, atau foto Facebook yang ingin didownload:</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: 16 }}>
          <input
            type="text"
            placeholder="Paste Facebook URL here..."
            value={url}
            onChange={handleInputChange}
            style={{ width: 320, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#1877f2', color: '#fff', border: 'none', fontWeight: 'bold' }}>
            Download
          </button>
        </form>

        {/* Error user-friendly */}
        {error && (
          <div className="fade-in error-box" style={{ marginTop: 24, color: '#fff', background: '#e74c3c', padding: 16, borderRadius: 8, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: '0 2px 8px #0002' }}>
            <span style={{ fontSize: 28, marginRight: 8, flexShrink: 0 }}>⚠️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Terjadi Kesalahan</div>
              <div>{error}</div>
              <div style={{ fontSize: 13, marginTop: 8, color: '#fff9' }}>
                Coba cek kembali URL Facebook, koneksi internet, atau ulangi beberapa saat lagi.
              </div>
            </div>
          </div>
        )}

        {/* Komponen loading/progress */}
        {loading && (
          <div className="fade-in" style={{ marginTop: 32 }}>
            <div className="loader" />
            <p style={{ color: '#fff', marginTop: 12 }}>Memproses download...</p>
          </div>
        )}

        {/* Preview hasil download (dummy) */}
        {result && !loading && (
          <div className="fade-in" style={{ marginTop: 32, background: '#fff', color: '#222', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001', minWidth: 320 }}>
            <h3>Preview Hasil Download</h3>
            {result.type === 'video' ? (
              <video src={result.url} controls width="320" style={{ borderRadius: 8, marginBottom: 12 }} />
            ) : (
              <img src={result.url} alt="Preview" width="320" style={{ borderRadius: 8, marginBottom: 12 }} />
            )}
            <div>
              <a href={result.url} download={result.filename} style={{ textDecoration: 'none', color: '#fff' }}>
                <button style={{ padding: '8px 16px', borderRadius: 4, background: '#28a745', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                  Unduh
                </button>
              </a>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
