import React, {useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import { Input, Button, Modal, message} from 'antd';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [user_id, setUser_id] = useState('');
  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verify OTP, Step 3: Enter new password
  const customIcon = <LoadingOutlined style={{ fontSize: 36, color: '#1890ff' }} spin />;
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
  const verifyOtp = async () => {
    try {
      await axiosClient.post('/auth/register-verify-otp', { otp , user_id});
      handleNavigate()
    } catch (error) {
      message.error('OTP không hợp lệ hoặc đã hết hạn.');
      console.error(error);
    }
  };
  const showPasswordModal = async (user_id) => {
    await sendOtp(user_id)
    setIsModalVisible(true);

  };
  // Gửi mã OTP
  const sendOtp = async (user_id) => {
    try {
      setUser_id(user_id)
      // Giả sử backend gửi OTP qua email
      await axiosClient.post('/auth/register-send-otp', {
        user_id: user_id
      })
      message.info('OTP đã được gửi đến email của bạn.');
    } catch (error) {
      message.error('Không thể gửi OTP. Vui lòng thử lại!');
      console.error(error);
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    resetModalState();
  };
  const resetModalState = () => {
    setStep(1);
    setOtp('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.post('auth/register', {
        email,
        password,
        role: 'Patient', // Vai trò cố định
        cccd_id: cccdId,
        name,
        dob,
        gender,
        residence,
      });
      console.log(response)
      await showPasswordModal(parseInt(response.data.id, 10))
    } catch (error) {
      const message = error.response?.data?.detail?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(message, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };
  const handleNavigate = () => {
    navigate('/login', {
      state: {
        notify: {
          type: 'success',
          message: 'Đăng ký thành công',
        },
      },
    });
  }

  return (
    <div className="register-container">
       {/* Bọc toàn bộ giao diện bằng Spin */}
    <Spin spinning={loading} tip="Đang xử lý..." indicator={customIcon} size="large">
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
      </Spin>
      <Modal
        title={step === 1 ? 'Xác thực OTP' : 'Nhập mật khẩu mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        styles={{ body: { backgroundColor: '#f7f7f7', padding: '20px', borderRadius: '10px' } }}
      >
        {step === 1 && (
          <div className="otp-verification-form">
            <Input.OTP length={6} value={otp} onChange={(value) => setOtp(value)} />
            <Button
              type="primary"
              onClick={verifyOtp}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                width: '100%',
                fontSize: '16px',
                padding: '12px',
              }}
              disabled={otp.length !== 6}
            >
              Xác thực OTP
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Register;
