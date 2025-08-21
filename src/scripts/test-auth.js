// scripts/test-auth.js
// Ejecutar con: node scripts/test-auth.js

const BASE_URL = 'http://localhost:4321';

// Función helper para hacer requests
async function makeRequest(endpoint, data, method = 'POST') {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method !== 'GET' ? JSON.stringify(data) : undefined,
  });
  
  const result = await response.json();
  return { status: response.status, data: result };
}

// Test de registro
async function testSignUp() {
  console.log('🔄 Testing user registration...');
  
  const userData = {
    name: 'Dr. Test User',
    email: 'test@ophthalmic.com',
    password: 'SecurePassword123',
    role: 'doctor'
  };
  
  try {
    const result = await makeRequest('/api/auth/signup', userData);
    
    if (result.status === 201) {
      console.log('✅ Registration successful:', result.data.user);
      return result.data.user;
    } else {
      console.log('❌ Registration failed:', result.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return null;
  }
}

// Test de login
async function testSignIn() {
  console.log('🔄 Testing user login...');
  
  const credentials = {
    email: 'test@ophthalmic.com',
    password: 'SecurePassword123'
  };
  
  try {
    const result = await makeRequest('/api/auth/signin', credentials);
    
    if (result.status === 200) {
      console.log('✅ Login successful:', result.data.user);
      return result.data.user;
    } else {
      console.log('❌ Login failed:', result.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

// Test completo
async function runTests() {
  console.log('🧪 Starting authentication tests...\n');
  
  // Test 1: Registro
  const registeredUser = await testSignUp();
  if (!registeredUser) {
    console.log('⏭️ Skipping login test due to registration failure');
    return;
  }
  
  console.log(''); // Separador
  
  // Test 2: Login
  const loggedInUser = await testSignIn();
  if (!loggedInUser) {
    console.log('❌ Login test failed');
    return;
  }
  
  console.log('\n🎉 All authentication tests passed!');
  
  // Instrucciones adicionales
  console.log('\n📋 Next steps:');
  console.log('1. Visit http://localhost:4321 in your browser');
  console.log('2. Open Developer Tools > Network tab');
  console.log('3. Try making requests to /api/auth/signin');
  console.log('4. Check the cookies to see the session token');
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Server not responding');
    }
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Start it with: npm run dev');
    return false;
  }
}

// Ejecutar tests
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error);