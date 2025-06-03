# CalendarApp

Una aplicación de calendario moderna construida con Vue.js 3 en el frontend y Node.js/Express en el backend.

## 🏗️ Arquitectura

### Frontend
- **Framework**: Vue 3 + Vite
- **State Management**: Pinia
- **UI Components**: Naive UI
- **Calendar**: FullCalendar
- **HTTP Client**: Axios
- **Testing**: Jest

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (production) / SQLite (testing)
- **ORM**: Sequelize
- **Authentication**: JWT
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

## 🚀 Guía de Inicio Rápido

### Prerrequisitos

1. **Node.js** (versión 16 o superior)
2. **PostgreSQL** (para el backend)
3. **npm** o **yarn**

### Configuración del Backend

1. **Navegar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crear un archivo `.env` en la carpeta `backend/` con el siguiente contenido:
   ```env
   # Database
   DB_NAME=calendar_app
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   
   # JWT
   JWT_SECRET=tu_jwt_secret_muy_seguro
   JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Configurar la base de datos PostgreSQL:**
   Levantar la BD en PgAdmin con los nombres que cargaron en el punto anterior

5. **Iniciar el servidor:**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

El backend estará ejecutándose en `http://localhost:3000`

### Configuración del Frontend

1. **Navegar al directorio del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

El frontend estará ejecutándose en `http://localhost:5173` (puerto por defecto de Vite)

## 📚 Scripts Disponibles

### Backend

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con nodemon |
| `npm test` | Ejecuta los tests |
| `npm run test:watch` | Ejecuta los tests en modo watch |
| `npm run test:coverage` | Ejecuta los tests con reporte de cobertura |

### Frontend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Preview de la build de producción |
| `npm test` | Ejecuta los tests |
| `npm run test:watch` | Ejecuta los tests en modo watch |
| `npm run test:coverage` | Ejecuta los tests con reporte de cobertura |

## 🔧 Configuración de Desarrollo

### Variables de Entorno del Backend

El backend requiere las siguientes variables de entorno:

```env
# Database Configuration
DB_NAME=calendar_app
DB_USER=tu_usuario_postgresql
DB_PASSWORD=tu_contraseña_postgresql
DB_HOST=localhost

# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Base de Datos

El proyecto utiliza PostgreSQL en producción y SQLite para testing. La configuración de la base de datos se encuentra en `backend/src/config/db.js`.

## 📖 API Documentation

Una vez que el backend esté ejecutándose, puedes acceder a la documentación interactiva de la API en:

- **Swagger UI**: `http://localhost:3000/api-docs`

## 🧪 Testing

### Ejecutar Tests del Backend
```bash
cd backend
npm test
```

### Ejecutar Tests del Frontend
```bash
cd frontend
npm test
```

### Coverage Reports
```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

## 🌟 Características

- ✅ Autenticación JWT
- ✅ CRUD de eventos
- ✅ Configuraciones de usuario personalizables
- ✅ Soporte multiidioma (ES/EN)
- ✅ Modo oscuro
- ✅ API RESTful bien documentada
- ✅ Tests unitarios e integración
- ✅ UI moderna y responsiva

## 📂 Estructura del Proyecto

```
CalendarApp/
├── frontend/                 # Aplicación Vue.js
│   ├── src/
│   │   ├── components/      # Componentes Vue
│   │   ├── views/          # Vistas/Páginas
│   │   ├── store/          # Stores Pinia
│   │   ├── services/       # Servicios API
│   │   └── router/         # Configuración de rutas
│   ├── __tests__/          # Tests del frontend
│   └── package.json
├── backend/                  # API Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Definición de rutas
│   │   ├── middleware/     # Middlewares
│   │   └── config/         # Configuraciones
│   ├── __tests__/          # Tests del backend
│   └── package.json
└── README.md
```

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.