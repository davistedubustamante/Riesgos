// Seed de datos: crea un admin por defecto y los datos de demo del proyecto prompt.
// Idempotencia: si ya existe un admin, no lo duplica; los proyectos se identifican por nombre.
//
// Uso: cd server && node scripts/seed-from-json.mjs

// Cargamos el .env desde la ruta real del proyecto, ignorando el CWD.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { arrToJson } from '../src/models/db.js';

const DB = process.env.DB_NAME || 'riesgos_db';

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// 1) Admin por defecto. Lo intenta crear solo si no hay usuarios.
//    Contraseña inicial: 'ChangeMe!2026' — cambia en producción.
async function ensureAdmin(conn) {
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM users');
  if (rows[0].n > 0) {
    console.log('  · admin ya existe — saltando');
    return (await conn.query('SELECT id FROM users WHERE role="admin" LIMIT 1'))[0][0]?.id;
  }
  // hash con la misma librería que usa el server
  const bcrypt = (await import('bcrypt')).default;
  const hash = await bcrypt.hash('ChangeMe!2026', 12);
  const id = 'u_admin_' + Date.now().toString(36);
  await conn.query(
    `INSERT INTO users (id, email, name, password_hash, role, active) VALUES (?, ?, ?, ?, 'admin', 1)`,
    [id, 'admin@riskflow.local', 'Administrador', hash],
  );
  console.log('  + admin creado: admin@riskflow.local / ChangeMe!2026');
  return id;
}

// 2) Proyecto, contexto, sprints, riesgos demo.
async function seedDemo(conn, adminId) {
  // ¿Ya existe el proyecto demo?
  const [ex] = await conn.query('SELECT id FROM projects WHERE name = ? LIMIT 1',
    ['Sistema inteligente basado en chatbot para apoyar la preselección de personal']);
  if (ex.length > 0) {
    console.log('  · proyecto demo ya existe — saltando inserts');
    return;
  }

  const projectId = 'p1';
  await conn.query(
    `INSERT INTO projects (id, name, description, type, owner, startDate, endDate, objective, scope, stakeholders, technologies, status, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [projectId,
     'Sistema inteligente basado en chatbot para apoyar la preselección de personal',
     'Plataforma web con chatbot, procesamiento de lenguaje natural, motor de evaluación multicriterio y dashboard para Recursos Humanos.',
     'Proyecto web',
     'Líder de proyecto',
     '2026-02-01', '2026-08-31',
     'Reducir el tiempo y la subjetividad en la fase de preselección de personal mediante un chatbot con NLP, evaluación multicriterio (Integral de Choquet) y dashboard para RR.HH.',
     'Chatbot de entrevista, API NLP externa con fallback, motor Choquet, dashboard de ranking, panel para RR.HH.',
     arrToJson(['RR.HH.','Gerencia','Postulantes','Equipo de desarrollo','Proveedor de API NLP']),
     arrToJson(['React + Vite','Node.js + Express','API Groq (NLP)','Motor Choquet','JSON storage']),
     'En ejecución', adminId, now(), now()],
  );

  await conn.query(
    `INSERT INTO contexts (id, projectId, internalContext, externalContext, criticalObjectives, riskCriteria, assets, affectedProcesses, stakeholders, legalFactors, technologicalFactors, organizationalFactors, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['ctx1', projectId,
     'Equipo pequeño con Scrum. RR.HH. con baja tolerancia a fallas operativas. Decisión final de contratación siempre es humana.',
     'Dependencia de proveedor de NLP. Mercado laboral con alta rotación. Marco regulatorio de protección de datos personales.',
     'Disponibilidad del chatbot, precisión percibida del ranking, trazabilidad de evaluaciones, tiempo de respuesta < 3s.',
     'Seguridad y privacidad → apetito BAJO. Ética y sesgo → apetito BAJO. Disponibilidad en piloto → MODERADO.',
     arrToJson(['Código fuente','Base de datos de postulantes','Credenciales API Groq','Pesos del motor Choquet','Logs de auditoría','Dashboard de RR.HH.']),
     arrToJson(['Reclutamiento','Preselección','Filtrado de candidatos','Reportes a gerencia']),
     arrToJson(['RR.HH.','Gerencia','Candidatos','Equipo técnico','Proveedor NLP']),
     'Tratamiento de datos personales de postulantes, consentimiento informado.',
     'API externa (Groq) con dependencia de disponibilidad, latencia variable, costos por uso.',
     'Resistencia al cambio de RR.HH., curva de aprendizaje del dashboard.',
     adminId, now(), now()],
  );

  // Sprints
  await conn.query(
    `INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, planningNotes, dailyImpediments, reviewNotes, retrospectiveNotes, lessonsLearned, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['s1', projectId,
     'Sprint 1 — Base del chatbot',
     'Levantar el esqueleto del chatbot y el fallback de reglas.',
     '2026-02-01', '2026-02-14',
     'Definir mocks de NLP y la matriz inicial de riesgos.',
     'Pendiente cuenta de sandbox del proveedor NLP.',
     'Chatbot responde a preguntas frecuentes. Fallback probado.',
     'El equipo subestimó la latencia de la API.',
     'Reservar tiempo para pruebas de resiliencia desde el Sprint 1.',
     adminId, now(), now()],
  );
  await conn.query(
    `INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, planningNotes, dailyImpediments, reviewNotes, retrospectiveNotes, lessonsLearned, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['s2', projectId,
     'Sprint 2 — Motor de evaluación',
     'Implementar el motor Choquet y el ranking.',
     '2026-02-15', '2026-02-28',
     'Validar fórmulas del motor Choquet con casos conocidos.',
     '',
     'Ranking se calcula correctamente sobre casos de prueba.',
     'Faltan métricas observables para los usuarios.',
     'Necesitamos un dashboard legible desde el primer sprint.',
     adminId, now(), now()],
  );

  // Riesgos R01-R05
  const risks = [
    ['R01','Técnico',3,4,12,'Alto','s1','En tratamiento',
     'Indisponibilidad de la API externa de NLP',
     'Caída o latencia excesiva del proveedor NLP durante una entrevista con el postulante.',
     'Dependencia de un servicio externo crítico (Groq) sin SLA garantizado.',
     'Entrevista interrumpida, postulante abandona, RR.HH. pierde trazabilidad.',
     'Líder técnico','Latencia p95 > 3s o tasa de error > 5%','Mitigar',
     'Implementar mecanismo de fallback basado en reglas + logs de activación.',
     '2026-02-14','','Si la API cae, el sistema atiende con reglas sin perder trazabilidad.',
     'Revisar precios del proveedor si el fallback se activa con frecuencia.'],

    ['R02','Ético / algorítmico',3,5,15,'Crítico',null,'Analizado',
     'Sesgo algorítmico en la evaluación de candidatos',
     'El motor de puntuación favorece o perjudica sistemáticamente a ciertos perfiles.',
     'Pesos del motor Choquet definidos con muestra limitada.',
     'Decisiones de preselección menos objetivas; rechazo legal/reputacional.',
     'Responsable de IA','Variaciones de puntaje significativas entre grupos demográficos.','Mitigar',
     'Aplicar auditoría periódica de distribución de puntajes + revisión de pesos.',
     '2026-03-01','','Distribución de puntajes estable y auditable.',
     'Crítico: debe tener evidencia antes de pasar a producción.'],

    ['R03','Privacidad',2,5,10,'Alto',null,'En tratamiento',
     'Exposición de datos personales de postulantes',
     'Filtración de respuestas, datos personales o puntajes desde el sistema.',
     'Controles de acceso insuficientes, ausencia de cifrado, logs mal sanitizados.',
     'Sanciones legales, daño reputacional, pérdida de confianza.',
     'Responsable de seguridad','Intentos de acceso fallidos > 10/h por usuario.','Mitigar',
     'Implementar autenticación, control de accesos por rol y cifrado en tránsito y reposo.',
     '2026-03-15','','Cero accesos indebidos en auditoría de seguridad.',
     'Aplica checklist de MAGERIT/NIST antes del release.'],

    ['R04','Organizacional',3,4,12,'Alto','s2','En tratamiento',
     'Baja aceptación del sistema por parte de Recursos Humanos',
     'RR.HH. no adopta el sistema o lo percibe como una caja negra.',
     'Falta de capacitación, usabilidad insuficiente, opacidad del ranking.',
     'Uso paralelo manual, ROI nulo, posible rechazo del proyecto.',
     'Product Owner','Tasa de uso del dashboard < 60% semanal.','Mitigar',
     'Capacitación, prototipo navegable, pruebas SUS y mejora continua de UX.',
     '2026-03-30','','SUS >= 80 y acta de retroalimentación de RR.HH.',
     'Necesita sponsor visible en RR.HH.'],

    ['R05','Funcional',3,5,15,'Crítico','s2','En tratamiento',
     'Error en el cálculo del ranking de candidatos',
     'El motor Choquet genera un ranking incorrecto para casos válidos.',
     'Pruebas insuficientes sobre casos límite y combinaciones de criterios.',
     'Decisiones de RR.HH. basadas en ordenamientos erróneos.',
     'Equipo de desarrollo','Diferencia de ranking vs. juicio experto fuera de umbral.','Mitigar',
     'Validar el motor con casos de prueba y comparación contra juicio experto.',
     '2026-03-10','','Coincidencia >= 85% con ranking experto de prueba.',
     ''],
  ];
  for (const [code, category, prob, imp, level, classification, sprintId, status, title, description, cause, consequence, owner, alertIndicator, responseStrategy, treatmentAction, reviewDate, evidence, expectedResult, observations] of risks) {
    await conn.query(
      `INSERT INTO risks
         (id, code, projectId, title, description, category, cause, consequence,
          probability, impact, level, classification, owner, sprintId, status,
          identifiedAt, alertIndicator, responseStrategy, treatmentAction, reviewDate,
          evidence, expectedResult, observations, createdBy, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['r' + code.slice(1), code, projectId, title, description, category, cause, consequence,
       prob, imp, level, classification, owner, sprintId, status,
       '2026-02-01', alertIndicator, responseStrategy, treatmentAction, reviewDate,
       evidence, expectedResult, observations,
       adminId, now(), now()],
    );
  }
  console.log('  + proyecto demo + 2 sprints + 5 riesgos insertados');
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB,
    connectTimeout: 10000,
  });
  console.log('→ Seed conectando a', DB);
  const adminId = await ensureAdmin(conn);
  await seedDemo(conn, adminId);
  await conn.end();
  console.log('✔ Seed completo.');
}

main().catch((e) => {
  console.error('✘ Error:', e.code || e.message);
  process.exit(1);
});
