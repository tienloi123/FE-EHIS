import React, { useState, useEffect } from 'react';
import './Home.css';
import './../all.css';
import SliderHome from '../../components/home/SliderHome';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
  const [scrollTopVisible, setScrollTopVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setScrollTopVisible(true);
      } else {
        setScrollTopVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className='home-container'>
      <SliderHome />
      <section className='home-content'>
        <div className='intro'>
          <h1>Chào mừng đến với Hệ thống Quản lý Hồ sơ Bệnh án</h1>
          <p>
            Chúng tôi cung cấp giải pháp toàn diện cho việc quản lý hồ sơ bệnh án của bạn.
            Với hệ thống của chúng tôi, bạn có thể dễ dàng theo dõi và quản lý thông tin bệnh án,
            hẹn khám, và nhận thông báo quan trọng ngay lập tức.
          </p>
        </div>
        <div className='features'>
          <h2>Tính năng nổi bật</h2>
          <ul>
            <li><strong>Quản lý hồ sơ bệnh án:</strong> Dễ dàng quản lý thông tin bệnh án và lịch sử điều trị.</li>
            <li><strong>Hẹn khám:</strong> Đặt lịch hẹn nhanh chóng và nhận thông báo tự động.</li>
            <li><strong>Thông báo kịp thời:</strong> Nhận thông báo về lịch khám và các thông tin quan trọng.</li>
            <li><strong>Tích hợp AI:</strong> Phân tích dữ liệu và dự đoán các vấn đề sức khỏe tiềm ẩn.</li>
          </ul>
        </div>
        <div className='video-section'>
          <h2>Giới thiệu về hệ thống</h2>
          <div className='video-container'>
            <video autoPlay muted loop>
              <source src="./videos/intro.mp4" type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          </div>
        </div>
        <div className='cta'>
          <h2>Hãy bắt đầu ngay hôm nay!</h2>
          <p>Đăng ký tài khoản để trải nghiệm tất cả các tính năng tuyệt vời của chúng tôi.</p>
          <a href="/register" className='cta-button'>Đăng ký ngay</a>
        </div>
        <div>
          <img src="./images/BFTET.png" alt="" className='imageFooter'/>
        </div>
      </section>

      {scrollTopVisible && (
        <div className='scroll-to-top'>
          <button onClick={scrollToTop} className='scroll-button'>
            <i className="fas fa-chevron-up"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
