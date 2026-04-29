# 🤖 Agente de Marketing — Chat Frontend

Frontend en Next.js que conecta con tu agente de n8n vía webhook.

---

## 🚀 Setup local (5 minutos)

### 1. Instalá Node.js
Si no lo tenés: https://nodejs.org (bajá la versión LTS)

### 2. Cloná o descomprimí este proyecto

### 3. Instalá dependencias
```bash
npm install
```

### 4. Configurá tu webhook de n8n
Copiá el archivo de ejemplo:
```bash
cp .env.local.example .env.local
```
Abrí `.env.local` y pegá la URL de tu webhook de n8n.

### 5. Levantá el servidor de desarrollo
```bash
npm run dev
```
Abrí http://localhost:3000 y ya tenés el chat funcionando.

---

## ☁️ Deploy en Vercel (para compartir con colegas)

1. Subí este proyecto a un repositorio de GitHub
2. Entrá a https://vercel.com y conectá tu repo
3. En la sección **Environment Variables** del proyecto en Vercel, agregá:
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL` → tu URL de webhook
4. Hacé deploy → Vercel te da una URL pública (ej: `mi-chat.vercel.app`)

---

## 🔌 Integración con n8n

El chat envía un `POST` a tu webhook con este body:
```json
{
  "sessionId": "uuid-unico-por-sesion",
  "message": "mensaje del usuario",
  "history": [ ... mensajes anteriores ... ]
}
```

Tu nodo **Respond to Webhook** en n8n debe devolver:
```json
{
  "output": "respuesta del agente aquí"
}
```

> Si tu nodo devuelve el texto en otro campo (ej: `text`, `message`, `response`),
> buscá en `app/page.js` la línea que dice `data.output || data.text || data.message`
> y ajustá según corresponda.

---

## 📁 Estructura del proyecto

```
marketing-chatbot/
├── app/
│   ├── layout.js      ← Estructura HTML raíz
│   ├── page.js        ← El chat (toda la lógica)
│   └── globals.css    ← Estilos globales y variables de color
├── .env.local.example ← Variables de entorno de ejemplo
├── package.json
└── README.md
```

---

## 🔮 Próximos pasos para producción

- **Login**: agregar NextAuth.js para que cada colega tenga su usuario
- **Historial**: guardar conversaciones en tu Neon Postgres
- **Multi-sesión**: que el agente recuerde conversaciones pasadas
- **Panel de admin**: ver todas las conversaciones en un dashboard
