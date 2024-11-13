import React, { useEffect, useState } from 'react';
import axiosClient from './../../axiosClient';
import DATA from '../../assets/icons/no-data.png';
import APPOINTMENT from '../../assets/icons/appointment.png';
import './appointment.css';
import Close from '../../assets/icons/arrow.png';
import Info from '../../assets/icons/info.png';
import { Puff } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const GetAppointment = () => {
  const [lichKham, setLichKham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Trạng thái cho modal
  const [data, setDoctors] = useState([]); // State cho danh sách bác sĩ
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [customEndTime, setCustomEndTime] = useState(''); // State cho thời gian đặt lịch
  // Danh sách khoa
  const departments = [
    'Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi', 'Khoa Da Liễu',
    'Khoa Mắt', 'Khoa Tai Mũi Họng', 'Khoa Răng Hàm Mặt',
    'Khoa Chẩn Đoán Hình Ảnh', 'Khoa Cấp Cứu'
  ]; // Danh sách 10 khoa
  useEffect(() => {
    fetchLichKham();
  }, []);
  const getTimeAndDate = (datetime) => {
    if (!datetime) return { time: '', date: '' };
    const [time, date] = datetime.split(' ');
    return { time, date };
  };

  const getDate = (datetime) => {
    if (!datetime) return { time: '', date: '' };
    const [time, date] = datetime.split(' ');

    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return { time, date: formattedDate };
  };
  const calculateEndTime = () => {
    if (!customEndTime) return '';

    // Chuyển giá trị `customEndTime` thành đối tượng `Date`
    const [hours, minutes] = customEndTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes, 0);

    // Thêm 30 phút
    endDate.setMinutes(endDate.getMinutes() + 30);

    // Chuyển thời gian kết thúc về định dạng `HH:MM`
    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
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
  const convertToCustomFormat = (date, time) => {
    // Chuyển đổi `date` từ `dd/mm/yyyy` sang `yyyy-mm-dd`
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    // Tạo đối tượng Date mới từ định dạng chuẩn `yyyy-mm-ddThh:mm:ss`
    const dateTime = new Date(`${formattedDate}T${time}`);

    // Kiểm tra nếu `dateTime` không hợp lệ
    if (isNaN(dateTime)) {
      console.error('Invalid Date object:', dateTime);
      return '';
    }

    // Lấy các giá trị giờ, phút, giây, ngày, tháng, năm để định dạng lại
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    const dayOutput = String(dateTime.getDate()).padStart(2, '0');
    const monthOutput = String(dateTime.getMonth() + 1).padStart(2, '0');
    const yearOutput = dateTime.getFullYear();

    return `${hours}:${minutes}:${seconds} ${dayOutput}/${monthOutput}/${yearOutput}`;
  };

  const updateAppointmentEndTime = async () => {
    try {
      // Chuyển đổi `startDate` và `startTime` sang định dạng yêu cầu
      const formattedStartTime = customEndTime ? convertToCustomFormat(getTimeAndDate(selectedAppointment.start_time).date, customEndTime) : '';
      const formattedEndTime = (calculateEndTime()) ? convertToCustomFormat(getTimeAndDate(selectedAppointment.start_time).date, (calculateEndTime())) : '';
      const doctorId = selectedDoctor.doctor?.id;
      const startTime = formattedStartTime;
      const endTime = formattedEndTime; // Nếu có custom thời gian kết thúc thì dùng, nếu không lấy từ hàm tính
      const appointment_id = selectedAppointment.id
      if (!doctorId || !startTime || !endTime) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      await axiosClient.put(`/appointment/${appointment_id}`, {
        doctor_id: doctorId,
        start_time: startTime,
        end_time: endTime,
      });
      fetchLichKham();
      closeModal();
      toast.success('Đặt lịch thành công');
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật');
    }
  };


  const fetchLichKham = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/appointment/for_receptionist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      
      setLichKham(response.data);
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/appointment/doctors', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          department: selectedDepartment,
        },
      });
      setDoctors(response.data);
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy danh sách bác sĩ.');
    }
  };
  const handleDoctorChange = (event) => {
    if (event.target.value === '') {
      return
    }
    setSelectedDoctor(data[parseInt(event.target.value)])
  };


  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setSelectedDepartment(department);
    setDoctors([]); // Clear the previous doctor list when department changes
  };
  const handleDoctorDropdownClick = () => {
    if (selectedDepartment) {
      fetchDoctors();
    }
  };

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment); // Lưu dữ liệu của appointment được chọn
  };

  const closeModal = () => {
    setSelectedAppointment(null); // Đóng modal
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
      <div className='title'>
        <h1>Lịch khám</h1>
        <img src={APPOINTMENT} alt='AppointmentImage' className="appointmenImage" />
      </div>
      <table className="lichKhamTable">
        <thead>
          <tr>
            <th>
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
                <tr key={appointment.id} onClick={() => {
                  handleRowClick(appointment)
                  setSelectedDoctor(null)
                }}>
                  <td>
                    <div>{created_Time}</div>
                    <div style={{ margin: '10px' }}>{created_Date}</div>
                  </td>
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

      {/* Modal cho chi tiết appointment */}
      {selectedAppointment && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div colSpan="8" className="Detail">
              <img src={Info} alt="" className="DetailImage" />
              <span>Chi tiết lịch khám</span>
            </div>

            <p style={{ marginTop: '30px' }}>
              <strong>Ngày đặt: </strong>
              <input type="text" value={getDate(selectedAppointment.created_at).date} className="staticInput" readOnly />
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Ngày khám: </strong>
              <input type="text" value={getTimeAndDate(selectedAppointment.start_time).date} className="staticInput" readOnly />
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Thời gian yêu cầu: </strong>
              <input type="text" value={formatTimeTo12Hour(getTimeAndDate(selectedAppointment.start_time).time)} className="staticInput" readOnly />
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Mô tả: </strong>
              <input type="text" value={selectedAppointment.description} className="staticInput" readOnly />
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Chọn khoa: </strong>
              <select id="department-select" onChange={handleDepartmentChange} value={selectedDepartment}>
                <option value="">Tất cả khoa</option>
                {departments.map((department, index) => (
                  <option key={index} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Bác sĩ: </strong>
              <select onClick={handleDoctorDropdownClick} onChange={handleDoctorChange}>
                <option value="">Chọn bác sĩ</option>
                {data.map((dataItem, index) => (
                  <option key={dataItem.doctor.id} value={index}>
                    {dataItem.doctor.name} - {dataItem.appointments && dataItem.appointments.length > 0 && dataItem.appointments[dataItem.appointments.length - 1]?.end_time ? dataItem.appointments[dataItem.appointments.length - 1].end_time : 'Trống Lịch'}
                  </option>
                ))}
              </select>
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Trạng thái: </strong>
              <input type="text" value={selectedAppointment.status === "UNPROCESSED" ? "Chưa xử lý" : "Đã xử lý"} className="staticInput" readOnly />
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Phòng khám: </strong>
              <input type="text" value={selectedDoctor?.doctor.clinic_location} className="staticInput" readOnly />
            </p>
            <p style={{ marginTop: '17px' }}>
              <strong>Thời gian đặt lịch: </strong>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                placeholder="Nhập thời gian đặt lịch"
              />
            </p>
            <p style={{ marginTop: '17px' }}>
              <strong>Thời gian kết thúc: </strong>
              <input type="text" value={formatTimeTo12Hour(calculateEndTime())} className="staticInput" readOnly />
            </p>

            <button onClick={closeModal} style={{ float: 'right' }} className="closeButton">
              <img src={Close} alt="" className="CloseImage" />
            </button>
            <button onClick={updateAppointmentEndTime} style={{ float: 'left' }} className="confirmButton">
              <span style={{ fontFamily: 'monospace', fontSize: '16px', color: 'green' }}>Confirm</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GetAppointment;

