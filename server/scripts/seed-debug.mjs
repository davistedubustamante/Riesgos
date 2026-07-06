import 'dotenv/config';
import mysql from 'mysql2/promise';

const CFG = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'riesgos_db',
};

async function main() {
  const conn = await mysql.createConnection(CFG);
  try {
    const [[admin]] = await conn.query('SELECT id FROM users WHERE role="admin" LIMIT 1');
    if (!admin) { console.error('No admin'); return; }
    const adminId = admin.id;
    const projectId = 'proj_madame_crepe';

    // Step 1: projects
    await conn.query(`DELETE FROM projects WHERE id=?`, [projectId]);
    await conn.query(`INSERT INTO projects (id,name,description,type,owner,startDate,endDate,status,createdBy,createdAt,updatedAt)
      VALUES (?,'Madame Crepe','Desc','web','PM',NOW(),DATE_ADD(NOW(),INTERVAL 6 MONTH),'active',?,NOW(),NOW())`,
      [projectId, adminId]);
    console.log('✓ projects OK');

    // Step 2: contexts
    await conn.query(`DELETE FROM contexts WHERE projectId=?`, [projectId]);
    await conn.query(`INSERT INTO contexts (id,projectId,internalContext,createdBy,createdAt,updatedAt)
      VALUES ('ctx_mc',?,'',?,NOW(),NOW())`, [projectId, adminId]);
    console.log('✓ contexts OK');

    // Step 3: sprints
    await conn.query(`DELETE FROM sprints WHERE projectId=?`, [projectId]);
    for (let i = 1; i <= 7; i++) {
      await conn.query(`INSERT INTO sprints (id,projectId,name,startDate,endDate,createdBy,createdAt,updatedAt)
        VALUES (?,?,'Sprint ${i}',DATE_ADD(NOW(),INTERVAL ${(i-1)*2} WEEK),DATE_ADD(NOW(),INTERVAL ${i*2} WEEK),?,NOW(),NOW())`,
        [`s_mc${i}`, projectId, adminId]);
    }
    console.log('✓ sprints OK');

    // Step 4: stakeholders
    await conn.query(`DELETE FROM stakeholders WHERE projectId=?`, [projectId]);
    for (let i = 1; i <= 18; i++) {
      const ring = i <= 10 ? 'interno' : 'externo';
      await conn.query(`INSERT INTO stakeholders (id,projectId,code,name,type,ring,power,influence,interest,createdAt,updatedAt)
        VALUES (?,?,'S${i}','Stakeholder ${i}','${ring}','${ring}',3,3,3,NOW(),NOW())`,
        [`stkh_mc${i}`, projectId]);
    }
    console.log('✓ stakeholders OK');

    // Step 5: resources
    await conn.query(`DELETE FROM resources WHERE projectId=?`, [projectId]);
    const catMap = { 0:'RRHH', 1:'FisicoTecnologico', 2:'FisicoMaterial', 3:'Virtual' };
    for (let i = 1; i <= 63; i++) {
      const cat = catMap[(i-1) % 4];
      await conn.query(`INSERT INTO resources (id,projectId,code,category,name,createdAt,updatedAt)
        VALUES (?,?,'R${i}','${cat}','Resource ${i}',NOW(),NOW())`,
        [`res_mc${i}`, projectId]);
    }
    console.log('✓ resources OK');

    // Step 6: activities
    await conn.query(`DELETE FROM activities WHERE projectId=?`, [projectId]);
    const actIdByCode = {};
    for (let i = 1; i <= 176; i++) {
      const actId = `act_mc${i}`;
      actIdByCode[`A${i}`] = actId;
      const month = `Mes${((i-1)%6)+1}`;
      await conn.query(`INSERT INTO activities (id,projectId,code,deliverable,month,name,domain_pmbok,uncertainty_type,probability,impact,level,classification,createdAt,updatedAt)
        VALUES (?,?,'A${i}','D${i}','${month}','Activity ${i}','Planificacion','riesgo_interno',2,3,6,'Medio',NOW(),NOW())`,
        [actId, projectId]);
    }
    console.log('✓ activities OK');

    // Step 7: activity_resources
    await conn.query(`DELETE FROM activity_resources WHERE 1=1`);
    const arValues = [];
    let arCount = 0;
    for (let i = 1; i <= 176; i++) {
      const actId = `act_mc${i}`;
      for (const rt of ['human','physical_tech']) {
        const resId = `res_mc${((i-1)%63)+1}`;
        arValues.push([`ar_mc${i}_${rt}`, actId, resId, rt, new Date().toISOString().slice(0,19)]);
        arCount++;
        if (arCount >= 1408) break;
      }
      if (arCount >= 1408) break;
    }
    if (arValues.length > 0) {
      await conn.query(
        `INSERT IGNORE INTO activity_resources (id,activityId,resourceId,resource_type,createdAt) VALUES ?`,
        [arValues]
      );
    }
    console.log('✓ activity_resources OK (' + arValues.length + ')');

    // Step 8: risks
    await conn.query(`DELETE FROM risks WHERE projectId=?`, [projectId]);
    const today = new Date().toISOString().slice(0,10);
    for (let i = 1; i <= 20; i++) {
      // probability e impact deben estar 1-5 (CHECK constraint chk_risks_p)
      const levelMap = {1:4, 2:6, 3:9, 4:12, 5:15, 6:16, 7:18, 8:20};
      const lvl = levelMap[(i % 8) + 1] || 6;
      const prob = Math.min(5, Math.max(1, Math.ceil(lvl / 4)));
      const imp = Math.min(5, Math.max(1, Math.ceil(lvl / prob)));
      const classif = lvl >= 15 ? 'Crítico' : lvl >= 10 ? 'Alto' : lvl >= 5 ? 'Medio' : 'Bajo';
      await conn.query(`INSERT INTO risks (id,code,projectId,title,description,category,cause,consequence,probability,impact,level,classification,owner,sprintId,status,identifiedAt,createdBy,createdAt,updatedAt)
        VALUES (?,'R${i}',?,?,'Description ${i}','Tecnologico','Cause ${i}','Consequence ${i}',?,?,?,'${classif}','Director de Proyecto','s_mc1','open',?,?,NOW(),NOW())`,
        [`risk_mc${i}`, projectId, `Riesgo ${i}`, prob, imp, lvl, today, adminId]);
    }
    console.log('✓ risks OK');

    // Step 9: risk_responses
    await conn.query(`DELETE FROM risk_responses WHERE projectId=?`, [projectId]);
    for (let i = 1; i <= 20; i++) {
      await conn.query(`INSERT INTO risk_responses (id,riskId,projectId,action,status,createdAt,updatedAt)
        VALUES (?,'risk_mc${i}',?,?,'Planificado',NOW(),NOW())`,
        [`rr_mc${i}`, projectId, `Response action ${i}`]);
    }
    console.log('✓ risk_responses OK');

    console.log('\n✅ Seed completo!');
  } catch (err) {
    console.error('✘ Error:', err.message, '| errno:', err.errno, '| code:', err.code);
  } finally {
    await conn.end();
  }
}

main();
