import React from 'react';
import Globe3D from '../components/Globe3D';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative' }}>
      {/* 侧边栏按钮 */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '20px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}>
        <button onClick={() => navigate('/country-trends')} className="nav-button">📊 Country Trends</button>
        <button onClick={() => navigate('/song-trends')} className="nav-button">🎶 Song Trends</button>
        <button onClick={() => navigate('/artist-trends')} className="nav-button">👩‍🎤 Artist Trends</button>
      </div>

      {/* 地图和标题 */}
      <Globe3D />
    </div>
  );
};

export default HomePage;
