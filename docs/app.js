import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const WEBHOOK_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/8f4d8f21-7b6a-4f47-9d2e-166000000167/chat';
const PREF_KEY = 'praisa-ia-preferences-v1';
const UI_BUILD = 'v19-mic-debug';

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

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let voiceRecognition = null;
let voiceListening = false;
let voiceFinalText = '';
let voiceInterimText = '';
let voiceBaseText = '';
let voiceHadError = false;
let micPermissionGranted = false;

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

function updateVoiceButtonState() {
  const button = document.querySelector('#n8n-chat .praisa-voice-button');
  const root = document.getElementById('n8n-chat');
  if (!button || !root) return;

  button.classList.toggle('is-listening', voiceListening);
  button.setAttribute('aria-pressed', voiceListening ? 'true' : 'false');
  button.setAttribute('aria-label', voiceListening ? 'Detener dictado' : 'Hablar con Praisa IA');
  button.title = voiceListening ? 'Detener dictado' : 'Hablar con Praisa IA';
  root.classList.toggle('praisa-voice-listening', voiceListening);
}

function finishVoiceState() {
  voiceListening = false;
  updateVoiceButtonState();
}

async function requestMicrophoneAccess() {
  if (!window.isSecureContext) {
    throw new Error('insecure-context');
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('media-devices-unavailable');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });

  const hasAudioTrack = stream.getAudioTracks().some(track => track.readyState === 'live');
  stream.getTracks().forEach(track => track.stop());

  if (!hasAudioTrack) throw new Error('no-audio-track');
  micPermissionGranted = true;
  return true;
}

function voicePermissionMessage(error) {
  const name = error?.name || error?.message || '';

  if (/NotAllowedError|PermissionDeniedError|not-allowed|service-not-allowed/i.test(name)) {
    return 'El navegador tiene bloqueado el micrófono. Pulsa el candado junto a la dirección de la página → Micrófono → Permitir, y vuelve a intentarlo.';
  }
  if (/NotFoundError|DevicesNotFoundError|no-audio-track/i.test(name)) {
    return 'No encontré un micrófono disponible. Revisa que esté conectado y seleccionado en Windows.';
  }
  if (/NotReadableError|TrackStartError/i.test(name)) {
    return 'El micrófono está siendo usado por otra aplicación. Cierra la aplicación que lo esté usando e inténtalo nuevamente.';
  }
  if (/insecure-context/i.test(name)) {
    return 'El micrófono requiere una conexión segura HTTPS.';
  }
  if (/media-devices-unavailable/i.test(name)) {
    return 'Este navegador no permite acceder al micrófono desde esta página.';
  }
  return 'No pude acceder al micrófono. Revisa los permisos del navegador e inténtalo nuevamente.';
}

async function startVoiceDictation() {
  if (voiceListening && voiceRecognition) {
    try { voiceRecognition.stop(); } catch {}
    return;
  }

  if (!SpeechRecognitionAPI) {
    helperText.textContent = 'El reconocimiento de voz no está disponible en este navegador. Usa Chrome o Edge actualizado.';
    return;
  }

  const input = chatInput();
  if (!input) {
    helperText.textContent = 'El chat todavía está cargando.';
    return;
  }

  try {
    if (!micPermissionGranted) {
      helperText.textContent = 'Solicitando acceso al micrófono…';
      await requestMicrophoneAccess();
    }
  } catch (error) {
    console.error('Micrófono:', error);
    helperText.textContent = voicePermissionMessage(error);
    return;
  }

  voiceFinalText = '';
  voiceInterimText = '';
  voiceBaseText = (input.value || '').trim();
  voiceHadError = false;

  const recognition = new SpeechRecognitionAPI();
  voiceRecognition = recognition;
  recognition.lang = 'es-GT';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 3;

  recognition.onstart = () => {
    voiceListening = true;
    updateVoiceButtonState();
    helperText.textContent = '🎙️ Escuchando… habla ahora. Puedes decir una frase completa.';
  };

  recognition.onaudiostart = () => {
    helperText.textContent = '🎙️ Micrófono activo. Te estoy escuchando…';
  };

  recognition.onspeechstart = () => {
    helperText.textContent = '🗣️ Voz detectada. Sigue hablando…';
  };

  recognition.onresult = (event) => {
    let interim = '';
    let finalChunk = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = (event.results[i][0]?.transcript || '').trim();
      if (!transcript) continue;

      if (event.results[i].isFinal) {
        finalChunk += (finalChunk ? ' ' : '') + transcript;
      } else {
        interim += (interim ? ' ' : '') + transcript;
      }
    }

    if (finalChunk) {
      voiceFinalText = [voiceFinalText, finalChunk].filter(Boolean).join(' ').trim();
    }

    voiceInterimText = interim.trim();

    const spoken = [voiceFinalText, voiceInterimText].filter(Boolean).join(' ').trim();
    const combined = [voiceBaseText, spoken]
      .filter(Boolean)
      .join(voiceBaseText && spoken ? ' ' : '')
      .trim();

    if (combined) {
      setChatInputValue(combined);
      helperText.textContent = '🗣️ Escuchando: “' + spoken + '”';
    }
  };

  recognition.onerror = (event) => {
    const code = event.error || '';
    console.error('Reconocimiento de voz:', code, event);

    if (code === 'aborted') return;

    voiceHadError = true;

    if (code === 'not-allowed' || code === 'service-not-allowed') {
      micPermissionGranted = false;
      helperText.textContent = 'El micrófono o el servicio de voz está bloqueado. Pulsa el candado de la barra de direcciones y permite el micrófono.';
    } else if (code === 'audio-capture') {
      micPermissionGranted = false;
      helperText.textContent = 'Chrome no está recibiendo audio del micrófono. Revisa el micrófono seleccionado en Windows y en Chrome.';
    } else if (code === 'network') {
      helperText.textContent = 'El reconocimiento de voz de Chrome necesita conexión a Internet. Revisa la conexión e inténtalo otra vez.';
    } else if (code === 'no-speech') {
      helperText.textContent = 'El micrófono está disponible, pero no detecté voz. Acércate al micrófono y vuelve a intentarlo.';
    } else {
      helperText.textContent = 'No pude reconocer la voz (' + code + '). Inténtalo nuevamente.';
    }
  };

  recognition.onspeechend = () => {
    helperText.textContent = 'Procesando lo que dijiste…';
  };

  recognition.onend = () => {
    // Some Chrome versions can end with only an interim transcript.
    const recognised = (voiceFinalText || voiceInterimText || '').trim();
    const finalMessage = [voiceBaseText, recognised]
      .filter(Boolean)
      .join(voiceBaseText && recognised ? ' ' : '')
      .trim();

    finishVoiceState();
    voiceRecognition = null;

    if (recognised && finalMessage) {
      setChatInputValue(finalMessage);

      if (!voiceHadError) {
        helperText.textContent = '✅ Voz reconocida. Enviando a Praisa IA…';
        setTimeout(() => sendPromptNow(finalMessage), 220);
      } else {
        helperText.textContent = 'Reconocí parte de la frase. Revísala y pulsa enviar.';
      }
    } else if (!voiceHadError) {
      helperText.textContent = 'No recibí texto de voz. Pulsa el micrófono y habla después de que aparezca “Micrófono activo”.';
    }
  };

  try {
    recognition.start();
  } catch (error) {
    console.error(error);
    finishVoiceState();
    voiceRecognition = null;
    helperText.textContent = 'No pude iniciar el reconocimiento de voz. Recarga la página e inténtalo nuevamente.';
  }
}

function ensureVoiceButton() {
  const root = document.getElementById('n8n-chat');
  const input = chatInput();
  if (!root || !input) return;

  if (root.querySelector('.praisa-voice-button')) {
    updateVoiceButtonState();
    return;
  }

  const composer = input.closest('.chat-inputs') || input.parentElement;
  if (!composer) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'praisa-voice-button';
  button.innerHTML = '<span aria-hidden="true">🎙️</span>';
  button.setAttribute('aria-label', 'Hablar con Praisa IA');
  button.setAttribute('aria-pressed', 'false');
  button.title = 'Hablar con Praisa IA';

  if (!SpeechRecognitionAPI || !navigator.mediaDevices?.getUserMedia) {
    button.classList.add('is-unsupported');
    button.title = 'Dictado no disponible en este navegador';
  }

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    startVoiceDictation();
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
    ensureVoiceButton();
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
    helperText.textContent = 'Praisa IA ' + UI_BUILD + ' · Puedes escribir o usar el micrófono 🎙️. La primera vez, permite el acceso cuando Chrome lo solicite.';
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
