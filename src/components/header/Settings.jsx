import React, { useState, useEffect } from 'react';
import { Input, Button, Modal, message, Row, Col, Card, Spin } from 'antd';
import axiosClient from '../../axiosClient';
import './Settings.css'; // Đảm bảo CSS được nhập đúng
import Info from '../../assets/icons/avatar.jpg';

const Settings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Change password
  const handleChangePassword = () => {
    message.success('Mật khẩu đã được thay đổi thành công!');
    setIsModalVisible(false);
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
  };

  // Handle modal cancellation
  const handleCancel = () => {
    setIsModalVisible(false);
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
                    <p><strong>Họ Tên:</strong> <span style={{marginLeft:"40px"}}>{userInfo?.name || 'Chưa có thông tin'}</span></p>
                    <p><strong>Email:</strong> <span style={{marginLeft:"50px"}}>{userInfo?.email || 'Chưa có thông tin'}</span></p>
                    <p><strong>Ngày sinh:</strong> <span style={{marginLeft:"15px"}}>{userInfo?.dob || 'Chưa có thông tin'}</span></p>
                    <p><strong>Giới tính:</strong> <span style={{marginLeft:"25px"}}>{userInfo?.gender || 'Chưa có thông tin'}</span></p>
                    <p><strong>Nơi cư trú:</strong> <span style={{marginLeft:"13px"}}>{userInfo?.residence || 'Chưa có thông tin'}</span></p>
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
        title="Đổi Mật Khẩu"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        bodyStyle={{
          backgroundColor: '#f7f7f7',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
        <div className="password-change-form">
          <Input.Password placeholder="Mật khẩu mới" style={{ marginBottom: '10px' }} />
          <Button
            type="primary"
            onClick={handleChangePassword}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              width: '100%',
              fontSize: '16px',
              padding: '12px',
            }}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
