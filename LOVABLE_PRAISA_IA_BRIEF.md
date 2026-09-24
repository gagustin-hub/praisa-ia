# Praisa IA — Build Brief para Lovable

## Objetivo
Crear una versión paralela de **Praisa IA Interno** en Lovable, sin reemplazar ni alterar la versión actual en GitHub Pages.

La nueva app debe conservar la lógica de negocio existente y usar n8n/CAF/Drive como backend. Lovable será principalmente la interfaz web y la capa de experiencia de usuario.

## Arquitectura existente
- **Frontend actual:** GitHub Pages
- **Backend/orquestación:** n8n
- **ERP / fuente comercial:** CAF Web
- **CRM:** HubSpot
- **Documentos:** Google Drive + Google Docs
- **Voz:** n8n + Gateway credits para transcripción
- **Workflow principal:** Praisa IA - Asistente Interno
- **Workflow de voz:** Praisa IA - Transcripción de Voz v1.0

## Endpoint principal del chat
```
https://asistentepraisa.app.n8n.cloud/webhook/8f4d8f21-7b6a-4f47-9d2e-166000000167/chat
```

## Endpoint de voz
```
https://asistentepraisa.app.n8n.cloud/webhook/praisa-voice-b8a6c1f4-7a10-4a3f-91d9-0a0000000180
```

## Diseño visual
Identidad industrial premium de Praisa:
- Fondo principal azul muy oscuro / carbón
- Rojo Praisa como color de acción
- Blanco para texto principal
- Gris azulado para superficies y divisores
- Interfaz limpia, corporativa y moderna
- 100% responsive para desktop, tablet y teléfono
- Evitar apariencia genérica de chatbot

## Layout desktop
### Header
- Logo Praisa a la izquierda
- Texto: **Praisa IA Interno**
- Subtítulo: *Tu asistente inteligente de trabajo*
- Buscador/comando rápido en centro
- Indicador de sesión
- Selector claro/oscuro
- Cerrar sesión

### Sidebar izquierda
- Chat IA
- Consultar CAF
- Base técnica
- Clientes
- Cotizaciones
- Aprobaciones
- Reportes
- Configuración

### Centro
- Hero pequeño: **Operaciones IA**
- Acciones rápidas:
  - Consultar CAF
  - Crear cotización
  - Buscar cliente
  - Base técnica
  - Generar reporte
- Chat principal con burbujas modernas
- Usuario en rojo a la derecha
- Praisa IA en azul/carbón a la izquierda
- Markdown, enlaces y estados

### Sidebar derecha
**Contexto de la sesión**
- Producto actual
- Cliente actual
- Cotización
- Validación técnica

Debe actualizarse conforme avanza la conversación.

## Chat
El composer debe incluir:
- Campo de texto
- Botón enviar
- Botón micrófono
- Selector de micrófono
- Estado visible de voz

Placeholder:
**Escribe o habla con Praisa IA...**

## Voz
Usar el método actual con Gateway credits:
1. Usuario activa modo voz.
2. App abre micrófono seleccionado.
3. Detecta voz y silencio.
4. Cierra grabación automáticamente.
5. Envía audio a n8n.
6. n8n transcribe.
7. La respuesta se envía automáticamente al chat cuando el modo manos libres está activo.
8. Cuando Praisa IA responde, vuelve a escuchar automáticamente.

La interfaz debe mostrar claramente:
- Escuchando
- Audio detectado
- Procesando
- Transcribiendo
- Mensaje enviado
- Esperando respuesta

Debe permitir desactivar el modo manos libres pulsando nuevamente el micrófono.

## Reglas importantes de voz
- No usar DroidCam/virtual como preferido si existe un micrófono físico.
- Detectar y rechazar transcripciones basura como:
  - Muchas gracias
  - Gracias
  - Amara.org
  - Subtítulos realizados por la comunidad...
- Si el asistente espera un código de producto, normalizar códigos industriales:
  - O → 0 en segmento numérico
  - I/L → 1 cuando corresponda
  - mayúsculas
  - eliminar espacios
- Ejemplo:
  `11ASo598` → `11AS0598`

## Flujos principales

### Consultar cliente
El usuario puede escribir:
- cuenta CAF
- nombre del cliente

El sistema debe conservar contexto y permitir cambiar de intención.

### Consultar producto
El usuario puede escribir:
- código CAF
- descripción técnica

Mostrar:
- código
- producto
- categoría
- código fabricante
- unidad
- Precio A CAF
- existencias por bodega
- existencia total

### Cotizaciones
Conversación guiada:
1. cliente
2. producto
3. cantidad
4. validar existencias
5. seguir agregando códigos
6. continuar a revisión
7. condiciones de pago manuales
8. entrega
9. asesor
10. generar documento

Soportar hasta 10 productos.

### Existencias
Antes de continuar:
- indicar que se validarán existencias
- informar disponibilidad
- si falta existencia, avisar que debe confirmarse plazo de entrega

### Asesores
Cuando el flujo pida asesor, mostrar tarjetas seleccionables con:
- nombre
- cargo
- teléfono
- correo

También permitir **Otro asesor**.

### Documentos
El backend genera:
- Google Docs
- PDF
- Word

Mostrar botones claros para abrir cada archivo.

## Contactos múltiples
Si CAF devuelve varios contactos de cliente, mostrar opciones seleccionables y permitir elegir el destinatario de la cotización.

## UX móvil
Debe funcionar muy bien en teléfono:
- sidebar convertible a menú
- chat como sección principal
- composer fijo/visible
- burbujas legibles
- contexto de sesión como drawer/acordeón
- selector de micrófono compacto
- evitar scroll horizontal

## Seguridad
- No poner credenciales CAF, n8n, Google, HubSpot ni API keys en frontend.
- Los secretos permanecen en n8n.
- Lovable solo consume endpoints autorizados.

## Enfoque del primer MVP
Primero construir:
1. Login visual/interno
2. Layout completo
3. Chat conectado a n8n
4. Contexto de sesión
5. Acciones rápidas
6. Voz con Gateway
7. Responsive

Después:
- reportes
- historial
- usuarios/roles
- Supabase si se necesita persistencia propia
- HubSpot más profundo

## Restricción
**No modificar ni reemplazar la página actual de GitHub Pages.**
Esta versión debe ser paralela para poder comparar ambas antes de decidir migración.
