# Praisa IA Interno — Piloto

Objetivo: validar si n8n aporta suficiente valor para continuar con la contratación y evolución del asistente interno.

## Acceso
- Chat alojado por n8n.
- Autenticación: n8n User Auth.
- Requiere permiso para ejecutar el workflow.
- No usar GitHub Pages para las pruebas internas.

## Capacidades del piloto
1. Consultar productos por código.
2. Consultar Precio A y existencias por bodega.
3. Buscar productos por descripción técnica.
4. Consultar clientes e historial.
5. Preparar y generar cotizaciones.
6. Mantener contexto conversacional básico.
7. Usar la Base Técnica sin aprobar automáticamente configuraciones no validadas.

## Pruebas mínimas
- Producto por código.
- Existencia.
- Cliente.
- Historial.
- Búsqueda técnica.
- Cotización desde producto recién consultado.
- Cotización con aprobación técnica.
- Respuestas contextuales como "cotiza este", "déjalo así" y "quiero 4".
- Generación consecutiva de dos cotizaciones.
- Revisión de documentos generados en Drive.

## Criterios para evaluar n8n
- Precisión de respuesta.
- Tiempo para completar la tarea.
- Cantidad de mensajes necesarios.
- Tareas manuales evitadas.
- Errores o pasos que requieren intervención.
- Estabilidad durante las pruebas.
