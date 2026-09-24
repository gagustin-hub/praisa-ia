import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const WEBHOOK_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/8f4d8f21-7b6a-4f47-9d2e-166000000167/chat';
const VOICE_TRANSCRIBE_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/praisa-voice-b8a6c1f4-7a10-4a3f-91d9-0a0000000180';
const PREF_KEY = 'praisa-ia-preferences-v1';
const UI_BUILD = 'v28-praisa-voice-correction';

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

function startVoiceMeter(stream) {
  const root = document.getElementById('n8n-chat');
  const AudioContextAPI = window.AudioContext || window.webkitAudioContext;
  if (!root || !AudioContextAPI) return;

  try {
    voiceAudioContext = new AudioContextAPI();
    const source = voiceAudioContext.createMediaStreamSource(stream);
    voiceAnalyser = voiceAudioContext.createAnalyser();
    voiceAnalyser.fftSize = 512;
    voiceAnalyser.smoothingTimeConstant = 0.72;
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
      const level = Math.min(1, rms * 10);
      root.style.setProperty('--praisa-voice-level', String(level));

      if (rms > 0.018) framesAbove++;
      else framesAbove = Math.max(0, framesAbove - 1);

      if (framesAbove >= 3 && !voicePeakSeen) {
        voicePeakSeen = true;
        root.classList.add('praisa-audio-detected');
        helperText.textContent = '🔊 Audio detectado · sigue hablando y pulsa 🎙️ al terminar.';
      }

      voiceMeterFrame = requestAnimationFrame(draw);
    };

    draw();
  } catch (error) {
    console.warn('Medidor de audio no disponible:', error);
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
    channelCount: 1
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
        '⚠️ n8n recibió el audio, pero la transcripción no fue válida. Prueba con el micrófono Realtek y habla más cerca.'
      );
      return;
    }

    const normalizedResult = normalizePraisaTranscript(transcript);
    const finalText = normalizedResult.text || transcript;

    setChatInputValue(finalText);
    setVoiceUi(
      'idle',
      normalizedResult.correction
        ? '✅ ' + normalizedResult.correction + '. Revisa y pulsa enviar.'
        : '✅ Transcripción recibida. Revisa el texto en la barra y pulsa enviar.'
    );
    chatInput()?.focus();
  } catch (error) {
    console.error('Transcripción de voz:', error);
    setVoiceUi(
      'idle',
      '❌ Falló el envío/transcripción: ' + (error?.message || 'error desconocido')
    );
  }
}

async function startVoiceRecording() {
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
      '🔴 GRABANDO con ' + deviceName + ' · habla ahora y pulsa 🎙️ otra vez al terminar.'
    );

    setTimeout(() => {
      if (voiceRecording && !voicePeakSeen) {
        helperText.textContent =
          '⚠️ El micrófono está abierto, pero todavía no detecto sonido. Revisa el nivel de entrada de Windows o cambia de micrófono.';
      }
    },2200);
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
      startVoiceRecording();
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
        helperText.textContent = 'Micrófono seleccionado. Pulsa 🎙️ para comenzar a grabar.';
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
  const internalProduct = upper.match(/\b\d{2}[A-Z]{2,}\d{3,}\b/)?.[0];
  const allCodes = upper.match(/\b(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9-]{5,}\b/g) || [];
  const fallbackProduct = [...allCodes].reverse().find((value) =>
    !/^[A-Z]{1,5}-\d{2,8}$/.test(value) &&
    !/^\d{2,}-[A-Z]/.test(value) &&
    !/^COT-/.test(value) &&
    !/^GTQ/.test(value)
  );
  const product = explicitProduct || internalProduct || fallbackProduct;
  if (product && contextProduct && contextProduct.textContent !== product) {
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
    const text = root.innerText || root.textContent || '';
    if (text !== lastText) {
      lastText = text;
      updateSessionContext(text);
    }
    enhanceMessages();
    ensureVoiceControls();
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
  gate.hidden = true;
  logoutButton.hidden = false;
  setStatus('online', 'Sesión interna', 'Praisa IA conectado');
  passInput.value = '';
  setTimeout(() => {
    helperText.textContent = 'Praisa IA ' + UI_BUILD + ' · Gateway: pulsa 🎙️, habla, pulsa 🎙️ otra vez y revisa el resultado.';
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
