import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const WEBHOOK_URL = 'https://serious-porpoise.pikapod.net/webhook/8f4d8f21-7b6a-4f47-9d2e-166000000167/chat';
const VOICE_TRANSCRIBE_URL = 'https://serious-porpoise.pikapod.net/webhook/praisa-voz-5d2e9b47';
const PREF_KEY = 'praisa-ia-preferences-v1';
const UI_BUILD = 'v43';
const FEEDBACK_URL = 'https://serious-porpoise.pikapod.net/webhook/praisa-calificacion-3f6c2a91';
let authHeader = '';
let authUser = '';

const gate = document.getElementById('access-gate');
const form = document.getElementById('access-form');
const userInput = document.getElementById('access-user');
const passInput = document.getElementById('access-pass');
const errorBox = document.getElementById('access-error');
const logoutButton = document.getElementById('logout-button');
const statusDot = document.getElementById('status-dot');
const statusTitle = document.getElementById('status-title');
const statusText = document.getElementById('status-text');
const helperText = document.getElementById('helper-text');
const currentDate = document.getElementById('current-date');
const currentTime = document.getElementById('current-time');
const globalSearch = document.getElementById('global-search');
const settingsButton = document.getElementById('settings-button');
const settingsDrawer = document.getElementById('settings-drawer');
const settingsBackdrop = document.getElementById('settings-backdrop');
const settingsClose = document.getElementById('settings-close');
const themeCycleButton = document.getElementById('theme-cycle-button');
const motionToggle = document.getElementById('motion-toggle');
const compactToggle = document.getElementById('compact-toggle');
const resetPreferences = document.getElementById('reset-preferences');
const navChat = document.getElementById('nav-chat');
const contextProduct = document.getElementById('context-product');
const contextClient = document.getElementById('context-client');
const contextQuote = document.getElementById('context-quote');
const contextTech = document.getElementById('context-tech');

function isInvalidDeviceProduct(value) {
  return /\b(H630BT|HAVIT|REALTEK|MICROPHONE|MICR[ÓO]FONO|AURICULARES|HEADSET|DROIDCAM|PREDETERMINADO|COMUNICACIONES|STEREO MIX|VB-AUDIO|OBS)\b/i.test(String(value || ''));
}

function sanitizeVisibleContext() {
  if (contextProduct && isInvalidDeviceProduct(contextProduct.textContent)) {
    contextProduct.textContent = 'Sin seleccionar';
    contextProduct.removeAttribute('title');
  }

  const summaryProduct = document.getElementById('summary-product');
  if (summaryProduct && isInvalidDeviceProduct(summaryProduct.textContent)) {
    summaryProduct.textContent = '—';
  }

  const tech = (contextTech?.textContent || '').trim().toLowerCase();
  const summaryStatus = document.getElementById('summary-status');
  if (summaryStatus && /sin requerir|sin validaci[oó]n/.test(tech)) {
    summaryStatus.textContent = 'Normal';
  }
}

if (contextProduct) contextProduct.textContent = 'Sin seleccionar';
if (contextClient) contextClient.textContent = 'Sin seleccionar';
if (contextQuote) contextQuote.textContent = 'Sin iniciar';
if (contextTech) contextTech.textContent = 'Sin requerir';

let chatStarted = false;

const PRAISA_ADVISORS = [
  { name:'Alejandra Reyes', role:'Asesora de ventas', phone:'+502 4250-9322', email:'areyes@praisa.com' },
  { name:'Aura Ramírez', role:'Asesora de ventas internas', phone:'+502 4296-8353', email:'aramirez@praisa.com' },
  { name:'Luis Agustín', role:'Asesor de ventas internas', phone:'+502 4707-0021', email:'lagustin@praisa.com' },
  { name:'Cristián Serovic', role:'Asesor de ventas', phone:'+502 5017-6258', email:'cserovic@praisa.com' },
  { name:'Susana Pineda', role:'Asesora de ventas externas', phone:'+502 4149-8926', email:'spineda@praisa.com' }
];

let preferences = {
  theme: 'dark',
  motion: true,
  compact: false
};

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    preferences = { ...preferences, ...saved };
  } catch {}
}

function savePreferences() {
  localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
}

function resolvedTheme() {
  if (preferences.theme === 'system') {
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return preferences.theme;
}

function updateLogos(theme) {
  const src = theme === 'light' ? 'logo-light.svg' : 'logo-dark.svg';
  document.querySelectorAll('[data-theme-logo]').forEach((img) => {
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  });
}

function applyPreferences() {
  const theme = resolvedTheme();
  document.documentElement.dataset.theme = theme;
  document.body?.classList.toggle('theme-light-active', theme === 'light');
  document.body?.classList.toggle('theme-dark-active', theme === 'dark');
  document.documentElement.classList.toggle('reduce-motion', !preferences.motion);
  document.documentElement.classList.toggle('compact', preferences.compact);
  updateLogos(theme);

  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.classList.toggle('active', button.dataset.themeChoice === preferences.theme);
  });

  if (motionToggle) motionToggle.checked = preferences.motion;
  if (compactToggle) compactToggle.checked = preferences.compact;
  if (themeCycleButton) {
    themeCycleButton.textContent = theme === 'light' ? '☀' : '◐';
    themeCycleButton.title = theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f4f7f9' : '#0d141d');
}

function setTheme(value) {
  preferences.theme = value;
  savePreferences();
  applyPreferences();
}

loadPreferences();
applyPreferences();

matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => {
  if (preferences.theme === 'system') applyPreferences();
});

function openSettings() {
  settingsDrawer.classList.add('open');
  settingsDrawer.setAttribute('aria-hidden', 'false');
  settingsBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeSettings() {
  settingsDrawer.classList.remove('open');
  settingsDrawer.setAttribute('aria-hidden', 'true');
  settingsBackdrop.hidden = true;
  document.body.style.overflow = '';
}

settingsButton?.addEventListener('click', openSettings);
settingsClose?.addEventListener('click', closeSettings);
settingsBackdrop?.addEventListener('click', closeSettings);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsDrawer.classList.contains('open')) closeSettings();
});

document.querySelectorAll('[data-theme-choice]').forEach((button) => {
  button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
});

themeCycleButton?.addEventListener('click', () => {
  setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark');
});

motionToggle?.addEventListener('change', () => {
  preferences.motion = motionToggle.checked;
  savePreferences();
  applyPreferences();
});

compactToggle?.addEventListener('change', () => {
  preferences.compact = compactToggle.checked;
  savePreferences();
  applyPreferences();
});

resetPreferences?.addEventListener('click', () => {
  preferences = { theme: 'dark', motion: true, compact: false };
  savePreferences();
  applyPreferences();
});

function setStatus(kind, title, text) {
  statusDot.classList.remove('online', 'error');
  if (kind) statusDot.classList.add(kind);
  statusTitle.textContent = title;
  statusText.textContent = text;
}

function updateClock() {
  const now = new Date();
  if (currentDate) {
    currentDate.textContent = new Intl.DateTimeFormat('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
  }
  if (currentTime) {
    currentTime.textContent = new Intl.DateTimeFormat('es-GT', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(now);
  }
}
updateClock();
setInterval(updateClock, 30000);

function chatInput() {
  return document.querySelector('#n8n-chat textarea, #n8n-chat input[type="text"]');
}

function focusChat() {
  document.querySelector('.chat-shell')?.scrollIntoView({ behavior: preferences.motion ? 'smooth' : 'auto', block: 'center' });
  setTimeout(() => chatInput()?.focus(), preferences.motion ? 300 : 0);
}

function putPromptInChat(prompt) {
  const input = chatInput();

  if (!input) {
    helperText.textContent = 'El chat todavía está cargando.';
    return;
  }

  input.focus();
  const proto = Object.getPrototypeOf(input);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(input, prompt);
  else input.value = prompt;

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  helperText.textContent = 'Completa el mensaje y presiona enviar.';
  focusChat();
}

function sendPromptNow(prompt) {
  putPromptInChat(prompt);

  setTimeout(() => {
    const root = document.getElementById('n8n-chat');
    const input = chatInput();
    if (!root || !input) return;

    const fallbackButtons = [...root.querySelectorAll('.chat-input button, .chat-inputs button')]
      .filter((button) => !button.classList.contains('praisa-voice-button'));
    const sendButton =
      root.querySelector('.chat-input-send-button') ||
      root.querySelector('button[type="submit"]') ||
      fallbackButtons.at(-1);

    if (sendButton && !sendButton.disabled) {
      sendButton.click();
      return;
    }

    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true
    }));
  }, 90);
}

const MIC_DEVICE_KEY = 'praisa-ia-mic-device-v1';
let voiceStream = null;
let voiceRecorder = null;
let voiceChunks = [];
let voiceRecording = false;
let voiceSending = false;
// ============================ VOZ v43 ============================
// 1) Dictado del navegador (Chrome, Edge, Android y Safari): el texto aparece en la caja mientras hablas.
// 2) Si el navegador no lo permite, o elegiste un micrófono específico en Configuración: se graba y
//    se transcribe en el servidor de Praisa (n8n + Gemini).
// El texto queda en la caja para revisarlo. Solo se envía solo si activas "Enviar al terminar de hablar".
const VOZ_AUTOENVIO_KEY = 'praisa-voz-autoenvio';
const VOZ_MAX_SEGUNDOS = 45;
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let vozEstado = 'inactivo';          // inactivo | escuchando | procesando
let vozReconocedor = null;
let vozGrabador = null;
let vozStream = null;
let vozPartes = [];
let vozLimite = null;
let vozSilencio = null;
let vozTextoPrevio = '';
let vozAudioCtx = null;

const leerPref = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const guardarPref = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const vozAutoenvio = () => leerPref(VOZ_AUTOENVIO_KEY) === '1';
const microfonoElegido = () => leerPref(MIC_DEVICE_KEY);

function setChatInputValue(value) {
  const input = chatInput();
  if (!input) return false;

  const proto = Object.getPrototypeOf(input);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(input, value);
  else input.value = value;

  input.dispatchEvent(new Event('input', { bubbles:true }));
  input.dispatchEvent(new Event('change', { bubbles:true }));
  return true;
}
function normalizePraisaProductCode(raw) {
  if (!raw) return '';

  const compact = String(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g,'');

  // Common Praisa format: two digits + 2–4 letters + numeric suffix.
  const match = compact.match(/^(\d{2})([A-Z]{2,4})([A-Z0-9]{3,})$/);
  if (!match) return '';

  const prefix = match[1];
  const family = match[2];
  const suffix = match[3]
    .replace(/O/g,'0')
    .replace(/[IL]/g,'1');

  if (!/^\d+$/.test(suffix)) return '';
  return prefix + family + suffix;
}
function extractPraisaProductCode(transcript) {
  const text = String(transcript || '');

  // First try compact tokens such as 11ASo598 or 16DEL0100.
  const tokens = text.match(/\b[A-Za-z0-9][A-Za-z0-9 ._-]{4,16}\b/g) || [];
  for (const token of tokens) {
    const code = normalizePraisaProductCode(token);
    if (code) return code;
  }

  // Then tolerate spoken/space-separated forms: "11 AS 0 5 9 8".
  const pieces = text
    .toUpperCase()
    .replace(/C[ÓO]DIGO|PRODUCTO|MAN[ÓO]METRO|V[ÁA]LVULA|TRAMPA/g,' ')
    .replace(/[^A-Z0-9]+/g,' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  for (let start = 0; start < pieces.length; start++) {
    for (let end = Math.min(pieces.length, start + 8); end > start; end--) {
      const code = normalizePraisaProductCode(pieces.slice(start,end).join(''));
      if (code) return code;
    }
  }

  return '';
}
function botIsRequestingProductCode() {
  const root = document.getElementById('n8n-chat');
  if (!root) return false;

  const botMessages = [...root.querySelectorAll('.chat-message-from-bot')];
  const last = botMessages.at(-1);
  const text = (last?.innerText || last?.textContent || '').toLowerCase();

  return /c[oó]digo del producto|c[oó]digo.*deseas cotizar|dime.*c[oó]digo|escribe.*c[oó]digo/.test(text);
}
function normalizePraisaTranscript(transcript) {
  let text = String(transcript || '').trim();
  if (!text) return { text:'', correction:'' };

  // Light vocabulary fixes that are safe in the Praisa context.
  text = text
    .replace(/\bpan[oó]metro\b/gi,'manómetro')
    .replace(/\bmanometro\b/gi,'manómetro')
    .replace(/\bcotizacion\b/gi,'cotización');

  const code = extractPraisaProductCode(text);

  if (code && botIsRequestingProductCode()) {
    return {
      text: code,
      correction: 'Código interpretado: ' + code
    };
  }

  if (code) {
    // Replace the most code-like alphanumeric token while preserving the sentence.
    const codeLike = text.match(/\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9_-]{5,}\b/);
    if (codeLike) {
      text = text.replace(codeLike[0],code);
      return {
        text,
        correction: 'Código normalizado: ' + code
      };
    }
  }

  return { text, correction:'' };
}

// Palabras a números para códigos dictados: "dieciocho del cero cero cero cinco" -> "18 del 0 0 0 5".
function numerosHablados(texto) {
  const mapa = { cero:0, uno:1, una:1, dos:2, tres:3, cuatro:4, cinco:5, seis:6, siete:7, ocho:8, nueve:9, diez:10,
    once:11, doce:12, trece:13, catorce:14, quince:15, dieciseis:16, 'dieciséis':16, diecisiete:17, dieciocho:18, diecinueve:19,
    veinte:20, treinta:30, cuarenta:40, cincuenta:50 };
  return String(texto || '').replace(/\b(cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|diecis[eé]is|diecisiete|dieciocho|diecinueve|veinte|treinta|cuarenta|cincuenta)\b/gi,
    (p) => String(mapa[p.toLowerCase()] ?? p));
}

function vozBoton() { return document.querySelector('#n8n-chat .praisa-voice-button'); }

function vozUi(estado, mensaje) {
  vozEstado = estado;
  const b = vozBoton();
  if (b) {
    b.classList.toggle('escuchando', estado === 'escuchando');
    b.classList.toggle('procesando', estado === 'procesando');
    b.setAttribute('aria-pressed', estado === 'escuchando' ? 'true' : 'false');
    b.title = estado === 'escuchando' ? 'Toca para terminar' : estado === 'procesando' ? 'Transcribiendo…' : 'Dictar con la voz';
    b.innerHTML = estado === 'escuchando' ? '<span aria-hidden="true">■</span>' : estado === 'procesando' ? '<span aria-hidden="true">…</span>' : '<span aria-hidden="true">🎙️</span>';
  }
  if (mensaje && helperText) helperText.textContent = mensaje;
}

function vozLimpiar() {
  clearTimeout(vozLimite); clearTimeout(vozSilencio);
  vozLimite = vozSilencio = null;
  try { vozStream?.getTracks().forEach(t => t.stop()); } catch {}
  try { vozAudioCtx?.close(); } catch {}
  vozStream = null; vozAudioCtx = null; vozGrabador = null; vozReconocedor = null;
}

function vozMostrar(texto) {
  const base = vozTextoPrevio ? vozTextoPrevio.replace(/\s+$/, '') + ' ' : '';
  setChatInputValue(base + texto);
}

function vozTerminar(textoCrudo) {
  vozLimpiar();
  const limpio = numerosHablados(String(textoCrudo || '').trim());
  if (!limpio) { vozUi('inactivo', '🎙️ No escuché nada. Toca el micrófono e intenta de nuevo, un poco más cerca.'); return; }
  const { text, correction } = normalizePraisaTranscript(limpio);
  vozMostrar(text);
  if (vozAutoenvio()) {
    vozUi('inactivo', '✅ Enviando: “' + text + '”');
    const final = (vozTextoPrevio ? vozTextoPrevio.replace(/\s+$/, '') + ' ' : '') + text;
    sendPromptNow(final);
  } else {
    vozUi('inactivo', '✅ Revisa el texto y presiona enviar.' + (correction ? ' (' + correction + ')' : ''));
    chatInput()?.focus();
  }
}

// ---- 1) Dictado del navegador ----
function vozDictadoNavegador() {
  const rec = new SpeechRec();
  vozReconocedor = rec;
  rec.lang = 'es-GT';
  rec.continuous = true;
  rec.interimResults = true;
  let finalTxt = '';
  let parcial = '';
  const reiniciarSilencio = () => { clearTimeout(vozSilencio); vozSilencio = setTimeout(() => { try { rec.stop(); } catch {} }, 2500); };

  rec.onresult = (e) => {
    parcial = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalTxt += t + ' '; else parcial += t;
    }
    vozMostrar((finalTxt + parcial).trim());
    reiniciarSilencio();
  };
  rec.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      vozLimpiar(); vozUi('inactivo', '❌ El navegador bloqueó el micrófono. Permítelo en el candado junto a la dirección de la página.');
    } else if (e.error === 'network' || e.error === 'language-not-supported') {
      rec.onend = null;
      vozLimpiar(); vozUi('inactivo', 'Cambiando a transcripción en el servidor…'); vozGrabarServidor();
    }
  };
  rec.onend = () => { if (vozEstado === 'escuchando') vozTerminar((finalTxt + parcial).trim()); };

  vozTextoPrevio = chatInput()?.value || '';
  try { rec.start(); } catch (err) { rec.onend = null; vozLimpiar(); vozGrabarServidor(); return; }
  vozUi('escuchando', '🔴 Te escucho… Habla y toca ■ cuando termines (se detiene solo al callarte).');
  reiniciarSilencio();
  vozLimite = setTimeout(() => { try { rec.stop(); } catch {} }, VOZ_MAX_SEGUNDOS * 1000);
}

// ---- 2) Grabación + transcripción en el servidor ----
async function vozGrabarServidor() {
  const deviceId = microfonoElegido();
  try {
    vozStream = await navigator.mediaDevices.getUserMedia({
      audio: { ...(deviceId ? { deviceId: { exact: deviceId } } : {}), echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
  } catch (err) {
    vozLimpiar();
    const n = err?.name || '';
    vozUi('inactivo', n === 'NotAllowedError' ? '❌ El navegador bloqueó el micrófono. Permítelo en el candado junto a la dirección.'
      : n === 'NotFoundError' || n === 'OverconstrainedError' ? '❌ No encontré ese micrófono. Revisa Configuración → Micrófono.'
      : '❌ No pude abrir el micrófono.');
    return;
  }
  const tipo = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
  vozPartes = [];
  vozGrabador = new MediaRecorder(vozStream, tipo ? { mimeType: tipo } : undefined);
  vozGrabador.ondataavailable = (e) => { if (e.data?.size) vozPartes.push(e.data); };
  vozGrabador.onstop = () => vozEnviarAudio(new Blob(vozPartes, { type: vozGrabador?.mimeType || tipo || 'audio/webm' }));

  // Se detiene solo tras 2 s de silencio (después de haber hablado).
  try {
    vozAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analizador = vozAudioCtx.createAnalyser();
    analizador.fftSize = 1024;
    vozAudioCtx.createMediaStreamSource(vozStream).connect(analizador);
    const datos = new Uint8Array(analizador.fftSize);
    let hablo = false, callado = 0;
    const medir = () => {
      if (vozEstado !== 'escuchando' || !vozGrabador) return;
      analizador.getByteTimeDomainData(datos);
      let s = 0; for (const v of datos) { const d = (v - 128) / 128; s += d * d; }
      const rms = Math.sqrt(s / datos.length);
      if (rms > 0.035) { hablo = true; callado = 0; } else if (hablo) { callado += 100; }
      if (hablo && callado >= 2000) { try { vozGrabador.stop(); } catch {} return; }
      setTimeout(medir, 100);
    };
    setTimeout(medir, 300);
  } catch {}

  vozTextoPrevio = chatInput()?.value || '';
  vozGrabador.start();
  vozUi('escuchando', '🔴 Grabando… Habla y toca ■ cuando termines.');
  vozLimite = setTimeout(() => { try { vozGrabador?.stop(); } catch {} }, VOZ_MAX_SEGUNDOS * 1000);
}

async function vozEnviarAudio(blob) {
  try { vozStream?.getTracks().forEach(t => t.stop()); } catch {}
  if (!blob || blob.size < 1500) { vozLimpiar(); vozUi('inactivo', '🎙️ La grabación fue muy corta. Intenta de nuevo.'); return; }
  vozUi('procesando', '⏳ Transcribiendo…');
  try {
    const fd = new FormData();
    fd.append('audiofile', blob, 'voz.' + (blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'));
    const r = await fetch(VOICE_TRANSCRIBE_URL, { method: 'POST', body: fd, headers: authHeader ? { Authorization: authHeader } : {} });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json().catch(() => ({}));
    vozTerminar(data.text || '');
  } catch (err) {
    console.warn('Transcripción:', err);
    vozLimpiar();
    vozUi('inactivo', '⚠️ No pude transcribir el audio ahora. Intenta de nuevo o escribe tu consulta.');
  }
}

function vozAlternar() {
  if (vozEstado === 'procesando') return;
  if (vozEstado === 'escuchando') {
    try { vozReconocedor?.stop(); } catch {}
    try { if (vozGrabador?.state === 'recording') vozGrabador.stop(); } catch {}
    return;
  }
  if (SpeechRec && !microfonoElegido()) vozDictadoNavegador();
  else vozGrabarServidor();
}

function ensureVoiceControls() {
  const root = document.getElementById('n8n-chat');
  const input = chatInput();
  if (!root || !input) return;
  root.querySelectorAll('.praisa-mic-device-wrap').forEach(el => el.remove());
  if (root.querySelector('.praisa-voice-button')) return;
  const composer = input.closest('.chat-inputs') || input.parentElement;
  if (!composer) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'praisa-voice-button';
  button.setAttribute('aria-label', 'Dictar con la voz');
  button.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); vozAlternar(); });
  const send = composer.querySelector('.chat-input-send-button') || composer.querySelector('button[type="submit"]');
  if (send && send.parentElement === composer) composer.insertBefore(button, send); else composer.appendChild(button);
  vozUi(vozEstado);
}

function maybeResumeHandsFreeAfterBot() {}

// Configuración → Voz: micrófono y envío automático.
async function vozLlenarMicrofonos() {
  const sel = document.getElementById('mic-select');
  if (!sel || !navigator.mediaDevices?.enumerateDevices) return;
  const lista = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput');
  const actual = microfonoElegido();
  sel.innerHTML = '<option value="">Automático (recomendado)</option>' +
    lista.filter(d => d.deviceId && d.deviceId !== 'default' && d.deviceId !== 'communications')
      .map((d, i) => '<option value="' + d.deviceId + '">' + (d.label || 'Micrófono ' + (i + 1)).replace(/</g, '&lt;') + '</option>').join('');
  sel.value = lista.some(d => d.deviceId === actual) ? actual : '';
}
document.getElementById('mic-select')?.addEventListener('change', (e) => { guardarPref(MIC_DEVICE_KEY, e.target.value); });
const vozAutoToggle = document.getElementById('voice-autosend-toggle');
if (vozAutoToggle) {
  vozAutoToggle.checked = vozAutoenvio();
  vozAutoToggle.addEventListener('change', () => guardarPref(VOZ_AUTOENVIO_KEY, vozAutoToggle.checked ? '1' : '0'));
}
document.getElementById('settings-button')?.addEventListener('click', () => { vozLlenarMicrofonos(); });
navigator.mediaDevices?.addEventListener?.('devicechange', () => { vozLlenarMicrofonos(); });

function syncCommandCenterSummary() {
  sanitizeVisibleContext();

  const pairs = [
    ['context-product','summary-product'],
    ['context-client','summary-client'],
    ['context-quote','summary-quote']
  ];

  pairs.forEach(([sourceId,targetId]) => {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (!target) return;

    const value = (source?.textContent || '').trim();
    target.textContent =
      !value || /sin seleccionar|sin iniciar/i.test(value) ? '—' : value;
  });

  const status = document.getElementById('summary-status');
  if (status) {
    const tech = (document.getElementById('context-tech')?.textContent || '').trim().toLowerCase();

    if (!tech || /sin requerir|sin validaci[oó]n/.test(tech)) {
      status.textContent = 'Normal';
    } else if (/aprobada|validada/.test(tech)) {
      status.textContent = 'Aprobada';
    } else if (/pendiente|revisi[oó]n/.test(tech)) {
      status.textContent = 'Revisión';
    } else {
      status.textContent = 'Activa';
    }
  }

  sanitizeVisibleContext();
}

function enhanceAdvisorSelector(message) {
  if (!message || message.dataset.praisaAdvisorSelector === 'true') return;

  const text = (message.innerText || message.textContent || '');
  if (!/selecciona el asesor responsable/i.test(text)) return;

  message.dataset.praisaAdvisorSelector = 'true';

  const panel = document.createElement('div');
  panel.className = 'praisa-advisor-selector';
  panel.setAttribute('aria-label', 'Seleccionar asesor Praisa');

  PRAISA_ADVISORS.forEach((advisor) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'praisa-advisor-card';
    button.innerHTML =
      '<strong>' + advisor.name + '</strong>' +
      '<span>' + advisor.role + '</span>' +
      '<small>' + advisor.phone + ' · ' + advisor.email + '</small>';
    button.addEventListener('click', () => {
      sendPromptNow('Asesor: ' + advisor.name);
    });
    panel.appendChild(button);
  });

  const other = document.createElement('button');
  other.type = 'button';
  other.className = 'praisa-advisor-card praisa-advisor-other';
  other.innerHTML =
    '<strong>Otro asesor</strong>' +
    '<span>Registrar manualmente</span>' +
    '<small>Nombre, teléfono y correo</small>';
  other.addEventListener('click', () => {
    sendPromptNow('Otro asesor');
  });
  panel.appendChild(other);

  const bubble =
    message.querySelector('.chat-message-markdown') ||
    message.querySelector('.chat-message-body') ||
    message;

  bubble.appendChild(panel);
}

function setActiveNav(button) {
  document.querySelectorAll('.side-link').forEach((item) => item.classList.remove('active'));
  if (button?.classList.contains('side-link')) button.classList.add('active');
}

document.querySelectorAll('.quick-prompt').forEach((button) => {
  button.addEventListener('click', () => {
    setActiveNav(button);
    const prompt = button.dataset.prompt || '';
    if (prompt) {
      updateSessionContext(prompt);
      putPromptInChat(prompt);
    }
  });
});

navChat?.addEventListener('click', () => {
  setActiveNav(navChat);
  focusChat();
});

globalSearch?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const query = globalSearch.value.trim();
    if (query) {
      updateSessionContext(query);
      putPromptInChat(query);
      globalSearch.value = '';
    }
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    globalSearch?.focus();
    globalSearch?.select();
  }
});

function flashContext(element) {
  const row = element?.closest('.context-item');
  if (!row) return;
  row.classList.add('updated');
  setTimeout(() => row.classList.remove('updated'), 900);
}

function updateSessionContext(text) {
  if (!text) return;
  const upper = text.toUpperCase();

  const clientNames = [...text.matchAll(/(?:^|\n)\s*(?:🔹\s*)?Cliente:\s*([^\n]+)/gim)]
    .map((match) => match[1]?.replace(/\*\*/g, '').trim())
    .filter(Boolean);
  const clientName = clientNames.at(-1);

  const accounts = upper.match(/\b[A-Z]{1,5}-\d{2,8}\b/g) || [];
  const account = accounts.at(-1);
  const clientDisplay = clientName || account;

  if (clientDisplay && contextClient && contextClient.textContent !== clientDisplay) {
    contextClient.textContent = clientDisplay;
    contextClient.title = account && clientName ? `${clientName} · ${account}` : clientDisplay;
    flashContext(contextClient);
  }

  const explicitProduct = upper.match(/(?:CÓDIGO|CODIGO)(?:\s+CAF)?\s*:\s*([A-Z0-9-]{5,})/)?.[1];

  const productMention = upper.match(
    /(?:PRODUCTO|MANÓMETRO|MANOMETRO|VÁLVULA|VALVULA|TRAMPA|ACTUADOR|REGULADOR)[^\n]{0,45}?\b(\d{2}[A-Z]{2,4}\d{3,})\b/
  )?.[1];

  const standalonePraisaCode = upper.match(/\b\d{2}[A-Z]{2,4}\d{3,}\b/)?.[0];

  const product = explicitProduct || productMention || standalonePraisaCode;
  if (
    product &&
    !isInvalidDeviceProduct(product) &&
    contextProduct &&
    contextProduct.textContent !== product
  ) {
    contextProduct.textContent = product;
    flashContext(contextProduct);
  }

  const quotes = upper.match(/\bCOT[-A-Z0-9]*\d[A-Z0-9-]*\b/g) || [];
  const quote = quotes.at(-1);
  if (quote && contextQuote) {
    contextQuote.textContent = quote;
    flashContext(contextQuote);
  } else if (/\b(COTIZA|COTIZAR|COTIZACIÓN|COTIZACION|CREAR COTIZACIÓN|CREAR COTIZACION)\b/.test(upper) && contextQuote?.textContent === 'Sin iniciar') {
    contextQuote.textContent = 'En preparación';
    flashContext(contextQuote);
  }

  if (/VALIDACIÓN TÉCNICA REGISTRADA|VALIDACION TECNICA REGISTRADA|APROBAR TÉCNICAMENTE|APROBAR TECNICAMENTE/.test(upper)) {
    if (contextTech) {
      contextTech.textContent = /REGISTRADA/.test(upper) ? 'Aprobada' : 'Pendiente de aprobación';
      flashContext(contextTech);
    }
  } else if (/COTIZACIÓN DETENIDA POR CONTROL TÉCNICO|COTIZACION DETENIDA POR CONTROL TECNICO/.test(upper)) {
    if (contextTech) {
      contextTech.textContent = 'Pendiente de aprobación';
      flashContext(contextTech);
    }
  }
}

function observeChatContext() {
  const root = document.getElementById('n8n-chat');
  if (!root) return;

  let lastText = '';

  // Si el servidor no responde (reinicio, actualización o mantenimiento), muestra un aviso claro
  // en lugar del error técnico del chat.
  const avisoSinConexion = () => {
    root.querySelectorAll('.chat-message:not([data-praisa-aviso])').forEach((message) => {
      const texto = (message.innerText || message.textContent || '').trim();
      if (/^(error:?\s*)?failed to receive response|^error:\s/i.test(texto)) {
        message.dataset.praisaAviso = 'true';
        message.innerHTML = '<p>🛠️ <strong>Praisa IA está en mantenimiento o no responde en este momento.</strong><br>Vuelve a intentarlo en unos minutos. Si es urgente, consulta directamente en CAF Web.</p>';
      }
    });
  };


  // Calificación de cada respuesta (👍 / 👎 + comentario opcional). Se guarda en n8n para revisar las pruebas.
  const MARCA_FB = 'praisa-fb';
  const textoMensaje = (el) => {
    const copia = el.cloneNode(true);
    copia.querySelectorAll('.' + MARCA_FB).forEach(n => n.remove());
    return (copia.innerText || copia.textContent || '').trim();
  };
  const preguntaAnterior = (el) => {
    let n = el.previousElementSibling;
    while (n && !n.classList.contains('chat-message-from-user')) n = n.previousElementSibling;
    return n ? textoMensaje(n) : '';
  };
  const enviarCalificacion = async (message, valoracion, comentario) => {
    try {
      await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({
          valoracion, comentario: comentario || '', usuario: authUser,
          pregunta: preguntaAnterior(message).slice(0, 1500),
          respuesta: textoMensaje(message).slice(0, 3000),
          pagina: UI_BUILD
        })
      });
      return true;
    } catch (e) { console.warn('Calificación no enviada:', e); return false; }
  };
  const agregarCalificacion = () => {
    root.querySelectorAll('.chat-message-from-bot:not(.chat-message-typing):not([data-praisa-fb]):not([data-praisa-aviso])').forEach((message) => {
      const texto = textoMensaje(message);
      if (!texto || /^Hola, soy Praisa IA/.test(texto)) { message.dataset.praisaFb = 'omitido'; return; }
      message.dataset.praisaFb = 'listo';
      const barra = document.createElement('div');
      barra.className = MARCA_FB;
      barra.innerHTML = '<span>¿Te sirvió?</span><button type="button" data-v="bien" aria-label="Me sirvió">👍</button><button type="button" data-v="mal" aria-label="No me sirvió">👎</button>';
      barra.addEventListener('click', async (ev) => {
        const b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.v === 'bien') {
          barra.innerHTML = '<span>Enviando…</span>';
          barra.innerHTML = (await enviarCalificacion(message, 'bien', '')) ? '<span>✅ Gracias</span>' : '<span>⚠️ No se pudo enviar</span>';
        } else if (b.dataset.v === 'mal') {
          barra.innerHTML = '<input type="text" maxlength="400" placeholder="¿Qué estuvo mal? (opcional)" /><button type="button" data-v="enviar">Enviar</button>';
          const campo = barra.querySelector('input');
          campo.focus();
          campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); barra.querySelector('[data-v="enviar"]').click(); } });
        } else if (b.dataset.v === 'enviar') {
          const comentario = barra.querySelector('input')?.value.trim() || '';
          barra.innerHTML = '<span>Enviando…</span>';
          barra.innerHTML = (await enviarCalificacion(message, 'mal', comentario)) ? '<span>✅ Gracias, lo revisaremos</span>' : '<span>⚠️ No se pudo enviar</span>';
        }
      });
      (message.querySelector('.chat-message-markdown') || message).appendChild(barra);
    });
  };


  const enhanceMessages = () => {
    const body = root.querySelector('.chat-body');

    root.querySelectorAll('.chat-message:not([data-praisa-enhanced])').forEach((message) => {
      message.dataset.praisaEnhanced = 'true';

      const messageText = (message.innerText || message.textContent || '').trim();
      const isUserMessage = message.classList.contains('chat-message-from-user');
      const isBotMessage = message.classList.contains('chat-message-from-bot');
      const quoteInProgress = contextQuote && /preparaci[oó]n/i.test(contextQuote.textContent || '');

      if (isBotMessage) {
        enhanceAdvisorSelector(message);
      }

      if (isUserMessage && quoteInProgress && /^\d+(?:[.,]\d+)?$/.test(messageText)) {
        root.classList.add('praisa-validating-stock');
        helperText.textContent = 'Validando producto y existencias en CAF…';
      }

      if (isBotMessage && root.classList.contains('praisa-validating-stock')) {
        root.classList.remove('praisa-validating-stock');
        helperText.textContent = 'Puedes seguir agregando códigos o continuar con la cotización.';
      }

      if (!message.classList.contains('chat-message-typing') && preferences.motion) {
        message.classList.add('praisa-message-enter');
        setTimeout(() => message.classList.remove('praisa-message-enter'), 500);
      }
    });

    if (body) {
      requestAnimationFrame(() => {
        body.scrollTo({
          top: body.scrollHeight,
          behavior: preferences.motion ? 'smooth' : 'auto'
        });
      });
    }
  };

  const read = () => {
    avisoSinConexion();
    agregarCalificacion();
    const messagesOnly = [...root.querySelectorAll('.chat-message')]
      .filter(message => !message.classList.contains('chat-message-typing'))
      .map(message => textoMensaje(message))
      .filter(Boolean)
      .join('\n');

    if (messagesOnly !== lastText) {
      lastText = messagesOnly;
      updateSessionContext(messagesOnly);
    }

    enhanceMessages();
    ensureVoiceControls();
    maybeResumeHandsFreeAfterBot();
    syncCommandCenterSummary();
    sanitizeVisibleContext();
  };

  const observer = new MutationObserver(read);
  observer.observe(root, { childList:true, subtree:true,characterData:true });
  read();
}

function startChat(username, password) {
  if (chatStarted) return;

  const token = btoa(unescape(encodeURIComponent(username + ':' + password)));
  authHeader = 'Basic ' + token;
  authUser = username;

  createChat({
    webhookUrl: WEBHOOK_URL,
    webhookConfig: {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + token
      }
    },
    target: '#n8n-chat',
    mode: 'fullscreen',
    chatInputKey: 'chatInput',
    chatSessionKey: 'sessionId',
    loadPreviousSession: false,
    metadata: {
      source: 'praisa-interno-web',
      channel: 'internal-pilot'
    },
    showWelcomeScreen: false,
    defaultLanguage: 'en',
    initialMessages: [
      'Hola, soy Praisa IA. Tu asistente interno.\n\nPuedo ayudarte a consultar CAF, productos, existencias, clientes, documentación técnica y cotizaciones.\n\n¿Qué necesitas hacer?'
    ],
    i18n: {
      en: {
        title: 'Praisa IA Interno',
        subtitle: 'Asistente virtual interno',
        footer: '',
        getStarted: 'Nueva conversación',
        inputPlaceholder: 'Escribe o habla con Praisa IA...'
      }
    },
    enableStreaming: false
  });

  chatStarted = true;

  if (contextProduct) contextProduct.textContent = 'Sin seleccionar';
  if (contextClient) contextClient.textContent = 'Sin seleccionar';
  if (contextQuote) contextQuote.textContent = 'Sin iniciar';
  if (contextTech) contextTech.textContent = 'Sin requerir';

  gate.hidden = true;
  logoutButton.hidden = false;
  setStatus('online', 'Sesión interna', 'Praisa IA conectado');
  passInput.value = '';
  setTimeout(() => {
    helperText.textContent = 'Escribe tu consulta o usa un acceso rápido. Califica cada respuesta con 👍 o 👎 para mejorar el asistente.';
    observeChatContext();
  }, 600);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = userInput.value.trim();
  const password = passInput.value;

  if (!username || !password) {
    errorBox.textContent = 'Ingresa usuario y contraseña.';
    return;
  }

  errorBox.textContent = '';

  try {
    startChat(username, password);
  } catch (error) {
    console.error(error);
    errorBox.textContent = 'No fue posible iniciar el chat.';
    setStatus('error', 'Error de acceso', 'Revisa la configuración interna');
  }
});

logoutButton.addEventListener('click', () => location.reload());
