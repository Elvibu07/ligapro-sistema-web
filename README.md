# LIGAPRO — Sistema de Automatización Web

Sistema de gestión de competiciones para la **Liga Profesional de Fútbol del Ecuador**, construido con React + Vite + TailwindCSS + Supabase.

---

## 🚀 Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Netlify](https://netlify.com)

---

## ⚙️ Configuración Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### 3. Configurar base de datos en Supabase

Ve a tu proyecto Supabase → **SQL Editor** y ejecuta los scripts en orden:

1. Primero ejecuta: `supabase/schema.sql` (crea las tablas)
2. Luego ejecuta: `supabase/seed.sql` (carga los datos iniciales)

> También en Supabase Dashboard → **Authentication → Settings** → habilita **Email** como proveedor.

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Build para producción
```bash
npm run build
```

Los archivos se generan en la carpeta `dist/`.

---

## 🌐 Deploy en Netlify (Gratis)

### Opción A — Deploy desde GitHub (recomendado)

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "LIGAPRO con Supabase"
   git remote add origin https://github.com/tu-usuario/ligapro.git
   git push -u origin main
   ```

2. Ve a [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**

3. Conecta tu repositorio de GitHub

4. Configuración de build (ya está en `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`

5. Agrega las variables de entorno en Netlify:
   - Ve a **Site settings → Environment variables**
   - Agrega:
     - `VITE_SUPABASE_URL` = `https://tvnowjjxbqjgpzatxemd.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = tu anon key

6. Haz click en **Deploy site** ✅

### Opción B — Deploy manual con Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔐 Autenticación

El sistema usa **Supabase Auth** con email/password.

Para crear el primer administrador:
1. Abre la app → pantalla de login
2. Click en **"Regístrate"**
3. Ingresa email, contraseña, nombre y rol
4. Verifica tu email (revisa la bandeja de entrada)

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes de UI
│   ├── auth/            # Login / Auth Guard
│   └── ...              # Vistas del sistema
├── hooks/
│   ├── useAuth.ts       # Hook de autenticación Supabase
│   └── useData.ts       # Hooks de datos (clubs, players, etc.)
├── lib/
│   ├── supabase.ts      # Cliente Supabase
│   └── services/        # CRUD services
│       ├── auth.ts
│       ├── clubs.ts
│       ├── players.ts
│       ├── matches.ts
│       ├── sanctions.ts
│       └── stadiums.ts
├── App.tsx              # App principal con auth guard
├── mockData.ts          # Datos de fallback
└── types.ts             # TypeScript interfaces
supabase/
├── schema.sql           # Esquema de base de datos
└── seed.sql             # Datos iniciales
netlify.toml             # Configuración de deploy
```

---

## 📜 Módulos del Sistema

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/` | Consola central con KPIs |
| Clubes | `clubes` | Gestión de clubes |
| Plantel | `plantel` | Registro de jugadores |
| Programación | `programacion` | Calendario de partidos |
| Fixture | `fixture` | Vista de fixture completo |
| Posiciones | `posiciones` | Tabla de posiciones |
| Planillas | `planillas` | Planillas de juego |
| Postergaciones | `postergaciones` | Solicitudes de postergación |
| Disciplina | `disciplina` | Sanciones y multas |
| Árbitros | `arbitros` | Designación arbitral |
| VAR/VOR | `var-vor` | Sistema VAR |
| Estadios | `estadios` | Gestión de estadios |
| Uniformes | `uniformes` | Control de uniformes |

---

*LIGAPRO © 2026 — Sistema de Automatización Web v1.0*
