import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const accordionData = [
  {
    title: '🟢 С чего начать',
    content: 'Калистеника — это тренировки с весом собственного тела. Начни с базы: отжимания, подтягивания, приседания, планка. Первые 2 недели занимайся через день, давай телу восстановиться. Не гонись за количеством — следи за техникой.'
  },
  {
    title: '📅 Программа для новичков',
    content: '3 дня в неделю (например Пн/Ср/Пт). День 1: отжимания 3×10, приседания 3×15, планка 3×30 сек. День 2: австралийские подтягивания 3×8, выпады 3×10, велосипед 3×15. День 3: пиковые отжимания 3×10, приседания с выпрыгиванием 3×8, боковая планка 3×20 сек.'
  },
  {
    title: '🍎 Питание',
    content: 'Без правильного питания прогресс будет медленным. Ешь достаточно белка — 1.5-2г на кг веса тела. Пей воду — минимум 2 литра в день. Не тренируйся на голодный желудок. За 1-2 часа до тренировки съешь углеводы (каша, банан).' 
  },
  {
    title: '❓ Частые вопросы',
    content: 'Как часто тренироваться? — 3 раза в неделю для начала. Что делать если болят мышцы? — отдыхай и делай лёгкую растяжку, тренируй другие группы. Когда будет результат? — через 4–6 недель регулярных тренировок. Можно ли тренироваться каждый день? — не рекомендуется, давай мышцам отдых, делай восстановительные дни.'
  }
];

const Guides = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1419', color: 'white', padding: '30px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6rem', margin: '0 0 10px', color: '#8cff7a' }}>Гайды по калистенике</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto' }}>
            Практические советы для новичков: тренировки, питание и восстановление в одном месте.
          </p>
        </header>

        <nav style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Link to="/" style={navLinkStyle}>Вход</Link>
          <Link to="/register" style={navLinkStyle}>Регистрация</Link>
          <Link to="/guides" style={{ ...navLinkStyle, backgroundColor: '#4caf50', color: '#0f1419' }}>Гайды</Link>
        </nav>

        <div style={{ display: 'grid', gap: '18px' }}>
          {accordionData.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={item.title}
                style={{
                  borderRadius: '22px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(76, 175, 80, 0.18)',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
                }}
              >
                <button
                  onClick={() => handleToggle(index)}
                  style={{
                    width: '100%',
                    padding: '22px 24px',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.05rem',
                    fontWeight: '700'
                  }}
                >
                  <span>{item.title}</span>
                  <span style={{ fontSize: '1.5rem', color: '#8cff7a' }}>{isOpen ? '−' : '+'}</span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    transition: 'max-height 0.35s ease, opacity 0.35s ease',
                    padding: isOpen ? '0 24px 22px' : '0 24px',
                    overflow: 'hidden'
                  }}
                >
                  <p style={{ margin: '0', lineHeight: '1.75', color: 'rgba(255,255,255,0.82)', whiteSpace: 'pre-line' }}>
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const navLinkStyle = {
  display: 'inline-block',
  padding: '10px 18px',
  borderRadius: '999px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: 'white',
  textDecoration: 'none',
  transition: 'background-color 0.2s ease'
};

export default Guides;
