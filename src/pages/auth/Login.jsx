import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Nhập CSS styles
import { AuthContext } from '../../context/AuthContext';
import './Login.css';
import axiosClient from '../../axiosClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Nhập icon con mắt
import { Puff } from 'react-loader-spinner'; 
const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosClient.post('auth/bearer-jwt/login', {
        email,
        password,
      });
      const { access_token, full_name } = response.data;
      login(access_token, full_name);
      setLoading(false); // Tắt loading trước khi điều hướng
      navigate('/', {
        state: {
          notify: {
            type: 'success',
            message: 'Đăng nhập thành công!',
          },
        },
      });
    } catch (error) {
      setLoading(false); // Tắt loading nếu xảy ra lỗi
      if (error.response) {
        const status = error.response.status;
        if (status === 400 && error.response.data.detail.name === 'INVALID_USERNAME_PASSWORD') {
          toast.error('Email hoặc Mật khẩu không hợp lệ.');
        } else if (status === 404 && error.response.data.detail.name === 'NOT_FOUND') {
          toast.error('Email hoặc Mật khẩu không hợp lệ.');
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
      } else {
        toast.error('Không thể kết nối đến máy chủ.'); // Thêm thông báo nếu lỗi không có response
      }
    }
  };
  // Nếu đang loading, hiển thị spinner
  if (loading) {
    return (
      <div className="loading">
        <Puff
          height="60"
          width="60"
          color="#00BFFF"
          ariaLabel="loading-indicator"
        />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'} // Chuyển đổi giữa text và password
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Chuyển đổi hiển thị mật khẩu"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">Đăng nhập</button>
        </form>
        <div className="register-link">
          <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
