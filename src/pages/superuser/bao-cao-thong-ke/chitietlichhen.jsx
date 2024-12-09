import React, { useEffect, useState } from 'react';
import axiosClient from '.././../../axiosClient';
import DATA from '../../../assets/icons/no-data.png';
import './chitietlichhen.css';
import { Puff } from 'react-loader-spinner';
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; 
import { Button} from "antd";

const AdminGetAppointment = () => {
  const [lichKham, setLichKham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLichKham();
  }, []);
  const getTimeAndDate = (datetime) => {
    if (!datetime) return { time: '', date: '' };
    const [time, date] = datetime.split(' ');
    return { time, date };
  };
  // Helper function to format time from 24-hour to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time) => {
    if (!time) return '';

    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Chuyển đổi giờ thành 12h, đảm bảo 0 giờ thành 12

    return `${hours}:${minutes} ${suffix}`;
  };
  const fetchLichKham = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/appointment/for_admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLichKham(response.data);
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Puff height="60" width="60" color="#00BFFF" ariaLabel="loading-indicator" />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="lichKhamContainer">
       <Button
          type="primary"
          icon={<LeftOutlined />}
          onClick={() => navigate(-1)} // Quay lại trang trước
          style={{
            top:"55px",
            marginLeft: "10px",
            backgroundColor: "#007aff",
            borderColor: "#52c41a",
            color: "#fff",
          }}
        >
          Quay lại
        </Button>
      <div className='title'>
        <h1>Lịch khám</h1>
      </div>
      <table className="lichKhamTable">
        <thead>
          <tr>
            <th>
              Mã khám bệnh
            </th>
            <th>Ngày khám</th>
            <th>Thời gian bắt đầu</th>
            <th>Thời gian kết thúc</th>
            <th>Mô tả</th>
            <th>Bác sĩ</th>
            <th>Trạng thái</th>
            <th>Phòng khám</th>
          </tr>
        </thead>
        <tbody>
          {lichKham.length > 0 && (
            lichKham.map((appointment) => {
              const { time: startTime, date: startDate } = getTimeAndDate(appointment.start_time);
              const { time: endTime } = getTimeAndDate(appointment.end_time || '');

              return (
                <tr key={appointment.id} onClick={() => {
                }}>
                  <td>{appointment.id}</td>
                  <td>{startDate}</td>
                  <td>{formatTimeTo12Hour(startTime)}</td>
                  <td>{formatTimeTo12Hour(endTime) || ' '}</td>
                  <td className="description">{appointment.description}</td>
                  <td>{appointment.doctor_name || ' '}</td>
                  <td>
                    {appointment.status === "UNPROCESSED"
                      ? "Chưa xử lý"
                      : appointment.status === "PROCESSED"
                        ? "Đã xử lý"
                        : appointment.status}
                  </td>
                  <td>{appointment.doctor_clinic || ' '}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {lichKham.length === 0 && (
        <div colSpan="8" className="noData">
          <img src={DATA} alt="Không có dữ liệu" className="noDataImage" />
          <span>Không có thông tin khám bệnh nào.</span>
        </div>
      )}

    </div>
  );
};

export default AdminGetAppointment;

