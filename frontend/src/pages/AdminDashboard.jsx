import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [scores, setScores] = useState([]);
  const [newClient, setNewClient] = useState({ username: '', password: '', name: '', email: '', organization: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchScores();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchScores = async () => {
    try {
      const res = await api.get('/admin/scores');
      setScores(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/clients', newClient);
      setNewClient({ username: '', password: '', name: '', email: '', organization: '' });
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating client');
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/clients/${id}`);
      fetchClients();
      fetchScores();
    } catch (err) { console.error(err); }
  };

  const handleAssignQuestions = async (id, currentVal) => {
    const qty = prompt('Nhập số lượng câu hỏi cần giao cho Client này:', currentVal || 5);
    if (qty === null) return;
    try {
      await api.put(`/admin/clients/${id}`, { assignedQuestions: parseInt(qty) });
      fetchClients();
      alert('Đã giao bài test thành công!');
    } catch (err) { console.error(err); }
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const res = await api.post('/admin/upload-excel', formData);
      alert(res.data.message);
      setUploadFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading file');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="header mt-4">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="btn btn-outline">Đăng xuất</button>
      </div>

      <div className="grid-2 mt-4">
        <div className="card">
          <h3>Quản lý Ngân hàng câu hỏi</h3>
          <form onSubmit={handleUploadExcel} className="mt-4">
            <div className="form-group">
              <label>Upload File Excel theo định dạng</label>
              <input type="file" className="form-control" accept=".xlsx, .xls" onChange={e => setUploadFile(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-primary mt-2">Upload và Cập nhật Data</button>
          </form>
        </div>

        <div className="card">
          <h3>Thêm Client mới</h3>
          <form onSubmit={handleCreateClient} className="mt-4">
            <div className="form-group"><input placeholder="Username" required className="form-control" value={newClient.username} onChange={e => setNewClient({...newClient, username: e.target.value})} /></div>
            <div className="form-group"><input placeholder="Password" required className="form-control" value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} /></div>
            <div className="form-group"><input placeholder="Họ và Tên" required className="form-control" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} /></div>
            <div className="form-group"><input placeholder="Email" className="form-control" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} /></div>
            <div className="form-group"><input placeholder="Đơn vị / Tổ chức" className="form-control" value={newClient.organization} onChange={e => setNewClient({...newClient, organization: e.target.value})} /></div>
            <button type="submit" className="btn btn-success mt-2">Tạo Client</button>
          </form>
        </div>
      </div>

      <div className="card mt-4">
        <h3>Danh sách Clients</h3>
        <table style={{width: '100%', marginTop: '16px', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{textAlign: 'left', borderBottom: '2px solid var(--border)'}}>
              <th>Username</th>
              <th>Họ Tên</th>
              <th>Đơn vị</th>
              <th>Số câu đã giao</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c._id} style={{borderBottom: '1px solid var(--border)'}}>
                <td style={{padding: '12px 0'}}>{c.username}</td>
                <td>{c.name}</td>
                <td>{c.organization}</td>
                <td>{c.assignedQuestions > 0 ? <span className="badge badge-success">{c.assignedQuestions} câu</span> : <span className="badge badge-danger">Chưa giao</span>}</td>
                <td>
                  <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '12px', marginRight: '8px'}} onClick={() => handleAssignQuestions(c._id, c.assignedQuestions)}>Giao Test</button>
                  <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '12px', background: 'var(--primary)'}} onClick={() => handleDeleteClient(c._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-4">
        <h3>Lịch sử Kết quả thi</h3>
        <table style={{width: '100%', marginTop: '16px', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{textAlign: 'left', borderBottom: '2px solid var(--border)'}}>
              <th>Thí sinh</th>
              <th>Đơn vị</th>
              <th>Điểm số</th>
              <th>Ngày thi</th>
            </tr>
          </thead>
          <tbody>
            {scores.map(s => (
              <tr key={s._id} style={{borderBottom: '1px solid var(--border)'}}>
                <td style={{padding: '12px 0'}}>{s.userId?.name} ({s.userId?.username})</td>
                <td>{s.userId?.organization}</td>
                <td><strong>{s.score} / {s.totalQuestions}</strong></td>
                <td>{new Date(s.date).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
