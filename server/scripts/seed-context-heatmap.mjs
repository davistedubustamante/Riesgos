import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [[admin]] = await conn.query('SELECT id FROM users WHERE role="admin" LIMIT 1');
  if (!admin) { console.error('No admin'); return; }
  const adminId = admin.id;
  const projectId = 'proj_madame_crepe';

  // ── 1. CONTEXT ─────────────────────────────────────────────────────────────
  const contextData = {
    internalContext: `Equipo de desarrollo Scrum de 6 personas: 1 Product Owner, 1 Scrum Master, 4 Desarrolladores full-stack. Metodología ágil con sprints de 2 semanas. Experiencia moderada en proyectos de IA conversacional. Cultura organizacional orientada a entregas rápidas con baja documentación técnica.`,
    externalContext: `Sector HR Tech altamente competitivo en Latinoamérica. Proveedores críticos de IA (Groq API, OpenAI) con dependencia de servicios cloud AWS. Regulaciones de protección de datos (LGPD/LPDP peruana). Mercado laboral volátil con alta rotación de perfiles técnicos especializados.`,
    organizationalFactors: `Patrocinio activo por parte de la dirección general. Estructura jerárquica plana con toma de decisiones ágil. Budget aprobado de 45K USD con límite inflexible. Apetito moderado al riesgo de innovación tecnológica.`,
    criticalObjectives: `1. Lanzamiento MVP estable en máximo 8 meses.\n2. Latencia del chatbot inferior a 250ms en respuestas estándar.\n3. Presupuesto total de desarrollo menor a 45K USD.\n4. Tasa de precisión del motor de scoring superior al 80%.\n5. Integración con al menos 3 plataformas de empleo.`,
    riskCriteria: `Nivel Bajo (1-4): Aceptar automáticamente sin plan de contingencia.\nNivel Medio (5-9): Requiere plan de contingencia documentado por el PM.\nNivel Alto (10-14): Requiere estrategia de mitigación activa antes del sprint.\nNivel Crítico (15-25): Bloquea el sprint inmediatamente — requiere escalamiento a dirección.`,
    legalFactors: `Ley de Protección de Datos Personales (Perú). Términos de servicio de APIs de IA (OpenAI, Groq). Licencias OSS de librerías utilizadas (MIT, Apache 2.0). Ética en decisiones automatizadas de preselección de candidatos (sesgo algorítmico).`,
    assets: `Código fuente del chatbot y motor de scoring,Credenciales de base de datos de producción en AWS,Base de datos de candidatos con información personal sensible,API Keys de Groq y OpenAI,Infraestructura AWS EC2 y S3,Documentación técnica y manuales de usuario`,
    affectedProcesses: `Registro e inicio de sesión de postulantes,Recepción e interpretación automática de currículums (NLP),Envío de notificaciones a reclutadores por email/API,Proceso de CI/CD con deployment automático a producción,Evaluación automatizada de candidatos mediante scoring`,
    stakeholders: `Dirección General (Sponsor),Equipo de RRHH (Cliente principal),Equipo de Ingeniería de Software,Proveedor externo de IA (Groq),Postulantes externos (usuarios finales),Administrador de infraestructura AWS,Equipo legal/compliance`,
    technologicalFactors: `Alojamiento en AWS EC2 con Auto-Scaling,API de Groq para inferencia LLM con fallback a OpenAI,Framework React + Node.js + MySQL 8,spaCy como motor NLP fallback local,Docker para containerización,GitHub Actions para CI/CD`
  };

  await conn.query('DELETE FROM contexts WHERE projectId=?', [projectId]);
  await conn.query(
    `INSERT INTO contexts (id,projectId,internalContext,externalContext,criticalObjectives,riskCriteria,assets,affectedProcesses,stakeholders,legalFactors,technologicalFactors,organizationalFactors,createdBy,createdAt,updatedAt)
     VALUES ('ctx_mc',?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [projectId,
     contextData.internalContext, contextData.externalContext, contextData.criticalObjectives,
     contextData.riskCriteria, contextData.assets, contextData.affectedProcesses,
     contextData.stakeholders, contextData.legalFactors, contextData.technologicalFactors,
     contextData.organizationalFactors, adminId]
  );
  console.log('✓ contexts (rich data)');

  // ── 2. SPRINTS (already have 7, ensure dates) ──────────────────────────────
  // Verify sprintIds for use in risks
  const [sprints] = await conn.query('SELECT id FROM sprints WHERE projectId=?', [projectId]);
  const sprintIds = sprints.map(s => s.id);
  console.log('✓ sprints found:', sprintIds.length);

  // ── 3. STAKEHOLDERS (already have 18) ────────────────────────────────────
  const [stkh] = await conn.query('SELECT COUNT(*) as c FROM stakeholders WHERE projectId=?', [projectId]);
  console.log('✓ stakeholders:', stkh[0].c);

  // ── 4. RESOURCES (already have 63) ────────────────────────────────────────
  const [res] = await conn.query('SELECT COUNT(*) as c FROM resources WHERE projectId=?', [projectId]);
  console.log('✓ resources:', res[0].c);

  // ── 5. ACTIVITIES (already have 176) ──────────────────────────────────────
  const [act] = await conn.query('SELECT COUNT(*) as c FROM activities WHERE projectId=?', [projectId]);
  console.log('✓ activities:', act[0].c);

  // ── 6. RISKS — overwrite with richer data (40 risks, spread P/I) ───────
  await conn.query('DELETE FROM risks WHERE projectId=?', [projectId]);
  await conn.query('DELETE FROM risk_responses WHERE projectId=?', [projectId]);

  const categories = ['Tecnologico', 'Externo', 'Organizacional', 'De scheduling', 'Financiero', 'Legal/Compliance', 'Operacional'];
  const statuses = ['Identificado', 'En tratamiento', 'Mitigado', 'Cerrado'];
  const owners = ['Product Owner', 'Scrum Master', 'Developers', 'RRHH', 'Infraestructura', 'Dirección'];
  const strategies = ['Mitigar', 'Transferir', 'Evitar', 'Aceptar'];
  const riskTypes = ['Amenaza', 'Amenaza', 'Amenaza', 'Oportunidad']; // mostly threats

  // Wide spread of probability/impact to fill the 5x5 matrix
  const riskTemplates = [
    // P1 (low prob)
    {p:1,i:1,t:'Fallo menor en logs de API',cat:'Tecnologico',st:'Mitigado'},
    {p:1,i:3,t:'Retraso en entrega de datasets de entrenamiento',cat:'Externo',st:'Cerrado'},
    {p:1,i:4,t:'Obsolescencia de librería NLP sin soporte LTS',cat:'Tecnologico',st:'Identificado'},
    // P2
    {p:2,i:1,t:'Pequeña fuga de datos de test en QA',cat:'Tecnologico',st:'Mitigado'},
    {p:2,i:2,t:'Cambios menores en UI detected por stakeholders',cat:'Organizacional',st:'Mitigado'},
    {p:2,i:3,t:'Latencia elevada en respuestas del chatbot',cat:'Tecnologico',st:'En tratamiento'},
    {p:2,i:4,t:'Cambio de regulación en protección de datos',cat:'Legal/Compliance',st:'Identificado'},
    {p:2,i:5,t:'Ataque de denegación de servicio menor',cat:'Externo',st:'Identificado'},
    // P3 (medium prob)
    {p:3,i:2,t:'Rotación de un desarrollador del equipo',cat:'Organizacional',st:'Mitigado'},
    {p:3,i:3,t:'Depreciación de modelo LLM utilizado sin aviso',cat:'Tecnologico',st:'En tratamiento'},
    {p:3,i:4,t:'Proveedor de IA altera pricing unilateralmente',cat:'Externo',st:'Identificado'},
    {p:3,i:5,t:'Brecha de seguridad con exfiltración de CVs',cat:'Tecnologico',st:'Identificado'},
    // P4
    {p:4,i:2,t:'Sprint no completado por sobrecarga del equipo',cat:'De scheduling',st:'Mitigado'},
    {p:4,i:3,t:'Infraestructura AWS supera presupuesto mensual',cat:'Financiero',st:'En tratamiento'},
    {p:4,i:4,t:'Fallo en pipeline CI/CD detiene deployments',cat:'Tecnologico',st:'En tratamiento'},
    {p:4,i:5,t:'Pérdida de datos de candidatos por error humano',cat:'Operacional',st:'Identificado'},
    // P5 (high prob)
    {p:5,i:1,t:'Pequeños bugs en interfaz de usuario',cat:'Tecnologico',st:'Mitigado'},
    {p:5,i:2,t:'Retraso en revisiones de código por falta de tiempo',cat:'De scheduling',st:'Mitigado'},
    {p:5,i:3,t:'Incumplimiento de deadline por sprint overload',cat:'De scheduling',st:'En tratamiento'},
    {p:5,i:4,t:'Deserción de cliente principal por insatisfacción',cat:'Externo',st:'Identificado'},
    {p:5,i:5,t:'Shutdown del proveedor de IA sin alternativa',cat:'Externo',st:'Identificado'},
    // Additional variety
    {p:1,i:2,t:'Documentación técnica desactualizada',cat:'Operacional',st:'Mitigado'},
    {p:1,i:5,t:'Sanciones regulatorias por mal uso de datos',cat:'Legal/Compliance',st:'Identificado'},
    {p:2,i:5,t:'Ransomware en servidores de producción',cat:'Tecnologico',st:'Identificado'},
    {p:3,i:1,t:'Error en test unitarios que pasa desapercibido',cat:'Tecnologico',st:'Mitigado'},
    {p:3,i:5,t:'Demanda laboral por discriminación algorítmica',cat:'Legal/Compliance',st:'Identificado'},
    {p:4,i:1,t:'Malentendidos en requisitos por falta de comunicación',cat:'Organizacional',st:'Mitigado'},
    {p:4,i:4,t:'Pérdida de clave API por compromiso de cuenta',cat:'Tecnologico',st:'En tratamiento'},
    {p:5,i:3,t:'Desbordamiento de backlog por requisitos cambiantes',cat:'Organizacional',st:'En tratamiento'},
    {p:5,i:4,t:'Hackeo de base de datos de candidatos',cat:'Tecnologico',st:'Identificado'},
    // Fill remaining cells to have 2-3 risks per cell
    {p:1,i:3,t:'Bug en parser de CV en formato no estándar',cat:'Tecnologico',st:'Mitigado'},
    {p:2,i:2,t:'Retraso en code review mayor a 48h',cat:'De scheduling',st:'Mitigado'},
    {p:2,i:4,t:'Cambio de dirección estratégica del cliente',cat:'Organizacional',st:'Identificado'},
    {p:3,i:2,t:'Dependencias con vulnerabilidades CVEs conocidas',cat:'Tecnologico',st:'En tratamiento'},
    {p:3,i:3,t:'Estimación de esfuerzo incorrecta en sprint planning',cat:'De scheduling',st:'Mitigado'},
    {p:3,i:4,t:'Filtración de datos de candidatos a terceros sin consentimiento',cat:'Legal/Compliance',st:'Identificado'},
    {p:4,i:2,t:'Retraso en entrega de ambiente de staging',cat:'Operacional',st:'Mitigado'},
    {p:4,i:3,t:'Integración con plataforma de empleo falla intermitentemente',cat:'Tecnologico',st:'En tratamiento'},
    {p:4,i:4,t:'Crisis de reputación en redes por fallo del chatbot',cat:'Externo',st:'Identificado'},
    {p:5,i:1,t:'Typo en mensajes automatizados del bot',cat:'Operacional',st:'Mitigado'},
    {p:5,i:2,t:'Acumulación de deuda técnica en módulo de scoring',cat:'Tecnologico',st:'En tratamiento'},
    {p:5,i:4,t:'Salida de personal clave sin plan de reemplazo',cat:'Organizacional',st:'Identificado'},
  ];

  const today = new Date().toISOString().slice(0,10);
  const levelMap = (p,i) => p*i;

  for (let i = 0; i < riskTemplates.length; i++) {
    const t = riskTemplates[i];
    const lvl = levelMap(t.p, t.i);
    const classif = lvl >= 15 ? 'Crítico' : lvl >= 10 ? 'Alto' : lvl >= 5 ? 'Medio' : 'Bajo';
    const rid = `risk_mc${i+1}`;
    const sprintId = sprintIds[i % sprintIds.length];
    const owner = owners[i % owners.length];
    const strategy = strategies[i % strategies.length];
    const riskType = riskTypes[i % riskTypes.length];

    await conn.query(
      `INSERT INTO risks (id,code,projectId,title,description,category,cause,consequence,probability,impact,level,classification,owner,sprintId,status,identifiedAt,alertIndicator,responseStrategy,risk_type,createdBy,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [rid, `R${i+1}`, projectId,
       t.t, `Descripción detallada del riesgo: ${t.t}. Afecta directamente al proceso de preselección automatizada de candidatos para el cliente.`,
       t.cat,
       `Causes raiz: cambio de requisitos, dependencia de terceros, falta de recursos especializados, complejidad técnica no anticipada.`,
       `Consecuencia potencial: impacto en calidad del delivery, sobrecarga del equipo, incumplimiento de SLA con el cliente, riesgo reputacional.`,
       t.p, t.i, lvl, classif, owner, sprintId, t.st,
       today,
       lvl >= 15 ? 'ALERT' : lvl >= 10 ? 'WARNING' : 'INFO',
       strategy, riskType, adminId]
    );

    // Risk response for each risk
    const rrId = `rr_mc${i+1}`;
    const rrStatus = t.st === 'Mitigado' || t.st === 'Cerrado' ? 'Completada' : 'En curso';
    const actionTemplates = [
      `Implementar monitoring con alertas proactivas en ${t.p >= 3 ? 'alta' : 'media'} prioridad.`,
      `Documentar y revisar proceso de fallback con equipo de infraestructura.`,
      `Establecer SLA con proveedor de IA y evaluar proveedores alternativos.`,
      `Ejecutar plan de contingencia: switch a modelo open-source como backup.`,
      `Capacitar al equipo en procedimientos de respuesta a incidentes.`,
    ];
    const rrAction = actionTemplates[i % actionTemplates.length];
    await conn.query(
      `INSERT INTO risk_responses (id,riskId,projectId,action,deadline_days,status,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,NOW(),NOW())`,
      [rrId, rid, projectId, rrAction, 30 - (i % 3) * 10, rrStatus]
    );
  }
  console.log('✓ risks:', riskTemplates.length, '| risk_responses:', riskTemplates.length);

  // Summary
  const [[rc]] = await conn.query('SELECT COUNT(*) as c FROM risks WHERE projectId=?', [projectId]);
  const [[rrc]] = await conn.query('SELECT COUNT(*) as c FROM risk_responses WHERE projectId=?', [projectId]);
  console.log('\n✅ Seed completo!');
  console.log('  Risks:', rc.c);
  console.log('  Risk responses:', rrc.c);

  await conn.end();
}

main().catch(e => { console.error('✘', e.message); process.exit(1); });
