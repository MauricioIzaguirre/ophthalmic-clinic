import 'dotenv/config'; // Cargar variables de entorno
import { db } from './drizzle';
import { users, clinics, clinicMembers, doctors, locations } from './schema';
import { hashPassword } from '../auth/session';
import { UserRole } from '../types';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Crear usuarios de prueba
    console.log('👥 Creating test users...');
    
    const hashedPassword = await hashPassword('SecurePassword123');
    
    const seedUsers = await db
      .insert(users)
      .values([
        {
          name: 'Super Admin',
          email: 'admin@ophthalmic.com',
          passwordHash: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          isActive: true
        },
        {
          name: 'Dr. María García',
          email: 'maria@ophthalmic.com',
          passwordHash: hashedPassword,
          role: UserRole.DOCTOR,
          isActive: true
        },
        {
          name: 'Dr. Carlos Rodríguez',
          email: 'carlos@ophthalmic.com',
          passwordHash: hashedPassword,
          role: UserRole.DOCTOR,
          isActive: true
        },
        {
          name: 'Ana López',
          email: 'ana@ophthalmic.com',
          passwordHash: hashedPassword,
          role: UserRole.RECEPTIONIST,
          isActive: true
        },
        {
          name: 'Juan Pérez',
          email: 'juan@ophthalmic.com',
          passwordHash: hashedPassword,
          role: UserRole.PATIENT,
          isActive: true
        }
      ])
      .returning();

    console.log(`✅ Created ${seedUsers.length} users`);

    // 2. Crear clínicas
    console.log('🏥 Creating test clinics...');
    
    const seedClinics = await db
      .insert(clinics)
      .values([
        {
          name: 'Clínica Oftalmológica Central',
          description: 'Especialistas en cirugía ocular y tratamientos avanzados',
          creditsBalance: 100,
          isActive: true
        },
        {
          name: 'Vista Clara Medical Center',
          description: 'Centro médico especializado en salud visual',
          creditsBalance: 50,
          isActive: true
        }
      ])
      .returning();

    console.log(`✅ Created ${seedClinics.length} clinics`);

    // 3. Crear relaciones clínica-usuarios
    console.log('🔗 Creating clinic memberships...');
    
    const clinic1 = seedClinics[0];
    const clinic2 = seedClinics[1];
    
    const adminUser = seedUsers[0];
    const doctor1 = seedUsers[1];
    const doctor2 = seedUsers[2];
    const receptionist = seedUsers[3];
    const patient = seedUsers[4];

    await db
      .insert(clinicMembers)
      .values([
        // Clínica 1
        { userId: adminUser.id, clinicId: clinic1.id, role: UserRole.CLINIC_ADMIN },
        { userId: doctor1.id, clinicId: clinic1.id, role: UserRole.DOCTOR },
        { userId: receptionist.id, clinicId: clinic1.id, role: UserRole.RECEPTIONIST },
        { userId: patient.id, clinicId: clinic1.id, role: UserRole.PATIENT },
        
        // Clínica 2
        { userId: doctor2.id, clinicId: clinic2.id, role: UserRole.DOCTOR },
      ]);

    console.log('✅ Created clinic memberships');

    // 4. Crear perfiles de doctores
    console.log('👨‍⚕️ Creating doctor profiles...');
    
    await db
      .insert(doctors)
      .values([
        {
          userId: doctor1.id,
          clinicId: clinic1.id,
          specialization: 'Oftalmología General',
          licenseNumber: 'MED-12345',
          phone: '+52 55 1234-5678',
          isActive: true
        },
        {
          userId: doctor2.id,
          clinicId: clinic2.id,
          specialization: 'Cirugía Refractiva',
          licenseNumber: 'MED-67890',
          phone: '+52 55 9876-5432',
          isActive: true
        }
      ]);

    console.log('✅ Created doctor profiles');

    // 5. Crear ubicaciones
    console.log('📍 Creating clinic locations...');
    
    await db
      .insert(locations)
      .values([
        {
          clinicId: clinic1.id,
          name: 'Sede Principal',
          address: 'Av. Reforma 123, Col. Centro',
          phone: '+52 55 1234-0000',
          city: 'Ciudad de México',
          workingHours: {
            morning: { start: '08:00', end: '14:00' },
            afternoon: { start: '15:00', end: '20:00' }
          },
          isActive: true
        },
        {
          clinicId: clinic2.id,
          name: 'Consultorio Norte',
          address: 'Calle Insurgentes 456, Col. Roma Norte',
          phone: '+52 55 5678-0000',
          city: 'Ciudad de México',
          workingHours: {
            morning: { start: '09:00', end: '15:00' }
          },
          isActive: true
        }
      ]);

    console.log('✅ Created clinic locations');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test credentials:');
    console.log('='.repeat(50));
    console.log('👑 Super Admin: admin@ophthalmic.com');
    console.log('👨‍⚕️ Doctor 1: maria@ophthalmic.com');
    console.log('👨‍⚕️ Doctor 2: carlos@ophthalmic.com');
    console.log('🏥 Receptionist: ana@ophthalmic.com');
    console.log('👤 Patient: juan@ophthalmic.com');
    console.log('🔑 Password (all): SecurePassword123');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Función para limpiar la base de datos
async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  try {
    await db.delete(doctors);
    await db.delete(locations);
    await db.delete(clinicMembers);
    await db.delete(clinics);
    await db.delete(users);
    
    console.log('✅ Database cleared');
  } catch (error) {
    console.warn('⚠️ Could not clear database (this is normal for first run)');
  }
}

// Ejecutar seed
async function main() {
  await clearDatabase();
  await seedDatabase();
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}