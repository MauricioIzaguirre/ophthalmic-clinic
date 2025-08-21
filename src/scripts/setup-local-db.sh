#!/bin/bash

echo "🐳 Setting up local PostgreSQL with Docker..."

# Crear docker-compose.yml si no existe
if [ ! -f "docker-compose.yml" ]; then
  cat > docker-compose.yml << EOF
services:
  postgres:
    image: postgres:16-alpine
    container_name: ophthalmic_clinic_postgres
    environment:
      POSTGRES_DB: ophthalmic_clinic
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
EOF
  echo "✅ Created docker-compose.yml"
fi

# Iniciar contenedor
echo "🚀 Starting PostgreSQL container..."
docker compose up -d

# Esperar a que esté listo
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Verificar conexión
docker compose exec postgres pg_isready -U postgres
if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL is ready!"
else
  echo "❌ PostgreSQL failed to start"
  exit 1
fi

echo "🎉 Local database setup complete!"
echo "Database URL: postgresql://postgres:postgres@localhost:54322/ophthalmic_clinic"