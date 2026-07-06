// Seed: Madam Crepe — 18 stakeholders · 176 actividades · 63 recursos · 20 riesgos
// Datos extraídos directamente de:
//   G1-Bustamante-Sanchez-Dominio_Interesados.xlsx
//   G1-Recursos_por_Actividad_PMBOK8.xlsx
//   G1-gestion_riesgos.xlsx
//
// Uso: cd server && node scripts/seed-madame-crebe.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const DB = process.env.DB_NAME || 'riesgos_db';

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// Railway MySQL connection (password may contain special chars → use URL format)
const DB_URL = `mysql://${encodeURIComponent(process.env.DB_USER || 'root')}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${DB}`;

async function getConn() {
  return mysql.createConnection(DB_URL);
}

// ── STAKEHOLDERS (18) — de G1-Bustamante-Sanchez-Dominio_Interesados.xlsx ──
const stakeholders = [
  // code,  name,                         type,              ring,      power, influence, interest, ca, cd, strategy_mendelow, quadrant_inf_pow, action
  ['S01', 'Director/a del Proyecto (PM)',            'Interno', 'Anillo 1', 5, 5, 5, 5, 5, 'Gestionar activamente',   'Potentes/Influyentes', 'Reuniones semanales + involucrar en decisiones de hitos E1-E7.'],
  ['S02', 'Equipo de Proyecto (5 integrantes)',       'Interno', 'Anillo 1', 4, 5, 5, 4, 5, 'Gestionar activamente',   'Potentes/Influyentes', 'Reuniones semanales + involucrar en decisiones de hitos E1-E7.'],
  ['S03', 'Patrocinador/a Ejecutivo/a',              'Interno', 'Anillo 2', 5, 4, 5, 4, 5, 'Gestionar activamente',   'Potentes/Influyentes', 'Reuniones semanales + involucrar en decisiones de hitos E1-E7.'],
  ['S04', 'PMO / Oficina de Gestión de Proyectos',   'Interno', 'Anillo 2', 4, 4, 4, 3, 4, 'Gestionar activamente',   'Potentes/Influyentes', 'Reuniones semanales + involucrar en decisiones de hitos E1-E7.'],
  ['S05', 'Comité de Control de Cambios (CCB)',       'Interno', 'Anillo 2', 4, 4, 3, 3, 4, 'Mantener satisfechos',    'Potentes/No influencers','Informes ejecutivos mensuales; sin consulta frecuente.'],
  ['S06', 'Área de TI / Infraestructura',             'Interno', 'Anillo 2', 3, 3, 4, 3, 4, 'Mantener informados',     'Medio/Baja influencia', 'Newsletters + consulta en cambios relevantes.'],
  ['S07', 'Área Legal y Contratos',                  'Interno', 'Anillo 2', 3, 2, 2, 2, 3, 'Monitorear',               'Bajo impacto/Media influencia','Solo en hitos críticos o riesgos regulatorios.'],
  ['S08', 'Área Financiera / Contabilidad',          'Interno', 'Anillo 2', 3, 2, 3, 3, 3, 'Monitorear',               'Bajo impacto/Media influencia','Solo en hitos críticos o riesgos regulatorios.'],
  ['S09', 'Gerencia General Madame Crepe',            'Externo', 'Anillo 3', 5, 5, 5, 4, 5, 'Gestionar activamente',   'Potentes/Influyentes', 'Reuniones semanales + involucrar en decisiones de hitos E1-E7.'],
  ['S10', 'Jefe/a de RR.HH. Madame Crepe',           'Externo', 'Anillo 3', 4, 4, 5, 4, 5, 'Gestionar activamente',   'Potentes/Influyentes', 'Reuniones semanales + involucrar en decisiones de hitos E1-E7.'],
  ['S11', 'Reclutadores Madame Crepe',               'Externo', 'Anillo 3', 3, 4, 5, 3, 4, 'Mantener informados',     'Baja influencia/Altamente interesados','Newsletters + consulta en cambios relevantes.'],
  ['S12', 'Candidatos / Postulantes',                'Externo', 'Anillo 3', 1, 1, 4, 1, 2, 'Mantener informados',     'Baja influencia/Muy interesados','Newsletters + consulta en cambios relevantes.'],
  ['S13', 'Personal Operativo Madame Crepe',          'Externo', 'Anillo 3', 2, 2, 3, 2, 3, 'Monitorear',               'Bajo impacto/Baja influencia','Solo en hitos críticos o riesgos regulatorios.'],
  ['S14', 'Proveedor Cloud / Hosting',               'Externo', 'Anillo 3', 2, 1, 2, 2, 3, 'Monitorear',               'Bajo impacto/Baja influencia','Solo en hitos críticos o riesgos regulatorios.'],
  ['S15', 'Proveedor de Internet / ISP',             'Externo', 'Anillo 3', 2, 1, 2, 2, 2, 'Monitorear',               'Bajo impacto/Baja influencia','Solo en hitos críticos o riesgos regulatorios.'],
  ['S16', 'SUNAT / Reguladores Tributarios',         'Externo', 'Anillo 3', 4, 1, 1, 1, 3, 'Mantener satisfechos',    'Potentes/No influencers','Informes ejecutivos mensuales; sin consulta frecuente.'],
  ['S17', 'Municipalidad de Chiclayo',              'Externo', 'Anillo 3', 3, 1, 1, 1, 2, 'Monitorear',               'Bajo impacto/Baja influencia','Solo en hitos críticos o riesgos regulatorios.'],
  ['S18', 'Comunidad / Medios locales',             'Externo', 'Anillo 3', 1, 1, 1, 1, 1, 'Monitorear',               'Bajo impacto/Baja influencia','Solo en hitos críticos o riesgos regulatorios.'],
];

// ── RESOURCES (63) — de G1-Recursos_por_Actividad_PMBOK8.xlsx ─────────────
// 17 RRHH + 10 Físicos Tec + 8 Físicos Mat + 28 Virtuales
const resources = [
  // RRHH (17) — código → [code, category, name, description]
  ['RR01','RRHH','Director/a del Proyecto (PM)','Liderazgo del equipo. PMBOK 8.'],
  ['RR02','RRHH','Product Owner','Dirección de proyecto. Scrum.'],
  ['RR03','RRHH','Scrum Master','Facilitación Scrum.'],
  ['RR04','RRHH','Líder Técnico / Arquitecto de Software','Diseño técnico y arquitectura.'],
  ['RR05','RRHH','Desarrollador Frontend','React, Next.js, TypeScript.'],
  ['RR06','RRHH','Desarrollador Backend','Python, FastAPI, PostgreSQL.'],
  ['RR07','RRHH','Ingeniero IA / ML','NLP, Groq, Choquet, spaCy.'],
  ['RR08','RRHH','QA / Tester','pytest, Postman, Selenium.'],
  ['RR09','RRHH','Diseñador UX/UI','Figma, Design Thinking.'],
  ['RR10','RRHH','Oficial de IA / AI Officer','Gobierno de IA. PMBOK 8.'],
  ['RR11','RRHH','Comité de Gobierno de Datos','Governance. PMBOK 8.'],
  ['RR12','RRHH','Área Legal y Contratos','Cumplimiento legal. PMBOK 8.'],
  ['RR13','RRHH','Área Financiera / Contabilidad','Control de costos. PMBOK 8.'],
  ['RR14','RRHH','Jefe/a de RR.HH. Madame Crepe','Cliente. Validación de requisitos.'],
  ['RR15','RRHH','Reclutadores Madame Crepe','Cliente. Pruebas piloto.'],
  ['RR16','RRHH','Gerencia General Madame Crepe','Cliente. Sponsor del proyecto.'],
  ['RR17','RRHH','Asesor Técnico (USAT)','Académico. Revisión y supervisión.'],
  // Físicos Tecnológicos (10)
  ['FT01','FisicoTecnologico','Laptop 16 GB RAM / SSD 512 GB','Equipo principal de desarrollo.'],
  ['FT02','FisicoTecnologico','Monitor externo 27"','Pantalla auxiliar para IDE.'],
  ['FT03','FisicoTecnologico','Celular corporativo','Pruebas móviles y comunicación.'],
  ['FT04','FisicoTecnologico','Teclado - Compartido','Periférico de uso común.'],
  ['FT05','FisicoTecnologico','Mouse','Periférico estándar.'],
  ['FT06','FisicoTecnologico','Audífonos con micrófono','Reuniones virtuales.'],
  ['FT07','FisicoTecnologico','Cámara web HD','Daily Scrum y demos.'],
  ['FT08','FisicoTecnologico','Impresora multifuncional','Impresión de documentos.'],
  ['FT09','FisicoTecnologico','Servidor físico on-premise (backup)','Respaldo local.'],
  ['FT10','FisicoTecnologico','Disco NAS / Storage','Almacenamiento masivo.'],
  // Físicos Materiales (8)
  ['FM01','FisicoMaterial','Oficina / Espacio de coworking','Reuniones y Daily presencial.'],
  ['FM02','FisicoMaterial','Mobiliario (escritorios, sillas)','Puestos de trabajo.'],
  ['FM03','FisicoMaterial','Sala de reuniones','Ceremonias Scrum.'],
  ['FM04','FisicoMaterial','Material de oficina (papel, tóner)','Insumos generales.'],
  ['FM05','FisicoMaterial','Café / Refrigerio para talleres','Actividades de cohesión.'],
  ['FM06','FisicoMaterial','Materiales de capacitación','Manuales impresos.'],
  ['FM07','FisicoMaterial','EPP (covid, seguridad)','Cumplimiento SST.'],
  ['FM08','FisicoMaterial','Licencia física / Documentos notariales','Acta de constitución.'],
  // Virtuales (28)
  ['VT01','Virtual','Licencia Visual Studio Code (OSS)','IDE principal.'],
  ['VT02','Virtual','Licencia PyCharm Professional','IDE Backend.'],
  ['VT03','Virtual','GitHub Enterprise (5 usuarios)','Control de versiones.'],
  ['VT04','Virtual','Docker Desktop (OSS)','Contenedores.'],
  ['VT05','Virtual','AWS EC2 t3.medium (Desarrollo)','Servidor dev.'],
  ['VT06','Virtual','AWS EC2 t3.large (Staging)','Servidor staging.'],
  ['VT07','Virtual','AWS EC2 t3.large HA (Producción)','Servidor producción.'],
  ['VT08','Virtual','AWS RDS PostgreSQL db.t3.medium','Base de datos.'],
  ['VT09','Virtual','AWS ElastiCache Redis','Cache.'],
  ['VT10','Virtual','Nginx (OSS)','Balanceador.'],
  ['VT11','Virtual','Dominio + DNS','Dominio del proyecto.'],
  ['VT12','Virtual','Certificado SSL (Lets Encrypt)','HTTPS.'],
  ['VT13','Virtual','API Groq / Gemini (tokens)','Análisis NLP.'],
  ['VT14','Virtual','API OpenAI (fallback)','Análisis NLP.'],
  ['VT15','Virtual','Jira Software','Backlog y sprints.'],
  ['VT16','Virtual','Confluence','Documentación.'],
  ['VT17','Virtual','Figma Professional','Diseño UX/UI.'],
  ['VT18','Virtual','Postman Pro','Testing API.'],
  ['VT19','Virtual','SonarCloud (SAST)','Análisis estático.'],
  ['VT20','Virtual','Snyk (vulnerabilidades)','Análisis de dependencias.'],
  ['VT21','Virtual','Licencia de Zoom','Reuniones virtuales.'],
  ['VT22','Virtual','Microsoft Teams','Comunicación.'],
  ['VT23','Virtual','Slack Pro','Chat equipo.'],
  ['VT24','Virtual','Notion','Notas.'],
  ['VT25','Virtual','Licencia Ozmap / Whimsical','Diagramas arquitectura.'],
  ['VT26','Virtual','Licencia Turnitin (USAT)','Anti-plagio académico.'],
  ['VT27','Virtual','GitHub Actions (CI/CD)','Pipeline.'],
  ['VT28','Virtual','OWASP ZAP (DAST)','Análisis dinámico.'],
];

// ── ACTIVITIES (176) — de G1-gestion_riesgos.xlsx Hoja 05 + G1-Recursos_por_Actividad_PMBOK8.xlsx ──
// [code, deliverable, month, objective, name, role_main, domain_pmbok, uncertainty_type, probability, impact]
const activities_raw = [
  // E1 · Mes 01 · OBJ-1
  ['SE-1.1.1','E1','Mes 01','OBJ-1','Elaboración del resumen de antecedentes: problema, métricas actuales y evidencias.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.1.2','E1','Mes 01','OBJ-1','Recopilación y revisión de la documentación previa del prototipo de tesis.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-1.1.3','E1','Mes 01','OBJ-1','Redacción de la justificación técnica, económica y social del proyecto empresarial.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.1.4','E1','Mes 01','OBJ-1','Validación de antecedentes con el Gerente General de Madame Crepe.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,2],
  ['SE-1.2.1','E1','Mes 01','OBJ-1','Definición de estrategias de respuesta y planes de contingencia.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.2.2','E1','Mes 01','OBJ-1','Evaluación de probabilidad e impacto de cada riesgo identificado.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,4],
  ['SE-1.2.3','E1','Mes 01','OBJ-1','Identificación de riesgos técnicos, operativos y organizacionales del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-1.3.1','E1','Mes 01','OBJ-1','Definición de funcionalidades incluidas y explícitamente excluidas del alcance.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-1.3.2','E1','Mes 01','OBJ-1','Identificación y documentación de hitos y criterios de éxito del proyecto.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-1.3.3','E1','Mes 01','OBJ-1','Redacción del objetivo general y los 4 objetivos específicos del proyecto empresarial.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.3.4','E1','Mes 01','OBJ-1','Reunión de kick-off con Gerencia y RR.HH. para definir el alcance del proyecto.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.3.5','E1','Mes 01','OBJ-1','Revisión y aprobación del alcance por la Gerencia.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.4.1','E1','Mes 01','OBJ-1','Elaboración del cronograma macro del proyecto (hitos por entregable).','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-1.4.2','E1','Mes 01','OBJ-1','Estimación del presupuesto de desarrollo, infraestructura y capacitación.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,4],
  ['SE-1.4.3','E1','Mes 01','OBJ-1','Identificación del equipo del proyecto: roles, responsabilidades y dedicación.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-1.5.1','E1','Mes 01','OBJ-1','Firma y aprobación oficial del Acta de Constitución.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.5.2','E1','Mes 01','OBJ-1','Presentación del acta a la Gerencia de Madame Crepe.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.5.3','E1','Mes 01','OBJ-1','Redacción formal del Acta de Constitución del Proyecto con todos sus componentes.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-1.5.4','E1','Mes 01','OBJ-1','Revisión del acta con el asesor técnico y el equipo del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-1.?.1','E1','Mes 01','OBJ-1','Definición de la estrategia de comunicación con cada stakeholder.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.?.2','E1','Mes 01','OBJ-1','Elaboración de la matriz de stakeholders: roles, intereses y nivel de influencia.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-1.?.3','E1','Mes 01','OBJ-1','Identificación de todos los stakeholders internos y externos del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-1.?.4','E1','Mes 01','OBJ-1','Validación del registro de stakeholders con el sponsor del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,2],
  // E2 · Mes 02 · OBJ-2
  ['SE-2.1.1','E2','Mes 02','OBJ-2','Identificación y documentación de los 4 roles de usuario: Admin, Reclutador, Visor, Candidato.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-2.1.2','E2','Mes 02','OBJ-2','Priorización del backlog con técnica MoSCoW.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-2.1.3','E2','Mes 02','OBJ-2','Redacción de las Historias de Usuario (HU) para cada rol del sistema.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-2.1.4','E2','Mes 02','OBJ-2','Talleres de Design Thinking fase Definir: síntesis del Punto de Vista.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-2.1.5','E2','Mes 02','OBJ-2','Talleres de Design Thinking fase Empatizar con el equipo de RR.HH.','Jefe/a de RR.HH. Madame Crepe','Ambigüedad','Amenaza',3,3],
  ['SE-2.2.1','E2','Mes 02','OBJ-2','Definición de requisitos de disponibilidad: operación 24/7 con tolerancia a fallos.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-2.2.2','E2','Mes 02','OBJ-2','Definición de requisitos de rendimiento: tiempo de respuesta menor a 3 segundos.','Líder Técnico / Arquitecto','Complejidad','Amenaza',4,3],
  ['SE-2.2.3','E2','Mes 02','OBJ-2','Definición de requisitos de seguridad: JWT, cifrado y control de acceso por rol.','Desarrollador Backend','Complejidad','Amenaza',4,4],
  ['SE-2.2.4','E2','Mes 02','OBJ-2','Definición de requisitos de usabilidad y compatibilidad web y móvil (responsive).','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-2.2.5','E2','Mes 02','OBJ-2','Validación de todos los requisitos no funcionales con la Gerencia.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-2.3.1','E2','Mes 02','OBJ-2','Diseño de la guía de entrevista semiestructurada para Gerencia y RR.HH.','Desarrollador Frontend','Complejidad','Amenaza',4,5],
  ['SE-2.3.2','E2','Mes 02','OBJ-2','Ejecución del shadowing: observación directa del proceso de reclutamiento.','Diseñador UX/UI','Ambigüedad','Amenaza',3,4],
  ['SE-2.3.3','E2','Mes 02','OBJ-2','Elaboración del mapa del proceso AS-IS con cuellos de botella identificados.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-2.3.4','E2','Mes 02','OBJ-2','Registro y cuantificación de métricas actuales: horas/semana, costos y rotación.','QA / Tester','Incertidumbre','Amenaza',3,3],
  ['SE-2.4.1','E2','Mes 02','OBJ-2','Construcción del banco inicial de preguntas alineadas a cada criterio.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-2.4.2','E2','Mes 02','OBJ-2','Definición de los pesos individuales para cada criterio de evaluación.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,4],
  ['SE-2.4.3','E2','Mes 02','OBJ-2','Modelado de interacciones no lineales entre criterios (medidas difusas).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-2.4.4','E2','Mes 02','OBJ-2','Talleres con RR.HH. para definir criterios de evaluación por puesto de trabajo.','Jefe/a de RR.HH. Madame Crepe','Ambigüedad','Amenaza',3,4],
  ['SE-2.4.5','E2','Mes 02','OBJ-2','Validación del modelo de criterios con expertos en RR.HH.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,2],
  ['SE-2.5.1','E2','Mes 02','OBJ-2','Medición de la tasa de correspondencia perfil-candidato actual (línea base 3.1/5).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-2.5.2','E2','Mes 02','OBJ-2','Medición formal del tiempo de filtrado manual: promedio de 8-10 h/semana.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-2.5.3','E2','Mes 02','OBJ-2','Registro de la tasa de rotación temprana: 25% en primer trimestre.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-2.6.1','E2','Mes 02','OBJ-2','Firma del documento de requisitos como línea base del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-2.6.2','E2','Mes 02','OBJ-2','Integración de todos los componentes en el documento de requisitos.','Product Owner','Complejidad','Amenaza',4,3],
  ['SE-2.6.3','E2','Mes 02','OBJ-2','Presentación y aprobación del documento por la Gerencia de Madame Crepe.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-2.6.4','E2','Mes 02','OBJ-2','Revisión del documento con el equipo técnico del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  // E3 · Mes 03 · OBJ-3
  ['SE-3.1.1','E3','Mes 03','OBJ-3','Definición de la arquitectura en 3 capas: Frontend React/Next.js, Backend FastAPI, BD PostgreSQL.','Desarrollador Frontend','Volatilidad','Amenaza',2,5],
  ['SE-3.1.2','E3','Mes 03','OBJ-3','Definición de la infraestructura de servidor productivo y requisitos de hosting.','Desarrollador Backend','Complejidad','Amenaza',4,3],
  ['SE-3.1.3','E3','Mes 03','OBJ-3','Diagrama de componentes del sistema y sus interacciones.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-3.1.4','E3','Mes 03','OBJ-3','Especificación del modelo de seguridad: JWT, cifrado de contraseñas con passlib y RBAC.','Desarrollador Backend','Complejidad','Amenaza',4,4],
  ['SE-3.1.5','E3','Mes 03','OBJ-3','Revisión y aprobación de la arquitectura con el equipo técnico.','Director/a del Proyecto (PM)','Complejidad','Amenaza',4,5],
  ['SE-3.2.1','E3','Mes 03','OBJ-3','Definición del sistema de diseño: paleta de colores, tipografía y componentes.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-3.2.2','E3','Mes 03','OBJ-3','Validación de wireframes con el equipo de RR.HH. de Madame Crepe.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,2],
  ['SE-3.2.3','E3','Mes 03','OBJ-3','Wireframes de la interfaz del chatbot para el Candidato (desktop y móvil).','Desarrollador Frontend','Complejidad','Amenaza',4,5],
  ['SE-3.2.4','E3','Mes 03','OBJ-3','Wireframes de las vistas de Administrador: gestión de cuentas y banco de preguntas.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-3.2.5','E3','Mes 03','OBJ-3','Wireframes de las vistas de Reclutador: puestos, entrevistas y dashboard.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-3.3.1','E3','Mes 03','OBJ-3','Definición de endpoints de autenticación: login, logout, refresh token.','Desarrollador Backend','Complejidad','Amenaza',4,3],
  ['SE-3.3.2','E3','Mes 03','OBJ-3','Definición de endpoints CRUD de usuarios y gestión de roles.','Desarrollador Backend','Complejidad','Amenaza',4,5],
  ['SE-3.3.3','E3','Mes 03','OBJ-3','Diseño del modelo de datos: tablas de usuarios, roles, permisos, auditoría.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-3.3.4','E3','Mes 03','OBJ-3','Configuración de PostgreSQL: índices, constraints, pg_trgm, full-text search.','Desarrollador Backend','Volatilidad','Amenaza',2,3],
  ['SE-3.4.1','E3','Mes 03','OBJ-3','Configuración de AWS EC2 + RDS + S3 para entorno de desarrollo.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-3.4.2','E3','Mes 03','OBJ-3','Configuración de Docker Compose para entorno local idéntico a producción.','Desarrollador Backend','Volatilidad','Amenaza',2,3],
  ['SE-3.4.3','E3','Mes 03','OBJ-3','Integración con GitHub Actions: pipeline CI/CD con stages build-test-deploy.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-3.4.4','E3','Mes 03','OBJ-3','Configuración de SonarCloud y Snyk en el pipeline de CI.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-3.4.5','E3','Mes 03','OBJ-3','Revisión de seguridad OWASP Top 10 en arquitectura propuesta.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,5],
  ['SE-3.5.1','E3','Mes 03','OBJ-3','Despliegue de infraestructura AWS con Terraform (IaC).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-3.5.2','E3','Mes 03','OBJ-3','Configuración de pipelines de infraestructura con GitOps (ArgoCD).','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-3.5.3','E3','Mes 03','OBJ-3','Implementación de observabilidad: logs, métricas, trazas distribuidas.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-3.5.4','E3','Mes 03','OBJ-3','Configuración de alertas y dashboards en Grafana/Prometheus.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-3.5.5','E3','Mes 03','OBJ-3','Revisión final de seguridad y cumplimiento antes de paso a staging.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,2],
  // E4 · Mes 04 · OBJ-4
  ['SE-4.1.1','E4','Mes 04','OBJ-4','Configuración del entorno de desarrollo FastAPI con Poetry y pre-commit hooks.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.1.2','E4','Mes 04','OBJ-4','Desarrollo de los endpoints de autenticación JWT con refresh tokens.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,4],
  ['SE-4.1.3','E4','Mes 04','OBJ-4','Implementación de RBAC: permisos granulares por rol (Admin, Reclutador, Visor, Candidato).','Desarrollador Backend','Complejidad','Amenaza',4,5],
  ['SE-4.1.4','E4','Mes 04','OBJ-4','Desarrollo del módulo de gestión de usuarios y auditoría de accesos.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.1.5','E4','Mes 04','OBJ-4','Desarrollo del módulo de gestión de puestos de trabajo.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.2.1','E4','Mes 04','OBJ-4','Desarrollo de endpoints CRUD del banco de preguntas con validación de tipos ENUM.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.2.2','E4','Mes 04','OBJ-4','Implementación del módulo de configuración de criterios Choquet con interfaz visual.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-4.2.3','E4','Mes 04','OBJ-4','Desarrollo de endpoints para asignación de preguntas a puestos.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-4.2.4','E4','Mes 04','OBJ-4','Implementación de ranking de candidatos con ponderación Choquet.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.2.5','E4','Mes 04','OBJ-4','Desarrollo del módulo de historial de entrevistas con filtros.','QA / Tester','Ambigüedad','Amenaza',3,5],
  ['SE-4.3.1','E4','Mes 04','OBJ-4','Configuración de Groq API con manejo de rate limits y reintentos automáticos.','Desarrollador Backend','Volatilidad','Amenaza',2,4],
  ['SE-4.3.2','E4','Mes 04','OBJ-4','Implementación de logging estructurado con contexto de entrevista.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.3.3','E4','Mes 04','OBJ-4','Desarrollo del endpoint /chat/start con generación de sesión e inicialización.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.3.4','E4','Mes 04','OBJ-4','Desarrollo del endpoint /chat/next con lógica secuencial de preguntas y registro.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,4],
  ['SE-4.3.5','E4','Mes 04','OBJ-4','Desarrollo del endpoint /chat/end con cierre de entrevista y cálculo de score.','Ingeniero IA / ML','Incertidumbre','Oportunidad',3,3],
  ['SE-4.3.6','E4','Mes 04','OBJ-4','Implementación de detección de lenguaje inapropiado con OpenAI Moderation API.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,4],
  ['SE-4.4.1','E4','Mes 04','OBJ-4','Configuración del entorno frontend con Next.js 14, Tailwind CSS y Zustand.','Desarrollador Frontend','Complejidad','Amenaza',4,5],
  ['SE-4.4.2','E4','Mes 04','OBJ-4','Desarrollo del layout principal y sistema de navegación con Auth Context.','Desarrollador Backend','Complejidad','Amenaza',4,3],
  ['SE-4.4.3','E4','Mes 04','OBJ-4','Implementación de tema oscuro/día con prefers-color-scheme.','Desarrollador Backend','Volatilidad','Amenaza',2,5],
  ['SE-4.4.4','E4','Mes 04','OBJ-4','Implementación del frontend React: pantalla de login y gestión de sesión con Auth Context.','Desarrollador Frontend','Complejidad','Amenaza',4,4],
  ['SE-4.4.5','E4','Mes 04','OBJ-4','Pruebas unitarias del módulo de autenticación y corrección de errores.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.5.1','E4','Mes 04','OBJ-4','Desarrollo del banco de preguntas con tipos ENUM: texto, número y selección única.','Jefe/a de RR.HH. Madame Crepe','Ambigüedad','Amenaza',3,4],
  ['SE-4.5.2','E4','Mes 04','OBJ-4','Desarrollo del módulo de configuración de criterios Choquet con almacenamiento JSONB.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,4],
  ['SE-4.5.3','E4','Mes 04','OBJ-4','Implementación de la asignación de preguntas a puestos con orden configurable.','Desarrollador Frontend','Complejidad','Amenaza',4,4],
  ['SE-4.5.4','E4','Mes 04','OBJ-4','Implementación de la interfaz de pesos e interacciones entre criterios.','Desarrollador Frontend','Complejidad','Amenaza',4,4],
  ['SE-4.5.5','E4','Mes 04','OBJ-4','Pruebas del módulo de configuración y validación con el equipo de RR.HH.','QA / Tester','Ambigüedad','Amenaza',3,2],
  ['SE-4.6.1','E4','Mes 04','OBJ-4','Desarrollo de la interfaz React con tabla de datos y formulario modal de puestos.','Desarrollador Frontend','Complejidad','Amenaza',4,4],
  ['SE-4.6.2','E4','Mes 04','OBJ-4','Implementación de endpoints CRUD de puestos con modelo de datos en PostgreSQL.','Desarrollador Backend','Complejidad','Amenaza',4,4],
  ['SE-4.6.3','E4','Mes 04','OBJ-4','Implementación de lógica de estados: puestos activos e inactivos.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-4.6.4','E4','Mes 04','OBJ-4','Implementación del generador de enlace único por puesto para candidatos.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-4.6.5','E4','Mes 04','OBJ-4','Pruebas funcionales del módulo de puestos y corrección de errores.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-4.7.1','E4','Mes 04','OBJ-4','Desarrollo de la interfaz conversacional del chatbot responsive para web y móvil.','Desarrollador Frontend','Complejidad','Amenaza',4,5],
  ['SE-4.7.2','E4','Mes 04','OBJ-4','Implementación del endpoint /chat/end: cierre de entrevista y cambio de estado.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-4.7.3','E4','Mes 04','OBJ-4','Implementación del endpoint /chat/next: lógica secuencial de preguntas y registro.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.7.4','E4','Mes 04','OBJ-4','Implementación del endpoint /chat/start: generación de sesión e inicialización.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-4.7.5','E4','Mes 04','OBJ-4','Implementación del registro completo de conversación en tabla mensajes_entrevista.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-4.7.6','E4','Mes 04','OBJ-4','Pruebas de flujo completo del chatbot con datos de prueba.','QA / Tester','Ambigüedad','Amenaza',3,5],
  // E5 · Mes 05
  ['SE-5.1.1','E5','Mes 05','OBJ-5','Aplicación de rúbrica de correspondencia perfil-candidato (escala Likert 1-5).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-5.1.2','E5','Mes 05','OBJ-5','Aplicación del Cuestionario SUS (System Usability Scale) a los 3 expertos.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-5.1.3','E5','Mes 05','OBJ-5','Procesamiento estadístico: cálculo del Score SUS global y tasa de correspondencia.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-5.1.4','E5','Mes 05','OBJ-5','Redacción del informe de validación con tablas de resultados y gráficos.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-5.1.5','E5','Mes 05','OBJ-5','Selección y convocatoria de 3 expertos en RR.HH. para la evaluación.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-5.2.1','E5','Mes 05','OBJ-5','Diseño de la matriz de trazabilidad pruebas-requisitos funcionales.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-5.2.2','E5','Mes 05','OBJ-5','Preparación del ambiente de pruebas con datos representativos.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-5.2.3','E5','Mes 05','OBJ-5','Redacción del plan de pruebas: alcance, tipos, criterios de aceptación y responsables.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-5.2.4','E5','Mes 05','OBJ-5','Revisión y aprobación del plan de pruebas con el equipo técnico.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-5.3.1','E5','Mes 05','OBJ-5','Coordinación con RR.HH. de Madame Crepe para convocar mínimo 30 postulantes.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-5.3.2','E5','Mes 05','OBJ-5','Documentación de incidencias y observaciones durante la prueba piloto.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-5.3.3','E5','Mes 05','OBJ-5','Ejecución de la prueba piloto: candidatos completan entrevistas vía chatbot.','Desarrollador Frontend','Incertidumbre','Amenaza',3,5],
  ['SE-5.3.4','E5','Mes 05','OBJ-5','Preparación de los puestos de prueba y criterios Choquet en el sistema.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-5.3.5','E5','Mes 05','OBJ-5','Registro y comparación de tiempos: proceso manual vs. proceso automatizado.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-5.4.1','E5','Mes 05','OBJ-5','Análisis del flujo de control de la función analizar_con_ia (n lp_utils.py).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-5.4.2','E5','Mes 05','OBJ-5','Diseño de caso CB-01: ruta de respuesta vacía.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-5.4.3','E5','Mes 05','OBJ-5','Diseño de caso CB-02: ruta de detección de alerta.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-5.4.4','E5','Mes 05','OBJ-5','Diseño de caso CB-03: ruta de análisis exitoso con API externa.','Desarrollador Backend','Volatilidad','Amenaza',2,3],
  ['SE-5.4.5','E5','Mes 05','OBJ-5','Diseño de caso CB-04: ruta de fallback local con spaCy.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-5.4.6','E5','Mes 05','OBJ-5','Ejecución de pruebas de caja blanca y verificación de cobertura 100%.','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-5.5.1','E5','Mes 05','OBJ-5','Corrección de defectos encontrados y re-ejecución de casos fallidos.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-5.5.2','E5','Mes 05','OBJ-5','Diseño de casos de prueba de acceso: credenciales correctas e incorrectas (CP01).','QA / Tester','Incertidumbre','Amenaza',3,5],
  ['SE-5.5.3','E5','Mes 05','OBJ-5','Diseño de casos de prueba de respuesta irrelevante o vacía (CP03).','QA / Tester','Ambigüedad','Amenaza',3,3],
  ['SE-5.5.4','E5','Mes 05','OBJ-5','Diseño de casos de prueba del motor Choquet al finalizar entrevista (CP04).','Desarrollador Frontend','Complejidad','Amenaza',4,5],
  ['SE-5.5.5','E5','Mes 05','OBJ-5','Diseño de casos de prueba del módulo NLP: detección de lenguaje inapropiado (CP02).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-5.5.6','E5','Mes 05','OBJ-5','Ejecución de todos los casos de caja negra y registro de resultados.','QA / Tester','Ambigüedad','Amenaza',3,3],
  // E6 · Mes 06
  ['SE-6.1.1','E6','Mes 06','OBJ-6','Documentación de la API REST: endpoints, parámetros y códigos de respuesta.','Desarrollador Backend','Volatilidad','Amenaza',2,3],
  ['SE-6.1.2','E6','Mes 06','OBJ-6','Documentación de la arquitectura final: diagrama de componentes y flujos.','Líder Técnico / Arquitecto','Complejidad','Amenaza',4,5],
  ['SE-6.1.3','E6','Mes 06','OBJ-6','Documentación del modelo de datos: tablas, relaciones y diccionario de datos.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.1.4','E6','Mes 06','OBJ-6','Documentación del motor Choquet: fórmula, criterios configurados y ejemplos.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-6.1.5','E6','Mes 06','OBJ-6','Documentación del módulo NLP: lógica de análisis, criterios y mecanismo de fallback.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-6.2.1','E6','Mes 06','OBJ-6','Guía de actualización de credenciales de APIs externas (Gemini).','Desarrollador Backend','Volatilidad','Amenaza',2,5],
  ['SE-6.2.2','E6','Mes 06','OBJ-6','Guía de monitoreo del sistema y resolución de incidencias comunes.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-6.2.3','E6','Mes 06','OBJ-6','Redacción del procedimiento de respaldo y recuperación de la base de datos.','Líder Técnico / Arquitecto','Complejidad','Amenaza',4,3],
  ['SE-6.3.1','E6','Mes 06','OBJ-6','Redacción de la guía de acceso al chatbot mediante enlace único.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-6.3.2','E6','Mes 06','OBJ-6','Redacción de las instrucciones para completar la entrevista vía chatbot.','Desarrollador Frontend','Complejidad','Amenaza',4,5],
  ['SE-6.3.3','E6','Mes 06','OBJ-6','Redacción de las preguntas frecuentes (FAQ) del proceso de postulación.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.4.1','E6','Mes 06','OBJ-6','Inclusión de capturas de pantalla y ejemplos prácticos en el manual del Admin.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.4.2','E6','Mes 06','OBJ-6','Redacción de la guía de configuración de criterios Choquet y pesos por puesto.','Ingeniero IA / ML','Ambigüedad','Amenaza',3,3],
  ['SE-6.4.3','E6','Mes 06','OBJ-6','Redacción de la guía de gestión de cuentas de usuario y asignación de roles.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.4.4','E6','Mes 06','OBJ-6','Redacción de la guía de gestión del banco de preguntas y tipos de pregunta.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.5.1','E6','Mes 06','OBJ-6','Inclusión de capturas de pantalla y casos prácticos en el manual del Reclutador.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.5.2','E6','Mes 06','OBJ-6','Redacción de la guía de asignación de entrevistas y generación de enlaces.','Desarrollador Frontend','Complejidad','Amenaza',4,3],
  ['SE-6.5.3','E6','Mes 06','OBJ-6','Redacción de la guía de creación y gestión de puestos de trabajo.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.5.4','E6','Mes 06','OBJ-6','Redacción de la guía de revisión del historial de conversaciones y alertas NLP.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-6.5.5','E6','Mes 06','OBJ-6','Redacción de la guía de uso del dashboard: ranking, filtros y visualización.','Product Owner','Ambigüedad','Amenaza',3,3],
  ['SE-6.6.1','E6','Mes 06','OBJ-6','Diseño del programa de capacitación: contenido, duración y metodología.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,4],
  ['SE-6.6.2','E6','Mes 06','OBJ-6','Ejecución de la sesión de capacitación presencial con el equipo de RR.HH.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-6.6.3','E6','Mes 06','OBJ-6','Evaluación de la capacitación y resolución de dudas del equipo.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,4],
  ['SE-6.6.4','E6','Mes 06','OBJ-6','Preparación del material de capacitación: presentación y ejercicios prácticos.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-6.6.5','E6','Mes 06','OBJ-6','Registro de asistencia y firma de conformidad de los capacitados.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  // E7 · Mes 07
  ['SE-7.1.1','E7','Mes 07','OBJ-7','Documentación de buenas prácticas y riesgos materializados durante el proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,5],
  ['SE-7.1.2','E7','Mes 07','OBJ-7','Redacción del informe de lecciones aprendidas para futuros proyectos similares.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-7.1.3','E7','Mes 07','OBJ-7','Taller de lecciones aprendidas con el cliente (Gerencia y RR.HH. de Madame Crepe).','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-7.1.4','E7','Mes 07','OBJ-7','Taller de lecciones aprendidas con el equipo técnico del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-7.2.1','E7','Mes 07','OBJ-7','Redacción de recomendaciones para calibración del motor Choquet con datos reales.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
  ['SE-7.2.2','E7','Mes 07','OBJ-7','Redacción de recomendaciones para expansión del NLP con análisis de voz (speech-to-text).','Ingeniero IA / ML','Incertidumbre','Amenaza',3,3],
  ['SE-7.2.3','E7','Mes 07','OBJ-7','Redacción de recomendaciones para incorporar módulo de auditoría de sesgos algorítmicos.','Oficial de IA / AI Officer','Incertidumbre','Amenaza',3,3],
  ['SE-7.2.4','E7','Mes 07','OBJ-7','Redacción del protocolo de transferencia tecnológica para otras MYPES del sector.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-7.3.1','E7','Mes 07','OBJ-7','Firma del Acta de Cierre por todas las partes: equipo técnico y cliente.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-7.3.2','E7','Mes 07','OBJ-7','Redacción formal del Acta de Cierre y Conformidad del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-7.3.3','E7','Mes 07','OBJ-7','Reunión formal de cierre con la Gerencia y RR.HH. de Madame Crepe.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,5],
  ['SE-7.3.4','E7','Mes 07','OBJ-7','Revisión del acta con el equipo técnico y el asesor del proyecto.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-7.4.1','E7','Mes 07','OBJ-7','Revisión del cumplimiento de los 7 entregables contra el Acta de Constitución.','Director/a del Proyecto (PM)','Ambigüedad','Amenaza',3,3],
  ['SE-7.4.2','E7','Mes 07','OBJ-7','Validación final del sistema en producción por el equipo de RR.HH. de Madame Crepe.','Director/a del Proyecto (PM)','Incertidumbre','Amenaza',3,2],
  ['SE-7.4.3','E7','Mes 07','OBJ-7','Verificación del cumplimiento de los 4 objetivos específicos con evidencias documentadas.','Ingeniero IA / ML','Incertidumbre','Amenaza',3,5],
];

// ── ACTIVITY → RESOURCE mapping ─────────────────────────────────────────
// Parseado de G1-Recursos_por_Actividad_PMBOK8.xlsx columna 7 (RRHH) + 8 (Físicos Tec) + 9 (Físicos Mat) + 10 (Virtuales)
// Solo incluimos las primeras menciones por actividad para no inflar la tabla

// Map nombre → código de recurso
const RES_MAP = {
  'Director/a del Proyecto (PM)': 'RR01', 'Product Owner': 'RR02', 'Scrum Master': 'RR03',
  'Líder Técnico / Arquitecto de Software': 'RR04', 'Líder Técnico / Arquitecto': 'RR04',
  'Desarrollador Frontend': 'RR05', 'Desarrollador Backend': 'RR06',
  'Ingeniero IA / ML': 'RR07', 'QA / Tester': 'RR08', 'Diseñador UX/UI': 'RR09',
  'Oficial de IA / AI Officer': 'RR10', 'Comité de Gobierno de Datos': 'RR11',
  'Área Legal y Contratos': 'RR12', 'Área Financiera / Contabilidad': 'RR13',
  'Jefe/a de RR.HH. Madame Crepe': 'RR14', 'Reclutadores Madame Crepe': 'RR15',
  'Gerencia General Madame Crepe': 'RR16', 'Asesor Técnico (USAT)': 'RR17',
  'Laptop 16 GB RAM / SSD 512 GB': 'FT01', 'Monitor externo 27"': 'FT02',
  'Celular corporativo': 'FT03', 'Teclado - Compartido': 'FT04', 'Mouse': 'FT05',
  'Audífonos con micrófono': 'FT06', 'Cámara web HD': 'FT07', 'Impresora multifuncional': 'FT08',
  'Servidor físico on-premise (backup)': 'FT09', 'Disco NAS / Storage': 'FT10',
  'Oficina / Espacio de coworking': 'FM01', 'Mobiliario (escritorios, sillas)': 'FM02',
  'Sala de reuniones': 'FM03', 'Material de oficina (papel, tóner)': 'FM04',
  'Café / Refrigerio para talleres': 'FM05', 'Materiales de capacitación': 'FM06',
  'EPP (covid, seguridad)': 'FM07', 'Licencia física / Documentos notariales': 'FM08',
  'Licencia Visual Studio Code (OSS)': 'VT01', 'Licencia PyCharm Professional': 'VT02',
  'GitHub Enterprise (5 usuarios)': 'VT03', 'Docker Desktop (OSS)': 'VT04',
  'AWS EC2 t3.medium (Desarrollo)': 'VT05', 'AWS EC2 t3.large (Staging)': 'VT06',
  'AWS EC2 t3.large HA (Producción)': 'VT07', 'AWS RDS PostgreSQL db.t3.medium': 'VT08',
  'AWS ElastiCache Redis': 'VT09', 'Nginx (OSS)': 'VT10', 'Dominio + DNS': 'VT11',
  'Certificado SSL (Lets Encrypt)': 'VT12', 'API Groq / Gemini (tokens)': 'VT13',
  'API OpenAI (fallback)': 'VT14', 'Jira Software': 'VT15', 'Confluence': 'VT16',
  'Figma Professional': 'VT17', 'Postman Pro': 'VT18', 'SonarCloud (SAST)': 'VT19',
  'Snyk (vulnerabilidades)': 'VT20', 'Licencia de Zoom': 'VT21', 'Microsoft Teams': 'VT22',
  'Slack Pro': 'VT23', 'Notion': 'VT24', 'Licencia Ozmap / Whimsical': 'VT25',
  'Licencia Turnitin (USAT)': 'VT26', 'GitHub Actions (CI/CD)': 'VT27', 'OWASP ZAP (DAST)': 'VT28',
};

function parseResourceList(names, type) {
  if (!names || names === '—') return [];
  return names.split('\n').map((n) => n.replace(/^[•]\s*/, '').trim()).filter((n) => {
    const code = RES_MAP[n];
    return code && (type === 'human' ? code.startsWith('RR') : type === 'physical_tech' ? code.startsWith('FT') : type === 'physical_mat' ? code.startsWith('FM') : code.startsWith('VT'));
  });
}

// ── 20 RIESGOS — de G1-gestion_riesgos.xlsx Hoja 06 + 07 ───────────────
const risks = [
  // code, category, P, I, title, description, cause, consequence, owner, strategy
  ['R-01','Interesados',3,3,'Cambio de prioridades del Sponsor',
   'El Sponsor cambia prioridades o requisitos después de firmado el Acta de Constitución.',
   'Comunicación deficiente con el sponsor','Replanificación, retrasos y sobrecostos','Director/a del Proyecto (PM)','Mitigar'],
  ['R-02','Riesgo',4,3,'Estimación insuficiente de horas del PM',
   'Las horas estimadas para el PM son insuficientes vs. la carga real del proyecto.',
   'Estimación sin datos históricos','Sobrecarga del PM, riesgo de calidad','Director/a del Proyecto (PM)','Mitigar'],
  ['R-03','Interesados',4,4,'Criterios de evaluación poco estandarizados',
   'Los criterios de evaluación de candidatos no están estandarizados entre RR.HH. y Gerencia.',
   'Falta de taller de alineamiento','Inconsistencia en preselección','Director/a del Proyecto (PM)','Mitigar'],
  ['R-04','Recursos',3,3,'Baja participación del equipo de RR.HH.',
   'El equipo de RR.HH. no participa activamente en los talleres de Design Thinking.',
   'Carga laboral del cliente','Requisitos incompletos','Director/a del Proyecto (PM)','Mitigar'],
  ['R-05','Riesgo',3,4,'Falta de consenso en arquitectura',
   'El equipo técnico no alcanza consenso sobre la arquitectura de 3 capas.',
   'Diseño sin participación del equipo','Retraso en desarrollo','Líder Técnico / Arquitecto de Software','Mitigar'],
  ['R-06','Riesgo',4,4,'Complejidad del algoritmo Choquet',
   'El algoritmo de Integral de Choquet para el motor de scoring es excesivamente complejo.',
   'Falta de expertise en teoría de conjuntos difusos','Errores en el scoring de candidatos','Ingeniero IA / ML','Mitigar'],
  ['R-07','Riesgo',3,5,'Caída del servicio Groq API',
   'El servicio de Groq API deja de funcionar durante entrevistas en horario laboral.',
   'Dependencia de servicio externo sin SLA','Experiencia negativa del candidato','Ingeniero IA / ML','Mitigar'],
  ['R-08','Riesgo',3,4,'Errores de cálculo del motor de scoring',
   'El motor de scoring produce errores al evaluar criterios nuevos no vistos en entrenamiento.',
   'Datos de entrenamiento insuficientes','Preselección inaccurate','Ingeniero IA / ML','Mitigar'],
  ['R-09','Riesgo',4,3,'Inconsistencias en datos de candidatos',
   'Los CVs de candidatos llegan en formatos no estándar, dificultando el parsing.',
   'Sin validación de formato al subir','Fallas en el proceso de preselección','QA / Tester','Mitigar'],
  ['R-10','Riesgo',3,4,'Cambio de tarifa de la API de IA',
   'Groq o Gemini cambian las tarifas de tokens durante la ejecución del proyecto.',
   'Dependencia de proveedor externo','Sobrecosto operativo','Director/a del Proyecto (PM)','Mitigar'],
  ['R-11','Riesgo',2,5,'Cambio regulatorio sobre uso de IA',
   'Una nueva ley peruana regula el uso de IA en procesos de selección de personal.',
   'Entorno regulatorio cambiante','Paralización del proyecto hasta cumplimiento','Director/a del Proyecto (PM)','Mitigar'],
  ['R-12','Riesgo',3,4,'Vulnerabilidades de seguridad',
   'Las pruebas SAST/DAST (OWASP ZAP, SonarCloud) detectan vulnerabilidades en el código.',
   'Código sin revisión de seguridad','Exposición de datos de candidatos','Desarrollador Backend','Mitigar'],
  ['R-13','Interesados',4,4,'Resistencia al cambio del equipo de RR.HH.',
   'El equipo de RR.HH. se resiste a adoptar el chatbot por temor a perder sus funciones.',
   'Cultura organizacional rígida','Baja adopción del sistema','Director/a del Proyecto (PM)','Mitigar'],
  ['R-14','Riesgo',2,4,'Disponibilidad del chatbot < 99% SLA',
   'El chatbot no alcanza el 99% de disponibilidad SLA comprometida, generando sobrecostos.',
   'Infraestructura sub-dimensionada','Pérdida de confianza del cliente','Líder Técnico / Arquitecto de Software','Mitigar'],
  ['R-15','Recursos',3,3,'Capacitación insuficiente a usuarios finales',
   'Los usuarios finales (Admin, Reclutador, Candidato) no están suficientemente capacitados.',
   'Plan de capacitación deficiente','Errores operativos en producción','Director/a del Proyecto (PM)','Mitigar'],
  ['R-16','Riesgo',3,5,'Sesgos en el modelo NLP',
   'El modelo NLP introduce sesgos que afectan la objetividad de la preselección de candidatos.',
   'Datos de entrenamiento sesgados','Discriminación algorítmica','Oficial de IA / AI Officer','Mitigar'],
  ['R-17','Finanzas',3,3,'Incremento inesperado de costos cloud',
   'Los costos de infraestructura AWS superan lo planificado por mal dimensionamiento.',
   'Estimación incorrecta de uso','Reasignación de presupuesto','Director/a del Proyecto (PM)','Transferir'],
  ['R-18','Interesados',3,4,'Baja tasa de adopción por Gerencia',
   'La Gerencia no adopta el sistema tras la puesta en marcha, manteniendo procesos manuales.',
   'Falta de involucramiento temprano','ROI no alcanzado','Director/a del Proyecto (PM)','Mitigar'],
  ['R-19','Gobernanza',2,4,'Hallazgos de auditoría interna',
   'La auditoría interna detecta hallazgos que pueden retrasar el cierre formal del proyecto.',
   'Procesos no documentados correctamente','Retraso en firma del Acta de Cierre','Director/a del Proyecto (PM)','Escalar'],
  ['R-20','Recursos',4,4,'Oportunidad: Documentar lecciones aprendidas',
   'Oportunidad de documentar lecciones aprendidas para futuros proyectos de IA en la organización.',
   'Voluntad del equipo','Conocimiento organizacional reutilizable','Director/a del Proyecto (PM)','Aceptar'],
];

// ── 20 RISK RESPONSES — de G1-gestion_riesgos.xlsx Hoja 07 ──────────────
const riskResponses = [
  ['R-01','Mitigar (alineación + comunicación)','Taller de alineación con el Sponsor quincenal + comunicación proactiva de cambios.'],
  ['R-02','Mitigar (plan específico)','Revisión semanal de carga del PM y redistribución de tareas si es necesario.'],
  ['R-03','Mitigar (alineación + comunicación)','Taller de alineación de criterios con RR.HH. y Gerencia antes de desarrollo.'],
  ['R-04','Mitigar (capacitación / backup)','Sesiones de Design Thinking registradas + roles backup identificados.'],
  ['R-05','Mitigar (plan específico)','Spike técnico de arquitectura + sesión de revisión con todo el equipo técnico.'],
  ['R-06','Mitigar (plan específico)','Prototipo del algoritmo Choquet + pruebas con datos reales antes de integración.'],
  ['R-07','Mitigar (plan específico)','Fallback a spaCy + OpenAI cuando Groq falle + monitoreo proactivo de SLA.'],
  ['R-08','Mitigar (plan específico)','Datos de entrenamiento ampliados + pruebas de stress con criterios extremos.'],
  ['R-09','Mitigar (plan específico)','Validador de formato de CV + conversión a texto plano antes de procesamiento.'],
  ['R-10','Mitigar (plan específico)','Presupuesto de contingencia del 20% para tokens + negociación de volumen.'],
  ['R-11','Mitigar (plan específico)','Monitoreo legislative continuo + diseño modular para adaptar el motor NLP.'],
  ['R-12','Mitigar (plan específico)','SAST/DAST en CI pipeline + revisión OWASP Top 10 en cada release.'],
  ['R-13','Mitigar (alineación + comunicación)','Talleres de sensibilización + quick wins para demostrar valor del sistema.'],
  ['R-14','Mitigar (plan específico)','Auto-scaling en AWS + SLA contractual con penalidades + monitoring 24/7.'],
  ['R-15','Mitigar (capacitación / backup)','Plan de capacitación estructurado + manuales de usuario + videos prácticos.'],
  ['R-16','Mitigar (plan específico)','Auditoría de sesgos algorítmicos trimestral + dataset diversificado de entrenamiento.'],
  ['R-17','Transferir (contrato / seguro)','Contrato con AWS con topes de gasto + monitoreo de costos mensual.'],
  ['R-18','Mitigar (alineación + comunicación)','Reportes semanales a Gerencia + demo mensuales del ROI del sistema.'],
  ['R-19','Escalar al Sponsor / Comité','Escalar al Sponsor con plan correctivo documentado en 7 días hábiles.'],
  ['R-20','Aceptar / Mejorar','Documentar y explotar: convertir en caso de éxito replicable para futuras propuestas.'],
];

// ── ACTIVITY RESOURCES — muestra del mapping real ─────────────────────────
// Para cada actividad, el primer recurso RRHH + los primeros 2-3 recursos de cada categoría
// Basado en la columna 7-10 de G1-Recursos_por_Actividad_PMBOK8.xlsx Hoja1
const activityResourcesMap = {
  'SE-1.1.1': ['RR07','FT01','FM01','VT26'],
  'SE-1.1.2': ['RR01','RR16','FT01','FM03','VT16','VT24','VT26'],
  'SE-1.1.3': ['RR01','RR04','FT01','FM01','VT16','VT24','VT26'],
  'SE-1.1.4': ['RR01','RR16','FT01','FM01','VT26'],
  'SE-1.2.1': ['RR01','RR11','FT01','FM01','VT15'],
  'SE-1.2.2': ['RR01','RR11','FT01','FM01','VT15'],
  'SE-1.2.3': ['RR01','RR11','FT01','FM01','VT15'],
  'SE-1.3.1': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-1.3.2': ['RR01','RR07','RR06','FT01','FM04','VT16','VT24'],
  'SE-1.3.3': ['RR01','FT01','FM01','VT16','VT24'],
  'SE-1.3.4': ['RR01','RR16','RR14','RR02','RR09','FT01','FM03','FM04','VT21','VT22','VT15'],
  'SE-1.3.5': ['RR01','RR16','FT01','FM03','FM04','VT15'],
  'SE-1.4.1': ['RR01','RR13','FT01','FM01','VT15'],
  'SE-1.4.2': ['RR01','RR14','RR13','FT01','FT02','FT04','FT05','FT06','FT07','FM03','FM04','FM05','FM06','VT01','VT03','VT04','VT05','VT21','VT22'],
  'SE-1.4.3': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-1.5.1': ['RR01','RR16','RR17','FT01','FM08','VT26'],
  'SE-1.5.2': ['RR01','RR16','FT01','FM03','FM04','FM08','VT26'],
  'SE-1.5.3': ['RR01','RR08','RR07','RR14','RR16','RR17','FT01','FM08','VT16','VT24','VT26'],
  'SE-1.5.4': ['RR01','RR16','FT01','FM03','FM04','FM08','VT26'],
  'SE-1.?.1': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-1.?.2': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-1.?.3': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-1.?.4': ['RR01','RR16','RR02','FT01','FM01','VT15'],
  'SE-2.1.1': ['RR01','RR05','RR06','RR07','FT01','FM04','VT16','VT24','VT15'],
  'SE-2.1.2': ['RR02','RR03','FT01','FM01','VT15'],
  'SE-2.1.3': ['RR01','FT01','FM01','VT16','VT24'],
  'SE-2.1.4': ['RR01','RR16','RR15','RR05','RR02','RR09','RR14','FT07','FT06','FM03','FM04','VT21','VT22','VT26'],
  'SE-2.1.5': ['RR01','RR16','RR14','RR15','RR02','RR09','FT07','FT06','FM03','FM04','VT21','VT22','VT15'],
  'SE-2.2.1': ['RR04','RR06','RR10','FT01','FM01','VT15'],
  'SE-2.2.2': ['RR04','RR06','RR10','FT01','FM01','VT15'],
  'SE-2.2.3': ['RR06','RR04','RR10','FT01','FM01','VT02','VT08','VT05','VT19','VT20','VT28'],
  'SE-2.2.4': ['RR01','RR02','FT03','FM01','VT15'],
  'SE-2.2.5': ['RR01','RR16','RR04','RR06','RR10','FT01','FM01','VT15'],
  'SE-2.3.1': ['RR01','RR05','RR06','RR07','RR02','RR09','RR14','FT01','FM01','VT16','VT24','VT15'],
  'SE-2.3.2': ['RR02','RR09','RR14','FT01','FM01','VT15'],
  'SE-2.3.3': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-2.3.4': ['RR08','RR07','RR14','FT01','FM01','VT15'],
  'SE-2.4.1': ['RR07','RR06','FT01','FM01','VT15'],
  'SE-2.4.2': ['RR07','RR06','FT01','FM01','VT15'],
  'SE-2.4.3': ['RR07','RR06','FT01','FM01','VT15'],
  'SE-2.4.4': ['RR01','RR16','RR14','RR15','RR07','RR06','RR02','RR09','FT07','FT06','FM03','FM04','VT21','VT22','VT15'],
  'SE-2.4.5': ['RR01','RR16','RR14','RR07','RR06','FT01','FM01','VT15'],
  'SE-2.5.1': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-2.5.2': ['RR01','FT01','FM04','VT16','VT24'],
  'SE-2.5.3': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-2.6.1': ['RR01','RR16','FT01','FM04','FM08','VT16','VT24'],
  'SE-2.6.2': ['RR01','FT01','FM04','VT16','VT24'],
  'SE-2.6.3': ['RR01','RR16','FT01','FM03','FM04','VT16','VT24'],
  'SE-2.6.4': ['RR01','RR16','FT01','FM03','FM04','VT16','VT24'],
  'SE-3.1.1': ['RR04','RR05','RR06','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT01','VT03','VT04','VT05','VT02','VT08','VT05','VT01','VT17','VT25','VT17'],
  'SE-3.1.2': ['RR04','RR06','FT01','FM01','VT15'],
  'SE-3.1.3': ['RR04','RR05','RR08','RR07','RR14','FT01','FM01','VT25','VT17'],
  'SE-3.1.4': ['RR06','RR04','RR10','FT01','FM01','VT02','VT08','VT05','VT19','VT20','VT28'],
  'SE-3.1.5': ['RR01','RR16','RR04','RR05','FT01','FM03','FM04','VT25','VT17'],
  'SE-3.2.1': ['RR09','RR05','FT01','FM01','VT15'],
  'SE-3.2.2': ['RR01','RR16','RR14','RR09','RR05','FT01','FM01','VT25','VT17','VT15'],
  'SE-3.2.3': ['RR09','RR05','RR06','RR07','FT03','FM01','VT01','VT17','VT25','VT17','VT19'],
  'SE-3.2.4': ['RR09','RR05','RR14','RR06','RR02','FT01','FM01','VT25','VT17'],
  'SE-3.2.5': ['RR09','RR05','RR06','RR07','FT01','FM01','VT25','VT17','VT15'],
  'SE-3.3.1': ['RR06','RR04','FT01','FM01','VT01','VT03','VT04','VT05','VT02','VT15'],
  'SE-3.3.2': ['RR06','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-3.3.3': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT08'],
  'SE-3.3.4': ['RR06','FT01','FM01','VT08'],
  'SE-3.4.1': ['RR07','FT01','FM01','VT04','VT05','VT07','VT08','VT10','VT11','VT12','VT27'],
  'SE-3.4.2': ['RR06','FT01','FM01','VT04','VT05'],
  'SE-3.4.3': ['RR07','FT01','FM01','VT03','VT04','VT27'],
  'SE-3.4.4': ['RR07','FT01','FM01','VT19','VT20','VT28'],
  'SE-3.4.5': ['RR01','FT01','FM01','VT19','VT20','VT28'],
  'SE-3.5.1': ['RR07','FT01','FM01','VT05','VT07','VT08'],
  'SE-3.5.2': ['RR01','FT01','FM01','VT05','VT07'],
  'SE-3.5.3': ['RR05','FT01','FM01','VT12','VT14','VT28'],
  'SE-3.5.4': ['RR05','FT01','FM01','VT12','VT14','VT28'],
  'SE-3.5.5': ['RR01','FT01','FM01','VT19','VT20','VT28'],
  'SE-4.1.1': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT02'],
  'SE-4.1.2': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT02'],
  'SE-4.1.3': ['RR06','RR04','FT01','FM01','VT01','VT03','VT04','VT05','VT02','VT19'],
  'SE-4.1.4': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT02'],
  'SE-4.1.5': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT02'],
  'SE-4.2.1': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT02'],
  'SE-4.2.2': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05','VT02'],
  'SE-4.2.3': ['RR05','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.2.4': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.2.5': ['RR08','FT01','FM01','VT01','VT03','VT04','VT05','VT15'],
  'SE-4.3.1': ['RR06','FT01','FM01','VT13','VT14'],
  'SE-4.3.2': ['RR07','FT01','FM01','VT15'],
  'SE-4.3.3': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.3.4': ['RR07','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.3.5': ['RR07','FT01','FM01','VT14'],
  'SE-4.3.6': ['RR07','FT01','FM01','VT13','VT14'],
  'SE-4.4.1': ['RR05','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.4.2': ['RR06','FT01','FM01','VT01','VT03','VT04','VT05','VT15'],
  'SE-4.4.3': ['RR06','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.4.4': ['RR05','RR06','RR07','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT01','VT03','VT04','VT05','VT01','VT17'],
  'SE-4.4.5': ['RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-4.5.1': ['RR14','RR06','RR02','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.5.2': ['RR06','RR04','RR07','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.5.3': ['RR06','RR04','RR05','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT01','VT03','VT04','VT05','VT01','VT17'],
  'SE-4.5.4': ['RR05','RR09','RR07','RR06','FT01','FM01','VT01','VT17'],
  'SE-4.5.5': ['RR01','RR16','RR14','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15','VT15'],
  'SE-4.6.1': ['RR05','RR09','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT01','VT03','VT04','VT05','VT01','VT17'],
  'SE-4.6.2': ['RR06','RR04','FT01','FM01','VT01','VT03','VT04','VT05'],
  'SE-4.6.3': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-4.6.4': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-4.6.5': ['RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-4.7.1': ['RR05','RR09','RR06','RR07','FT01','FT02','FT04','FT05','FT06','FT07','FT03','FM01','VT01','VT03','VT04','VT05','VT01','VT17','VT19','VT20'],
  'SE-4.7.2': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-4.7.3': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-4.7.4': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-4.7.5': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-4.7.6': ['RR05','RR06','RR07','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15','VT19','VT20'],
  'SE-5.1.1': ['RR05','RR06','RR07','RR08','RR14','FT01','FM01','VT15'],
  'SE-5.1.2': ['RR08','RR07','RR14','FT01','FM01','VT15'],
  'SE-5.1.3': ['RR07','RR06','RR08','RR14','FT01','FM01','VT15'],
  'SE-5.1.4': ['RR01','RR16','FT01','FM04','VT16','VT24'],
  'SE-5.1.5': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-5.2.1': ['RR08','RR01','RR02','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.2.2': ['RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.2.3': ['RR01','RR07','RR06','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15','VT16','VT24'],
  'SE-5.2.4': ['RR01','RR16','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM03','FM04','VT18','VT15'],
  'SE-5.3.1': ['RR05','RR06','RR07','FT01','FM01','VT15'],
  'SE-5.3.2': ['RR01','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FT01','FM04','VT18','VT15','VT16','VT24'],
  'SE-5.3.3': ['RR05','RR06','RR07','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15','VT19','VT20'],
  'SE-5.3.4': ['RR07','RR06','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.3.5': ['RR01','FT01','FM04','VT16','VT24'],
  'SE-5.4.1': ['RR07','RR06','FT01','FM01','VT13'],
  'SE-5.4.2': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-5.4.3': ['RR07','RR06','FT01','FM01','VT15'],
  'SE-5.4.4': ['RR06','RR04','FT01','FM01','VT15'],
  'SE-5.4.5': ['RR07','RR06','FT01','FM01','VT13'],
  'SE-5.4.6': ['RR08','RR06','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.5.1': ['RR01','RR02','FT01','FM01','VT15'],
  'SE-5.5.2': ['RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.5.3': ['RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.5.4': ['RR05','RR07','RR06','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT18','VT15'],
  'SE-5.5.5': ['RR07','RR06','RR08','FT01','FT02','FT04','FT05','FT06','FT07','FM01','VT13','VT18','VT15'],
  'SE-5.5.6': ['RR08','FT01','FM01','VT18','VT15'],
  'SE-6.1.1': ['RR01','RR04','RR06','FT01','FT02','FT04','FT05','FT06','FT07','FT01','FM04','VT01','VT03','VT04','VT05','VT16','VT24'],
  'SE-6.1.2': ['RR01','RR04','RR05','FT01','FM04','VT16','VT24','VT25','VT17'],
  'SE-6.1.3': ['RR01','FT01','FM04','VT16','VT24'],
  'SE-6.1.4': ['RR01','RR04','RR07','RR06','FT01','FM04','VT16','VT24'],
  'SE-6.1.5': ['RR01','RR04','RR07','RR06','FT01','FM04','VT13','VT16','VT24'],
  'SE-6.2.1': ['RR01','RR04','RR06','RR07','FT01','FM01','VT13','VT16','VT24'],
  'SE-6.2.2': ['RR01','FT01','FM01','VT16','VT24'],
  'SE-6.2.3': ['RR01','RR04','RR09','RR02','FT01','FM01','VT16','VT24'],
  'SE-6.3.1': ['RR01','RR05','RR06','RR07','FT01','FM01','VT16','VT24','VT19','VT20'],
  'SE-6.3.2': ['RR01','RR05','RR06','RR07','RR09','RR02','FT01','FM01','VT16','VT24','VT19','VT20'],
  'SE-6.3.3': ['RR01','RR09','RR02','FT01','FM01','VT16','VT24'],
  'SE-6.4.1': ['RR01','FT01','FM04','VT16','VT24'],
  'SE-6.4.2': ['RR01','RR07','RR06','FT01','FM01','VT16','VT24'],
  'SE-6.4.3': ['RR01','FT01','FM01','VT16','VT24'],
  'SE-6.4.4': ['RR01','RR14','RR06','RR02','FT01','FM01','VT16','VT24'],
  'SE-6.5.1': ['RR01','FT01','FM04','VT16','VT24','VT15'],
  'SE-6.5.2': ['RR01','RR05','RR06','RR07','FT01','FM01','VT16','VT24'],
  'SE-6.5.3': ['RR01','RR14','RR06','RR02','FT01','FM01','VT16','VT24'],
  'SE-6.5.4': ['RR01','RR16','RR07','RR06','FT01','FM03','FM04','VT13','VT16','VT24'],
  'SE-6.5.5': ['RR01','RR07','RR06','FT01','FM01','VT16','VT24'],
  'SE-6.6.1': ['RR01','RR14','FT07','FT06','FM03','FM04','FM05','FM06','VT21','VT22'],
  'SE-6.6.2': ['RR05','RR06','RR07','RR01','RR14','FT07','FT06','FM03','FM04','FM05','FM06','FM01','FM02','VT21','VT22','VT15'],
  'SE-6.6.3': ['RR01','RR14','FT07','FT06','FM03','FM04','FM05','FM06','VT21','VT22'],
  'SE-6.6.4': ['RR01','RR16','RR14','FT07','FT06','FM03','FM04','FM05','FM06','VT21','VT22'],
  'SE-6.6.5': ['RR01','RR16','FT01','FM08','VT15'],
  'SE-7.1.1': ['RR01','RR11','FT01','FM04','VT16','VT24'],
  'SE-7.1.2': ['RR01','FT01','FM04','VT16','VT24'],
  'SE-7.1.3': ['RR01','RR16','RR14','RR15','FT07','FT06','FM03','FM04','VT21','VT22','VT15'],
  'SE-7.1.4': ['RR01','RR16','RR15','FT07','FT06','FM03','FM04','VT21','VT22'],
  'SE-7.2.1': ['RR01','RR04','RR07','RR06','FT01','FM01','VT16','VT24'],
  'SE-7.2.2': ['RR01','RR07','RR06','FT01','FM01','VT13','VT16','VT24'],
  'SE-7.2.3': ['RR01','RR04','RR10','FT01','FM01','VT16','VT24'],
  'SE-7.2.4': ['RR01','FT01','FM01','VT16','VT24'],
  'SE-7.3.1': ['RR01','RR16','RR17','FT01','FM08','VT26'],
  'SE-7.3.2': ['RR01','FT01','FM08','VT16','VT24','VT26'],
  'SE-7.3.3': ['RR01','RR16','RR14','FT01','FM03','FM04','VT21','VT22','VT15'],
  'SE-7.3.4': ['RR01','RR16','FT01','FM03','FM04','FM08','VT26'],
  'SE-7.4.1': ['RR01','RR16','RR17','FT01','FM03','FM04','FM08','VT26'],
  'SE-7.4.2': ['RR01','RR16','RR14','RR04','RR06','FT01','FT09','FT10','FM01','VT07','VT10','VT12','VT11','VT15'],
  'SE-7.4.3': ['RR01','FT01','FM04','VT16','VT24'],
};

async function seedMadameCrepe(conn) {
  const projectName = 'Madame Crepe — Sistema Inteligente de Preselección de Personal';

  const [[admin]] = await conn.query('SELECT id FROM users WHERE role="admin" LIMIT 1');
  if (!admin) throw new Error('No hay usuario admin. Ejecuta seed-from-json primero.');
  const adminId = admin.id;

  const projectId = 'proj_madame_crepe';
  const ctxId = 'ctx_madame_crepe';
  const nowStr = now();

  // ── Limpiar TODOS los datos existentes en la base (evita ER_RECORD_FILE_FULL en Railway) ─
  const tablesToClean = [
    'audit_log', 
    'risk_responses', 
    'activity_resources', 
    'risks', 
    'activities', 
    'resources', 
    'stakeholders', 
    'sprints', 
    'contexts', 
    'sessions', 
    'projects'
  ];
  for (const tbl of tablesToClean) {
    try {
      await conn.query(`DELETE FROM \`${tbl}\``);
    } catch (e) {
      console.warn(`  (Aviso al limpiar ${tbl}: ${e.message})`);
    }
  }
  console.log('  (Base de datos limpiada a nivel global para liberar espacio)');

  // Proyecto
  await conn.query(
    `REPLACE INTO projects (id,name,description,type,owner,startDate,endDate,objective,scope,status,createdBy,createdAt,updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [projectId, projectName,
     'Sistema inteligente de preselección de personal con chatbot conversacional y motor de scoring Choquet.',
     'Proyecto web','Director/a del Proyecto (PM)',
     '2026-01-01','2026-08-31',
     'Desarrollar e implementar un sistema de gestión de proyectos con ISO 31000, PMBOK 8, Scrum y MAGERIT/NIST.',
     'Módulo de stakeholders, módulo de actividades y recursos, módulo de riesgos, dashboard de seguimiento.',
     'En ejecucion', adminId, nowStr, nowStr],
  );
  console.log('  + proyecto insertado');

  // Context
  await conn.query(
    `REPLACE INTO contexts (id,projectId,internalContext,externalContext,criticalObjectives,riskCriteria,assets,affectedProcesses,stakeholders,legalFactors,technologicalFactors,organizationalFactors,createdBy,createdAt,updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [ctxId, projectId,
     'Equipo Scrum de 6 personas. Metodologia agil con sprints de 2 semanas. Motor NLP con Groq API + fallback spaCy.',
     'Dependencia de proveedores cloud AWS/Groq. Regulaciones de proteccion de datos (LGPD/LPDP peruana).',
     'Desarrollar e implementar el sistema de preseleccion en 8 meses dentro del presupuesto.',
     'Seguridad y privacidad = apetito BAJO. Disponibilidad = apetito MODERADO. Cumplimiento normativo = apetito BAJO.',
     'Codigo fuente, base de datos, modelos ML, dokumentacion PMBOK 8.',
     'Reclutamiento manual, filtrado de CVs, entrevistas telefonicas.',
     'Gerencia General, RRHH, Reclutadores, Equipo tecnico del proyecto.',
     'LGPD/LPDP peruana, normativa SUNAT para MYPES.',
     'AWS EC2/RDS, Groq API, spaCy, FastAPI, React.',
     'Madame Crepe - microempresa de gastronomía con 15 empleados.',
     adminId, nowStr, nowStr],
  );
  console.log('  + context insertado');

  // Sprints
  for (const [snum, name, goal, start, end] of [
    ['s_mc1','Sprint 1 — Fundación','Acta de Constitución, registro de stakeholders, EDT, cronograma base','2026-01-01','2026-01-31'],
    ['s_mc2','Sprint 2 — Diagnóstico','Documento de requisitos, modelo de criterios Choquet, backlog priorizado','2026-02-01','2026-02-28'],
    ['s_mc3','Sprint 3 — Arquitectura','Arquitectura 3 capas, wireframes, infraestructura AWS dev','2026-03-01','2026-03-31'],
    ['s_mc4','Sprint 4 — Desarrollo Core','Autenticación, chatbot, motor Choquet, módulo de puestos','2026-04-01','2026-04-30'],
    ['s_mc5','Sprint 5 — Testing','Pruebas integrales, prueba piloto con candidatos, caja blanca','2026-05-01','2026-05-31'],
    ['s_mc6','Sprint 6 — Documentación','Manuales de usuario, capacitación, guías técnicas','2026-06-01','2026-07-15'],
    ['s_mc7','Sprint 7 — Go-Live','Lecciones aprendidas, cierre formal, validación en producción','2026-07-16','2026-08-31'],
  ]) {
    await conn.query(
      `REPLACE INTO sprints (id,projectId,name,goal,startDate,endDate,createdBy,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [snum, projectId, name, goal, start, end, adminId, nowStr, nowStr],
    );
  }
  console.log('  + 7 sprints insertados');

  // ── STAKEHOLDERS ──────────────────────────────────────────────────────
  for (const [code,name,type,ring,power,influence,interest,ca,cd,strategy,quadrant,action] of stakeholders) {
    const id = 'stkh_' + code.toLowerCase();
    await conn.query(
      `REPLACE INTO stakeholders (id,projectId,code,name,type,ring,power,influence,interest,commitment_actual,commitment_desired,strategy_mendelow,quadrant_inf_pow,action,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, projectId, code, name, type, ring, power, influence, interest, ca, cd, strategy, quadrant, action, nowStr, nowStr],
    );
  }
  console.log('  + 18 stakeholders insertados');

  // ── RESOURCES ─────────────────────────────────────────────────────────
  const resIdByCode = {};
  for (const [code,category,name,desc] of resources) {
    const id = 'res_' + code.toLowerCase();
    resIdByCode[code] = id;
    await conn.query(
      `REPLACE INTO resources (id,projectId,code,category,name,description,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, projectId, code, category, name, desc, nowStr, nowStr],
    );
  }
  console.log('  + 63 resources insertados');

  // ── ACTIVITIES ────────────────────────────────────────────────────────
  const actIdByCode = {};
  for (const [code,deliverable,month,objective,name,role,domain_pmbok,uncertainty_type,probability,impact] of activities_raw) {
    const id = 'act_' + code.toLowerCase().replace(/\./g,'_').replace(/[^a-zA-Z0-9]/g,'_');
    const level = probability * impact;
    const classification = level >= 15 ? 'Crítico' : level >= 10 ? 'Alto' : level >= 5 ? 'Medio' : 'Bajo';
    actIdByCode[code] = id;
    await conn.query(
      `REPLACE INTO activities (id,projectId,code,deliverable,month,objective,name,role_main,domain_pmbok,uncertainty_type,risk_type,probability,impact,level,classification,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, projectId, code, deliverable, month, objective, name, role, domain_pmbok, uncertainty_type, uncertainty_type, probability, impact, level, classification, nowStr, nowStr],
    );
  }
  console.log('  + ' + activities_raw.length + ' activities insertadas');

  // ── ACTIVITY_RESOURCES (Bulk Insert Optimization) ───────────────────
  const arValues = [];
  for (const [actCode, resCodes] of Object.entries(activityResourcesMap)) {
    const actId = actIdByCode[actCode];
    if (!actId) continue;
    const uniqueCodes = [...new Set(resCodes)];
    for (const resCode of uniqueCodes) {
      const resId = resIdByCode[resCode];
      if (!resId) continue;
      const typeMap = { 'RR':'human', 'FT':'physical_tech', 'FM':'physical_mat', 'VT':'virtual' };
      const rt = typeMap[resCode.substring(0,2)] || 'virtual';
      const arId = 'ar_' + actId.replace('act_', '') + '_' + resId.replace('res_', '');
      arValues.push([arId, actId, resId, rt, nowStr]);
    }
  }

  if (arValues.length > 0) {
    await conn.query(
      `INSERT IGNORE INTO activity_resources (id,activityId,resourceId,resource_type,createdAt) VALUES ?`,
      [arValues],
    );
  }
  console.log('  + ' + arValues.length + ' activity_resources insertadas');

  // ── RISKS (Enlazados a sprints y con datos de exposición financiera) ──
  const riskIdByCode = {};
  for (const [code,category,probability,impact,title,description,cause,consequence,owner,strategy] of risks) {
    const id = 'risk_' + code.toLowerCase().replace('-','_');
    const level = probability * impact;
    const classification = level >= 15 ? 'Crítico' : level >= 10 ? 'Alto' : level >= 5 ? 'Medio' : 'Bajo';
    riskIdByCode[code] = id;
    const today = new Date().toISOString().slice(0,10);
    
    // Distribuir riesgos de forma secuencial en los Sprints 1 a 5
    const riskNum = parseInt(code.replace('R-', ''), 10);
    let sprintId = null;
    if (riskNum <= 4) sprintId = 's_mc1';
    else if (riskNum <= 8) sprintId = 's_mc2';
    else if (riskNum <= 12) sprintId = 's_mc3';
    else if (riskNum <= 16) sprintId = 's_mc4';
    else if (riskNum <= 20) sprintId = 's_mc5';

    // Determinar estrategia y plan de respuesta detallado
    const rAction = riskResponses.find(([c]) => c === code)?.[2] || 'Plan de respuesta en proceso de definición.';
    const exposure = level * 1800; // Exposición financiera (ej. 16 * 1800 = S/.28,800)
    const domainPmbok = category === 'Interesados' ? 'Interesados' : 'Incertidumbre';

    await conn.query(
      `REPLACE INTO risks (id,code,projectId,title,description,category,cause,consequence,probability,impact,level,classification,owner,sprintId,status,identifiedAt,alertIndicator,responseStrategy,treatmentAction,reviewDate,evidence,expectedResult,observations,createdBy,createdAt,updatedAt,domain_pmbok,process_pmbok,risk_type,exposure_soles,response_plan,response_status,response_deadline)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, code, projectId, title, description, category, cause, consequence,
       probability, impact, level, classification, owner, sprintId, 'Identificado', today, null, strategy,
       rAction, null, '', '', '', adminId, nowStr, nowStr,
       domainPmbok, null, 'Amenaza', exposure, rAction, 'Abierto', 30],
    );
  }
  console.log('  + ' + risks.length + ' riesgos insertados');

  // ── RISK_RESPONSES ────────────────────────────────────────────────────
  for (const [code,strategy,action] of riskResponses) {
    if (!riskIdByCode[code]) continue;
    const id = 'rr_' + code.toLowerCase().replace('-','_');
    await conn.query(
      `REPLACE INTO risk_responses (id,riskId,projectId,action,deadline_days,status,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, riskIdByCode[code], projectId, action, 30, 'Abierto', nowStr, nowStr],
    );
  }
  console.log('  + ' + riskResponses.length + ' risk_responses insertadas');

  // ── AUDIT LOG INITIAL SEED ────────────────────────────────────────────
  await conn.query(
    `INSERT IGNORE INTO audit_log (userId, action, entityType, entityId, meta, ip, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [adminId, 'create_project', 'project', projectId, JSON.stringify({ name: projectName }), '127.0.0.1', nowStr]
  );
  console.log('  + 1 audit_log insertado');
}

async function main() {
  const conn = await getConn();
  console.log('→ Seed Madame Crepe conectando a', DB);
  try {
    await seedMadameCrepe(conn);
    console.log('✔ Seed Madame Crepe completo.');
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error('✘ Error:', e.code || e.message);
  process.exit(1);
});
