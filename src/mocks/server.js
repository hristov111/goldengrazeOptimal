// Mock server for development
// Toggle this on/off by setting ENABLE_MOCKS = true/false

const ENABLE_MOCKS = true;

const mockData = {
  user: {
    id: "u_123",
    email: "jane@example.com", 
    name: "Jane Doe"
  },
  orderProfile: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "(555) 123-4567",
    street: "123 Oak Street",
    apt: "Apt 2B",
    city: "Austin",
    state: "TX",
    zip: "78701",
    notes: "Please leave at front door"
  }
};

// Intercept fetch calls and return mock data
const originalFetch = window.fetch;

window.fetch = async (url, options = {}) => {
  if (!ENABLE_MOCKS) {
    return originalFetch(url, options);
  }

  // Mock /api/me endpoint
  if (url === '/api/me' || url.endsWith('/api/me')) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const authHeader = options.headers?.Authorization;
    if (!authHeader || !authHeader.includes('Bearer')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(mockData.user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock /api/users/:id/order-profile endpoint
  if (url.includes('/api/users/') && url.includes('/order-profile')) {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const authHeader = options.headers?.Authorization;
    if (!authHeader || !authHeader.includes('Bearer')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(mockData.orderProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // For all other requests, use the original fetch
  return originalFetch(url, options);
};

// Helper function to simulate login (for testing)
window.mockLogin = () => {
  localStorage.setItem('authToken', 'mock_jwt_token_12345');
  console.log('Mock login successful! Reload the page and visit /order to see prefilled form.');
};

window.mockLogout = () => {
  localStorage.removeItem('authToken');
  console.log('Mock logout successful! Visit /order to see empty form.');
};

console.log('🎭 Mock server enabled!');
console.log('📝 Test commands:');
console.log('   mockLogin()  - Simulate user login');
console.log('   mockLogout() - Simulate user logout');
console.log('🔧 To disable mocks, set ENABLE_MOCKS = false in src/mocks/server.js');

export { ENABLE_MOCKS, mockData };