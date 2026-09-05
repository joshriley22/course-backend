import { useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import '../App.css';
import './Login.css';

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

        <div id='body-container' className='flex items-center justify-center viewport-overlay'>
            <Sidebar />
            <div id='content-container' className='main-content flex flex-col items-center full-width full-height'>
                <div id='login-panel' className='login-panel flex flex-col items-center justify-center'>
                    <span className='login-title'>{signUp ? 'Sign Up' : 'Login'}</span>
                    <form method='POST' onSubmit={ signUp ? handleSignUp : handleLogin}>
                        <label>Username:</label>
                        <input type='text' name='username' value={username} onChange={(input) => setUsername(input.target.value)} className='login-input'/>
                        <label>Password:</label>
                        <input type='password' name='password' value={password} onChange={(input) => setPassword(input.target.value)} className='login-input'/>
                        <button type='submit'> {signUp ? 'Sign Up' : 'Log in'} </button>
                    </form>
                    <button id='signup-switch' onClick={ () => setSignUp(!signUp) }>{signUp ? 'Log in' : 'Sign Up'}</button>
                </div>
            </div>
        </div>
);
}