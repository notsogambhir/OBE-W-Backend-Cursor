async function debugUser() {
  try {
    console.log('=== Testing user API ===');
    
    const response = await fetch('http://127.0.0.1:3000/api/auth/me', {
      credentials: 'include',
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('User data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('User test failed:', error);
  }
}

debugUser();