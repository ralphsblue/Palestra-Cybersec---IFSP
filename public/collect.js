import FingerprintJS from 'https://openfpcdn.io/fingerprintjs/v4';

const inicio = Date.now();
const behavior = {
  cliques: 0,
  maxScrollPct: 0,
  abriuTermo: false,
  leuTermoMs: 0
};

document.addEventListener('click', () => { behavior.cliques++; });
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = Math.round((h.scrollTop) / (h.scrollHeight - h.clientHeight || 1) * 100);
  if (pct > behavior.maxScrollPct) behavior.maxScrollPct = Math.min(pct, 100);
});

async function coletarDevice() {
  const n = navigator;
  const s = screen;
  const d = {
    userAgent: n.userAgent,
    plataforma: n.platform,
    idiomas: n.languages,
    idioma: n.language,
    fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offsetUTC: -new Date().getTimezoneOffset() / 60,
    tela: { largura: s.width, altura: s.height, profundidadeCor: s.colorDepth, pixelRatio: window.devicePixelRatio },
    janela: { largura: window.innerWidth, altura: window.innerHeight },
    nucleosCPU: n.hardwareConcurrency || null,
    memoriaGB: n.deviceMemory || null,
    touch: ('ontouchstart' in window) || n.maxTouchPoints > 0,
    maxTouchPoints: n.maxTouchPoints || 0,
    cookiesHabilitados: n.cookieEnabled,
    doNotTrack: n.doNotTrack,
    online: n.onLine,
    conexao: null,
    bateria: null,
    gpu: lerGPU(),
    fingerprint: null,
    componentes: null
  };

  if (n.connection) {
    d.conexao = {
      tipo: n.connection.effectiveType,
      downlinkMbps: n.connection.downlink,
      rttMs: n.connection.rtt,
      economiaDados: n.connection.saveData
    };
  }

  try {
    if (n.getBattery) {
      const b = await n.getBattery();
      d.bateria = { nivelPct: Math.round(b.level * 100), carregando: b.charging };
    }
  } catch {}

  try {
    const fp = await FingerprintJS.load();
    const r = await fp.get();
    d.fingerprint = r.visitorId;
    d.componentes = resumoComponentes(r.components);
  } catch (e) {
    d.fingerprint = 'erro: ' + (e && e.message);
  }

  return d;
}

function lerGPU() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (!info) return null;
    return {
      fabricante: gl.getParameter(info.UNMASKED_VENDOR_WEBGL),
      modelo: gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
    };
  } catch { return null; }
}

function resumoComponentes(c) {
  if (!c) return null;
  const pick = {};
  for (const k of ['fonts', 'languages', 'colorDepth', 'deviceMemory', 'hardwareConcurrency',
                   'timezone', 'platform', 'vendor', 'screenResolution', 'touchSupport',
                   'osCpu', 'colorGamut']) {
    if (c[k] && c[k].value !== undefined) pick[k] = c[k].value;
  }
  return pick;
}

const dialog = document.getElementById('termoDialog');
document.getElementById('abrirTermo').addEventListener('click', (e) => {
  e.preventDefault();
  behavior.abriuTermo = true;
  behavior._abriuEm = Date.now();
  dialog.showModal();
});
document.getElementById('fecharTermo').addEventListener('click', () => {
  if (behavior._abriuEm) behavior.leuTermoMs += Date.now() - behavior._abriuEm;
  dialog.close();
});

// Dropdowns Estado -> Cidade (dados IBGE locais)
const estadoSel = document.getElementById('estado');
const cidadeSel = document.getElementById('cidade');

fetch('/ibge.json').then(r => r.json()).then(ibge => {
  for (const uf of ibge.estados) {
    const opt = document.createElement('option');
    opt.value = uf.sigla;
    opt.textContent = uf.nome;
    estadoSel.appendChild(opt);
  }

  estadoSel.addEventListener('change', () => {
    const uf = estadoSel.value;
    const cidades = ibge.municipios[uf] || [];
    cidadeSel.innerHTML = '<option value="" disabled selected>Selecione a cidade</option>';
    for (const nome of cidades) {
      const opt = document.createElement('option');
      opt.value = nome + ' - ' + uf;
      opt.textContent = nome;
      cidadeSel.appendChild(opt);
    }
    cidadeSel.disabled = false;
  });
}).catch(() => {
  // Sem dados do IBGE: cai para texto livre para nao travar o cadastro.
  const wrapEstado = estadoSel.closest('.field');
  if (wrapEstado) wrapEstado.style.display = 'none';
  const wrap = cidadeSel.parentElement;
  const input = document.createElement('input');
  input.type = 'text'; input.id = 'cidade'; input.name = 'cidade'; input.placeholder = 'Cidade';
  wrap.replaceWith(input);
});

let devicePromise = coletarDevice();

const form = document.getElementById('form');
const msg = document.getElementById('msg');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!document.getElementById('aceite').checked) {
    msg.className = 'msg err';
    msg.textContent = 'E preciso aceitar os termos para participar.';
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  const device = await devicePromise;
  behavior.tempoNaPaginaMs = Date.now() - inicio;

  document.getElementById('deviceField').value = JSON.stringify(device);
  document.getElementById('behaviorField').value = JSON.stringify(behavior);

  const body = new URLSearchParams(new FormData(form));
  try {
    const resp = await fetch('/participar', { method: 'POST', body });
    const data = await resp.json();
    if (data.ok) {
      window.location.href = '/confirmado.html';
    } else {
      throw new Error('resposta invalida');
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Quero participar';
    msg.className = 'msg err';
    msg.textContent = 'Erro ao enviar. Tente novamente.';
  }
});
