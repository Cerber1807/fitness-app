const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const exercises = [
  {
    name: 'Пиковые отжимания',
    target_muscle: 'Плечи, Трицепс',
    category: 'Руки',
    description: 'Отжимания домиком с поднятым тазом для переноса нагрузки на передние дельты. Базовое подводящее упражнение к отжиманиям в стойке на руках.',
    image_url: 'https://media.giphy.com/media/nT9u7Rm4zQvmrcCSWF/giphy.gif'
  },
  {
    name: 'Классические подтягивания',
    target_muscle: 'Широчайшие мышцы спины, Бицепс',
    category: 'Руки',
    description: 'Базовое многосуставное упражнение на турнике для развития ширины и силы спины, а также укрепления хвата.',
    image_url: 'https://media.giphy.com/media/K55x1hsxRuqdniXhXH/giphy.gif'
  },
  {
    name: 'Поза лягушки (Frog Stand)',
    target_muscle: 'Плечи, Мышцы кора, Запястья',
    category: 'Руки',
    description: 'Статический баланс на руках со согнутыми локтями и упором коленей в трицепс. Базовый элемент калистеники для перехода к горизонту.',
    image_url: 'https://media.giphy.com/media/gyTzWRvzNtKC2fe9B7/giphy.gif'
  },
  {
    name: 'Австралийские подтягивания',
    target_muscle: 'Верх спины, Ромбовидные, Бицепс',
    category: 'Руки',
    description: 'Подтягивания на низкой перекладине с упором ногами в пол. Отлично подходит для проработки рельефа спины и подготовки к обычным подтягиваниям.',
    image_url: 'https://media.giphy.com/media/WB4AIcJh76pWq2W5wn/giphy.gif'
  },
  {
    name: 'Отжимания на брусьях',
    target_muscle: 'Низ груди, Трицепс, Передняя дельта',
    category: 'Грудь',
    description: 'Мощное базовое упражнение на брусьях для прокачки всей толкающей группы мышц верхнего плечевого пояса.',
    image_url: 'https://media.giphy.com/media/Uj83hIkkCsdvSONzqV/giphy.gif'
  },
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
    image_url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif'
  },
  {
    name: 'Скручивания',
    target_muscle: 'Прямая мышца живота',
    category: 'Пресс',
    description: 'Классические кранчи лёжа на спине. Поднимай только лопатки, не тяни шею руками.',
    image_url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif'
  },
  {
    name: 'Подъём ног лёжа',
    target_muscle: 'Нижний пресс, Сгибатели бедра',
    category: 'Пресс',
    description: 'Лёжа на спине поднимай прямые ноги до 90 градусов и медленно опускай. Поясница прижата к полу.',
    image_url: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif'
  },
  {
    name: 'Велосипед',
    target_muscle: 'Косые мышцы живота, Пресс',
    category: 'Пресс',
    description: 'Лёжа на спине поочерёдно тяни локоть к противоположному колену. Одно из лучших упражнений на косые мышцы.',
    image_url: 'https://media.giphy.com/media/l0HlPZeB9OagZMWbu/giphy.gif'
  },
  {
    name: 'Горная тропа (Mountain Climbers)',
    target_muscle: 'Пресс, Кора, Кардио',
    category: 'Пресс',
    description: 'В упоре лёжа поочерёдно подтягивай колени к груди в быстром темпе. Совмещает кардио и работу пресса.',
    image_url: 'https://media.giphy.com/media/eSzGp7uMDHRfW/giphy.gif'
  },
  {
    name: 'Боковая планка',
    target_muscle: 'Косые мышцы живота, Кора',
    category: 'Пресс',
    description: 'Удержание тела в боковом упоре на предплечье. Таз не опускай, тело должно быть прямой линией.',
    image_url: 'https://media.giphy.com/media/l0HlQoNGMAbmACYQw/giphy.gif'
  },
  {
    name: 'Отжимания в стойке на руках у стены',
    target_muscle: 'Дельты, Трицепс, Кора',
    category: 'Плечи',
    description: 'Стойка на руках у стены с отжиманиями. Мощное упражнение для массы плеч. Начинай с удержания стойки.',
    image_url: 'https://media.giphy.com/media/l0HlHFJbLMCRz1Saw/giphy.gif'
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
    image_url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif'
  },
  {
    name: 'Отжимания с поворотом',
    target_muscle: 'Плечи, Грудь, Косые мышцы',
    category: 'Плечи',
    description: 'После каждого отжимания поворачивай корпус и поднимай руку вверх. Развивает подвижность плечевого пояса.',
    image_url: 'https://media.giphy.com/media/26ybwwiZmD3wFCiJa/giphy.gif'
  },
  {
    name: 'Обратные отжимания от скамьи',
    target_muscle: 'Задние дельты, Трицепс',
    category: 'Плечи',
    description: 'Руки на скамье сзади, ноги впереди. Сгибай локти опуская таз вниз. Хорошо прорабатывает задний пучок дельт.',
    image_url: 'https://media.giphy.com/media/RGmBAQjoy8Hnkuq1Hk/giphy.gif'
  },
  {
    name: 'Приседания с гантелями',
    target_muscle: 'Ягодицы, Квадрицепс, Бёдра',
    category: 'Ноги',
    description: 'Глубокие приседания с гантелями в руках. Хорошо нагружает ноги и ягодицы, добавляя сопротивление для прогресса.',
    image_url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif'
  },
  {
    name: 'Жим лежа',
    target_muscle: 'Грудь, Трицепс, Передняя дельта',
    category: 'Грудь',
    description: 'Классическое силовое упражнение лёжа. Работает на массу и силу грудных мышц.',
    image_url: 'https://media.giphy.com/media/IxE0gqevIU0pc/giphy.gif'
  },
  {
    name: 'Тяга верхнего блока',
    target_muscle: 'Широчайшие мышцы спины, Бицепс',
    category: 'Руки',
    description: 'Упражнение на верхний блок для проработки широчайших мышц и улучшения посадки плеч.',
    image_url: 'https://media.giphy.com/media/26gR0fjEDs8Cj0pSU/giphy.gif'
  }
];

const upsertExercises = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exercise_catalog (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        target_muscle VARCHAR(255),
        category VARCHAR(100),
        description TEXT,
        image_url TEXT
      );
    `);

    for (const exercise of exercises) {
      await pool.query(
        `INSERT INTO exercise_catalog (name, target_muscle, category, description, image_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET
           target_muscle = EXCLUDED.target_muscle,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url;`,
        [
          exercise.name,
          exercise.target_muscle,
          exercise.category,
          exercise.description,
          exercise.image_url
        ]
      );
    }

    console.log(`Залито упражнений в Railway: ${exercises.length}`);
  } catch (err) {
    console.error('Ошибка seed.js:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

upsertExercises();

