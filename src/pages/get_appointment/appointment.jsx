import React, { useEffect, useState } from 'react';
import axiosClient from './../../axiosClient';
import DATA from '../../assets/icons/no-data.png';
import APPOINTMENT from '../../assets/icons/appointment.png';
import './appointment.css'; // Import file CSS
import Filter from '../../assets/icons/filter.png';
// Sử dụng Puff spinner
import { Puff } from 'react-loader-spinner'; 

const GetAppointment = () => {
  const [lichKham, setLichKham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // Trạng thái để lưu thứ tự sắp xếp

  useEffect(() => {
    fetchLichKham(sortOrder);
  }, [sortOrder]); // Thay đổi khi sortOrder thay đổi

  const fetchLichKham = async (order) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/appointment', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          order: order,
        },
      });
      setLichKham(response.data);
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc')); // Chuyển đổi thứ tự
  };

  // Nếu đang loading, hiển thị spinner
  if (loading) {
    return (
      <div className="loading">
        <Puff
          height="60"
          width="60"
          color="#00BFFF"
          ariaLabel="loading-indicator"
        />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const getTimeAndDate = (datetime) => {
    if (!datetime) return { time: '', date: '' };
    const [time, date] = datetime.split(' ');
    return { time, date };
  };
  const getDate = (datetime) => {
    if (!datetime) return { time: '', date: '' };
    const [time, date] = datetime.split(' ');

    // Định dạng ngày theo yêu cầu "10 Oct 2024"
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return { time, date: formattedDate };
  };

  return (
    <div className="lichKhamContainer">
      <div className='title'>
        <h1>Lịch khám</h1>
        <img src={APPOINTMENT} className="appointmenImage" />
      </div>
      <table className="lichKhamTable">
        <thead>
          <tr>
            <th>
              <button className='Filter' onClick={toggleSortOrder}>
                <img src={Filter} alt="Filter" className='Filter_Image' />
              </button>
              Ngày đặt
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
              const { time: created_Time, date: created_Date } = getDate(appointment.created_at);

              return (
                <tr key={appointment.id}>
                  <td>
                    <div>{created_Time}</div>
                    <div style={{ margin: '10px' }}>{created_Date}</div>
                  </td>
                  <td>{startDate}</td>
                  <td>{startTime}</td>
                  <td>{endTime || ' '}</td>
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
            }))}

        </tbody>
      </table>
      {lichKham.length === 0 && <div colSpan="8" className="noData">
        <img src={DATA} alt="Không có dữ liệu" className="noDataImage" />
        <span>Không có thông tin khám bệnh nào.</span>
      </div>}
    </div>
  );
};

export default GetAppointment;
