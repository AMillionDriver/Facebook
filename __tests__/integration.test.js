const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../backend/index');

// Helper to simulate frontend request to backend and check download

describe('Integration: Download Facebook Media', () => {
  it('should return media info and allow file download for valid Facebook video URL', async () => {
    // Simulasi URL Facebook valid (gunakan URL dummy, backend akan validasi pola saja)
    const url = 'https://www.facebook.com/watch/?v=1234567890';
    const res = await request(app)
      .post('/api/download')
      .send({ url });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('formats');
    expect(res.body).toHaveProperty('thumbnail');
    expect(res.body).toHaveProperty('downloadUrl');

    // Simulasi download file (jika ada downloadUrl)
    if (res.body.downloadUrl) {
      const downloadRes = await request(app)
        .get(res.body.downloadUrl)
        .expect(200);
      // Cek tipe konten (misal: video/mp4, application/octet-stream, dll)
      expect(downloadRes.headers['content-type']).toMatch(/octet-stream|video/);
      // Cek ada data file
      expect(downloadRes.body.length).toBeGreaterThan(0);
    }
  });

  it('should return 400 for invalid Facebook URL', async () => {
    const url = 'https://www.google.com/';
    const res = await request(app)
      .post('/api/download')
      .send({ url });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
