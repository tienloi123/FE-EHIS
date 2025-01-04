import React, { useState } from 'react';
import './BookingAppointment.css';
import { toast } from 'react-toastify';
import axiosClient from '../../axiosClient';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from 'antd';
const BookingAppointment = () => {
  const [description, setSymptoms] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const navigate = useNavigate();
  const startTime = `${appointmentTime}:00 ${appointmentDate.split('-').reverse().join('/')}`;

  // Lấy ngày hiện tại (theo định dạng yyyy-mm-dd)
  const today = new Date();
  today.setHours(today.getHours() + 7); // Thêm 7 giờ để phù hợp với múi giờ +7
  const todayString = today.toISOString().split('T')[0];

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Format start_time as hh:mm:ss dd/mm/yyyy
    // Retrieve token from localStorage
    const token = localStorage.getItem('access_token');

    try {
      await axiosClient.post('/appointment', {
        description,
        start_time: startTime
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    navigate('/', {
      state: {
        notify: {
          type: 'success',
          message: 'Đặt lịch thành công!',
        },
      },
    });
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error('Mã truy cập đã hết hạn');
        } else if (status === 400) {
          toast.error('Mã truy cập không hợp lệ');
        } else if (status === 405) {
          toast.error('Tài nguyên được yêu cầu thuộc về bệnh nhân');
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
      }
    }
  };

  return (
    <div className="booking-container">
      <h2>Đặt lịch hẹn</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="symptoms">Triệu chứng bệnh</label>
          <Input.TextArea
          style={{resize: "none",height: "120px"}}
            id="description"
            value={description}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Nhập triệu chứng bệnh"
            rows={4} // Đặt chiều cao cho TextArea
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="appointmentDate">Ngày hẹn</label>
          <input
            type="date"
            id="appointmentDate"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={todayString} // Chỉ cho phép chọn ngày từ hôm nay trở đi
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="appointmentTime">Giờ hẹn</label>
          <input
            type="time"
            id="appointmentTime"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="booking-button">Đặt lịch hẹn</button>
      </form>
    </div>
  );
};

export default BookingAppointment;
