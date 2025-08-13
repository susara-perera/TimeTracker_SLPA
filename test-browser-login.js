fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'susaraperera33@gmail.com',
    password: '248310'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login result:', data);
  if (data.success) {
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('User:', data.user.firstName, data.user.lastName);
    console.log('Role:', data.user.role);
  } else {
    console.log('❌ Login failed:', data.message);
  }
})
.catch(error => {
  console.error('Error:', error);
});
