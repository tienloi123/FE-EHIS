import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import bellIcon from '../../assets/icons/bell-icon.png';
import Avatar from '../../assets/icons/avatar.jpg';
import Eye from '../../assets/icons/eye.png';
import Up from '../../assets/icons/eye2.png';
import axiosClient from './../../axiosClient';
import { AuthContext } from '../../context/AuthContext';
import ToastNotify from '../common/ToastNotify';
import { toast } from 'react-toastify';
import { Popover, Badge, Segmented, Button ,Tooltip, List} from 'antd';
import Pusher from 'pusher-js';
import MarkAsRead from '../../assets/icons/mark-all-as-read.png';

export const Header = () => {
  const { isLoggedIn, logout, role, user, user_id } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingMenuOpen, setBookingMenuOpen] = useState(false);
  const [appointmentMenuOpen, setAppointmentMenuOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);  // Số lượng thông báo
  const [notifications, setNotifications] = useState([]); // Danh sách thông báo
  const [expandedNotification, setExpandedNotification] = useState(null);


  const fetchNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]);  // Nếu chưa đăng nhập, xóa thông báo
      setMessageCount(0);
      return;
    }

    try {
      const response = await axiosClient.get('/notification/get_all'); // Đảm bảo rằng API này trả về đúng định dạng
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
        console.log(response.data)
        setMessageCount(response.data.filter(notificationItem => !notificationItem.is_seen).length); // Đếm số lượng thông báo
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };
  const handleSegmentChange = async (value) => {
    if (value === 'Tất cả') {
      try {
        const response = await axiosClient.get('/notification/get_all'); // Đảm bảo rằng API này trả về đúng định dạng
        if (response.data && Array.isArray(response.data)) {
          setNotifications(response.data);
          console.log(response.data)
          setMessageCount(response.data.filter(notificationItem => !notificationItem.is_seen).length); // Đếm số lượng thông báo
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    } else if (value === 'Chưa đọc') {
      try {
        const response = await axiosClient.get('/notification/message-unread'); // Đảm bảo rằng API này trả về đúng định dạng
        if (response.data && Array.isArray(response.data)) {
          setNotifications(response.data);
          console.log(response.data)
          setMessageCount(response.data.filter(notificationItem => !notificationItem.is_seen).length); // Đếm số lượng thông báo
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axiosClient.put('/notification/mark-all-as-read'); // API của bạn
      console.log('Đã đánh dấu tất cả là đã đọc:', response.data);
      fetchNotifications();
      // Cập nhật lại state hoặc giao diện nếu cần thiết
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };
  const markAsRead = async (notificationId) => {
    try {
      // Tìm thông báo cụ thể trong danh sách
      const notification = notifications.find((item) => item._id === notificationId);

      // Nếu thông báo chưa được đọc, đánh dấu là đã đọc và giảm số lượng chưa đọc
      if (notification && !notification.is_seen) {
        await axiosClient.put(`/notification/mark-as-read/${notificationId}`, { notificationId });

        // Cập nhật trạng thái của thông báo trong state
        setNotifications((prevNotifications) =>
          prevNotifications.map((item) =>
            item._id === notificationId ? { ...item, is_seen: true } : item
          )
        );

        // Giảm số lượng thông báo chưa đọc
        setMessageCount((prevCount) => Math.max(prevCount - 1, 0));
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo là đã đọc:", error);
    }
  };




  useEffect(() => {
    fetchNotifications();
  }, [isLoggedIn]);  // Thêm isLoggedIn vào dependency để khi trạng thái thay đổi, thông báo sẽ được cập nhật

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };
  useEffect(() => {
    requestNotificationPermission();
    // Thiết lập kết nối với Pusher khi component được mount
    const pusher = new Pusher('fedafb8feb81afa00009', {
      cluster: 'ap1',
    });
    const channelName = `${user_id}`; // Tạo tên channel dựa trên ID người dùng
    const channel = pusher.subscribe(channelName);

    // Lắng nghe sự kiện 'notification' từ Pusher
    channel.bind('notification', (data) => {
      const formattedDate = new Date(data.start_date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Lấy ngày hiện tại và chuyển đổi thành định dạng "DD/MM/YYYY"
      const currentDate = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      // Thêm thông báo vào danh sách notifications
      setNotifications((prevNotifications) => [
        {
          title: data.title,
          description: data.description,
          doctor: data.doctor,
          start_date: data.formattedDate,
          start_time: data.start_time,
          is_seen: false,
          created_at: currentDate,
        },
        ...prevNotifications,
      ]);

      setMessageCount((prevCount) => prevCount + 1);

      toast.info(
        <div className="notification-toast">
          <h4 className="toast-title">{data.title}</h4>
          <p><strong>Bác sĩ:</strong> {data.doctor.name}</p>
          <p><strong>Phòng khám:</strong> {data.doctor.clinic_location}</p>
          <p><strong>Ngày khám:</strong> {data.start_date}</p>
          <p><strong>Thời gian:</strong> {data.start_time}</p>
        </div>,
        {
          position: 'bottom-left',
          autoClose: 10000,
        }
      );
      // Đẩy thông báo lên trình duyệt với thiết kế hợp lý
      if (Notification.permission === 'granted') {
        const notification = new Notification(data.title, {
          body: `🩺 Bác sĩ: ${data.doctor.name}\n🏥 Phòng khám: ${data.doctor.clinic_location}\n📅 Ngày khám: ${formattedDate}\n⏰ Thời gian: ${data.start_time}`,
          icon: '../../assets/icons/notification-icon.png', // Thay thế với đường dẫn tới icon của bạn
          badge: '../../assets/icons/notification-badge.png' // (nếu có) icon nhỏ ở góc dưới giúp nhận diện thông báo
        });

        // Tùy chọn: Để thông báo mở trang hoặc làm gì đó khi người dùng click vào
        notification.onclick = () => {
          window.focus(); // Hoặc điều hướng đến trang chi tiết cuộc hẹn
        };
      } else if (Notification.permission === 'default') {
        requestNotificationPermission(); // Gọi lại nếu người dùng chưa cho phép
      }


    });

    return () => {
      pusher.unsubscribe(channelName); // Hủy đăng ký channel khi component bị unmount
    };
  }, [user_id]);

  const handleLogout = async () => {
    try {
      await axiosClient.get('auth/bearer-jwt/logout', {
        withCredentials: true
      });
      logout();
      navigate('/login');
    } catch (error) {
    }
  };

  const handleProtectedLink = (e, link) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.warn("Vui lòng đăng nhập để sử dụng chức năng này");
    } else {
      navigate(link);
    }
  };

  const toggleNotificationDetails = (id) => {
    // Gọi API để đánh dấu thông báo là đã đọc khi nhấn "More"
    if (expandedNotification !== id) {
      markAsRead(id);
    }
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  const content = (
    <div className="popoverContent">
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item key={item._id} className="popoverItem">
            <div className="popoverDetails">
              {/* Đổi màu chấm nếu thông báo đã đọc */}
              {!item.is_seen ? <div className="unreadDot" /> : ''}
              <p><strong>{item.title}</strong></p>
              <p>{item.description}</p>

              {/* Nếu có nội dung mở rộng */}
              {expandedNotification === item._id ? (
                <>
                  <p><strong>Bác sĩ:</strong> {item.doctor_name}</p>
                  <p><strong>Ngày khám:</strong> {item.start_date}</p>
                  <p><strong>Thời gian:</strong> {item.start_time}</p>
                  <p><strong>Phòng khám:</strong> {item.clinic_location}</p>
                  <Button
                    onClick={() => toggleNotificationDetails(item._id)}
                    type='text'
                    icon={<img src={Up} width={20} />}
                    className='button_detail'>
                    Hide
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => toggleNotificationDetails(item._id)}
                  icon={<img src={Eye} width={20} />}
                  className='button_detail'
                  type="text">
                  More
                </Button>
              )}
              <div className="popoverDate">
                {item.created_at}
              </div>
            </div>
          </List.Item>

        )}
      />
    </div>
  );


  return (
    <div className='containerHeader'>
      <ToastNotify />
      <div className='logoHeader'>
        <Link to="/">
          <img src="./images/logo.png" alt="logo" className='logo1' />
        </Link>
      </div>
      <div className='menuHeader'>
        <ul className='menuLi'>
          <li><Link to="/">Trang chủ</Link></li>

          {role === 'Patient' ? (
            <>
              <li className='bookingMenu' onMouseEnter={() => setBookingMenuOpen(true)} onMouseLeave={() => setBookingMenuOpen(false)}>
                <span className='textcolor'>Khám bệnh</span>
                {bookingMenuOpen && (
                  <ul className='dropdownMenu'>
                    <li><Link to="/dat-lich-kham" onClick={(e) => handleProtectedLink(e, '/dat-lich-kham')}>Đặt lịch khám</Link></li>
                    <li><Link to="/xem-lich-kham" onClick={(e) => handleProtectedLink(e, '/lich-kham-cua-toi')}>Xem lịch khám</Link></li>
                  </ul>
                )}
              </li>
              <li><Link to="/ho-so-benh-an" onClick={(e) => handleProtectedLink(e, '/ho-so-benh-an')}>Hồ Sơ Bệnh Án</Link></li>
              <li><Link to="/tin-tuc">Tin tức</Link></li>
            </>
          ) : role === 'Receptionist' && (
            <>
              <li className='bookingMenu' onMouseEnter={() => setAppointmentMenuOpen(true)} onMouseLeave={() => setAppointmentMenuOpen(false)}>
                <span className='textcolor'>Quản lý lịch hẹn</span>
                {appointmentMenuOpen && (
                  <ul className='dropdownMenu'>
                    <li><Link to="/lich-hen-benh-nhan">Lịch hẹn của bệnh nhân</Link></li>
                    <li><Link to="/lich-lam-viec-bac-si">Lịch làm việc của bác sĩ</Link></li>
                  </ul>
                )}
              </li>
              <li><Link to="/thanh-toan">Thanh toán</Link></li>
            </>
          )}
        </ul>
      </div>

      {isLoggedIn ? (
        <div className='userContainer'>
          <div className='notificationContainer'>
            {/* Sử dụng Badge để hiển thị số lượng thông báo */}

            <Popover
              content={content}
              title={
                <div className="notification-read-all-wrapper">
                  <span style={{ fontSize: '20px' }} className="popover-title">
                    Thông báo
                  </span>
                  <div className="DivMarkAsRead">
                    <Tooltip title="Đánh dấu tất cả đã đọc">
                        <img src={MarkAsRead} alt="Mark as Read" className="MarkAsRead" onClick={markAllAsRead}/>
                    </Tooltip>
                    <div>
                      <Segmented
                        defaultValue='Tất cả'
                        options={['Tất cả', 'Chưa đọc']}
                        onChange={handleSegmentChange}
                      />
                    </div>
                  </div>
                </div>
              }
              trigger="click"
            >

              <Badge count={messageCount} offset={[-20, 10]}>
                <img src={bellIcon} alt="" className='bell_icon' />
              </Badge>
            </Popover>
          </div>
          <div className='user_name'>Xin chào, {user}!</div>
          <div className='avatarContainer' onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
            <div className='avatarWrapper'>
              <img src={Avatar} className='avatar' />
              {menuOpen && (
                <div className='dropdownMenu'>
                  <Link to="/settings">Cài đặt</Link>
                  <span onClick={handleLogout}>Đăng xuất</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Link className='LoginLink' to="/login"><div className='LoginButton'>Đăng nhập</div></Link>
      )}
    </div>
  );
};

export default Header;
