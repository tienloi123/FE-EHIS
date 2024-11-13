import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clinicLocation, setClinicLocation] = useState('');
  const navigate = useNavigate();

  const departments = [
    'Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi', 'Khoa Da Liễu',
    'Khoa Mắt', 'Khoa Tai Mũi Họng', 'Khoa Răng Hàm Mặt',
    'Khoa Chẩn Đoán Hình Ảnh', 'Khoa Cấp Cứu'
  ]; // Danh sách 10 khoa

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    if (event.target.value !== 'Doctor') {
      setDepartment('');
      setClinicLocation('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('auth/register', {
        email,
        name,
        dob: new Date(dob).toLocaleDateString('vi-VN'),
        password,
        role,
        clinic_location: role === 'Doctor' ? clinicLocation : null,
        department: role === 'Doctor' ? department : null,
        gender,
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
      toast.error(message, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Đăng ký tài khoản</h2>
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
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              placeholder="Nhập Họ và Tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob">Ngày sinh</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Giới tính</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

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

          <div className="form-group">
            <label htmlFor="role">Vai trò</label>
            <select id="role" value={role} onChange={handleRoleChange} required>
              <option value="">Chọn vai trò</option>
              <option value="Doctor">Bác sĩ</option>
              <option value="Receptionist">Lễ tân</option>
              <option value="Patient">Bệnh nhân</option>
            </select>
          </div>

          {role === 'Doctor' && (
            <>
              <div className="form-group">
                <label htmlFor="department">Khoa</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Chọn khoa</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="clinicLocation">Vị trí phòng khám</label>
                <input
                  type="text"
                  id="clinicLocation"
                  value={clinicLocation}
                  onChange={(e) => setClinicLocation(e.target.value)}
                  placeholder="Nhập vị trí phòng khám"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="login-link">
          <p>Bạn đã có tài khoản? <a href="/login">Đăng nhập ngay</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
