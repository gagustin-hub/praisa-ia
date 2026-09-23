import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const WEBHOOK_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/c4c5322d-8e15-4f0c-a9fd-9a889fa30b27/chat';

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

let chatStarted = false;

function setStatus(kind, title, text) {
  statusDot.classList.remove('online', 'error');
  if (kind) statusDot.classList.add(kind);
  statusTitle.textContent = title;
  statusText.textContent = text;
}

function putPromptInChat(prompt) {
  const root = document.getElementById('n8n-chat');
  const input = root.querySelector('textarea, input[type="text"]');
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
  helperText.textContent = 'Mensaje preparado. Puede editarlo antes de enviarlo.';
}

document.querySelectorAll('.quick-prompt').forEach((button) => {
  button.addEventListener('click', () => {
    const prompt = button.dataset.prompt || '';
    if (prompt) putPromptInChat(prompt);
  });
});

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
      'Hola. Soy Praisa IA Interno. ¿Qué necesitas consultar o hacer?'
    ],
    i18n: {
      en: {
        title: 'Praisa IA Interno',
        subtitle: 'Asistente virtual interno',
        footer: '',
        getStarted: 'Nueva conversación',
        inputPlaceholder: 'Escribe lo que necesitas...'
      }
    },
    enableStreaming: false
  });

  chatStarted = true;
  gate.hidden = true;
  logoutButton.hidden = false;
  setStatus('online', 'Sesión interna', 'Asistente listo para pruebas');
  passInput.value = '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = userInput.value.trim();
  const password = passInput.value;

  if (!username || !password) {
    errorBox.textContent = 'Ingrese usuario y contraseña.';
    return;
  }

  errorBox.textContent = '';
  try {
    startChat(username, password);
  } catch (error) {
    console.error(error);
    errorBox.textContent = 'No fue posible iniciar el chat.';
    setStatus('error', 'Error de acceso', 'Revise la configuración interna');
  }
});

logoutButton.addEventListener('click', () => {
  location.reload();
});
