import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://fitness-app-production-e276.up.railway.app', { email, password });
            
            // Сохраняем токен и ID пользователя
            localStorage.setItem('token', res.data.token);
            alert("Вход выполнен!");
            
            // Переходим в профиль
            navigate(`/profile/${res.data.user.id}`);
        } catch (err) {
            alert("Ошибка входа: " + err.response?.data?.message);
        }
    };

    return (
        <div style={{ marginTop: '50px' }}>
            <h2>Вход в Fitness App</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} required /><br />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default Login;