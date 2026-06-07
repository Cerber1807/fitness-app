import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Добавили useParams
import axios from 'axios';
import ExerciseList from './ExerciseList';

const API_URL = 'https://fitness-app-production-e276.up.railway.app'; // Убедитесь, что URL правильный и соответствует вашему серверу

const Profile = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [progress, setProgress] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [message, setMessage] = useState('');
    const [pendingFrom, setPendingFrom] = useState('');
    const [pendingTo, setPendingTo] = useState('');
    const [historyFrom, setHistoryFrom] = useState('');
    const [historyTo, setHistoryTo] = useState('');
    const { id } = useParams(); // Достаем ID пользователя из URL (например, 12)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                // Стучимся по правильному адресу с ID
                const res = await axios.get(`${API_URL}/profile/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                setUsername(res.data.username);
                setHeight(res.data.height ?? '');
                setWeight(res.data.weight ?? '');
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
                // Если сервер ответил ошибкой, не выкидываем сразу, а смотрим консоль
                // navigate('/'); 
            }
        };

        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get(`${API_URL}/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Ошибка загрузки статистики:', err);
            }
        };

        const fetchProgress = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get(`${API_URL}/progress`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProgress(res.data);
            } catch (err) {
                console.error('Ошибка загрузки прогресса:', err);
            }
        };

        fetchProfile();
        fetchStats();
        fetchProgress();
    }, [id, navigate]);

    if (!user) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Загрузка профиля {id}...</div>;

    return (
        <div style={{ padding: '20px', color: 'white', minHeight: '100vh', background: '#121212' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>ЛИЧНЫЙ КАБИНЕТ</h1>
            
            <div style={{ 
                maxWidth: '600px', margin: '0 auto 50px auto', background: 'rgba(255, 255, 255, 0.05)', 
                backdropFilter: 'blur(20px)', padding: '40px', borderRadius: '30px', 
                border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center'
            }}>
                <div style={{ 
                    width: '60px', height: '60px', background: '#4CAF50', borderRadius: '50%', 
                    margin: '0 auto 15px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'
                }}>
                    {user.username[0].toUpperCase()}
                </div>

                <h2>{user.username}</h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '20px 0' }}>
                    <p>Рост: <strong>{user.height} см</strong></p>
                    <p>Вес: <strong>{user.weight} кг</strong></p>
                </div>

                <div style={{ padding: '15px', borderRadius: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid #4CAF50' }}>
                    <h3 style={{ color: '#4CAF50', margin: '0' }}>ИМТ: {user.bmi}</h3>
                    <p style={{ margin: '5px 0 0 0' }}>{user.category}</p>
                </div>

                <div style={{ marginTop: '25px', padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <h3 style={{ margin: '0 0 18px 0', color: '#fff', fontSize: '1.2rem' }}>Моя статистика</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '15px' }}>
                        <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '1.4rem' }}>🏋️</div>
                            <div style={{ marginTop: '10px', color: '#bbb', fontSize: '0.9rem' }}>Всего тренировок</div>
                            <div style={{ marginTop: '8px', fontSize: '1.4rem', fontWeight: '700' }}>{stats?.total_workouts ?? 0}</div>
                        </div>
                        <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '1.4rem' }}>🔥</div>
                            <div style={{ marginTop: '10px', color: '#bbb', fontSize: '0.9rem' }}>Любимое упражнение</div>
                            <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: '700' }}>{stats?.favorite_exercise || '—'}</div>
                        </div>
                        <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '1.4rem' }}>📅</div>
                            <div style={{ marginTop: '10px', color: '#bbb', fontSize: '0.9rem' }}>Дней активности</div>
                            <div style={{ marginTop: '8px', fontSize: '1.4rem', fontWeight: '700' }}>{stats?.active_days ?? 0}</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '25px', padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.15rem' }}>Прогресс за 30 дней</h3>
                    {progress.length === 0 ? (
                        <p style={{ margin: 0, color: '#cfcfcf' }}>Начни тренироваться чтобы увидеть прогресс</p>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', minHeight: '180px', paddingTop: '8px' }}>
                                {progress.map((item) => {
                                    const maxCount = Math.max(...progress.map((entry) => Number(entry.count)), 1);
                                    const height = Math.max(8, (Number(item.count) / maxCount) * 100);
                                    const shortDate = new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

                                    return (
                                        <div key={item.date} style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: '120px' }}>
                                                <div
                                                    title={`${shortDate}: ${item.count} тренировок`}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '26px',
                                                        height: `${height}%`,
                                                        minHeight: '8px',
                                                        borderRadius: '10px 10px 4px 4px',
                                                        background: 'linear-gradient(180deg, #66bb6a 0%, #4CAF50 100%)',
                                                        boxShadow: '0 6px 12px rgba(76, 175, 80, 0.25)'
                                                    }}
                                                />
                                            </div>
                                            <span style={{ color: '#d8d8d8', fontSize: '0.82rem' }}>{shortDate}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '10px', color: '#a7a7a7', fontSize: '0.85rem', textAlign: 'center' }}>
                                Количество тренировок за последние 30 дней
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '25px' }}>
                    <button
                        onClick={() => {
                            setMessage('');
                            setIsEditing(prev => !prev);
                        }}
                        style={{
                            background: isEditing ? '#616161' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            borderRadius: '10px'
                        }}
                    >
                        {isEditing ? 'Отменить' : 'Редактировать профиль'}
                    </button>
                    <button 
                        onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
                        style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '10px 20px', cursor: 'pointer', borderRadius: '10px' }}
                    >
                        Выйти
                    </button>
                </div>

                {isEditing && (
                    <form
                        onSubmit={async (event) => {
                            event.preventDefault();
                            const token = localStorage.getItem('token');
                            if (!token) {
                                alert('Ошибка: токен не найден. Войдите заново.');
                                navigate('/');
                                return;
                            }

                            try {
                                const payload = {
                                    username: username.trim() || null,
                                    height: height === '' ? null : Number(height),
                                    weight: weight === '' ? null : Number(weight)
                                };

                                const res = await axios.put(`${API_URL}/profile/${id}`, payload, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setUser(res.data);
                                setIsEditing(false);
                                setMessage('Профиль обновлён!');
                            } catch (err) {
                                console.error('Ошибка обновления профиля:', err);
                                const serverMessage = err.response?.data?.message || err.message;
                                setMessage(`Ошибка: ${serverMessage}`);
                            }
                        }}
                        style={{ marginTop: '30px', textAlign: 'left' }}
                    >
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            Имя пользователя
                            <input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Имя пользователя"
                                style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            Рост (см)
                            <input
                                type="number"
                                value={height}
                                onChange={e => setHeight(e.target.value)}
                                placeholder="Рост"
                                min="0"
                                style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            Вес (кг)
                            <input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                placeholder="Вес"
                                min="0"
                                style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                            />
                        </label>
                        <button
                            type="submit"
                            style={{ marginTop: '10px', width: '100%', background: '#2196F3', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
                        >
                            Сохранить
                        </button>
                    </form>
                )}

                {message && (
                    <div style={{ marginTop: '20px', color: message.startsWith('Ошибка') ? '#ff8a80' : '#c8e6c9' }}>
                        {message}
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto 30px auto', color: 'white' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '18px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.95rem', color: '#ccc' }}>
                        С:
                        <input
                            type="date"
                            value={pendingFrom}
                            onChange={(e) => setPendingFrom(e.target.value)}
                            style={{ marginTop: '8px', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                        />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.95rem', color: '#ccc' }}>
                        По:
                        <input
                            type="date"
                            value={pendingTo}
                            onChange={(e) => setPendingTo(e.target.value)}
                            style={{ marginTop: '8px', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                        />
                    </label>
                    <button
                        onClick={() => {
                            setHistoryFrom(pendingFrom);
                            setHistoryTo(pendingTo);
                        }}
                        style={{ padding: '12px 18px', borderRadius: '12px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Применить
                    </button>
                    <button
                        onClick={() => {
                            setPendingFrom('');
                            setPendingTo('');
                            setHistoryFrom('');
                            setHistoryTo('');
                        }}
                        style={{ padding: '12px 18px', borderRadius: '12px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                    >
                        Сбросить
                    </button>
                </div>
            </div>
            <ExerciseList historyFrom={historyFrom} historyTo={historyTo} />
        </div>
    );
};

export default Profile;