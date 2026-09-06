import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import rotundaLawn from '../assets/uva-lawn-rotunda.jpg';
import '../App.css';
import './Login.css';

export function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signUp, setSignUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:8000/users/login', {
                username,
                password
            });
            if (response.status === 200) {
                navigate('/');
            }
        } catch (error) {
            setError('Incorrect username or password.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:8000/users/register', {
                username,
                password
            });
            if (response.status === 201) {
                navigate('/');
            }
        } catch (error) {
            setError('That username is already taken.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const toggleMode = () => {
        setSignUp(!signUp);
        setError(null);
    }

    return (

        <motion.div
            id='content-container'
            className='main-content login-page flex flex-col items-center justify-center full-width full-height'
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <motion.div
                className='login-backdrop'
                aria-hidden='true'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    backgroundImage:
                        'linear-gradient(180deg, rgba(16, 21, 36, 0.32) 0%, rgba(23, 29, 51, 0.42) 55%, rgba(16, 21, 36, 0.58) 100%), ' +
                        `url(${rotundaLawn})`
                }}
            />
            <div id='login-panel' className='login-panel flex flex-col items-center'>
                    <form className='login-form full-width' method='POST' onSubmit={ signUp ? handleSignUp : handleLogin } noValidate>
                        <div className='login-field'>
                            <label htmlFor='login-username'>Username</label>
                            <input
                                id='login-username'
                                type='text'
                                name='username'
                                autoComplete='username'
                                required
                                value={username}
                                onChange={(input) => setUsername(input.target.value)}
                                className='login-input'
                            />
                        </div>
                        <div className='login-field'>
                            <label htmlFor='login-password'>Password</label>
                            <input
                                id='login-password'
                                type='password'
                                name='password'
                                autoComplete={signUp ? 'new-password' : 'current-password'}
                                required
                                value={password}
                                onChange={(input) => setPassword(input.target.value)}
                                className='login-input'
                            />
                        </div>
                        {error && <p className='login-error' role='alert'>{error}</p>}
                        <button type='submit' className='login-submit full-width' disabled={isSubmitting}>
                            {isSubmitting
                                ? (signUp ? 'Creating account…' : 'Logging in…')
                                : (signUp ? 'Sign Up' : 'Log in')}
                        </button>
                    </form>
                    <div className='login-divider full-width'>
                        <span>{signUp ? 'Already have an account?' : 'New to Course Explorer?'}</span>
                    </div>
                    <button type='button' id='signup-switch' className='login-switch' onClick={toggleMode}>
                        {signUp ? 'Log in instead' : 'Create an account'}
                    </button>
            </div>
        </motion.div>
    );
}
