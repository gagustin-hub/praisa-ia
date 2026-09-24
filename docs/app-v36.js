import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const WEBHOOK_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/8f4d8f21-7b6a-4f47-9d2e-166000000167/chat';
const VOICE_TRANSCRIBE_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/praisa-voice-b8a6c1f4-7a10-4a3f-91d9-0a0000000180';
const PREF_KEY = 'praisa-ia-preferences-v1';
const UI_BUILD = 'v36-context-safe-visual';

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
  helperText.textContent = 'Mensaje preparado. Puedes editarlo antes de enviarlo.';
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
let voiceAudioContext = null;
let voiceAnalyser = null;
let voiceMeterFrame = null;
let voicePeakSeen = false;
let voiceStartedAt = 0;
let handsFreeMode = false;
let handsFreeArmed = false;
let handsFreeSilenceSince = 0;
let handsFreeSpeechStarted = false;
let handsFreeLastBotSignature = '';
let handsFreeRestartTimer = null;
let handsFreeStopRequested = false;
let voiceSpeechFrames = 0;
let voiceStrongSpeechFrames = 0;
let voicePeakRms = 0;

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

function voiceButton() {
  return document.querySelector('#n8n-chat .praisa-voice-button');
}

function microphoneSelect() {
  return document.querySelector('.praisa-mic-select');
}

function setVoiceUi(state, message) {
  const root = document.getElementById('n8n-chat');
  const button = voiceButton();
  if (!root || !button) return;

  const recording = state === 'recording';
  const sending = state === 'sending';

  voiceRecording = recording;
  voiceSending = sending;

  root.classList.toggle('praisa-voice-listening', recording);
  root.classList.toggle('praisa-voice-sending', sending);
  button.classList.toggle('is-listening', recording);
  button.classList.toggle('is-sending', sending);
  button.disabled = sending;

  button.setAttribute('aria-pressed', recording ? 'true' : 'false');
  button.setAttribute('aria-label', recording ? 'Detener grabación' : 'Hablar con Praisa IA');
  button.title = recording ? 'Detener grabación' : 'Hablar con Praisa IA';

  if (message) helperText.textContent = message;
}

function cleanupVoiceStream() {
  if (voiceMeterFrame) {
    cancelAnimationFrame(voiceMeterFrame);
    voiceMeterFrame = null;
  }
  if (voiceAudioContext) {
    try { voiceAudioContext.close(); } catch {}
    voiceAudioContext = null;
  }
  voiceAnalyser = null;

  if (voiceStream) {
    try { voiceStream.getTracks().forEach(track => track.stop()); } catch {}
  }
  voiceStream = null;

  const root = document.getElementById('n8n-chat');
  root?.classList.remove('praisa-audio-detected');
  root?.style.removeProperty('--praisa-voice-level');
}

function setHandsFreeMode(enabled, message) {
  handsFreeMode = enabled;
  handsFreeStopRequested = !enabled;

  const root = document.getElementById('n8n-chat');
  const button = voiceButton();

  root?.classList.toggle('praisa-handsfree-active', enabled);
  button?.classList.toggle('is-handsfree', enabled);

  if (button) {
    button.title = enabled
      ? 'Desactivar conversación por voz'
      : 'Activar conversación por voz';
    button.setAttribute(
      'aria-label',
      enabled ? 'Desactivar conversación por voz' : 'Activar conversación por voz'
    );
  }

  if (message) helperText.textContent = message;

  if (!enabled) {
    if (handsFreeRestartTimer) {
      clearTimeout(handsFreeRestartTimer);
      handsFreeRestartTimer = null;
    }

    handsFreeArmed = false;
    handsFreeSpeechStarted = false;
    handsFreeSilenceSince = 0;

    if (voiceRecording && voiceRecorder) {
      try { voiceRecorder.stop(); } catch {}
    }

    cleanupVoiceStream();
  }
}

function latestBotMessageSignature() {
  const root = document.getElementById('n8n-chat');
  if (!root) return '';

  const messages = [...root.querySelectorAll('.chat-message-from-bot')]
    .filter(m => !m.classList.contains('chat-message-typing'));

  const last = messages.at(-1);
  return (last?.innerText || last?.textContent || '').trim();
}

function botIsTyping() {
  const root = document.getElementById('n8n-chat');
  return Boolean(root?.querySelector('.chat-message-typing'));
}

function scheduleHandsFreeListen(delay = 550) {
  if (!handsFreeMode || handsFreeStopRequested) return;

  if (handsFreeRestartTimer) clearTimeout(handsFreeRestartTimer);

  handsFreeRestartTimer = setTimeout(async () => {
    handsFreeRestartTimer = null;

    if (!handsFreeMode || handsFreeStopRequested || botIsTyping() || voiceSending || voiceRecording) {
      return;
    }

    await startVoiceRecording({ handsFree:true });
  }, delay);
}

function maybeResumeHandsFreeAfterBot() {
  if (!handsFreeMode || handsFreeStopRequested) return;
  if (botIsTyping() || voiceSending || voiceRecording) return;

  const signature = latestBotMessageSignature();
  if (!signature || signature === handsFreeLastBotSignature) return;

  handsFreeLastBotSignature = signature;
  helperText.textContent = '🎙️ Praisa IA terminó de responder. Te escucho en un momento…';
  scheduleHandsFreeListen(500);
}

function userMessageCount() {
  const root = document.getElementById('n8n-chat');
  return root ? root.querySelectorAll('.chat-message-from-user').length : 0;
}

function latestUserMessageText() {
  const root = document.getElementById('n8n-chat');
  const messages = root ? [...root.querySelectorAll('.chat-message-from-user')] : [];
  const last = messages.at(-1);
  return (last?.innerText || last?.textContent || '').trim();
}

async function waitForUserMessageSent(previousCount, expectedText, timeoutMs = 1400) {
  const started = performance.now();

  while (performance.now() - started < timeoutMs) {
    const count = userMessageCount();
    const last = latestUserMessageText();

    if (count > previousCount || (last && last === expectedText)) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve,90));
  }

  return false;
}

async function sendHandsFreeMessageReliably(value) {
  const input = chatInput();
  const root = document.getElementById('n8n-chat');
  if (!input || !root) return false;

  const before = userMessageCount();
  setChatInputValue(value);
  input.focus();

  await new Promise(resolve => setTimeout(resolve,180));

  const sendButton =
    root.querySelector('.chat-input-send-button') ||
    root.querySelector('button[type="submit"]') ||
    [...root.querySelectorAll('.chat-input button, .chat-inputs button')]
      .filter(button => !button.classList.contains('praisa-voice-button'))
      .find(button => !button.disabled);

  if (sendButton && !sendButton.disabled) {
    sendButton.click();
    if (await waitForUserMessageSent(before,value,900)) return true;
  }

  input.dispatchEvent(new KeyboardEvent('keydown',{
    key:'Enter',
    code:'Enter',
    bubbles:true,
    cancelable:true
  }));

  input.dispatchEvent(new KeyboardEvent('keyup',{
    key:'Enter',
    code:'Enter',
    bubbles:true,
    cancelable:true
  }));

  if (await waitForUserMessageSent(before,value,900)) return true;

  const form = input.closest('form');
  if (form?.requestSubmit) {
    try { form.requestSubmit(); } catch {}
    if (await waitForUserMessageSent(before,value,700)) return true;
  }

  return false;
}

function lastBotPromptText() {
  const root = document.getElementById('n8n-chat');
  if (!root) return '';

  const messages = [...root.querySelectorAll('.chat-message-from-bot')]
    .filter(m => !m.classList.contains('chat-message-typing'));

  const last = messages.at(-1);
  return (last?.innerText || last?.textContent || '').trim();
}

function expectedVoiceAnswerType() {
  const text = lastBotPromptText()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();

  if (/que cliente|nombre o cuenta caf|cliente deseas|cuenta caf/.test(text)) return 'client';
  if (/codigo del producto|codigo.*cotizar|dime el codigo|otro codigo/.test(text)) return 'product_code';
  if (/cuantas unidades|cantidad deseas|cantidad.*cotizar/.test(text)) return 'quantity';
  if (/condiciones? de pago|condicion de pago/.test(text)) return 'payment';
  if (/selecciona el asesor|asesor responsable|que asesor/.test(text)) return 'advisor';
  if (/correo/.test(text)) return 'email';
  if (/telefono/.test(text)) return 'phone';
  return 'free';
}

function isExplicitIntentSwitch(text) {
  const n = String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();

  return (
    /\b(quiero|necesito|deseo|consultar|buscar|informacion)\b.*\b(producto|manometro|valvula|trampa|existencia|precio|cotizacion|cliente)\b/.test(n) ||
    /\b(crear|iniciar|hacer)\b.*\bcotizacion\b/.test(n)
  );
}

function isGarbageVoiceTranscript(text) {
  const n = String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();

  if (!n) return true;

  const exactGarbage = new Set([
    'gracias',
    'muchas gracias',
    'gracias muchas gracias',
    'hasta luego',
    'subtitulos realizados por la comunidad de amara org',
    'subtitulos por la comunidad de amara org',
    'amara org',
    'thank you',
    'thank you for watching'
  ]);

  return exactGarbage.has(n);
}

function spanishNumberToDigits(text) {
  const n = String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim();

  const direct = n.match(/\b\d+(?:[.,]\d+)?\b/);
  if (direct) return direct[0].replace(',','.');

  const basic = {
    'uno':1,'una':1,'un':1,'dos':2,'tres':3,'cuatro':4,'cinco':5,'seis':6,'siete':7,'ocho':8,'nueve':9,
    'diez':10,'once':11,'doce':12,'trece':13,'catorce':14,'quince':15,'dieciseis':16,'diecisiete':17,
    'dieciocho':18,'diecinueve':19,'veinte':20,'veintiuno':21,'veintidos':22,'veintitres':23,'veinticuatro':24,
    'veinticinco':25,'veintiseis':26,'veintisiete':27,'veintiocho':28,'veintinueve':29,'treinta':30,
    'cuarenta':40,'cincuenta':50,'sesenta':60,'setenta':70,'ochenta':80,'noventa':90,'cien':100
  };

  if (Object.prototype.hasOwnProperty.call(basic,n)) return String(basic[n]);

  const parts=n.split(/\s+y\s+/);
  if(parts.length===2 && basic[parts[0]]>=30 && basic[parts[1]]>0 && basic[parts[1]]<10){
    return String(basic[parts[0]]+basic[parts[1]]);
  }

  return '';
}

function looksLikeSuspiciousClientTranscript(text) {
  const n = String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();

  if (!n) return true;

  // CAF account-like response: let it pass.
  if (/^[a-z]{1,5}-?\d{2,8}$/i.test(n.replace(/\s+/g,''))) return false;

  // Common client/company terms are plausible names.
  if (/\b(ingenio|sociedad|anonima|olme(c|k)a|pantaleon|magdalena|tulula|union|san diego|bimbo|cerveceria|alimentos|industria|industrial)\b/.test(n)) {
    return false;
  }

  const conversationalNoise = [
    'para','ahi','tiene','otro','lugar','cosa','asi','quedarme',
    'gracias','muchas','bueno','pues','entonces','dale','correcto'
  ];

  const words = n.split(' ').filter(Boolean);
  const noiseCount = words.filter(word => conversationalNoise.includes(word)).length;

  // A short phrase dominated by conversational filler is very unlikely to be a client.
  return words.length <= 8 && noiseCount >= 2;
}

function normalizeVoiceText(text) {
  return String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9@.+_ -]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function isGenericAssistantPrompt() {
  const n = normalizeVoiceText(lastBotPromptText());
  return (
    /que necesitas hacer|en que puedo ayudarte|puedo ayudarte a consultar/.test(n) ||
    /hola soy praisa ia/.test(n)
  );
}

function hasPraisaIntent(text) {
  const n = normalizeVoiceText(text);

  const intentTerms = [
    'cotizacion','cotizar','cotiza','cliente','producto','codigo','caf',
    'existencia','existencias','precio','precios','manometro','valvula',
    'trampa','actuador','ficha tecnica','base tecnica','documentacion',
    'historial','asesor','reporte','pedido','movimiento'
  ];

  if (intentTerms.some(term => n.includes(term))) return true;
  if (extractPraisaProductCode(text)) return true;
  if (/\b[a-z]{1,5}-?\d{2,8}\b/i.test(n.replace(/\s+/g,''))) return true;

  return false;
}

function isLikelyVoiceHallucination(text) {
  const n = normalizeVoiceText(text);
  if (!n) return true;

  const knownHallucinationFragments = [
    'respecto a todos',
    'para que tengamos una accion',
    'quiero brindar por ti',
    'su ansiedad',
    'gracias por ver',
    'muchas gracias',
    'subtitulos',
    'amara org'
  ];

  if (knownHallucinationFragments.some(fragment => n.includes(fragment))) return true;

  if (isGenericAssistantPrompt() && !hasPraisaIntent(text)) return true;

  return false;
}

function prepareHandsFreeReply(rawText) {
  let value = String(rawText || '').trim();
  const expected = expectedVoiceAnswerType();

  if (isGarbageVoiceTranscript(value) || isLikelyVoiceHallucination(value)) {
    return {
      ok:false,
      retry:true,
      reason:'No entendí una instrucción clara de Praisa en esa frase.'
    };
  }

  if (isExplicitIntentSwitch(value)) {
    return { ok:true, value, expected:'intent_switch' };
  }

  if (expected === 'product_code') {
    const code = extractPraisaProductCode(value);
    if (!code) {
      return { ok:false, retry:true, reason:'No identifiqué un código de producto válido.' };
    }
    return { ok:true, value:code, expected };
  }

  if (expected === 'quantity') {
    const quantity = spanishNumberToDigits(value);
    if (!quantity) {
      return { ok:false, retry:true, reason:'No identifiqué la cantidad.' };
    }
    return { ok:true, value:quantity, expected };
  }

  if (expected === 'email') {
    const email = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
    if (!email) return { ok:false,retry:true,reason:'No identifiqué un correo válido.' };
    return { ok:true,value:email,expected };
  }

  if (expected === 'phone') {
    const phone = value.match(/\+?\d[\d\s().-]{6,}\d/)?.[0]?.trim() || '';
    if (!phone) return { ok:false,retry:true,reason:'No identifiqué un teléfono válido.' };
    return { ok:true,value:phone,expected };
  }

  if (expected === 'client') {
    if (value.length < 3 || looksLikeSuspiciousClientTranscript(value)) {
      return {
        ok:false,
        retry:true,
        reason:'No entendí con suficiente claridad el nombre o la cuenta del cliente.'
      };
    }
  }

  return { ok:true,value,expected };
}

async function autoSendHandsFreeText(text) {
  const prepared = prepareHandsFreeReply(text);

  if (!prepared.ok) {
    helperText.textContent = '⚠️ ' + prepared.reason + ' Te escucho otra vez…';
    setChatInputValue('');
    scheduleHandsFreeListen(850);
    return;
  }

  const value = prepared.value;
  helperText.textContent = '✅ Entendí: “' + value + '” · enviando automáticamente…';

  const sent = await sendHandsFreeMessageReliably(value);

  handsFreeArmed = false;
  handsFreeSpeechStarted = false;
  handsFreeSilenceSince = 0;

  if (!sent) {
    helperText.textContent =
      '⚠️ No pude enviar automáticamente. Reintentando…';

    await new Promise(resolve => setTimeout(resolve,350));
    const retry = await sendHandsFreeMessageReliably(value);

    if (!retry) {
      setChatInputValue(value);
      helperText.textContent =
        '⚠️ Dejé la respuesta en la barra porque el envío automático no respondió.';
      return;
    }
  }

  handsFreeLastBotSignature = latestBotMessageSignature();
  helperText.textContent = '⏳ Mensaje enviado. Esperando respuesta de Praisa IA…';
}

function startVoiceMeter(stream) {
  const root = document.getElementById('n8n-chat');
  const AudioContextAPI = window.AudioContext || window.webkitAudioContext;
  if (!root || !AudioContextAPI) return;

  try {
    voiceAudioContext = new AudioContextAPI();
    const source = voiceAudioContext.createMediaStreamSource(stream);
    voiceAnalyser = voiceAudioContext.createAnalyser();
    voiceAnalyser.fftSize = 512;
    voiceAnalyser.smoothingTimeConstant = 0.70;
    source.connect(voiceAnalyser);

    const data = new Uint8Array(voiceAnalyser.fftSize);
    let framesAbove = 0;

    const draw = () => {
      if (!voiceAnalyser) return;

      voiceAnalyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const sample = (data[i] - 128) / 128;
        sum += sample * sample;
      }

      const rms = Math.sqrt(sum / data.length);
      voicePeakRms = Math.max(voicePeakRms, rms);
      if (rms > 0.015) voiceSpeechFrames++;
      if (rms > 0.03) voiceStrongSpeechFrames++;
      const level = Math.min(1, rms * 10);
      root.style.setProperty('--praisa-voice-level', String(level));

      const speaking = rms > 0.015;

      if (speaking) framesAbove++;
      else framesAbove = Math.max(0,framesAbove - 1);

      if (framesAbove >= 3) {
        if (!voicePeakSeen) {
          voicePeakSeen = true;
          root.classList.add('praisa-audio-detected');
        }

        if (handsFreeMode && voiceRecording) {
          handsFreeSpeechStarted = true;
          handsFreeSilenceSince = 0;
          helperText.textContent = '🗣️ Te escucho…';
        }
      } else if (handsFreeMode && voiceRecording && handsFreeSpeechStarted) {
        if (!handsFreeSilenceSince) handsFreeSilenceSince = performance.now();

        const silenceMs = performance.now() - handsFreeSilenceSince;

        if (silenceMs >= 1750 && voiceRecorder?.state === 'recording') {
          helperText.textContent = '⏳ Terminaste de hablar. Procesando…';

          try {
            voiceRecorder.requestData?.();
            setTimeout(() => {
              try {
                if (voiceRecorder?.state === 'recording') voiceRecorder.stop();
              } catch {}
            },90);
          } catch {
            try { voiceRecorder.stop(); } catch {}
          }

          handsFreeSilenceSince = 0;
        }
      }

      voiceMeterFrame = requestAnimationFrame(draw);
    };

    draw();
  } catch (error) {
    console.warn('Medidor de audio no disponible:',error);
  }
}

async function refreshMicrophoneDevices() {
  const select = microphoneSelect();
  if (!select) return;

  select.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = '';
  auto.textContent = 'Micrófono predeterminado';
  select.appendChild(auto);

  if (!navigator.mediaDevices?.enumerateDevices) {
    select.disabled = true;
    return;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const microphones = devices.filter(device => device.kind === 'audioinput');
    const saved = localStorage.getItem(MIC_DEVICE_KEY) || '';
    const virtualPattern = /(droidcam|stereo mix|mezcla est[eé]reo|vb-audio|cable|virtual|obs)/i;
    const preferredPattern = /(microphone array|matriz de micr[oó]fonos|headset|auriculares|realtek|intel.*sound|microphone|micr[oó]fono)/i;

    const ranked = [...microphones].sort((a,b) => {
      const score = d => {
        const label = d.label || '';
        if (virtualPattern.test(label)) return -10;
        if (preferredPattern.test(label)) return 10;
        return 0;
      };
      return score(b) - score(a);
    });

    ranked.forEach((device,index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      const isVirtual = virtualPattern.test(device.label || '');
      option.textContent = (device.label || ('Micrófono ' + (index + 1))) + (isVirtual ? ' · virtual' : '');
      select.appendChild(option);
    });

    select.disabled = false;

    if (saved && [...select.options].some(option => option.value === saved)) {
      select.value = saved;
    } else {
      const preferred = ranked.find(device => !virtualPattern.test(device.label || ''));
      if (preferred) {
        select.value = preferred.deviceId;
        localStorage.setItem(MIC_DEVICE_KEY, preferred.deviceId);
      }
    }

    const selectedLabel = select.selectedOptions?.[0]?.textContent || '';
    if (virtualPattern.test(selectedLabel)) {
      helperText.textContent = '⚠️ Ese dispositivo es virtual. Para dictar usa el micrófono físico de la PC o de los audífonos.';
    }
  } catch (error) {
    console.warn('No pude listar micrófonos:', error);
  }
}

function selectedAudioConstraints() {
  const selected = microphoneSelect()?.value || '';
  const base = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
    sampleRate: 48000,
    sampleSize: 16
  };

  return selected
    ? { ...base, deviceId: { exact: selected } }
    : base;
}

function chooseRecorderMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ];

  return candidates.find(type => window.MediaRecorder?.isTypeSupported?.(type)) || '';
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

async function sendRecordedAudio(blob, mimeType) {
  if (!blob || blob.size < 500) {
    setVoiceUi('idle', '⚠️ La grabación quedó vacía. Habla durante al menos 1 segundo.');
    if (handsFreeMode) scheduleHandsFreeListen(850);
    return;
  }

  if (
    handsFreeMode &&
    (voiceSpeechFrames < 18 || voiceStrongSpeechFrames < 4 || voicePeakRms < 0.022)
  ) {
    setVoiceUi(
      'idle',
      '🎙️ Escuché ruido, pero no una voz suficientemente clara. Te escucho otra vez…'
    );
    scheduleHandsFreeListen(850);
    return;
  }

  const sizeKb = Math.max(1, Math.round(blob.size / 1024));
  setVoiceUi('sending', '📤 Grabación capturada (' + sizeKb + ' KB). Enviando a n8n…');

  const extension =
    mimeType.includes('mp4') ? 'm4a' :
    mimeType.includes('ogg') ? 'ogg' : 'webm';

  const form = new FormData();
  form.append('audiofile', blob, 'praisa-voz.' + extension);

  try {
    const response = await fetch(VOICE_TRANSCRIBE_URL, {
      method:'POST',
      body:form,
      cache:'no-store'
    });

    const raw = await response.text();

    if (!response.ok) {
      throw new Error('Webhook respondió HTTP ' + response.status + ': ' + raw.slice(0,180));
    }

    let data = {};
    try { data = JSON.parse(raw); }
    catch { data = { text: raw }; }

    const transcript = String(data.text || data.transcript || '').trim();

    if (!transcript) {
      throw new Error('n8n respondió, pero la transcripción llegó vacía.');
    }

    const normalized = transcript
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9 ]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();

    const falseTranscripts = [
      'subtitulos realizados por la comunidad de amara org',
      'subtitulos por la comunidad de amara org',
      'amara org',
      'gracias por ver el video',
      'thank you for watching'
    ];

    if (falseTranscripts.some(text => normalized.includes(text))) {
      setVoiceUi(
        'idle',
        handsFreeMode
          ? '⚠️ La transcripción no fue válida. Te escucho otra vez…'
          : '⚠️ n8n recibió el audio, pero la transcripción no fue válida. Prueba con el micrófono Realtek y habla más cerca.'
      );
      if (handsFreeMode) scheduleHandsFreeListen(700);
      return;
    }

    const normalizedResult = normalizePraisaTranscript(transcript);
    const finalText = normalizedResult.text || transcript;

    if (handsFreeMode) {
      setVoiceUi('idle');
      await autoSendHandsFreeText(finalText);
    } else {
      setChatInputValue(finalText);
      setVoiceUi(
        'idle',
        normalizedResult.correction
          ? '✅ ' + normalizedResult.correction + '. Revisa y pulsa enviar.'
          : '✅ Transcripción recibida. Revisa el texto en la barra y pulsa enviar.'
      );
      chatInput()?.focus();
    }
  } catch (error) {
    console.error('Transcripción de voz:', error);
    setVoiceUi(
      'idle',
      '❌ Falló el envío/transcripción: ' + (error?.message || 'error desconocido')
    );

    if (handsFreeMode) {
      helperText.textContent += ' · volveré a escucharte.';
      scheduleHandsFreeListen(900);
    }
  }
}

async function startVoiceRecording(options = {}) {
  const handsFree = Boolean(options.handsFree);
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    helperText.textContent = '❌ Este navegador no permite grabar audio desde esta página.';
    return;
  }

  if (voiceSending) return;

  if (voiceRecording && voiceRecorder) {
    const elapsed = Date.now() - voiceStartedAt;
    if (elapsed < 700) {
      helperText.textContent = 'Habla un poco más antes de detener la grabación.';
      return;
    }

    setVoiceUi('idle','⏳ Cerrando grabación…');
    try {
      voiceRecorder.requestData?.();
      setTimeout(() => {
        try { voiceRecorder?.stop(); } catch {}
      },120);
    } catch {
      try { voiceRecorder.stop(); } catch {}
    }
    return;
  }

  cleanupVoiceStream();
  voiceChunks = [];
  voicePeakSeen = false;
  voiceStartedAt = 0;
  voiceSpeechFrames = 0;
  voiceStrongSpeechFrames = 0;
  voicePeakRms = 0;
  handsFreeSpeechStarted = false;
  handsFreeSilenceSince = 0;
  handsFreeArmed = handsFree;

  const preferredConstraints = selectedAudioConstraints();

  const openStream = async (constraints) => {
    return navigator.mediaDevices.getUserMedia({ audio: constraints });
  };

  try {
    helperText.textContent = '🎙️ Abriendo el micrófono seleccionado…';

    try {
      voiceStream = await openStream(preferredConstraints);
    } catch (selectedError) {
      console.warn('Falló el micrófono seleccionado, probando predeterminado:', selectedError);
      localStorage.removeItem(MIC_DEVICE_KEY);
      voiceStream = await openStream({
        echoCancellation:true,
        noiseSuppression:true,
        autoGainControl:true,
        channelCount:1
      });
    }

    const audioTrack = voiceStream.getAudioTracks()[0];
    if (!audioTrack || audioTrack.readyState !== 'live') {
      throw new Error('Chrome abrió el micrófono, pero no entregó una pista de audio activa.');
    }

    await refreshMicrophoneDevices();

    const deviceName = audioTrack.label || 'Micrófono predeterminado';
    const mimeType = chooseRecorderMimeType();
    const options = mimeType ? { mimeType } : undefined;

    voiceRecorder = new MediaRecorder(voiceStream, options);

    voiceRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) voiceChunks.push(event.data);
    };

    voiceRecorder.onerror = event => {
      console.error('MediaRecorder:', event.error || event);
      cleanupVoiceStream();
      voiceRecorder = null;
      setVoiceUi('idle','❌ Error al grabar audio.');
    };

    voiceRecorder.onstop = async () => {
      const recorder = voiceRecorder;
      const actualMime = recorder?.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(voiceChunks, { type:actualMime });

      voiceRecorder = null;
      voiceChunks = [];
      cleanupVoiceStream();

      await sendRecordedAudio(blob,actualMime);
    };

    startVoiceMeter(voiceStream);
    voiceRecorder.start(250);
    voiceStartedAt = Date.now();

    setVoiceUi(
      'recording',
      handsFree
        ? '🎙️ Te escucho con ' + deviceName + ' · responde cuando quieras.'
        : '🔴 GRABANDO con ' + deviceName + ' · habla ahora y pulsa 🎙️ otra vez al terminar.'
    );

    setTimeout(() => {
      if (voiceRecording && !voicePeakSeen) {
        helperText.textContent = handsFree
          ? '🎙️ Sigo escuchando… responde cuando quieras.'
          : '⚠️ El micrófono está abierto, pero todavía no detecto sonido. Revisa el nivel de entrada de Windows o cambia de micrófono.';
      }
    },3200);
  } catch (error) {
    console.error('Micrófono:', error);
    cleanupVoiceStream();
    voiceRecorder = null;

    const name = error?.name || '';
    if (name === 'NotAllowedError') {
      helperText.textContent = '❌ Chrome tiene bloqueado el micrófono. Permítelo junto a la barra de direcciones.';
    } else if (name === 'NotFoundError') {
      helperText.textContent = '❌ Windows/Chrome no encontró ningún micrófono.';
    } else {
      helperText.textContent = '❌ No pude abrir el micrófono: ' + (error?.message || name || 'error desconocido');
    }
  }
}

function cleanupDuplicateMicControls() {
  const wraps = [...document.querySelectorAll('.praisa-mic-device-wrap')];
  wraps.slice(1).forEach(el => el.remove());

  const buttons = [...document.querySelectorAll('#n8n-chat .praisa-voice-button')];
  buttons.slice(1).forEach(el => el.remove());
}

function ensureVoiceControls() {
  cleanupDuplicateMicControls();
  const root = document.getElementById('n8n-chat');
  const input = chatInput();
  if (!root || !input) return;

  const composer = input.closest('.chat-inputs') || input.parentElement;
  if (!composer) return;

  if (!root.querySelector('.praisa-voice-button')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'praisa-voice-button';
    button.innerHTML = '<span aria-hidden="true">🎙️</span>';
    button.setAttribute('aria-label', 'Hablar con Praisa IA');
    button.title = 'Hablar con Praisa IA';

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      if (handsFreeMode) {
        setHandsFreeMode(false,'⏹️ Conversación por voz desactivada.');
        return;
      }

      setHandsFreeMode(
        true,
        '🎙️ Modo voz automático activo. Ya no necesitas pulsar Enviar: habla y Praisa IA hará el resto.'
      );

      handsFreeLastBotSignature = latestBotMessageSignature();
      scheduleHandsFreeListen(250);
    });

    const sendButton =
      composer.querySelector('.chat-input-send-button') ||
      composer.querySelector('button[type="submit"]');

    if (sendButton && sendButton.parentElement === composer) {
      composer.insertBefore(button, sendButton);
    } else {
      composer.appendChild(button);
    }
  }

  if (!document.querySelector('.praisa-mic-device-wrap')) {
    const wrap = document.createElement('div');
    wrap.className = 'praisa-mic-device-wrap';

    const label = document.createElement('span');
    label.textContent = 'Micrófono:';

    const select = document.createElement('select');
    select.className = 'praisa-mic-select';
    select.setAttribute('aria-label', 'Seleccionar micrófono');

    select.addEventListener('change', () => {
      localStorage.setItem(MIC_DEVICE_KEY, select.value || '');
      const label = select.selectedOptions?.[0]?.textContent || '';
      if (/(droidcam|stereo mix|mezcla est[eé]reo|vb-audio|cable|virtual|obs)/i.test(label)) {
        helperText.textContent = '⚠️ Ese dispositivo parece virtual. Usa el micrófono físico de la PC o de los audífonos.';
      } else {
        helperText.textContent = 'Micrófono seleccionado. Pulsa 🎙️ una vez para iniciar conversación por voz.';
      }
    });

    wrap.append(label, select);

    const footer =
      root.querySelector('.chat-footer') ||
      root.querySelector('.chat-layout') ||
      root;

    footer.appendChild(wrap);

    refreshMicrophoneDevices();
  }

  cleanupDuplicateMicControls();
}

navigator.mediaDevices?.addEventListener?.('devicechange', () => {
  refreshMicrophoneDevices();
});

setInterval(() => {
  if (handsFreeMode && !handsFreeStopRequested) {
    maybeResumeHandsFreeAfterBot();
  }
},450);

function syncCommandCenterSummary() {
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
  const rejectedDeviceModels = new Set(['H630BT']);
  if (
    product &&
    !rejectedDeviceModels.has(product) &&
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
    const messagesOnly = [...root.querySelectorAll('.chat-message')]
      .filter(message => !message.classList.contains('chat-message-typing'))
      .map(message => (message.innerText || message.textContent || '').trim())
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
  };

  const observer = new MutationObserver(read);
  observer.observe(root, { childList:true, subtree:true,characterData:true });
  read();
}

function startChat(username, password) {
  if (chatStarted) return;

  const token = btoa(unescape(encodeURIComponent(username + ':' + password)));

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
    helperText.textContent = 'Praisa IA ' + UI_BUILD + ' · Centro de operaciones visual activo.';
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
