import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  useEffect(() => {
    fetchTest();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !result) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0 && !result) {
      handleSubmit(); // auto submit
    }
  }, [timeLeft, result, questions]);

  const fetchTest = async () => {
    try {
      const res = await api.get('/client/test');
      setQuestions(res.data.questions);
      setTimeLeft(res.data.questions.length * 72); // ~1.2 mins per question
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lấy bài test');
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/client/submit', { answers });
      setResult(res.data);
    } catch (err) {
      alert('Có lỗi xảy ra khi nộp bài');
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  
  if (error) return (
    <div className="container mt-4">
      <div className="card text-center">
        <h3 style={{color: 'var(--primary)'}}>{error}</h3>
        <button onClick={() => navigate('/client')} className="btn btn-outline mt-4">Quay lại</button>
      </div>
    </div>
  );

  if (result) {
    const pct = Math.round((result.score / result.totalQuestions) * 100);
    const isPass = pct >= 70;
    
    return (
      <div className="container mt-4">
        <div className="card text-center">
          <h2>KẾT QUẢ SÁT HẠCH</h2>
          <h3 className="mt-2">{name}</h3>
          
          <div style={{margin: '30px 0'}}>
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%', border: `8px solid ${isPass ? 'var(--success)' : 'var(--primary)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
            }}>
              <div style={{fontSize: '32px', fontWeight: '800'}}>{result.score}</div>
              <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>/ {result.totalQuestions} câu ({pct}%)</div>
            </div>
          </div>
          
          <h2 style={{color: isPass ? 'var(--success)' : 'var(--primary)'}}>{isPass ? 'ĐẠT YÊU CẦU' : 'KHÔNG ĐẠT'}</h2>
          
          <button onClick={() => navigate('/client')} className="btn btn-primary mt-4">Trở về Dashboard</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return (
    <div className="container mt-4">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '20px', position: 'sticky', top: '12px', zIndex: 10}}>
        <div><strong>{name}</strong></div>
        <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)'}}>⏱ {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</div>
        <button onClick={() => { if (confirm('Bạn muốn nộp bài ngay bây giờ?')) handleSubmit() }} className="btn btn-primary">Nộp bài thi</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start'}}>
        <div>
          <div className="card" style={{padding: '28px', marginBottom: '20px'}}>
            <div style={{color: 'var(--primary)', fontWeight: 'bold', marginBottom: '16px'}}>Câu hỏi {currentIndex + 1} / {questions.length}</div>
            <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '20px', lineHeight: 1.6}}>{q.questionText}</div>
            
            <div>
              {q.options.map((opt, idx) => {
                const isSelected = answers[q._id] === idx;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleSelectOption(q._id, idx)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', 
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, 
                      borderRadius: '8px', marginBottom: '12px', cursor: 'pointer',
                      background: isSelected ? 'var(--primary-light)' : '#fff'
                    }}
                  >
                    <input type="radio" checked={isSelected} readOnly style={{marginTop: '4px', accentColor: 'var(--primary)'}} />
                    <div style={{flex: 1}}>{opt}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <button onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0} className="btn btn-secondary">⬅ Câu trước</button>
            <button onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))} disabled={currentIndex === questions.length - 1} className="btn btn-secondary">Câu kế tiếp ➡</button>
          </div>
        </div>

        <div className="card" style={{padding: '20px'}}>
          <div style={{fontWeight: 'bold', marginBottom: '14px'}}>Danh sách câu hỏi</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px'}}>
            {questions.map((qItem, idx) => {
              const isAnswered = answers[qItem._id] !== undefined;
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                    background: isAnswered ? 'var(--primary)' : '#fff',
                    color: isAnswered ? '#fff' : 'inherit',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
