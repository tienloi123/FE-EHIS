import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
        <Link to="/">
          <img src="./images/logo.png" alt="logo" className='logo1' />
        </Link>
          <p>Hệ Thống Quản Lý Hồ Sơ Bệnh Án Điện Tử</p>
        </div>

        <div className="footer-links">
          <ul>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/privacy">Chính sách bảo mật</a></li>
            <li><a href="/terms">Điều khoản sử dụng</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <p>Email: support@ehr-system.com</p>
          <p>Điện thoại: 123-456-789</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Hệ Thống Quản Lý Hồ Sơ Bệnh Án Điện Tử. Tất cả các quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}

export default Footer;
