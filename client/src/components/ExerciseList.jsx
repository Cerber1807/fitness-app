import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://fitness-app-production-f1ff.up.railway.app';

const gifMap = {
    'Классические отжимания': 'https://media.giphy.com/media/lHWkyjY10OaWGdiHTz/giphy.gif',
    'Приседания с гантелями': 'https://media.giphy.com/media/4V6x8qM0S0COgk8Ftx/giphy.gif',
    'Жим лежа': 'https://media.giphy.com/media/IxE0gqevIU0pc/giphy.gif',
    'Планка': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnYzNzA0N245NjRmOW0xZjJpZ24zdmJ5OHZhbnEzeXJ6dm93OHpiZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/CLjw2mHysNEYw/giphy.gif',
    'Скручивания': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDRtbDk0ejM0aXNwZXFoNGc0bnFoM3duOXU2enF5MWwwYTFmOGp4cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jpt34EMgjiitZKb3ds/giphy.gif',
    'Подъём ног лёжа': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHc1eDFzcWN0YXZvMHBmczE2dTcyeXo3NHFnZG1mbnY0dWcweGdqZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uOhYjZ6JpY3yRdawOS/giphy.gif',
    'Велосипед': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDR0ZzlhZHJqMWprdWZtNWxpOXRyZWNjYW5jd3Z2enVuYmVhYXVyaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TMNCtgJGJnV8k/giphy.gif',
    'Горная тропа (Mountain Climbers)': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHl5NmgyMmNpZjdqOGpiaXJienU5OWF0bXVkbTNxYTAyb2U0Z21teiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3vR3kl8djhC3OF32/giphy.gif',
    'Боковая планка': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHNmYmtrYXd1N3cxcTJ4dGMyaW5oemkwdm92MGxlMTlmcmE1enZ1aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ws9dUXg0RjsylJkauy/giphy.gif',
    'Отжимания в стойке на руках у стены': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHpmY3RhaXlmcndvNDY1N3J5dGtnZ3hndXVnOGNhZWE2dmZ1Y2xvbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xThta8ZR0THqoBOOTC/giphy.gif',
    'Разведение рук в планке': 'https://goodlooker.ru/wp-content/uploads/2020/08/Vrashenie_rukoj_v_planke_2.gif',
    'Отжимания с поворотом': 'https://d39ziaow49lrgk.cloudfront.net/wp-content/uploads/2015/07/Push_Up_6.gif',
    'Тяга верхнего блока': 'https://media.giphy.com/media/26gR0fjEDs8Cj0pSU/giphy.gif'
};

// --- НАШ ТАЙМЕР (добавлен просто сверху) ---
const TimerOverlay = ({ exercise, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [run, setRun] = useState(true);

    const recordWorkout = useCallback(async (exercise) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Ошибка: токен не найден. Пожалуйста, перевойдите.");
                return;
            }

            await axios.post(
                `${API_URL}/record-workout`,
                { exercise_name: exercise.name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert(`✅ ${exercise.name} записано! Отличная работа!`);
        } catch (err) {
            console.error("Ошибка при сохранении тренировки:", err);
            const serverMessage = err.response?.data?.message || err.response?.data || err.message;
            alert("Ошибка при сохранении тренировки: " + serverMessage);
        }
    }, []);

    useEffect(() => {
        if (!run || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [run, timeLeft]);

    useEffect(() => {
        if (timeLeft !== 0) return;
        recordWorkout(exercise);
        onClose();
    }, [timeLeft, exercise, onClose, recordWorkout]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex',
            justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#1a1a1a', padding: '40px', borderRadius: '30px',
                border: '2px solid #4CAF50', textAlign: 'center', width: '320px',
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
            }}>
                <h2 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>{exercise.name}</h2>
                <p style={{ color: 'white', opacity: 0.8, margin: 0 }}>{exercise.target_muscle}</p>
                <div style={{ fontSize: '5rem', color: 'white', fontWeight: 'bold', margin: '20px 0' }}>{timeLeft}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setRun(!run)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#4CAF50', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        {run ? 'ПАУЗА' : 'СТАРТ'}
                    </button>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', fontWeight: 'bold', cursor: 'pointer' }}>
                        СТОП
                    </button>
                </div>
            </div>
        </div>
    );
};

const RepsModal = ({ exercise, onClose, onSave }) => {
    const [reps, setReps] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const repsNumber = Number(reps);

        if (!exercise) return;
        if (!reps || repsNumber <= 0) {
            alert('Введите корректное количество повторений.');
            return;
        }

        setSubmitting(true);
        try {
            await onSave({ reps: repsNumber, weight_lifted: 0 });
            setReps('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex',
            justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
            <div style={{
                width: '100%', maxWidth: '420px', background: '#121212', padding: '30px',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>{exercise?.name}</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '20px' }}>{exercise?.target_muscle || 'Силовое упражнение'}</p>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', color: 'white', marginBottom: '20px' }}>
                        Кол-во повторений
                        <input
                            type="number"
                            min="1"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', background: '#1d1d1d', color: 'white' }}
                        />
                    </label>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            border: 'none',
                            background: '#4CAF50',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginBottom: '12px'
                        }}
                        disabled={submitting}
                    >
                        {submitting ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'transparent',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        disabled={submitting}
                    >
                        Отмена
                    </button>
                </form>
            </div>
        </div>
    );
};
// --------------------------------------------

const ExerciseList = ({ historyFrom, historyTo }) => {
    const [exercises, setExercises] = useState([]);
    const [filter, setFilter] = useState('Все');
    const [searchText, setSearchText] = useState('');
    const [activeExercise, setActiveExercise] = useState(null); // <-- состояние для таймера
    const [repsModalExercise, setRepsModalExercise] = useState(null);
    const [history, setHistory] = useState([]);
    const [records, setRecords] = useState([]);
    const [recordToast, setRecordToast] = useState(null);
    const categories = ['Все', 'Разминка', 'Грудь', 'Ноги', 'Руки', 'Пресс', 'Плечи'];

    const saveWorkout = useCallback(async ({ exercise, reps, weight_lifted }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Ошибка: токен не найден. Пожалуйста, войдите.');
                return;
            }

            await axios.post(
                `${API_URL}/exercises`,
                {
                    exercise_name: exercise.name,
                    sets: 1,
                    reps,
                    weight_lifted
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(`✅ ${exercise.name} сохранено!`);
        } catch (err) {
            console.error('Ошибка при сохранении упражнения:', err);
            const serverMessage = err.response?.data?.message || err.response?.data || err.message;
            alert('Ошибка при сохранении упражнения: ' + serverMessage);
        }
    }, []);

    const handleExerciseClick = (exercise) => {
        if (exercise.category === 'Разминка') {
            setActiveExercise(exercise);
            return;
        }

        setRepsModalExercise(exercise);
    };

    const handleRepsSave = async ({ reps, weight_lifted }) => {
        if (!repsModalExercise) return;

        await saveWorkout({ exercise: repsModalExercise, reps, weight_lifted });

        const currentRecord = records.find((record) => record.exercise_name === repsModalExercise.name);
        const currentBest = Number(currentRecord?.max_reps ?? 0);

        if (reps > currentBest) {
            setRecordToast({
                message: `🏆 Новый рекорд! ${repsModalExercise.name} — ${reps} повт.`
            });
        }

        setRepsModalExercise(null);
    };

    useEffect(() => {
        if (!recordToast) return;

        const timer = window.setTimeout(() => {
            setRecordToast(null);
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [recordToast]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await axios.get(`${API_URL}/all-exercises`);
                setExercises(res.data);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
            }
        };

        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${API_URL}/user-history`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        from: historyFrom || undefined,
                        to: historyTo || undefined
                    }
                });
                setHistory(res.data);
            } catch (err) {
                console.error("Ошибка загрузки истории:", err);
            }
        };

        const fetchRecords = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${API_URL}/user-records`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecords(res.data);
            } catch (err) {
                console.error("Ошибка загрузки рекордов:", err);
            }
        };

        fetchExercises();
        fetchHistory();
        fetchRecords();
    }, [historyFrom, historyTo]);

    const normalizedSearch = searchText.trim().toLowerCase();
    const categoryFiltered = filter === 'Все'
        ? exercises
        : exercises.filter(ex => ex.category === filter);
    const filteredExercises = normalizedSearch === ''
        ? categoryFiltered
        : categoryFiltered.filter(ex => ex.name.toLowerCase().includes(normalizedSearch));

    const recordsByExercise = records.reduce((acc, record) => {
        acc[record.exercise_name] = record;
        return acc;
    }, {});

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* <-- ВЫЗОВ ТАЙМЕРА или модального окна повторений --> */}
            {activeExercise && <TimerOverlay exercise={activeExercise} onClose={() => setActiveExercise(null)} />}
            {repsModalExercise && (
                <RepsModal
                    exercise={repsModalExercise}
                    onClose={() => setRepsModalExercise(null)}
                    onSave={handleRepsSave}
                />
            )}
            {recordToast && (
                <div
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: 11000,
                        background: '#4CAF50',
                        color: '#fff',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        boxShadow: '0 12px 24px rgba(76, 175, 80, 0.28)',
                        fontWeight: 700,
                        maxWidth: '320px',
                        lineHeight: 1.4
                    }}
                >
                    {recordToast.message}
                </div>
            )}

            <h2 style={{ color: 'white', textAlign: 'center', fontSize: '2rem', marginBottom: '30px' }}>
                Тренировочный зал
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Поиск упражнения..."
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'white',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        fontSize: '1rem'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#4CAF50'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.3)'}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '30px',
                            border: 'none',
                            backgroundColor: filter === cat ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            transition: '0.3s all ease',
                            fontWeight: '600',
                            boxShadow: filter === cat ? '0 4px 15px rgba(76, 175, 80, 0.4)' : 'none'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filteredExercises.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '30px' }}>
                    Упражнение не найдено.
                </p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '25px'
                }}>
                {filteredExercises.map(ex => (
                    <div key={ex.id} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(15px)',
                        padding: '0', 
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ width: '100%', height: '180px', background: '#222', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           <img src={gifMap[ex.name] || ex.image_url || 'https://via.placeholder.com/150'} alt={ex.name} style={{ height: '80%', opacity: 0.8 }} />
                        </div>

                        <div style={{ padding: '20px' }}>
                            <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0', fontSize: '1.4rem' }}>{ex.name}</h3>
                            <p style={{ margin: '5px 0' }}><strong>🎯 {ex.target_muscle}</strong></p>
                            <p style={{ fontSize: '0.9em', opacity: 0.7, minHeight: '50px' }}>{ex.description}</p>
                            <p style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.8)', margin: '12px 0 0 0' }}>
                                {recordsByExercise[ex.name]
                                    ? `⭐ Ваш рекорд: ${recordsByExercise[ex.name].max_reps} повт. / ${recordsByExercise[ex.name].max_weight_lifted} кг`
                                    : '⭐ Рекорд: еще нет подходов'}
                            </p>
                            <button 
                                onClick={() => handleExerciseClick(ex)}
                                style={{
                                    width: '100%',
                                    marginTop: '15px',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Начать тренировку
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            )}

            <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>История тренировок</h2>
                {history.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                        {historyFrom || historyTo ? 'За этот период тренировок нет.' : 'Пока нет завершенных тренировок.'}
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {history.map(item => {
                            const isWarmup = item.category === 'Разминка';
                            const repsText = item.reps ?? 0;
                            const recordText = isWarmup
                                ? `${item.exercise_name} — ${repsText} сек`
                                : item.sets != null
                                    ? `${item.exercise_name} — ${item.sets} подх. × ${repsText} повт.`
                                    : `${item.exercise_name} — ${repsText} повт.`;
                            const statusText = isWarmup ? '⏱ Разминка' : '✔ Выполнено';

                            return (
                                <div key={item.id} style={{ padding: '18px', borderRadius: '18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: '700' }}>
                                            {recordText}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '6px' }}>
                                            {new Date(item.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <span style={{ color: '#4CAF50', fontWeight: '700', fontSize: '0.95rem', opacity: 0.9 }}>
                                        {statusText}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseList;