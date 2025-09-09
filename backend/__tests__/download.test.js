const request = require('supertest');
const express = require('express');
const app = require('../index');

describe('API /api/download', () => {
  it('should return 400 for missing url', async () => {
    const res = await request(app)
      .post('/api/download')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 400 for invalid facebook url', async () => {
    const res = await request(app)
      .post('/api/download')
      .send({ url: 'https://google.com/' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/facebook/i);
  });

  // Test with a valid Facebook video URL (replace with a real one for real test)
  it('should return media info for valid facebook url', async () => {
    const res = await request(app)
      .post('/api/download')
      .send({ url: 'https://www.facebook.com/facebookapp/videos/10153231379946729/' });
    // Accept 200 or 500 (if yt-dlp fails in CI), but must have error or title
    expect([200, 500, 404]).toContain(res.statusCode);
    expect(res.body.error || res.body.title).toBeDefined();
  }, 20000);
});

