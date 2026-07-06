import app from './app.js';

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`✅ RiskFlow API escuchando en http://localhost:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`   Frontend esperado: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
});
