import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cccdId, setCccdId] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [residence, setResidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isScanned, setIsScanned] = useState(false); // Trạng thái đã quét QR
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axiosClient.post('/qrcode/scan-qrcode/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;
      setCccdId(data.cccd_id);
      setName(data.full_name);
      setDob(data.dob);
      setGender(data.gender);
      setResidence(data.residence);

      setIsScanned(true); // Đặt trạng thái đã quét thành true
      toast.success('Quét thông tin thành công!', { position: 'top-right' });
    } catch (error) {
      toast.error('Không thể quét thông tin. Vui lòng thử lại.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await axiosClient.post('auth/register', {
        email,
        password,
        role: 'Patient', // Vai trò cố định
        cccd_id: cccdId,
        name,
        dob,
        gender,
        residence,
      });

      navigate('/login', {
        state: {
          notify: {
            type: 'success',
            message: 'Đăng ký thành công',
          },
        },
      });
    } catch (error) {
      const message = error.response?.data?.detail?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(message, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit}>
          {/* Nút chọn ảnh khi chưa quét QR */}
          {!isScanned && (
            <div className="form-group">
              <label htmlFor="file-upload">Quét mã QR CCCD</label>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <button type="submit" className="register-button" disabled={loading || !isScanned}>
                {loading ? 'Đang quét mã...' : 'Quét mã căn cước'}
              </button>
            </div>
          )}

          {/* Các trường thông tin tự động điền khi đã quét QR */}
          {isScanned && (
            <>
              <div className="form-group">
                <label htmlFor="cccdId">Số CCCD</label>
                <input
                  type="text"
                  id="cccdId"
                  value={cccdId}
                  disabled
                  placeholder="Số CCCD sẽ được điền tự động"
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  disabled
                  placeholder="Họ và tên sẽ được điền tự động"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dob">Ngày sinh</label>
                <input
                  type="text"
                  id="dob"
                  value={dob}
                  disabled
                  placeholder="Ngày sinh sẽ được điền tự động"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <input
                  type="text"
                  id="gender"
                  value={gender}
                  disabled
                  placeholder="Giới tính sẽ được điền tự động"
                />
              </div>

              <div className="form-group">
                <label htmlFor="residence">Nơi cư trú</label>
                <input
                  type="text"
                  id="residence"
                  value={residence}
                  disabled
                  placeholder="Nơi cư trú sẽ được điền tự động"
                />
              </div>
              {/* Trường nhập email */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Trường nhập mật khẩu */}
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              {/* Nút đăng ký */}
              <button type="submit" className="register-button" disabled={loading || !isScanned}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </>
          )}
        </form>

        <div className="login-link">
          <p>Bạn đã có tài khoản? <a href="/login">Đăng nhập ngay</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
