require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const { requireSupabase } = require('./services/supabase');
const { signWorkerToken, signAdminToken, requireWorkerAuth, requireAdminAuth } = require('./services/auth');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });
const port = Number(process.env.PORT || 8080);

const PARISHES = [
  'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary', 'St. Ann', 'Trelawny',
  'St. James', 'Hanover', 'Westmoreland', 'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine'
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:8080').split(',').map((v) => v.trim())
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/apps', express.static(path.join(__dirname, 'apps')));

function scoreWorker(worker) {
  const ratingAvg = Number(worker.rating_avg || 0);
  const ratingCount = Number(worker.rating_count || 0);
  const requests30 = Number(worker.requests_last_30d || 0);
  const featured = worker.is_featured ? 1 : 0;
  return (ratingAvg * 20) + (ratingCount * 0.5) + (featured ? 30 : 0) + (requests30 * 0.2);
}

function tagsForWorker(worker, score) {
  const tags = [];
  if (worker.is_featured) tags.push('Featured');
  if (Number(worker.rating_avg || 0) >= 4.7 && Number(worker.rating_count || 0) >= 10) tags.push('Top Rated');
  if (score > 95 || Number(worker.requests_last_30d || 0) > 12) tags.push('Recommended');
  if (!Number(worker.rating_count || 0)) tags.push('New');
  return tags;
}

function estimateResponseSpeed(worker) {
  const recent = Number(worker.requests_last_30d || 0);
  if (recent >= 20) return 'Usually replies in under 10 mins';
  if (recent >= 10) return 'Usually replies in under 30 mins';
  return 'Fast responder';
}

function normalizeWorker(worker) {
  const score = scoreWorker(worker);
  return {
    ...worker,
    score,
    tags: tagsForWorker(worker, score),
    response_speed: estimateResponseSpeed(worker)
  };
}

function ensureParish(parish) {
  return !parish || PARISHES.includes(parish);
}

app.get('/api/public/parishes', (req, res) => {
  res.json({ parishes: PARISHES });
});

app.get('/api/public/workers', async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { parish, category, q } = req.query;

    if (!ensureParish(parish)) return res.status(400).json({ error: 'Invalid parish' });

    let query = supabase
      .from('profiles')
      .select('worker_id,name,parish,categories,whatsapp,logo_url,bio,is_featured,rating_avg,rating_count,requests_last_30d,status')
      .eq('status', 'active')
      .limit(100);

    if (parish) query = query.eq('parish', parish);
    if (category) query = query.contains('categories', [category]);
    if (q) query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;

    const ranked = (data || []).map(normalizeWorker).sort((a, b) => b.score - a.score);
    res.json({ items: ranked });
  } catch (error) {
    next(error);
  }
});

app.get('/api/public/workers/:workerId', async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { workerId } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('worker_id', workerId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Worker not found' });
    res.json({ worker: normalizeWorker(data) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/public/workers/:workerId/portfolio', async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('portfolio_media')
      .select('*')
      .eq('worker_id', req.params.workerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
});

app.post('/api/public/workers/:workerId/requests', async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { workerId } = req.params;
    const requestId = `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const payload = req.body || {};

    const required = ['customer_name', 'phone', 'service_category', 'urgency', 'parish'];
    for (const field of required) {
      if (!payload[field]) return res.status(400).json({ error: `Missing ${field}` });
    }

    const { error } = await supabase.from('job_requests').insert({
      request_id: requestId,
      worker_id: workerId,
      status: 'new',
      customer_name: payload.customer_name,
      phone: payload.phone,
      email: payload.email || null,
      service_category: payload.service_category,
      urgency: payload.urgency,
      request_type: payload.request_type || 'visit',
      parish: payload.parish,
      address_details: payload.address_details || null,
      preferred_time: payload.preferred_time || null,
      notes: payload.notes || null,
      source: 'storefront'
    });

    if (error) throw error;
    res.status(201).json({ requestId });
  } catch (error) {
    next(error);
  }
});

app.post('/api/worker/login', async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { identity, passcode } = req.body;
    if (!identity || !passcode) return res.status(400).json({ error: 'Identity and passcode are required' });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`worker_id.eq.${identity},profile_email.eq.${identity}`)
      .maybeSingle();

    if (error) throw error;
    if (!data || data.password !== passcode) return res.status(401).json({ error: 'Invalid credentials' });
    if (data.status === 'paused') return res.status(403).json({ error: 'Account paused. Contact support.' });

    res.json({ token: signWorkerToken(data), profile: data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/worker/me', requireWorkerAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('worker_id', req.user.workerId)
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/worker/requests', requireWorkerAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { status, q } = req.query;
    let query = supabase
      .from('job_requests')
      .select('*')
      .eq('worker_id', req.user.workerId)
      .order('created_at', { ascending: false })
      .limit(300);

    if (status) query = query.eq('status', status);
    if (q) query = query.or(`request_id.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
});

app.post('/api/worker/requests/:requestId/status', requireWorkerAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { requestId } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'scheduled', 'completed', 'archived'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const { data, error } = await supabase
      .from('job_requests')
      .update({ status })
      .eq('request_id', requestId)
      .eq('worker_id', req.user.workerId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ item: data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/worker/portfolio', requireWorkerAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('portfolio_media')
      .select('*')
      .eq('worker_id', req.user.workerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
});

app.post('/api/worker/portfolio', requireWorkerAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const { media_type, url, caption } = req.body;
    if (!['image', 'video'].includes(media_type)) return res.status(400).json({ error: 'Invalid media type' });
    if (!url) return res.status(400).json({ error: 'Missing url' });

    const { data, error } = await supabase.from('portfolio_media').insert({
      worker_id: req.user.workerId,
      media_type,
      url,
      caption: caption || null
    }).select('*').single();

    if (error) throw error;
    res.status(201).json({ item: data });
  } catch (error) {
    next(error);
  }
});

app.post('/api/worker/profile', requireWorkerAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const allowed = ['name', 'whatsapp', 'parish', 'categories', 'bio', 'experience_years', 'qualifications', 'logo_url', 'social_links'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('worker_id', req.user.workerId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});

app.post('/api/media/upload', requireWorkerAuth, upload.array('files', 6), async (req, res, next) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary not configured' });
    }

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No files uploaded' });

    const folder = (process.env.CLOUDINARY_FOLDER || 'clicktrade/workers/{workerId}').replace('{workerId}', req.user.workerId);
    const uploads = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(file.buffer);
    })));

    res.status(201).json({
      items: uploads.map((item) => ({
        url: item.secure_url,
        media_type: item.resource_type === 'video' ? 'video' : 'image'
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const validUsers = [process.env.ADMIN_EMAIL, process.env.ADMIN_USERNAME].filter(Boolean);
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsers.length || !validPassword) {
    return res.status(500).json({ error: 'Admin credentials are not configured in environment.' });
  }

  if (!validUsers.includes(username) || password !== validPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  res.json({ token: signAdminToken(username) });
});

app.get('/api/admin/workers', requireAdminAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const { parish, status, category, q } = req.query;

    let query = supabase.from('profiles').select('*', { count: 'exact' }).range(offset, offset + limit - 1).order('created_at', { ascending: false });
    if (parish) query = query.eq('parish', parish);
    if (status) query = query.eq('status', status);
    if (category) query = query.contains('categories', [category]);
    if (q) query = query.or(`worker_id.ilike.%${q}%,name.ilike.%${q}%,profile_email.ilike.%${q}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ items: data || [], total: count || 0, limit, offset });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/workers', requireAdminAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const payload = req.body || {};
    if (!payload.worker_id) return res.status(400).json({ error: 'worker_id is required' });

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'worker_id' })
      .select('*')
      .single();

    if (error) throw error;
    res.json({ worker: data });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/workers/:workerId/reset-passcode', requireAdminAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    const nextPasscode = req.body.passcode || `pass-${Math.random().toString(36).slice(2, 8)}`;
    const { data, error } = await supabase
      .from('profiles')
      .update({ password: nextPasscode })
      .eq('worker_id', req.params.workerId)
      .select('worker_id,name,profile_email')
      .single();

    if (error) throw error;
    res.json({ worker: data, passcode: nextPasscode });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/requests', requireAdminAuth, async (req, res, next) => {
  try {
    const supabase = requireSupabase();
    let query = supabase
      .from('job_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);

    if (req.query.workerId) query = query.eq('worker_id', req.query.workerId);
    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
});

app.get(['/', '/storefront'], (req, res) => res.sendFile(path.join(__dirname, 'apps/storefront/index.html')));
app.get('/storefront/worker.html', (req, res) => res.sendFile(path.join(__dirname, 'apps/storefront/worker.html')));
app.get('/worker', (req, res) => res.sendFile(path.join(__dirname, 'apps/worker/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'apps/admin/index.html')));

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ error: error.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`ClickTrade running on http://localhost:${port}`);
});
