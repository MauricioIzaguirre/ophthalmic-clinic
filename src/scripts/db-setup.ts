import { db } from "../lib/db/drizzle";


async function setupDatabase() {
  console.log('🔄 Setting up database...');
  
  try {
    // Generar nueva migración si hay cambios
    console.log('📋 Run: npm run db:generate');
    console.log('🚀 Run: npm run db:migrate');
    
    // Verificar conexión
    await db.execute('SELECT 1');
    console.log('✅ Database connection successful');
    
    console.log('🎉 Database setup completed!');
    console.log('Next steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Run: npm run db:migrate');
    console.log('3. Run: npm run db:seed (optional)');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}