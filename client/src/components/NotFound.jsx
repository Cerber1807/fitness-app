import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #121212 0%, #1b1b1b 100%)',
        color: '#f5f5f5',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '460px',
          padding: '36px 28px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          border: '1px solid rgba(76, 175, 80, 0.25)',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div
          style={{
            fontSize: '88px',
            lineHeight: 1,
            fontWeight: 800,
            color: '#4CAF50',
            letterSpacing: '4px',
            marginBottom: '8px',
          }}
        >
          404
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: '28px', color: '#ffffff' }}>
          Страница не найдена
        </h2>
        <p style={{ margin: '0 0 24px', color: '#cfcfcf', lineHeight: 1.5 }}>
          Такой страницы больше не существует или она была перемещена.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            border: 'none',
            borderRadius: '999px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '15px',
            boxShadow: '0 8px 18px rgba(76, 175, 80, 0.3)',
          }}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default NotFound;
