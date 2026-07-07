import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  let navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('role', data.role);
        setMessage('Login successful');
        navigate("/home");
      } else {
        setMessage('Invalid credentials');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-container">
    <h1>Smart Application for Energy Saving</h1>
    <br /><br />
    <Card style={{width: "400px"}}>
      <CardHeader title="Login"></CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <TextField id="username" value={username} label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)} />
          <br /><br />
          <TextField id="password" value={password} label="Password" variant="outlined" onChange={(e) => setPassword(e.target.value)} />
          <br /><br />
          <Button variant="contained" type="submit">Login</Button>
        </form>
        <br />

        {message && <p>{message}</p>}
    </CardContent>
    </Card>
    </div>
  );
}

export default Login;
