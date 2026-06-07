import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        height: '',
        weight: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://fitness-app-production-e276.up.railway.app', formData);
            alert("Регистрация успешна! теперь войдите.");
            navigate('/');
        } catch (err) {
            alert("Ошибка регистрации: " + (err.response?.data?.message || "Что-то пошло не так"));
        }
    };

    return (
        <div style={{ marginTop: '50px' }}>
            <h2>Регистрация нового атлета</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto', gap: '10px' }}>
                <input name="username" placeholder="Имя пользователя" onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Пароль" onChange={handleChange} required />
                <input name="height" type="number" placeholder="Рост (см)" onChange={handleChange} required />
                <input name="weight" type="number" placeholder="Вес (кг)" onChange={handleChange} required />
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
                    Зарегистрироваться
                </button>
            </form>
        </div>
    );
};

export default Register;