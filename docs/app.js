import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const WEBHOOK_URL = 'https://asistentepraisa.app.n8n.cloud/webhook/31f3a969-f3ac-47ee-abe1-bd759f44e0ba/chat';

const statusDot = document.getElementById('status-dot');
const statusTitle = document.getElementById('status-title');
const statusText = document.getElementById('status-text');
const helperText = document.getElementById('helper-text');

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
    helperText.textContent = 'El chat todavía está cargando. Intente nuevamente en un momento.';
    return;
  }

  input.focus();
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    'value'
  )?.set;

  if (setter) setter.call(input, prompt);
  else input.value = prompt;

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  helperText.textContent = 'Mensaje preparado. Puede editarlo o enviarlo desde el chat.';
}

document.querySelectorAll('.quick-prompt').forEach((button) => {
  button.addEventListener('click', () => {
    const prompt = button.dataset.prompt || '';
    if (prompt) putPromptInChat(prompt);
  });
});

try {
  createChat({
    webhookUrl: WEBHOOK_URL,
    webhookConfig: {
      method: 'POST',
      headers: {}
    },
    target: '#n8n-chat',
    mode: 'fullscreen',
    chatInputKey: 'chatInput',
    chatSessionKey: 'sessionId',
    loadPreviousSession: false,
    metadata: {
      source: 'praisa-web-chat',
      channel: 'web'
    },
    showWelcomeScreen: false,
    defaultLanguage: 'en',
    initialMessages: [
      'Bienvenido a Praisa. Puedo ayudarle a cotizar productos, revisar existencias y localizar opciones según su necesidad.'
    ],
    i18n: {
      en: {
        title: 'Asistente Comercial Praisa',
        subtitle: 'Cotizaciones, existencias y soporte técnico',
        footer: '',
        getStarted: 'Nueva conversación',
        inputPlaceholder: 'Escriba su consulta aquí...'
      }
    },
    enableStreaming: false
  });

  setStatus('online', 'En línea', 'Praisa IA lista para conversar');
} catch (error) {
  console.error(error);
  setStatus('error', 'No disponible', 'Revise la conexión con n8n');
  helperText.textContent = 'No fue posible cargar el chat. Verifique que el workflow esté publicado y el Chat Trigger permita el origen de esta página.';
}