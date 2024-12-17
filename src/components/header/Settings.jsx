import React, { useState, useEffect } from 'react';
import { Input, Button, Modal, message, Row, Col, Card, Spin, Form } from 'antd';
import axiosClient from '../../axiosClient';
import './Settings.css'; // Ensure CSS is properly imported
import Info from '../../assets/icons/avatar.jpg';

const Settings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(Info); // Avatar mặc định


  // Simulating user data (since no API call is being made here for demonstration)
  // Fetch user info
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('user/profile');
      setUserInfo(response.data);
      console.log(response.data.avatar_url)
      setAvatar(response.data.avatar_url || Info);
    } catch (error) {
      message.error('Không thể tải thông tin người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const sendOtp = async () => {
    try {
      await axiosClient.post('/auth/send-otp');
      message.info('OTP đã được gửi đến email của bạn.');
    } catch (error) {
      message.error('Không thể gửi OTP. Vui lòng thử lại!');
    }
  };

  const verifyOtp = async () => {
    try {
      await axiosClient.post('/auth/verify-otp', { otp });
      message.success('Xác thực OTP thành công! Hãy nhập mật khẩu mới.');
      setStep(2);
    } catch (error) {
      message.error('OTP không hợp lệ hoặc đã hết hạn.');
    }
  };

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
      resetModalState();
    } catch (error) {
      message.error('Mật khẩu cũ không đúng. Vui lòng thử lại!');
    }
  };

  const resetModalState = () => {
    setStep(1);
    setOtp('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    fetchUserInfo();  // Assign the simulated user info
  }, []);

  const showPasswordModal = () => {
    setIsModalVisible(true);
    sendOtp();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    resetModalState();
  };
  const handleUploadAvatar = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) {
      return;
    }

    // Validate file size and type
    if (!['image/png', 'image/jpeg'].includes(uploadedFile.type)) {
      message.error('File không hợp lệ. Chỉ chấp nhận PNG, JPG.');
      return;
    }

    // Display preview
    const imageURL = URL.createObjectURL(uploadedFile);
    setAvatar(imageURL);

    // Upload file
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axiosClient.post('/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      window.location.reload();
      message.success('Ảnh đại diện đã được cập nhật!');
      setUserInfo((prev) => ({ ...prev, avatar: response.data.avatar }));
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    }
  };
  return (
    <div className="settings-container">
      <Row gutter={16}>
        <Col span={8}>
          <Card
            title="Thông tin cá nhân"
            bordered={false}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '15px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <div className="user-profile">
              {loading ? (
                <Spin size="large" />
              ) : (
                <>
                  <div className="profile-upload" style={{ display: "flex", justifyContent: "start", width: "70%", gap: "20px" }}>
                    <img
                      src={avatar}
                      className="avatar"
                      alt="User Avatar"
                      style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                    />

                    <div>
                      <p><strong>Ảnh đại diện</strong></p>
                      <p style={{ fontSize: "x-small", width: "200px" }}>Loại tệp được chấp nhận .png, .jpg.</p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleUploadAvatar}
                        style={{ display: 'none' }}
                        id="fileInput"
                      />
                      <Button
                        type="primary"
                        onClick={() => document.getElementById('fileInput').click()}
                        style={{
                          display: "flex",
                          justifyContent: "start",
                          height: "25%",
                          marginLeft: "0px",
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>

                  <Form
                    style={{ marginLeft: "70px" }}
                    layout="vertical"
                    initialValues={{
                      name: userInfo?.name || '',
                      email: userInfo?.email || '',
                      dob: userInfo?.dob || '',
                      gender: userInfo?.gender || '',
                      residence: userInfo?.residence || '',
                      role: userInfo?.role || '',
                    }}
                  >

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Họ Tên" name="name">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Email" name="email">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Ngày sinh" name="dob">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Giới tính" name="gender">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Nơi cư trú" name="residence">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Vai trò" name="role">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                    </Row>

                  </Form>
                  <Button
                    type="primary"
                    onClick={showPasswordModal}
                    style={{
                      marginTop: '20px',
                      backgroundColor: '#1890ff',
                      borderColor: '#1890ff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      padding: '10px 25px',
                      borderRadius: '25px',
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={step === 1 ? 'Xác thực OTP' : 'Nhập mật khẩu mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        bodyStyle={{ backgroundColor: '#f7f7f7', borderRadius: '10px' }}
        style={{
          maxWidth: '500px',
          borderRadius: '10px',
        }}
      >
        {step === 1 && (
          <div className="otp-verification-form">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{
                marginBottom: '10px',
                borderRadius: '8px',
                padding: '10px',
              }}
              placeholder="Nhập mã OTP"
            />
            <Button
              type="primary"
              onClick={verifyOtp}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                width: '100%',
                fontSize: '16px',
                padding: '12px',
                borderRadius: '8px',
              }}
              disabled={otp.length !== 6}
            >
              Xác thực OTP
            </Button>
          </div>
        )}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
            <Input.Password
              placeholder="Mật khẩu cũ"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              style={{ marginBottom: '10px', borderRadius: '8px', padding: '10px' }}
            />
            <Input.Password
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              style={{ marginBottom: '10px', borderRadius: '8px', padding: '10px' }}
            />
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={{ marginBottom: '20px', borderRadius: '8px', padding: '10px' }}
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
                borderRadius: '8px',
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
