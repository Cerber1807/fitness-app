import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Guides from './components/Guides';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <div style={{ textAlign: 'center', fontFamily: 'Arial' }}>
        <nav style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
          <Link to="/" style={{ color: 'white', margin: '10px' }}>Вход</Link>
          <Link to="/register" style={{ color: 'white', margin: '10px' }}>Регистрация</Link>
          <Link to="/guides" style={{ color: 'white', margin: '10px' }}>Гайды</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;