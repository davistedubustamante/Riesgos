import { q, close } from '../src/models/db.js';

async function main() {
  const oldName = 'Madame Crebe — Sistema Inteligente de Preselección de Personal';
  const newName = 'Madame Crepe — Sistema Inteligente de Preselección de Personal';
  
  console.log(`Buscando proyecto: "${oldName}"...`);
  
  const rows = await q('SELECT id FROM projects WHERE name = ?', [oldName]);
  
  if (rows.length === 0) {
    console.log('No se encontró el proyecto con el nombre antiguo. Intentando buscar por nombre parcial...');
    const partialRows = await q("SELECT id, name FROM projects WHERE name LIKE '%Madame Crebe%'");
    if (partialRows.length > 0) {
      console.log('Encontrados parciales:', partialRows);
      const res = await q(
        "UPDATE projects SET name = REPLACE(name, 'Madame Crebe', 'Madam Crepe') WHERE name LIKE '%Madame Crebe%'"
      );
      console.log('Resultado de actualización parcial:', res);
    } else {
      console.log('No se encontró ningún proyecto con el nombre a cambiar.');
    }
  } else {
    const res = await q(
      'UPDATE projects SET name = ? WHERE name = ?',
      [newName, oldName]
    );
    console.log('Resultado de actualización exacta:', res);
  }
  
  await close();
  console.log('Proceso de renombrado finalizado.');
}

main().catch(console.error);
