const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ТОКЕНА (Middleware)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Берем сам код из строки "Bearer TOKEN"

    if (!token) return res.status(401).json({ message: "Нет доступа (токен отсутствует)" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Токен недействителен" });
        req.user = user;
        next(); // Если всё ок, идем к следующей функции
    });
};

// 1. Проверка связи
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); 
        res.json({ message: 'База данных на связи!', time: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка базы данных');
    }
});

// 2. РЕГИСТРАЦИЯ
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, height, weight } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, height, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, email, hashedPassword, height, weight]
        );
        res.json({ message: "Пользователь создан!", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).send("Ошибка регистрации: " + err.message);
    }
});

// 3. ЛОГИН (Теперь выдает токен)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) return res.status(401).json({ message: "Юзер не найден" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ message: "Неверный пароль" });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Вход выполнен!", token, user: { id: user.rows[0].id, username: user.rows[0].username } });
    } catch (err) {
        res.status(500).send("Ошибка сервера");
    }
});

// 4. ЗАЩИЩЕННЫЙ ПРОФИЛЬ
app.get('/profile/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: "Нет прав для просмотра чужого профиля" });
        }

        const user = await pool.query("SELECT username, height, weight FROM users WHERE id = $1", [id]);
        if (user.rows.length === 0) return res.status(404).json({ message: "Не найден" });

        const { username, height, weight } = user.rows[0];
        // Считаем ИМТ прямо тут для надежности
        const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
        let category;
        if (bmi < 18.5) category = "Недостаточный вес";
        else if (bmi < 25) category = "Норма";
        else if (bmi < 30) category = "Избыточный вес";
        else category = "Ожирение";

        // Отправляем ВСЕ данные, которые нужны фронтенду
        res.json({ 
            username, 
            height, 
            weight, 
            bmi, 
            category
        });
    } catch (err) {
        res.status(500).send("Ошибка профиля");
    }
});

app.put('/profile/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.id !== parseInt(id, 10)) {
            return res.status(403).json({ message: "Нет прав для редактирования чужого профиля" });
        }

        const { username, height, weight } = req.body;

        const updatedUser = await pool.query(
            `UPDATE users
             SET username = COALESCE(NULLIF($1, ''), username),
                 height = COALESCE($2, height),
                 weight = COALESCE($3, weight)
             WHERE id = $4
             RETURNING username, height, weight`,
            [username, height, weight, id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const { username: updatedUsername, height: updatedHeight, weight: updatedWeight } = updatedUser.rows[0];
        const bmi = ((updatedWeight / ((updatedHeight / 100) ** 2)) || 0).toFixed(2);

        res.json({
            username: updatedUsername,
            height: updatedHeight,
            weight: updatedWeight,
            bmi,
            category: "Ваш расчет готов"
        });
    } catch (err) {
        console.error('Ошибка обновления профиля:', err.message);
        res.status(500).json({ message: "Ошибка при обновлении профиля" });
    }
});

// 5. ДОБАВЛЕНИЕ УПРАЖНЕНИЯ
app.post('/exercises', authenticateToken, async (req, res) => {
    try {
        const { exercise_name, sets, reps, weight_lifted } = req.body;
        const user_id = req.user.id; // Берем ID из токена (безопасно!)

        const newExercise = await pool.query(
            "INSERT INTO user_exercises (user_id, exercise_name, sets, reps, weight_lifted) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_id, exercise_name, sets, reps, weight_lifted]
        );

        res.json({ message: "Упражнение добавлено!", exercise: newExercise.rows[0] });
    } catch (err) {
        console.error('Ошибка в POST /exercises:', err);
        res.status(500).send("Ошибка при сохранении упражнения: " + err.message);
    }
});

// 6. ПОЛУЧЕНИЕ ВСЕХ ТРЕНИРОВОК ЮЗЕРА
app.get('/exercises', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const allExercises = await pool.query(
            "SELECT * FROM user_exercises WHERE user_id = $1 ORDER BY created_at DESC", 
            [user_id]
        );
        res.json(allExercises.rows);
    } catch (err) {
        res.status(500).send("Ошибка получения данных");
    }
});

// 6.1. ПОЛУЧЕНИЕ ЛУЧШИХ ПОКАЗАТЕЛЕЙ ПОЛЬЗОВАТЕЛЯ
app.get('/user-records', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(
            `SELECT exercise_name,
                    MAX(reps) AS max_reps,
                    MAX(weight_lifted) AS max_weight_lifted
             FROM user_exercises
             WHERE user_id = $1
             GROUP BY exercise_name
             ORDER BY exercise_name ASC`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения пользовательских рекордов:', err);
        res.status(500).send('Ошибка получения пользовательских рекордов: ' + err.message);
    }
});

app.get('/user-history', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { from, to } = req.query;
        const fromDate = from ? from : null;
        const toDate = to ? to : null;

        const result = await pool.query(
            `SELECT ue.exercise_name,
                    ue.sets,
                    ue.reps,
                    ue.weight_lifted,
                    ec.category,
                    ue.created_at
             FROM user_exercises ue
             LEFT JOIN exercise_catalog ec ON ec.name = ue.exercise_name
             WHERE ue.user_id = $1
               AND ($2::date IS NULL OR DATE(ue.created_at) >= $2::date)
               AND ($3::date IS NULL OR DATE(ue.created_at) <= $3::date)
             ORDER BY ue.created_at DESC`,
            [user_id, fromDate, toDate]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения истории упражнений пользователя:', err);
        res.status(500).send('Ошибка получения истории упражнений пользователя: ' + err.message);
    }
});

app.get('/stats', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        const totalWorkoutsResult = await pool.query(
            'SELECT COUNT(*) AS total_workouts FROM user_exercises WHERE user_id = $1',
            [user_id]
        );

        const favoriteExerciseResult = await pool.query(
            `SELECT exercise_name
             FROM user_exercises
             WHERE user_id = $1
             GROUP BY exercise_name
             ORDER BY COUNT(*) DESC, exercise_name ASC
             LIMIT 1`,
            [user_id]
        );

        const activeDaysResult = await pool.query(
            `SELECT COUNT(DISTINCT DATE(created_at)) AS active_days
             FROM user_exercises
             WHERE user_id = $1`,
            [user_id]
        );

        res.json({
            total_workouts: Number(totalWorkoutsResult.rows[0].total_workouts),
            favorite_exercise: favoriteExerciseResult.rows[0]?.exercise_name || null,
            active_days: Number(activeDaysResult.rows[0].active_days)
        });
    } catch (err) {
        console.error('Ошибка получения статистики пользователя:', err);
        res.status(500).json({ message: 'Ошибка получения статистики пользователя' });
    }
});

app.get('/progress', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        const result = await pool.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count
             FROM user_exercises
             WHERE user_id = $1
               AND created_at >= NOW() - INTERVAL '30 days'
             GROUP BY DATE(created_at)
             ORDER BY date ASC`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения прогресса пользователя:', err);
        res.status(500).json({ message: 'Ошибка получения прогресса пользователя' });
    }
});

// 7. УДАЛЕНИЕ УПРАЖНЕНИЯ
app.delete('/exercises/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Удаляем только если упражнение принадлежит этому пользователю
        const deleteOp = await pool.query(
            "DELETE FROM user_exercises WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, user_id]
        );

        if (deleteOp.rows.length === 0) {
            return res.status(404).json({ message: "Упражнение не найдено или нет доступа" });
        }

        res.json({ message: "Упражнение удалено успешно" });
    } catch (err) {
        res.status(500).send("Ошибка удаления");
    }
});
// Получение ОБЩЕГО списка упражнений из каталога (без токена)
app.get('/all-exercises', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM exercise_catalog ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Ошибка при получении упражнений:", err.message);
        res.status(500).send('Ошибка сервера');
    }
});

// 8. ЗАПИСЬ ЗАВЕРШЕННОЙ ТРЕНИРОВКИ
app.post('/record-workout', authenticateToken, async (req, res) => {
    try {
        const { exercise_name } = req.body;
        const user_id = req.user.id;

        if (!exercise_name) {
            return res.status(400).json({ message: "Название упражнения обязательно" });
        }

        const workout = await pool.query(
            "INSERT INTO workout_history (user_id, exercise_name, completed_at) VALUES ($1, $2, NOW()) RETURNING *",
            [user_id, exercise_name]
        );

        res.json({ message: "Тренировка записана!", workout: workout.rows[0] });
    } catch (err) {
        console.error("Ошибка при сохранении тренировки:", err.message);
        res.status(500).json({ message: "Ошибка при сохранении тренировки" });
    }
});

// 9. ПОЛУЧЕНИЕ ИСТОРИИ ТРЕНИРОВОК ЮЗЕРА
app.get('/workout-history', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const history = await pool.query(
            "SELECT * FROM workout_history WHERE user_id = $1 ORDER BY completed_at DESC",
            [user_id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error("Ошибка при получении истории:", err.message);
        res.status(500).json({ message: "Ошибка при получении истории" });
    }
});

const initDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS workout_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                exercise_name VARCHAR(255) NOT NULL,
                completed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exercise_catalog (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                target_muscle VARCHAR(255),
                category VARCHAR(100),
                description TEXT,
                image_url TEXT
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_exercises (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                exercise_name VARCHAR(255) NOT NULL,
                sets INTEGER,
                reps INTEGER,
                weight_lifted NUMERIC,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Таблицы workout_history, exercise_catalog и user_exercises проверены/созданы.');
    } catch (err) {
        console.error('Ошибка инициализации базы данных:', err.message);
        process.exit(1);
    }
};

const seedExerciseCatalog = async () => {
    const fullExercisePack = [
        {
            name: 'Вращение плечами',
            target_muscle: 'Суставы плеч, Грудь, Верх спины',
            category: 'Разминка',
            description: 'Плавные круговые движения руками вперед и назад для разогрева плечевых суставов перед нагрузкой.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGI1eDJuOWE5cWtscGxzcmxldGNqeTF1b29ydGI1NDc0bWJuMXRtYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/kHa1N17eGv1tWMBQqA/giphy.gif'
        },
        {
            name: 'Разогрев запястий и кистей',
            target_muscle: 'Запястья, Предплечья',
            category: 'Разминка',
            description: 'Вращения кистями в замке и легкие растягивающие движения. КРИТИЧЕСКИ важно перед позой лягушки и стойками!',
            image_url: 'https://artimg.gympik.com/articles/wp-content/uploads/2019/04/2019-04-24.gif'
        },
        {
            name: 'Прыжки "Джампинг Джек"',
            target_muscle: 'Все тело, Кардио-разогрев',
            category: 'Разминка',
            description: 'Интенсивные прыжки с разведением рук и ног для поднятия пульса и общей подготовки организма к тренировке.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDltMDRnZGUxd21vNmR3ZnQ0ODZobWJsZ21xaHJwemx5OGl2cXpqbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WgViBJUWQMEeu5Jvmd/giphy.gif'
        },
        {
            name: 'Поза лягушки (Frog Stand)',
            target_muscle: 'Плечи, Мышцы кора, Запястья',
            category: 'Руки',
            description: 'Статический баланс на руках со согнутыми локтями и упором коленей в трицепс. Базовая статика в калистенике.',
            image_url: 'https://media.giphy.com/media/CmnQ7MrEbH75jAFkH3/giphy.gif'
        },
        {
            name: 'Пиковые отжимания',
            target_muscle: 'Плечи (Дельты), Трицепс',
            category: 'Руки',
            description: 'Отжимания домиком с поднятым тазом. Переносят вес тела на плечи, подготавливая к отжиманиям в стойке.',
            image_url: 'https://media.giphy.com/media/nT9u7Rm4zQvmrcCSWF/giphy.gif'
        },
        {
            name: 'Классические подтягивания',
            target_muscle: 'Широчайшие спины, Бицепс, Хват',
            category: 'Руки',
            description: 'Базовое движение на турнике для мощной спины и проработки двуглавой мышцы плеча.',
            image_url: 'https://media.giphy.com/media/K55x1hsxRuqdniXhXH/giphy.gif'
        },
        {
            name: 'Австралийские подтягивания',
            target_muscle: 'Верх спины, Ромбовидные, Бицепс',
            category: 'Руки',
            description: 'Горизонтальные подтягивания на низкой перекладине. Отличное упражнение для контроля осанки и рельефа.',
            image_url: 'https://media.giphy.com/media/WB4AIcJh76pWq2W5wn/giphy.gif'
        },
        {
            name: 'Отжимания на брусьях',
            target_muscle: 'Трицепс, Нижняя часть груди',
            category: 'Руки',
            description: 'Мощное многосуставное упражнение для прокачки всей толкающей группы мышц рук и плечевого пояса.',
            image_url: 'https://media.giphy.com/media/RGmBAQjoy8Hnkuq1Hk/giphy.gif'
        },
        {
            name: 'Классические отжимания',
            target_muscle: 'Грудь, Трицепс, Кора',
            category: 'Грудь',
            description: 'Фундаментальное упражнение на полу. Держи тело ровно, опускайся до касания грудью пола.',
            image_url: 'https://media.giphy.com/media/SX9pF45td2gIniqSBm/giphy.gif'
        },
        {
            name: 'Алмазные отжимания',
            target_muscle: 'Внутренняя часть груди, Трицепс',
            category: 'Грудь',
            description: 'Отжимания с узкой постановкой рук, где ладони образуют треугольник (алмаз). Смещает акцент на трицепс.',
            image_url: 'https://media.giphy.com/media/4XGl3yPyvnWCFfTaYV/giphy.gif'
        },
        {
            name: 'Приседания с выпрыгиванием',
            target_muscle: 'Квадрицепс, Ягодицы, Взрывная сила',
            category: 'Ноги',
            description: 'Плиометрическое упражнение: глубокий присед с последующим максимально мощным выпрыгиванием вверх.',
            image_url: 'https://media.giphy.com/media/yxH3qXZsBWgkiuk7e6/giphy.gif'
        },
        {
            name: 'Выпады на месте',
            target_muscle: 'Ягодицы, Бицепс бедра, Квадрицепс',
            category: 'Ноги',
            description: 'Шаг вперед с удержанием равновесия. Следи, чтобы колено впереди стоящей ноги не выходило за носок.',
            image_url: 'https://media.giphy.com/media/BpCFzJw6Pl5HuggQCo/giphy.gif'
        },
        {
            name: 'Планка',
            target_muscle: 'Прямая мышца живота, Кора, Плечи',
            category: 'Пресс',
            description: 'Статическое удержание тела в упоре лёжа на предплечьях. Держи тело прямым как доска, не прогибай поясницу.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnYzNzA0N245NjRmOW0xZjJpZ24zdmJ5OHZhbnEzeXJ6dm93OHpiZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/CLjw2mHysNEYw/giphy.gif'
        },
        {
            name: 'Скручивания',
            target_muscle: 'Прямая мышца живота',
            category: 'Пресс',
            description: 'Классические кранчи лёжа на спине. Поднимай только лопатки, не тяни шею руками.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDRtbDk0ejM0aXNwZXFoNGc0bnFoM3duOXU2enF5MWwwYTFmOGp4cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jpt34EMgjiitZKb3ds/giphy.gif'
        },
        {
            name: 'Подъём ног лёжа',
            target_muscle: 'Нижний пресс, Сгибатели бедра',
            category: 'Пресс',
            description: 'Лёжа на спине поднимай прямые ноги до 90 градусов и медленно опускай. Поясница прижата к полу.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHc1eDFzcWN0YXZvMHBmczE2dTcyeXo3NHFnZG1mbnY0dWcweGdqZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uOhYjZ6JpY3yRdawOS/giphy.gif'
        },
        {
            name: 'Велосипед',
            target_muscle: 'Косые мышцы живота, Пресс',
            category: 'Пресс',
            description: 'Лёжа на спине поочерёдно тяни локоть к противоположному колену. Одно из лучших упражнений на косые мышцы.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDR0ZzlhZHJqMWprdWZtNWxpOXRyZWNjYW5jd3Z2enVuYmVhYXVyaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TMNCtgJGJnV8k/giphy.gif'
        },
        {
            name: 'Горная тропа (Mountain Climbers)',
            target_muscle: 'Пресс, Кора, Кардио',
            category: 'Пресс',
            description: 'В упоре лёжа поочерёдно подтягивай колени к груди в быстром темпе. Совмещает кардио и работу пресса.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHl5NmgyMmNpZjdqOGpiaXJienU5OWF0bXVkbTNxYTAyb2U0Z21teiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3vR3kl8djhC3OF32/giphy.gif'
        },
        {
            name: 'Боковая планка',
            target_muscle: 'Косые мышцы живота, Кора',
            category: 'Пресс',
            description: 'Удержание тела в боковом упоре на предплечье. Таз не опускай, тело должно быть прямой линией.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHNmYmtrYXd1N3cxcTJ4dGMyaW5oemkwdm92MGxlMTlmcmE1enZ1aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ws9dUXg0RjsylJkauy/giphy.gif'
        },
        {
            name: 'Отжимания в стойке на руках у стены',
            target_muscle: 'Дельты, Трицепс, Кора',
            category: 'Плечи',
            description: 'Стойка на руках у стены с отжиманиями. Мощное упражнение для массы плеч. Начинай с удержания стойки.',
            image_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHpmY3RhaXlmcndvNDY1N3J5dGtnZ3hndXVnOGNhZWE2dmZ1Y2xvbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xThta8ZR0THqoBOOTC/giphy.gif'
        },
        {
            name: 'Пайк отжимания',
            target_muscle: 'Передние дельты, Трицепс',
            category: 'Плечи',
            description: 'Отжимания в позиции домиком — таз высоко поднят, голова смотрит вниз. Подготовительное к стойке на руках.',
            image_url: 'https://media.giphy.com/media/nT9u7Rm4zQvmrcCSWF/giphy.gif'
        },
        {
            name: 'Разведение рук в планке',
            target_muscle: 'Средние дельты, Кора, Стабилизаторы',
            category: 'Плечи',
            description: 'Из положения планки поочерёдно поднимай прямую руку в сторону до уровня плеча. Таз не крути.',
            image_url: 'https://goodlooker.ru/wp-content/uploads/2020/08/Vrashenie_rukoj_v_planke_2.gif'
        },
        {
            name: 'Отжимания с поворотом',
            target_muscle: 'Плечи, Грудь, Косые мышцы',
            category: 'Плечи',
            description: 'После каждого отжимания поворачивай корпус и поднимай руку вверх. Развивает подвижность плечевого пояса.',
            image_url: 'https://d39ziaow49lrgk.cloudfront.net/wp-content/uploads/2015/07/Push_Up_6.gif'
        },
        {
            name: 'Обратные отжимания от скамьи',
            target_muscle: 'Задние дельты, Трицепс',
            category: 'Плечи',
            description: 'Руки на скамье сзади, ноги впереди. Сгибай локти опуская таз вниз. Хорошо прорабатывает задний пучок дельт.',
            image_url: 'https://media.giphy.com/media/RGmBAQjoy8Hnkuq1Hk/giphy.gif'
        }
    ];

    try {
        for (const exercise of fullExercisePack) {
            await pool.query(
                `INSERT INTO exercise_catalog (name, target_muscle, category, description, image_url)
                 VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)
                 ON CONFLICT (name) DO NOTHING`,
                [exercise.name, exercise.target_muscle, exercise.category, exercise.description, exercise.image_url]
            );
        }
        console.log('Сидирование полного пакета упражнений выполнено.');
    } catch (err) {
        console.error('Ошибка сидирования полного пакета упражнений:', err.message);
    }
};

initDatabase().then(async () => {
    await seedExerciseCatalog();
    app.listen(PORT, () => console.log(`Сервер на порту ${PORT}`));
}).catch(err => {
    console.error('Критическая ошибка:', err);
    process.exit(1);
});