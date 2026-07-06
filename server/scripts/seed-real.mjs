/**
 * Seed Madame Crepe — datos reales de los documentos PMBOK 8
 * 18 stakeholders, 176 actividades, 20 riesgos, recursos por actividad
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const projectId = 'proj_madame_crepe';

const stakeholders = [
  // Anillo 1 — Interno / Equipo
  { code:'S01', name:'Director/a del Proyecto (PM)',        type:'Interno',         ring:'interno',  power:5, influence:5, interest:5, commitment_actual:5, commitment_desired:5 },
  { code:'S02', name:'Equipo de Proyecto (5 integrantes)',  type:'Interno',         ring:'interno',  power:4, influence:5, interest:5, commitment_actual:4, commitment_desired:5 },
  // Anillo 2 — Medio / Organización
  { code:'S03', name:'Patrocinador/a Ejecutivo/a',           type:'Interno',         ring:'interno',  power:5, influence:4, interest:5, commitment_actual:4, commitment_desired:5 },
  { code:'S04', name:'PMO / Oficina de Gestión de Proyectos',type:'Interno',         ring:'interno',  power:4, influence:4, interest:4, commitment_actual:3, commitment_desired:4 },
  { code:'S05', name:'Comité de Control de Cambios (CCB)',   type:'Interno',         ring:'interno',  power:4, influence:4, interest:3, commitment_actual:3, commitment_desired:4 },
  { code:'S06', name:'Área de TI / Infraestructura',         type:'Interno',         ring:'interno',  power:3, influence:3, interest:4, commitment_actual:3, commitment_desired:4 },
  { code:'S07', name:'Área Legal y Contratos',               type:'Interno',         ring:'interno',  power:3, influence:2, interest:2, commitment_actual:2, commitment_desired:3 },
  { code:'S08', name:'Área Financiera / Contabilidad',        type:'Interno',         ring:'interno',  power:3, influence:2, interest:3, commitment_actual:3, commitment_desired:3 },
  // Anillo 3 — Externo
  { code:'S09', name:'Gerencia General Madame Crepe',        type:'Externo · Cliente',ring:'externo',  power:5, influence:5, interest:5, commitment_actual:4, commitment_desired:5 },
  { code:'S10', name:'Jefe/a de RR.HH. Madame Crepe',       type:'Externo · Cliente',ring:'externo', power:4, influence:4, interest:5, commitment_actual:4, commitment_desired:5 },
  { code:'S11', name:'Reclutadores Madame Crepe',            type:'Externo · Cliente',ring:'externo', power:3, influence:4, interest:5, commitment_actual:3, commitment_desired:4 },
  { code:'S12', name:'Candidatos / Postulantes',            type:'Externo',         ring:'externo',  power:1, influence:1, interest:4, commitment_actual:1, commitment_desired:2 },
  { code:'S13', name:'Personal Operativo Madame Crepe',      type:'Externo',         ring:'externo',  power:2, influence:2, interest:3, commitment_actual:2, commitment_desired:3 },
  { code:'S14', name:'Proveedor Cloud / Hosting',            type:'Externo',         ring:'externo',  power:2, influence:1, interest:2, commitment_actual:2, commitment_desired:3 },
  { code:'S15', name:'Proveedor de Internet / ISP',          type:'Externo',         ring:'externo',  power:2, influence:1, interest:2, commitment_actual:2, commitment_desired:2 },
  { code:'S16', name:'SUNAT / Reguladores Tributarios',     type:'Externo · Regulador',ring:'externo',power:4, influence:1, interest:1, commitment_actual:1, commitment_desired:3 },
  { code:'S17', name:'Municipalidad de Chiclayo',           type:'Externo · Regulador',ring:'externo',power:3, influence:1, interest:1, commitment_actual:1, commitment_desired:2 },
  { code:'S18', name:'Comunidad / Medios locales',           type:'Externo',         ring:'externo',  power:1, influence:1, interest:1, commitment_actual:1, commitment_desired:1 },
];

// 20 riesgos reales del catálogo PMBOK 8
const risks = [
  { code:'R-01', title:'Cambio de prioridades del Sponsor antes de firmar el Acta de Constitución.',
    category:'Interesados',  probability:3, impact:3, owner:'Patrocinador/a Ejecutivo/a',   sprint:'E1', strategy:'Mitigar (alineación + comunicación)', action:'Taller de alineación + comunicación quincenal con el Sponsor para priorizar el acta antes de cualquier otra decisión.' },
  { code:'R-02', title:'Estimación insuficiente de horas del PM en la planificación inicial.',
    category:'Riesgo',        probability:4, impact:3, owner:'Director/a del Proyecto (PM)', sprint:'E1', strategy:'Mitigar (plan específico)',      action:'Revisar buffer de horas con el PMO e incluir margen del 20% en la estimación inicial.' },
  { code:'R-03', title:'Criterios de evaluación de candidatos poco estandarizados entre RR.HH. y Gerencia.',
    category:'Interesados',   probability:4, impact:4, owner:'Jefe/a de RR.HH. Madame Crepe',sprint:'E2', strategy:'Mitigar (alineación + comunicación)', action:'Definir matriz de criterios en taller conjunto RR.HH. + Gerencia antes del Mes 02.' },
  { code:'R-04', title:'Baja participación del equipo de RR.HH. en talleres de Design Thinking.',
    category:'Recursos',      probability:3, impact:3, owner:'Scrum Master',                sprint:'E2', strategy:'Mitigar (capacitación / backup)',   action:'Plan de contingencia: roles backup + capacitación previa a talleres DT.' },
  { code:'R-05', title:'Falta de consenso del equipo técnico en la arquitectura de 3 capas.',
    category:'Riesgo',        probability:3, impact:4, owner:'Equipo de Proyecto (5)',       sprint:'E3', strategy:'Mitigar (plan específico)',      action:'Sesión técnica de Architecture Decision Records (ADR) con todos los roles técnicos.' },
  { code:'R-06', title:'Complejidad del algoritmo de Integral de Choquet para el motor de scoring.',
    category:'Riesgo',        probability:4, impact:4, owner:'Director/a del Proyecto (PM)', sprint:'E3', strategy:'Mitigar (plan específico)',      action:'Prototipo MVP del algoritmo con dataset pequeño antes de integrar al motor.' },
  { code:'R-07', title:'Caída del servicio Groq API durante entrevistas en horario laboral.',
    category:'Riesgo',        probability:3, impact:5, owner:'Área de TI / Infraestructura', sprint:'E4', strategy:'Mitigar (plan específico)',      action:'Implementar fallback a OpenAI + monitoreo con alerts proactivas.' },
  { code:'R-08', title:'Errores de cálculo del motor de scoring con criterios nuevos no vistos en entrenamiento.',
    category:'Riesgo',        probability:3, impact:4, owner:'Director/a del Proyecto (PM)', sprint:'E4', strategy:'Mitigar (plan específico)',      action:'Suite de tests de regresión con datos históricos de Madame Crepe.' },
  { code:'R-09', title:'Inconsistencias en los datos de candidatos (CVs con formatos no estándar).',
    category:'Riesgo',        probability:4, impact:3, owner:'Jefe/a de RR.HH. Madame Crepe',sprint:'E4', strategy:'Mitigar (plan específico)',      action:'Pipeline de preprocesamiento con parser OCR + validación de campos obligatorios.' },
  { code:'R-10', title:'Cambio de tarifa o límite de tokens de la API de IA durante el proyecto.',
    category:'Riesgo',        probability:3, impact:4, owner:'Área de TI / Infraestructura', sprint:'E5', strategy:'Mitigar (plan específico)',      action:'Negociar SLA con proveedor + evaluar альтернативные modelos (GPT-4o, Gemini).' },
  { code:'R-11', title:'Cambio regulatorio sobre uso de IA en procesos de selección (Ley peruana).',
    category:'Riesgo',        probability:2, impact:5, owner:'Área Legal y Contratos',       sprint:'E5', strategy:'Mitigar (plan específico)',      action:'Revisión legal trimestral + buffer de adaptación técnica de 30 días.' },
  { code:'R-12', title:'Vulnerabilidades de seguridad detectadas en pruebas SAST/DAST (OWASP ZAP, SonarCloud).',
    category:'Riesgo',        probability:3, impact:4, owner:'Área de TI / Infraestructura', sprint:'E5', strategy:'Mitigar (plan específico)',      action:'Integrar SonarCloud en CI/CD + revisión de seguridad en cada merge.' },
  { code:'R-13', title:'Resistencia al cambio del equipo de RR.HH. frente al chatbot.',
    category:'Interesados',   probability:4, impact:4, owner:'Jefe/a de RR.HH. Madame Crepe',sprint:'E6', strategy:'Mitigar (alineación + comunicación)', action:'Taller de change management + demonstration de beneficios con KPIs.' },
  { code:'R-14', title:'Disponibilidad real del chatbot < 99% SLA comprometida por sobrecostos operativos.',
    category:'Riesgo',        probability:2, impact:4, owner:'Área de TI / Infraestructura', sprint:'E6', strategy:'Mitigar (plan específico)',      action:'Auto-scaling en AWS EC2 + SLA de infraestructura documentado contractualmente.' },
  { code:'R-15', title:'Capacitación insuficiente a usuarios finales (Admin, Reclutador, Candidato).',
    category:'Recursos',      probability:3, impact:3, owner:'Jefe/a de RR.HH. Madame Crepe',sprint:'E6', strategy:'Mitigar (capacitación / backup)',   action:'Videos tutoriales + sandbox de pruebas + documentation in-app.' },
  { code:'R-16', title:'Sesgos en el modelo NLP que afecten la objetividad de la preselección.',
    category:'Riesgo',        probability:3, impact:5, owner:'Director/a del Proyecto (PM)', sprint:'E7', strategy:'Mitigar (plan específico)',      action:'Auditoría de bias trimestral + dataset de prueba con escenarios diversos.' },
  { code:'R-17', title:'Incremento inesperado de costos de infraestructura cloud AWS.',
    category:'Finanzas',      probability:3, impact:3, owner:'Área Financiera / Contabilidad',sprint:'E7', strategy:'Transferir (contrato / seguro)', action:'Reserved Instances + alertas de billing + presupuesto con buffer 15%.' },
  { code:'R-18', title:'Baja tasa de adopción por parte de Gerencia tras la puesta en marcha.',
    category:'Interesados',   probability:3, impact:4, owner:'Gerencia General Madame Crepe',  sprint:'E7', strategy:'Mitigar (alineación + comunicación)', action:'Dashboard executive con KPIs de negocio + demo mensual a Gerencia.' },
  { code:'R-19', title:'Hallazgos de auditoría interna que retrasen el cierre del proyecto.',
    category:'Gobernanza',    probability:2, impact:4, owner:'Patrocinador/a Ejecutivo/a',   sprint:'E7', strategy:'Escalar al Sponsor / Comité',   action:'Prepárate para escalar al Sponsor con plan correctivo en 7 días.' },
  { code:'R-20', title:'Oportunidad: Documentar lecciones aprendidas para futuros proyectos de IA en la organización.',
    category:'Recursos',      probability:4, impact:4, owner:'Director/a del Proyecto (PM)', sprint:'E8', strategy:'Aceptar / Mejorar',            action:'Documentar y explotar: convertir en caso de éxito replicable.' },
];

// 176 actividades (code, deliverable, month, name, domain, type, probability, impact)
const activities = [
  // E1 — Mes 01
  {code:'SE-1.1.1', deliverable:'E1', month:'Mes 01', name:'Elaboración del resumen de antecedentes: problema, métricas actuales y evidencias.', domain:'Planeación', type:'I', probability:3, impact:3},
  {code:'SE-1.1.2', deliverable:'E1', month:'Mes 01', name:'Recopilación y revisión de la documentación previa del prototipo de tesis.', domain:'Planeación', type:'I', probability:3, impact:5},
  {code:'SE-1.1.3', deliverable:'E1', month:'Mes 01', name:'Redacción de la justificación técnica, económica y social del proyecto empresarial.', domain:'Planeación', type:'I', probability:3, impact:3},
  {code:'SE-1.1.4', deliverable:'E1', month:'Mes 01', name:'Validación de antecedentes con el Gerente General de Madame Crepe.', domain:'Planeación', type:'I', probability:3, impact:3},
  {code:'SE-1.2.1', deliverable:'E1', month:'Mes 01', name:'Definición de estrategias de gestión de riesgos y oportunidades.', domain:'Riesgo', type:'A', probability:3, impact:4},
  {code:'SE-1.2.2', deliverable:'E1', month:'Mes 01', name:'Evaluación de probabilidad e impacto de cada riesgo identificado.', domain:'Riesgo', type:'A', probability:3, impact:4},
  {code:'SE-1.3.1', deliverable:'E1', month:'Mes 01', name:'Identificación y documentación de los interesados del proyecto.', domain:'Interesados', type:'I', probability:3, impact:4},
  {code:'SE-1.3.2', deliverable:'E1', month:'Mes 01', name:'Elaboración de la estrategia de engagement con interesados.', domain:'Interesados', type:'I', probability:2, impact:3},
  // E2 — Mes 02
  {code:'SE-2.1.1', deliverable:'E2', month:'Mes 02', name:'Diagnóstico del proceso AS-IS de reclutamiento en Madame Crepe.', domain:'Planeación', type:'I', probability:2, impact:4},
  {code:'SE-2.1.2', deliverable:'E2', month:'Mes 02', name:'Entrevistas con el equipo de RR.HH. sobre pain points actuales.', domain:'Interesados', type:'I', probability:2, impact:3},
  {code:'SE-2.2.1', deliverable:'E2', month:'Mes 02', name:'Mapeo del flujo de candidato desde postulación hasta contratación.', domain:'Planeación', type:'I', probability:2, impact:4},
  {code:'SE-2.2.2', deliverable:'E2', month:'Mes 02', name:'Taller de Design Thinking con RR.HH. para definir requisitos del chatbot.', domain:'Interesados', type:'A', probability:4, impact:4},
  {code:'SE-2.3.1', deliverable:'E2', month:'Mes 02', name:'Definición de criterios de éxito del MVP con el Sponsor.', domain:'Interesados', type:'I', probability:3, impact:5},
  {code:'SE-2.3.2', deliverable:'E2', month:'Mes 02', name:'Aprobación del backlog inicial del producto por el Product Owner.', domain:'Planeación', type:'I', probability:2, impact:4},
  // E3 — Mes 03
  {code:'SE-3.1.1', deliverable:'E3', month:'Mes 03', name:'Diseño de la arquitectura de 3 capas (presentación, lógica, datos).', domain:'Técnico', type:'A', probability:3, impact:5},
  {code:'SE-3.1.2', deliverable:'E3', month:'Mes 03', name:'Selección del stack tecnológico (React, FastAPI, MySQL, Groq API).', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-3.2.1', deliverable:'E3', month:'Mes 03', name:'Diseño del modelo de datos de candidatos y ofertas.', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-3.2.2', deliverable:'E3', month:'Mes 03', name:'Diseño de la API REST endpoints del chatbot.', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-3.3.1', deliverable:'E3', month:'Mes 03', name:'Definición del algoritmo de Integral de Choquet para scoring.', domain:'Técnico', type:'A', probability:4, impact:5},
  {code:'SE-3.3.2', deliverable:'E3', month:'Mes 03', name:'Prototipo del motor de scoring con dataset de prueba.', domain:'Técnico', type:'A', probability:4, impact:4},
  // E4 — Mes 04
  {code:'SE-4.1.1', deliverable:'E4', month:'Mes 04', name:'Desarrollo del módulo de parsing y extracción de datos de CVs.', domain:'Técnico', type:'A', probability:4, impact:4},
  {code:'SE-4.1.2', deliverable:'E4', month:'Mes 04', name:'Integración con Groq API para inferencia LLM.', domain:'Técnico', type:'A', probability:3, impact:5},
  {code:'SE-4.2.1', deliverable:'E4', month:'Mes 04', name:'Implementación del motor de scoring con Integral de Choquet.', domain:'Técnico', type:'A', probability:4, impact:5},
  {code:'SE-4.2.2', deliverable:'E4', month:'Mes 04', name:'Pruebas del motor de scoring con datos históricos de Madame Crepe.', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-4.3.1', deliverable:'E4', month:'Mes 04', name:'Desarrollo del backend de notificaciones a reclutadores.', domain:'Técnico', type:'A', probability:2, impact:3},
  {code:'SE-4.3.2', deliverable:'E4', month:'Mes 04', name:'Integración con plataforma de empleo para publicación automática.', domain:'Técnico', type:'A', probability:3, impact:4},
  // E5 — Mes 05
  {code:'SE-5.1.1', deliverable:'E5', month:'Mes 05', name:'Desarrollo del frontend del panel de administración (React).', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-5.1.2', deliverable:'E5', month:'Mes 05', name:'Desarrollo del frontend del chat de postulación para candidatos.', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-5.2.1', deliverable:'E5', month:'Mes 05', name:'Implementación de autenticación y control de acceso (RBAC).', domain:'Técnico', type:'A', probability:3, impact:5},
  {code:'SE-5.2.2', deliverable:'E5', month:'Mes 05', name:'Pruebas de seguridad SAST/DAST con OWASP ZAP y SonarCloud.', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-5.3.1', deliverable:'E5', month:'Mes 05', name:'Configuración del pipeline CI/CD con GitHub Actions.', domain:'Técnico', type:'A', probability:2, impact:4},
  {code:'SE-5.3.2', deliverable:'E5', month:'Mes 05', name:'Despliegue a entorno de staging en AWS EC2.', domain:'Técnico', type:'A', probability:2, impact:4},
  // E6 — Mes 06
  {code:'SE-6.1.1', deliverable:'E6', month:'Mes 06', name:'Pruebas de aceptación con usuarios reales de RR.HH.', domain:'Interesados', type:'A', probability:3, impact:4},
  {code:'SE-6.1.2', deliverable:'E6', month:'Mes 06', name:'Sesiones de capacitación para Administrators y Reclutadores.', domain:'Recursos', type:'A', probability:3, impact:4},
  {code:'SE-6.2.1', deliverable:'E6', month:'Mes 06', name:'Corrección de bugs reportados en testing de aceptación.', domain:'Técnico', type:'A', probability:3, impact:3},
  {code:'SE-6.2.2', deliverable:'E6', month:'Mes 06', name:'Optimización de rendimiento del chatbot (< 250ms latencia).', domain:'Técnico', type:'A', probability:3, impact:4},
  {code:'SE-6.3.1', deliverable:'E6', month:'Mes 06', name:'Despliegue a producción en AWS EC2 con Auto-Scaling.', domain:'Técnico', type:'A', probability:2, impact:5},
  {code:'SE-6.3.2', deliverable:'E6', month:'Mes 06', name:'Monitoreo de disponibilidad del chatbot (SLA 99%).', domain:'Técnico', type:'A', probability:2, impact:4},
  // E7 — Mes 07
  {code:'SE-7.1.1', deliverable:'E7', month:'Mes 07', name:'Auditoría de sesgos algorítmicos en el modelo NLP.', domain:'Técnico', type:'A', probability:3, impact:5},
  {code:'SE-7.1.2', deliverable:'E7', month:'Mes 07', name:'Análisis de adopción real por Gerencia (métricas de uso).', domain:'Interesados', type:'A', probability:3, impact:4},
  {code:'SE-7.2.1', deliverable:'E7', month:'Mes 07', name:'Revisión de costos cloud AWS vs presupuesto reservado.', domain:'Finanzas', type:'A', probability:3, impact:4},
  {code:'SE-7.2.2', deliverable:'E7', month:'Mes 07', name:'Ajuste de capacidad de infraestructura según demanda real.', domain:'Técnico', type:'A', probability:2, impact:4},
  {code:'SE-7.3.1', deliverable:'E7', month:'Mes 07', name:'Preparación de informe ejecutivo para Sponsor.', domain:'Interesados', type:'I', probability:2, impact:4},
  {code:'SE-7.3.2', deliverable:'E7', month:'Mes 07', name:'Reunión de status con Sponsor y PMO.', domain:'Interesados', type:'I', probability:2, impact:3},
  // E8 — Mes 08
  {code:'SE-8.1.1', deliverable:'E8', month:'Mes 08', name:'Recopilación de feedback de usuarios finales.', domain:'Interesados', type:'I', probability:2, impact:3},
  {code:'SE-8.1.2', deliverable:'E8', month:'Mes 08', name:'Ajustes finales al chatbot según feedback.', domain:'Técnico', type:'A', probability:2, impact:3},
  {code:'SE-8.2.1', deliverable:'E8', month:'Mes 08', name:'Documentación de lecciones aprendidas del proyecto.', domain:'Gestión', type:'I', probability:2, impact:3},
  {code:'SE-8.2.2', deliverable:'E8', month:'Mes 08', name:'Elaboración del manual de operación y soporte.', domain:'Gestión', type:'I', probability:2, impact:3},
  {code:'SE-8.3.1', deliverable:'E8', month:'Mes 08', name:'Acta de cierre del proyecto y transferencia a operaciones.', domain:'Gestión', type:'I', probability:2, impact:4},
  {code:'SE-8.3.2', deliverable:'E8', month:'Mes 08', name:'Celebración de cierre con todos los interesados.', domain:'Interesados', type:'I', probability:1, impact:1},
];

// Recursos catalogados por tipo
const rrhh = [
  {code:'R-PO',  name:'Product Owner',         description:'PMBOK 8 · Dirección de proyecto'},
  {code:'R-SM',  name:'Scrum Master',           description:'PMBOK 8 + Scrum · Facilitación'},
  {code:'R-D1',  name:'Desarrollador Backend',  description:'FastAPI, MySQL, Groq API, Docker'},
  {code:'R-D2',  name:'Desarrollador Frontend', description:'React, Tailwind, API REST'},
  {code:'R-D3',  name:'Ingeniero IA / ML',       description:'spaCy, Integral de Choquet, NLP'},
  {code:'R-QA',  name:'QA / Tester',            description:'Pruebas automatizadas, Selenium'},
  {code:'R-PM',  name:'Director/a del Proyecto', description:'Gestión global, stakeholder engagement'},
  {code:'R-RRHH',name:'Jefe/a de RR.HH.',        description:'Criterios de evaluación, change management'},
  {code:'R-GG',  name:'Gerencia General',        description:'Sponsor, aprobación de alcance'},
  {code:'R-ADM', name:'Administrador del Sistema',description:'Gestión de usuarios, RBAC'},
  {code:'R-REC', name:'Reclutador',              description:'Uso del chatbot, revisión de candidatos'},
  {code:'R-CAN', name:'Candidato',               description:'Usuario final — postulación'},
  {code:'R-AI',  name:'Arquitecto de Software',  description:'Diseño de arquitectura, ADR'},
  {code:'R-OPS', name:'DevOps Engineer',         description:'CI/CD, AWS EC2, Docker'},
  {code:'R-LEG', name:'Asesor Legal',           description:'Contratos, regulación IA'},
];

const fisicos_tec = [
  {code:'F-MON',  name:'Monitor externo 27"',   description:'Pantalla auxiliar para IDE'},
  {code:'F-CEL',  name:'Celular corporativo',   description:'Pruebas móviles y comunicación'},
  {code:'F-LAP',  name:'Laptop 16 GB RAM / SSD 512 GB', description:'Estación de desarrollo'},
  {code:'F-SRV',  name:'Servidor AWS EC2 (producción)', description:'Hosting del chatbot'},
  {code:'F-S3',   name:'AWS S3 Bucket',          description:'Almacenamiento de CVs y archivos'},
  {code:'F-API',  name:'API Keys Groq + OpenAI', description:'Inferencia LLM'},
];

const fisicos_mat = [
  {code:'M-MOB',  name:'Mobiliario (escritorios, sillas)', description:'Puestos de trabajo'},
  {code:'M-SALA', name:'Sala de reuniones',        description:'Ceremonias Scrum'},
  {code:'M-OFI',  name:'Oficina / Espacio coworking',description:'Ambiente de trabajo'},
  {code:'M-MAT',  name:'Material de oficina',      description:'Papel, tóner, útiles'},
];

const virtuales = [
  {code:'V-PYCH', name:'Licencia PyCharm Professional', description:'IDE Backend'},
  {code:'V-GIT',  name:'GitHub Enterprise (5 usuarios)',description:'Control de versiones'},
  {code:'V-JIRA', name:'Jira Software',               description:'Gestión de sprints'},
  {code:'V-CONF', name:'Confluence',                  description:'Documentación técnica'},
  {code:'V-NOTO', name:'Notion',                      description:'Gestión de conocimiento'},
  {code:'V-SONA', name:'SonarCloud',                  description:'Análisis de código SAST'},
  {code:'V-ZAP',  name:'OWASP ZAP',                  description:'Seguridad DAST'},
  {code:'V-TURN', name:'Licencia Turnitin (USAT)',   description:'Detección de plagio'},
  {code:'V-SLACK',name:'Slack',                       description:'Comunicación del equipo'},
  {code:'V-AWS',  name:'AWS Console',                 description:'Infraestructura cloud'},
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [[admin]] = await conn.query('SELECT id FROM users WHERE role="admin" LIMIT 1');
  if (!admin) { console.error('No admin user'); return; }
  const adminId = admin.id;
  const today = new Date().toISOString().slice(0, 10);

  // Sprint IDs
  const [sprints] = await conn.query('SELECT id, name FROM sprints WHERE projectId=?', [projectId]);
  const sprintMap = {};
  sprints.forEach(s => { sprintMap[s.name] = s.id; });

  // ── CLEANUP ─────────────────────────────────────────────────────────────────
  await conn.query('DELETE FROM risk_responses WHERE projectId=?', [projectId]);
  await conn.query('DELETE FROM risks WHERE projectId=?', [projectId]);
  await conn.query('DELETE FROM activity_resources WHERE activityId IN (SELECT id FROM activities WHERE projectId=?)', [projectId]);
  await conn.query('DELETE FROM activities WHERE projectId=?', [projectId]);
  await conn.query('DELETE FROM resources WHERE projectId=?', [projectId]);
  await conn.query('DELETE FROM stakeholders WHERE projectId=?', [projectId]);
  await conn.query('DELETE FROM contexts WHERE projectId=?', [projectId]);
  console.log('✓ Limpieza previa');

  // ── CONTEXT ────────────────────────────────────────────────────────────────
  await conn.query(
    `INSERT INTO contexts (id,projectId,internalContext,externalContext,criticalObjectives,riskCriteria,assets,affectedProcesses,stakeholders,legalFactors,technologicalFactors,organizationalFactors,createdBy,createdAt,updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    ['ctx_mc', projectId,
     `Equipo Scrum de 6 personas: 1 Product Owner, 1 Scrum Master, 4 Desarrolladores (1 Backend, 1 Frontend, 1 IA/ML, 1 QA). Metodología híbrida Scrum + Design Thinking. Sprints de 2 semanas.`,
     `Cliente: Madame Crepe S.A.C., Chiclayo, Perú. Sector HR Tech. Proveedores críticos: Groq API (LLM), OpenAI (fallback), AWS EC2/S3. Regulaciones: LGPD peruana, ley de IA en selección.`,
     `1. Lanzamiento MVP estable en 8 meses (Mes 01–Mes 08).\n2. Latencia del chatbot < 250ms en respuestas estándar.\n3. Presupuesto ≤ 45,000 USD.\n4. Tasa de precisión del motor de scoring > 80%.\n5. Integración con al menos 3 plataformas de empleo.`,
     `Bajo (1-4): Aceptar. Medio (5-9): Plan documentado por PM. Alto (10-14): Mitigación activa antes del sprint. Crítico (15-25): Bloquea sprint — escalamiento a dirección.`,
     `Código fuente, credenciales AWS/Groq/OpenAI, base de datos de candidatos (datos personales), documentación técnica, contratos con proveedores.`,
     `Registro de postulantes, parsing de CVs (NLP), scoring automatizado, notificaciones a reclutadores, CI/CD, deployment a producción.`,
     `Gerencia General (Sponsor), RR.HH. (Cliente), Equipo de Proyecto, PMO, CCB, Área Legal, Área de TI, Proveedores cloud.`,
     `Ley de Protección de Datos Personales (Perú), Términos de servicio OpenAI/Groq, Licencias OSS (MIT, Apache 2.0), Ética en decisiones automatizadas.`,
     `AWS EC2 + S3 (hosting), Groq API + OpenAI (LLM), React + FastAPI + MySQL (stack), spaCy (NLP fallback), Docker + GitHub Actions (CI/CD).`,
     `Patrocinio activo de Gerencia General. Estructura plana. Budget aprobado 45K USD inflexible. Apetito moderado al riesgo.`
     , adminId]
  );
  console.log('✓ Context');

  // ── STAKEHOLDERS ───────────────────────────────────────────────────────────
  for (const s of stakeholders) {
    await conn.query(
      `INSERT INTO stakeholders (id,projectId,code,name,type,ring,power,influence,interest,commitment_actual,commitment_desired,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [`stkh_mc_${s.code.toLowerCase()}`, projectId, s.code, s.name, s.type, s.ring,
       s.power, s.influence, s.interest, s.commitment_actual, s.commitment_desired]);
  }
  console.log(`✓ Stakeholders: ${stakeholders.length}`);

  // ── RESOURCES ──────────────────────────────────────────────────────────────
  const resourceIds = {};
  const catMap = { 'RRHH': rrhh, 'FisicoTecnologico': fisicos_tec, 'FisicoMaterial': fisicos_mat, 'Virtual': virtuales };
  for (const [cat, items] of Object.entries(catMap)) {
    for (const r of items) {
      const rid = `res_mc_${r.code.toLowerCase()}`;
      await conn.query(
        `INSERT INTO resources (id,projectId,code,category,name,description,createdAt,updatedAt)
         VALUES (?,?,?,?,?,?,NOW(),NOW())`,
        [rid, projectId, r.code, cat, r.name, r.description]
      );
      resourceIds[r.code] = rid;
    }
  }
  const totalRes = rrhh.length + fisicos_tec.length + fisicos_mat.length + virtuales.length;
  console.log(`✓ Resources: ${totalRes} (${rrhh.length} RRHH, ${fisicos_tec.length} Fisicos Tec, ${fisicos_mat.length} Fisicos Mat, ${virtuales.length} Virtuales)`);

  // ── ACTIVITIES ─────────────────────────────────────────────────────────────
  const deliverableMap = { 'E1':'E1. Acta de Constitución','E2':'E2. Diagnóstico AS-IS','E3':'E3. Diseño Técnico','E4':'E4. Motor de Preselección','E5':'E5. Módulo de Presentación','E6':'E6. Testing y Despliegue','E7':'E7. Monitoreo y Control','E8':'E8. Cierre' };
  const roleMap = { 'Técnico':'Desarrollador Backend','Planeación':'Director del Proyecto','Riesgo':'Director del Proyecto','Interesados':'Product Owner','Gestión':'Scrum Master','Recursos':'Jefe de RRHH','Finanzas':'Gerencia General' };
  const activityIds = [];
  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    const lvl = a.probability * a.impact;
    const cls = lvl >= 15 ? 'Crítico' : lvl >= 10 ? 'Alto' : lvl >= 5 ? 'Medio' : 'Bajo';
    const aid = `act_mc_${String(i+1).padStart(3,'0')}`;
    const subCode = a.code.split('.').slice(0,2).join('.');
    const objective = deliverableMap[a.deliverable] || a.deliverable;
    const roleMain = roleMap[a.domain] || 'Director del Proyecto';
    const riskType = a.type === 'I' ? 'Amenaza' : 'Amenaza';
    const uncertaintyType = a.type === 'I' ? 'Incidente' : 'Amenaza';
    await conn.query(
      `INSERT INTO activities (id,projectId,code,sub_code,deliverable,month,objective,name,role_main,domain_pmbok,uncertainty_type,risk_type,probability,impact,level,classification,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [aid, projectId, a.code, subCode, a.deliverable, a.month, objective, a.name, roleMain, a.domain, uncertaintyType, riskType, a.probability, a.impact, lvl, cls]
    );
    activityIds.push(aid);
  }
  console.log(`✓ Activities: ${activities.length}`);

  // ── ACTIVITY_RESOURCES (assign resources to activities) ────────────────────
  // Assign each activity its primary resources based on domain
  const domainResources = {
    'Técnico':   ['R-D1','R-D2','R-D3','R-QA','R-AI','R-OPS','F-LAP','F-SRV','F-API','V-GIT','V-JIRA','V-SONA'],
    'Planeación':['R-PM','R-PO','R-SM','R-GG','F-LAP','V-JIRA','V-CONF','V-NOTO'],
    'Riesgo':    ['R-PM','R-PO','R-SM','F-LAP','V-JIRA'],
    'Interesados':['R-PM','R-RRHH','R-GG','R-REC','F-LAP','V-SLACK','V-NOTO'],
    'Gestión':   ['R-PM','R-PO','R-SM','F-LAP','V-JIRA','V-CONF'],
    'Recursos':  ['R-RRHH','R-PM','F-LAP','V-NOTO','V-SLACK'],
    'Finanzas':  ['R-PM','R-GG','F-LAP','V-NOTO'],
  };
  let arCount = 0;
  for (let i = 0; i < activityIds.length; i++) {
    const a = activities[i];
    const resCodes = domainResources[a.domain] || domainResources['Técnico'];
    for (const rc of resCodes) {
      if (resourceIds[rc]) {
        await conn.query(
          `INSERT INTO activity_resources (id,activityId,resourceId,createdAt,updatedAt) VALUES (?,?,?,NOW(),NOW())`,
          [`ar_${activityIds[i]}_${rc.toLowerCase()}`, activityIds[i], resourceIds[rc]]
        );
        arCount++;
      }
    }
  }
  console.log(`✓ Activity-Resources: ${arCount} asignaciones`);

  // ── RISKS ──────────────────────────────────────────────────────────────────
  const riskIds = [];
  for (let i = 0; i < risks.length; i++) {
    const r = risks[i];
    const lvl = r.probability * r.impact;
    const cls = lvl >= 15 ? 'Crítico' : lvl >= 10 ? 'Alto' : lvl >= 5 ? 'Medio' : 'Bajo';
    const riskType = r.title.includes('Oportunidad') ? 'Oportunidad' : 'Amenaza';
    const rid = `risk_mc_${String(i+1).padStart(2,'0')}`;
    const sprintId = sprintMap[`E${i+1}`] || sprints[0]?.id;
    await conn.query(
      `INSERT INTO risks (id,code,projectId,title,category,probability,impact,level,classification,owner,sprintId,status,identifiedAt,responseStrategy,risk_type,createdBy,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [rid, r.code, projectId, r.title, r.category, r.probability, r.impact, lvl, cls, r.owner, sprintId, 'Identificado', today, r.strategy, riskType, adminId]
    );
    riskIds.push(rid);
  }
  console.log(`✓ Risks: ${risks.length}`);

  // ── RISK RESPONSES ─────────────────────────────────────────────────────────
  for (let i = 0; i < risks.length; i++) {
    const r = risks[i];
    const rrId = `rr_mc_${String(i+1).padStart(2,'0')}`;
    await conn.query(
      `INSERT INTO risk_responses (id,riskId,projectId,action,deadline_days,status,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,NOW(),NOW())`,
      [rrId, riskIds[i], projectId, r.action, 30, 'Abierto']
    );
  }
  console.log(`✓ Risk Responses: ${risks.length}`);

  // ── VERIFY ─────────────────────────────────────────────────────────────────
  const [[rc]]  = await conn.query('SELECT COUNT(*) as c FROM risks WHERE projectId=?', [projectId]);
  const [[ac]]  = await conn.query('SELECT COUNT(*) as c FROM activities WHERE projectId=?', [projectId]);
  const [[sc]]  = await conn.query('SELECT COUNT(*) as c FROM stakeholders WHERE projectId=?', [projectId]);
  const [[resc]]= await conn.query('SELECT COUNT(*) as c FROM resources WHERE projectId=?', [projectId]);
  const [[rrc]] = await conn.query('SELECT COUNT(*) as c FROM risk_responses WHERE projectId=?', [projectId]);

  console.log(`\n✅ Seed real completo — Madame Crepe PMBOK 8`);
  console.log(`   Context: 1  |  Stakeholders: ${sc.c}  |  Resources: ${resc.c}`);
  console.log(`   Activities: ${ac.c}  |  Risks: ${rc.c}  |  Risk Responses: ${rrc.c}`);

  await conn.end();
}

main().catch(e => { console.error('✘', e.message); process.exit(1); });
