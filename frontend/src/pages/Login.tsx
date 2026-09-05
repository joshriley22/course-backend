import { useState } from 'react';
import axios from 'axios';

export function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signUp, setSignUp] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/users/login', {
                username,
                password
            });
            if (response.status === 200) {
                setLoggedIn(true);
            }
        } catch (error) {
            console.error("An error occurred during login.");
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/users/register', {
                username,
                password
            });
            if (response.status === 201) {
                setLoggedIn(true);
            }
        } catch (error) {
            console.error("An error occurred during signup.");
        }
    }

    return (

        <div id='login-panel' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '40%', height: '70%', position: 'absolute', left: '30%', top: '20%', borderRadius: '50px' }}>
            <span style={{ textSize: '36px', fontWeight: '600' }}>{signUp ? 'Sign Up' : 'Login'}</span>
            <form method='POST' onSubmit={ signUp ? handleSignUp : handleLogin}>
                <label>Username:</label>
                <input type='text' name='username' value={username} onChange={(input) => setUsername(input.target.value)} style={{ display: 'block', margin: '10px 0' }}/>
                <label>Password:</label>
                <input type='password' name='password' value={password} onChange={(input) => setPassword(input.target.value)} style={{ display: 'block', margin: '10px 0' }}/>
                <button type='submit'> {signUp ? 'Sign Up' : 'Log in'} </button>
            </form>
            <button id='signup-switch' onClick={ () => setSignUp(!signUp) }>{signUp ? 'Log in' : 'Sign Up'}</button>
        </div>
);
}