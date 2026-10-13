'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');

const db = require('./db');

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-troque-isto';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_ENABLED = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 6,
    secure: BASE_URL.startsWith('https')
  }
}));

if (GOOGLE_ENABLED) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/google/callback`
  }, (accessToken, refreshToken, profile, done) => {
    done(null, {
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails,
      photos: profile.photos,
      provider: profile.provider,
      _raw: profile._json
    });
  }));
  app.use(passport.initialize());
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return (req.ip || '').replace('::ffff:', '');
}

async function geoFromIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { note: 'IP local/privado - geolocalizacao por IP indisponivel em rede interna' };
  }
  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,zip,lat,lon,isp,org,as,mobile,proxy,hosting,query`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const resp = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!resp.ok) return { error: `HTTP ${resp.status}` };
    return await resp.json();
  } catch (err) {
    return { error: String(err && err.message || err) };
  }
}

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [user, pass] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
    if (user === ADMIN_USER && pass === ADMIN_PASS) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Painel da Palestra", charset="UTF-8"');
  return res.status(401).send('Autenticacao necessaria.');
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ifsp-logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ifsp-logo.png'));
});

app.get('/config', (req, res) => {
  res.json({ googleEnabled: GOOGLE_ENABLED });
});

app.post('/participar', async (req, res) => {
  const body = req.body || {};
  let device = null;
  let behavior = null;
  try { device = body.device ? JSON.parse(body.device) : null; } catch { device = null; }
  try { behavior = body.behavior ? JSON.parse(body.behavior) : null; } catch { behavior = null; }

  const ip = getClientIp(req);
  const geo = await geoFromIp(ip);

  const id = db.insertParticipante({
    nome: body.nome,
    email: body.email,
    telefone: body.telefone,
    nascimento: body.nascimento,
    instagram: body.instagram,
    cidade: body.cidade,
    ip,
    geo,
    device,
    behavior,
    fingerprint: (device && device.fingerprint) || ''
  });

  req.session.participanteId = id;
  res.json({ ok: true, id });
});

app.get('/auth/google', (req, res, next) => {
  if (!GOOGLE_ENABLED) return res.redirect('/confirmado.html');
  passport.authenticate('google', { scope: ['openid', 'email', 'profile'], session: false })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  if (!GOOGLE_ENABLED) return res.redirect('/confirmado.html');
  passport.authenticate('google', { session: false, failureRedirect: '/confirmado.html' }, (err, user) => {
    if (err || !user) return res.redirect('/confirmado.html');
    const email = (user.emails && user.emails[0] && user.emails[0].value) || '';
    const id = req.session.participanteId;
    if (id) {
      db.attachGoogle(id, user, email);
    } else {
      const newId = db.insertParticipante({ nome: user.displayName, email });
      db.attachGoogle(newId, user, email);
      req.session.participanteId = newId;
    }
    res.redirect('/confirmado.html');
  })(req, res, next);
});

app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/admin/data', adminAuth, (req, res) => {
  res.json({ total: db.count(), participantes: db.getAll() });
});

app.post('/admin/wipe', adminAuth, (req, res) => {
  db.wipe();
  res.json({ ok: true, total: db.count() });
});

app.listen(PORT, () => {
  console.log(`\n  IFSP - Palestra CyberSec`);
  console.log(`  Servidor em ${BASE_URL}`);
  console.log(`  Painel:     ${BASE_URL}/admin  (usuario: ${ADMIN_USER})`);
  console.log(`  Google OAuth: ${GOOGLE_ENABLED ? 'habilitado' : 'DESABILITADO (preencha .env)'}\n`);
});
