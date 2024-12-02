import React, { useState, useEffect } from 'react';
import { Input, Button, Modal, message, Row, Col, Card, Spin } from 'antd';
import axiosClient from '../../axiosClient';
import './Settings.css'; // Đảm bảo CSS được nhập đúng
import Info from '../../assets/icons/avatar.jpg';

const Settings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verify OTP, Step 3: Enter new password
  const [oldPassword, setOldPassword] = useState(''); // Mật khẩu cũ
  const [newPassword, setNewPassword] = useState(''); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(''); // Xác nhận mật khẩu mới

  // Gửi mã OTP
  const sendOtp = async () => {
    try {
      // Giả sử backend gửi OTP qua email
      await axiosClient.post('/auth/send-otp');
      message.info('OTP đã được gửi đến email của bạn.');
    } catch (error) {
      message.error('Không thể gửi OTP. Vui lòng thử lại!');
      console.error(error);
    }
  };

  // Xác thực OTP
  const verifyOtp = async () => {
    try {
      console.log(otp)
      await axiosClient.post('/auth/verify-otp', { otp });
      message.success('Xác thực OTP thành công! Hãy nhập mật khẩu mới.');
      setStep(2); // Chuyển sang bước nhập mật khẩu mới
    } catch (error) {
      message.error('OTP không hợp lệ hoặc đã hết hạn.');
      console.error(error);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error('Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.');
      return;
    }

    try {
      await axiosClient.post('/auth/change-password', { oldPassword, newPassword });
      message.success('Mật khẩu đã được thay đổi thành công!');
      setIsModalVisible(false);
      resetModalState(); // Reset lại trạng thái modal
    } catch (error) {
      message.error('Mật khẩu cũ không đúng. Vui lòng thử lại!');
      console.error(error);
    }
  };

  const resetModalState = () => {
    setStep(1);
    setOtp('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Fetch user info
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('user/profile');
      setUserInfo(response.data);
    } catch (error) {
      message.error('Không thể tải thông tin người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Open password modal
  const showPasswordModal = () => {
    setIsModalVisible(true);
    sendOtp()

  };

  // Handle modal cancellation
  const handleCancel = () => {
    setIsModalVisible(false);
    resetModalState();
  };

  return (
    <div className="settings-container">
      <Row gutter={16}>
        {/* User Profile Section */}
        <Col span={8}>
          <div className="profile-card">
            <Card
              title="Thông tin cá nhân"
              bordered
              style={{ textAlign: 'center', backgroundColor: '#f0f2f5', borderRadius: '10px' }}
            >
              <div className="user-profile">
                <img src={Info} className="avatar" alt="User Avatar" />
                {loading ? (
                  <Spin size="large" />
                ) : (
                  <>
                    <p><strong>Họ Tên:</strong> <span style={{ marginLeft: "40px" }}>{userInfo?.name || 'Chưa có thông tin'}</span></p>
                    <p><strong>Email:</strong> <span style={{ marginLeft: "50px" }}>{userInfo?.email || 'Chưa có thông tin'}</span></p>
                    <p><strong>Ngày sinh:</strong> <span style={{ marginLeft: "15px" }}>{userInfo?.dob || 'Chưa có thông tin'}</span></p>
                    <p><strong>Giới tính:</strong> <span style={{ marginLeft: "25px" }}>{userInfo?.gender || 'Chưa có thông tin'}</span></p>
                    <p><strong>Nơi cư trú:</strong> <span style={{ marginLeft: "13px" }}>{userInfo?.residence || 'Chưa có thông tin'}</span></p>
                    <Button
                      type="primary"
                      onClick={showPasswordModal}
                      style={{
                        marginTop: '20px',
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        padding: '8px 20px',
                      }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Password Change Modal */}
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
        {step === 2 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}>
            <Input.Password
              placeholder="Mật khẩu cũ"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              style={{ marginBottom: '10px' }}
            />
            <Input.Password
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              style={{ marginBottom: '10px' }}
            />
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={{ marginBottom: '10px' }}
            />
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                width: '100%',
                fontSize: '16px',
                padding: '12px',
              }}
              disabled={!oldPassword || !newPassword || !confirmPassword}
            >
              Đổi mật khẩu
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Settings;
