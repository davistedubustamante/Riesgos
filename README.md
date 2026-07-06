# RiskFlow Web

Aplicación **full stack** para gestionar riesgos de un proyecto tecnológico aplicando una **metodología híbrida**:

- **ISO 31000** como metodología principal (contexto → identificación → análisis → evaluación → tratamiento → monitoreo).
- **PMBOK** como apoyo (instrumentos: matriz, responsables, respuestas, reservas).
- **Scrum** como marco de integración operativa (Planning, Daily, Review, Retrospective).
- **MAGERIT / NIST RMF** como complemento para seguridad, privacidad y continuidad.

> Caso de aplicación sugerido: *Sistema inteligente basado en chatbot para apoyar la fase de preselección del personal* (incluye proyecto + 5 riesgos de ejemplo en el seed inicial).

---

## 1. Stack

**Frontend** — React 18 + Vite + JavaScript, React Router, Tailwind CSS, Recharts, Lucide React, Zustand (estado global), React Hook Form (formularios).

**Backend** — Node.js + Express, CORS, dotenv, **Zod** (validaciones), persistencia en archivo JSON.

> La persistencia es JSON (suficiente para una guía aplicativa). Para un entorno real, migrar a Prisma + SQLite/Postgres es trivial: los modelos están separados de los controladores.

---

## 2. Estructura del proyecto

```
riskflow-web/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── components/        # RiskBadge, RiskForm, RiskTable, RiskMatrix,
│       │                      # RiskHeatmap, HeatmapLegend, HeatmapCellDetail,
│       │                      # MetricCard, Modal, ConfirmModal, EmptyState,
│       │                      # FilterBar, SprintBoard
│       ├── layouts/
│       │   └── DashboardLayout.jsx   # Sidebar + Topbar + <Outlet/>
│       ├── pages/             # Dashboard, Projects, Context, Risks,
│       │                      # Matrix, Heatmap, Treatment, Sprints, Guide
│       ├── routes/            # (vacío por ahora; rutas declaradas en App.jsx)
│       ├── services/api.js    # Cliente HTTP
│       ├── store/useAppStore.js  # Zustand
│       ├── utils/risk.js      # Clasificación + constantes
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js             # Configuración Express + middlewares
│       ├── server.js          # Arranque + bootstrap de la DB
│       ├── routes/index.js    # Router /api
│       ├── controllers/       # projects, contexts, risks, sprints,
│       │                      # dashboard, heatmap
│       ├── models/db.js       # Capa de persistencia (JSON)
│       ├── data/seed.js       # Datos iniciales
│       ├── middlewares/errors.js
│       └── utils/             # riskLevel (P×I), asyncHandler, errors
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Requisitos previos

- **Node.js ≥ 18**.
- **npm ≥ 9** (también funciona yarn / pnpm).

---

## 4. Instalación

```bash
# Backend
cd riskflow-web/server
npm install
cp ../.env.example .env

# Frontend
cd ../client
npm install
```

> En Windows con PowerShell los comandos equivalentes son `copy .env.example .env` y similares.

---

## 5. Ejecución

Abrir **dos terminales**:

```bash
# Terminal 1 — backend en :4000
cd riskflow-web/server
npm run dev

# Terminal 2 — frontend en :5173 (con proxy automático a :4000)
cd riskflow-web/client
npm run dev
```

- Frontend: <http://localhost:5173>
- Healthcheck API: <http://localhost:4000/api/health>

> Si quieres producción local: `npm run build` en el cliente y servir `client/dist/` con cualquier servidor estático (vite preview está integrado).

---

## 6. Variables de entorno

`.env.example` contiene los valores por defecto. Solo es necesario ajustar:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DB_FILE=src/data/db.runtime.json    # opcional; apunta al JSON de persistencia
```

Si despliegas el cliente en otro origen, define `VITE_API_URL` en `client/.env`.

---

## 7. Rutas principales

### Frontend

| Ruta | Pantalla |
|---|---|
| `/` | Dashboard (métricas + gráficos) |
| `/projects` | CRUD de proyectos |
| `/context` | Contexto ISO 31000 |
| `/risks` | CRUD de riesgos + filtros |
| `/matrix` | Matriz P×I 5×5 con celda clicable |
| `/heatmap` | **Mapa de calor** (frequency / severity + filtros) |
| `/treatment` | Tratamiento de riesgos (estrategia, acción, evidencia) |
| `/sprints` | Sprints Scrum + tablero Kanban por estado |
| `/guide` | Guía metodológica paso a paso |

### API REST

```
GET    /api/health
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/projects/:projectId/context
POST   /api/projects/:projectId/context
PUT    /api/projects/:projectId/context

GET    /api/risks
GET    /api/risks/:id
POST   /api/risks
PUT    /api/risks/:id
DELETE /api/risks/:id
GET    /api/projects/:projectId/risks

GET    /api/projects/:projectId/sprints
GET    /api/sprints/:id
POST   /api/projects/:projectId/sprints
PUT    /api/sprints/:id
DELETE /api/sprints/:id

GET    /api/dashboard/:projectId
GET    /api/heatmap/:projectId?mode=frequency|severity
GET    /api/heatmap/:projectId?category=Tecnico&status=EnTratamiento
```

---

## 8. Modelo de datos

Ver archivos:
- **Backend:** `server/src/data/seed.js` (modelos completos y datos iniciales).
- **Frontend:** `client/src/utils/risk.js` (constantes + helper de clasificación).

Las entidades centrales son **Project**, **Context**, **Risk** y **Sprint**, tal como exige el prompt maestro.

---

## 9. Reglas de negocio implementadas

- **Nivel:** `level = probability * impact`.
- **Clasificación:**
  - 1-4 → **Bajo**
  - 5-9 → **Medio**
  - 10-14 → **Alto**
  - 15-25 → **Crítico**
- **Riesgos críticos** requieren obligatoriamente: responsable, estrategia, acción y fecha.
- **Cerrar** un riesgo requiere evidencia + resultado esperado.
- El **mapa de calor** recalcula automáticamente cuando cambian los riesgos.
- Modos disponibles: **frequency** y **severity** (suma de niveles en la celda).

---

## 10. Cómo usar el mapa de calor (cómo priorizar riesgos)

1. Ve a **Mapa de calor**.
2. Comienza en modo **Severidad acumulada**: las celdas rojas con valores altos concentran los riesgos más críticos.
3. Cambia a **Frecuencia**: las celdas con varios riesgos representan repetición (posible causa sistémica).
4. Aplica filtros por **categoría**, **estado**, **sprint** y **clasificación** para aislar un escenario.
5. Haz **clic en una celda** para listar los riesgos que contiene y abrir su detalle.
6. Revisa la columna **"Zonas calientes"** — son las celdas con clasificación Alto/Crítico.
7. Preguntas que responde el mapa:
   - ¿Dónde se concentran los riesgos más críticos?
   - ¿Qué combinación de probabilidad e impacto domina el proyecto?
   - ¿Qué categorías requieren tratamiento prioritario?
   - ¿Qué riesgos revisar antes del próximo sprint?

---

## 11. Flujo recomendado de uso

1. Crear un proyecto.
2. Mapear su **Contexto ISO 31000**.
3. Registrar **riesgos iniciales** (al menos los críticos).
4. Asignar probabilidad e impacto (el sistema calcula el nivel).
5. Revisar la **matriz** y el **mapa de calor**.
6. Definir **tratamiento**: estrategia, acción, responsable, fecha.
7. **Crear sprints** y asignar riesgos.
8. Al final de cada sprint: actualizar estados, revisar cierre con evidencia, registrar lecciones.
9. Repetir el ciclo.

---

## 12. Datos de ejemplo (seed)

Al primer arranque el backend crea `server/src/data/db.runtime.json` clonando el seed, que incluye:

- **1 proyecto:** *Sistema inteligente basado en chatbot para apoyar la preselección del personal*.
- **1 contexto ISO 31000** con activos, partes interesadas y criterios.
- **2 sprints** (Sprint 1 — base del chatbot; Sprint 2 — motor de evaluación).
- **5 riesgos** (R01–R05) adaptados del prompt maestro:
  - R01 Indisponibilidad de la API de NLP · P=3, I=4 → Alto (12).
  - R02 Sesgo algorítmico · P=3, I=5 → **Crítico** (15).
  - R03 Exposición de datos personales · P=2, I=5 → Alto (10).
  - R04 Baja aceptación por RR.HH. · P=3, I=4 → Alto (12).
  - R05 Error en cálculo del ranking · P=3, I=5 → **Crítico** (15).

Para reiniciar al estado inicial basta con **borrar** `server/src/data/db.runtime.json` y reiniciar el backend.

---

## 13. Calidad del código

- Separación: rutas → controladores → servicios → modelos (backend); páginas → componentes → utilidades (frontend).
- Validación con Zod en el backend; control de errores uniforme.
- Frontend con componentes reutilizables y estado global mínimo (Zustand).
- Diseño responsive (móvil/tablet/escritorio) con Tailwind.
- Mapa de calor accesible: contraste adecuado, leyenda y títulos.

---

## 14. Próximos pasos sugeridos

- Reemplazar la persistencia JSON por **Prisma + SQLite** (mínimo cambio gracias a la capa `models/db.js`).
- Añadir **autenticación** (rol administrador/reclutador) en el módulo de seguridad MAGERIT/NIST.
- Persistir la matriz como **audit log inmutable** para cumplir requisitos forenses de privacidad.
- Internacionalización (i18n) si se requiere.

---

## 15. Licencia y créditos

Construido como guía aplicativa a partir del prompt maestro *RiskFlow Web* sobre gestión híbrida de riesgos.
Marcos referenciados: **ISO 31000:2018**, **PMBOK 7ª ed.**, **Scrum (Schwaber)**, **MAGERIT v3** y **NIST SP 800-37 Rev. 2**.
