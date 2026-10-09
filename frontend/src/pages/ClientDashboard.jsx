import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ClientDashboard() {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await api.get('/client/my-scores');
      setScores(res.data);
    } catch (err) { console.error(err); }
  };

  const handleStartTest = () => {
    navigate('/test');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="header">
        <div className="brand">
          <div className="brand-badge">HỌC VIÊN</div>
          <div className="brand-title">
            <h1>Xin chào, {name}</h1>
            <p>Chào mừng bạn đến với hệ thống sát hạch trực tuyến</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline">Đăng xuất</button>
      </div>

      <div className="card mt-4 text-center" style={{padding: '60px 20px'}}>
        <h2 style={{marginBottom: '20px'}}>Kiểm tra bài test được giao</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '30px'}}>Nhấn nút bên dưới để bắt đầu bài thi nếu Quản trị viên đã giao bài cho bạn.</p>
        <button onClick={handleStartTest} className="btn btn-primary" style={{fontSize: '18px', padding: '16px 40px'}}>BẮT ĐẦU VÀO THI</button>
      </div>

      <div className="card mt-4">
        <h3>Lịch sử thi của bạn</h3>
        {scores.length === 0 ? (
          <p className="mt-4" style={{color: 'var(--text-muted)'}}>Bạn chưa có bài thi nào.</p>
        ) : (
          <table style={{width: '100%', marginTop: '16px', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{textAlign: 'left', borderBottom: '2px solid var(--border)'}}>
                <th>Ngày thi</th>
                <th>Số câu hỏi</th>
                <th>Số câu đúng</th>
                <th>Tỉ lệ</th>
              </tr>
            </thead>
            <tbody>
              {scores.map(s => {
                const pct = Math.round((s.score / s.totalQuestions) * 100);
                return (
                  <tr key={s._id} style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '12px 0'}}>{new Date(s.date).toLocaleString('vi-VN')}</td>
                    <td>{s.totalQuestions}</td>
                    <td><strong style={{color: 'var(--success)'}}>{s.score}</strong></td>
                    <td>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;
