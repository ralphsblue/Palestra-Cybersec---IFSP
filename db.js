'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS participantes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  TEXT    NOT NULL,
    nome        TEXT,
    email       TEXT,
    telefone    TEXT,
    nascimento  TEXT,
    instagram   TEXT,
    cidade      TEXT,
    ip          TEXT,
    geo         TEXT,
    device      TEXT,
    google      TEXT,
    behavior    TEXT,
    fingerprint TEXT
  );
`);

const stmtInsert = db.prepare(`
  INSERT INTO participantes
    (created_at, nome, email, telefone, nascimento, instagram, cidade, ip, geo, device, behavior, fingerprint)
  VALUES
    (@created_at, @nome, @email, @telefone, @nascimento, @instagram, @cidade, @ip, @geo, @device, @behavior, @fingerprint)
`);

const stmtUpdateGoogle = db.prepare(`UPDATE participantes SET google = @google, nome = COALESCE(NULLIF(nome, ''), @nome), email = COALESCE(NULLIF(email, ''), @email) WHERE id = @id`);
const stmtGetAll = db.prepare(`SELECT * FROM participantes ORDER BY id DESC`);
const stmtGetOne = db.prepare(`SELECT * FROM participantes WHERE id = ?`);
const stmtCount = db.prepare(`SELECT COUNT(*) AS n FROM participantes`);
const stmtWipe = db.prepare(`DELETE FROM participantes`);
const stmtResetSeq = db.prepare(`DELETE FROM sqlite_sequence WHERE name = 'participantes'`);

function nowISO() {
  return new Date().toISOString();
}

module.exports = {
  insertParticipante(data) {
    const row = {
      created_at: nowISO(),
      nome: data.nome || '',
      email: data.email || '',
      telefone: data.telefone || '',
      nascimento: data.nascimento || '',
      instagram: data.instagram || '',
      cidade: data.cidade || '',
      ip: data.ip || '',
      geo: JSON.stringify(data.geo || null),
      device: JSON.stringify(data.device || null),
      behavior: JSON.stringify(data.behavior || null),
      fingerprint: data.fingerprint || ''
    };
    const info = stmtInsert.run(row);
    return Number(info.lastInsertRowid);
  },

  attachGoogle(id, profile, email) {
    stmtUpdateGoogle.run({
      id,
      google: JSON.stringify(profile || null),
      nome: (profile && profile.displayName) || '',
      email: email || ''
    });
  },

  getAll() {
    return stmtGetAll.all().map(parseRow);
  },

  getOne(id) {
    const row = stmtGetOne.get(id);
    return row ? parseRow(row) : null;
  },

  count() {
    return stmtCount.get().n;
  },

  wipe() {
    stmtWipe.run();
    stmtResetSeq.run();
  }
};

function parseRow(row) {
  return {
    ...row,
    geo: safeParse(row.geo),
    device: safeParse(row.device),
    google: safeParse(row.google),
    behavior: safeParse(row.behavior)
  };
}

function safeParse(s) {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
