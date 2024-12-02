import React, { useEffect, useState, useContext } from 'react';
import axiosClient from '../../axiosClient';
import DATA from '../../assets/icons/no-data.png';
import APPOINTMENT from '../../assets/icons/appointment.png';
import Info from '../../assets/icons/info.png';
import './doctor_appointment.css';
import { Puff } from 'react-loader-spinner';
import { AuthContext } from '../../context/AuthContext';
import { Input, Checkbox, Form, Popconfirm, Modal } from 'antd';
import { toast } from 'react-toastify';
const DoctorAppointments = () => {

  const { user_id } = useContext(AuthContext);
  const [lichKham, setLichKham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Trạng thái cho modal
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [status_step, setStatusStep] = useState(false); // State cho thời gian đặt lịch
  const [showTestFields, setShowTestFields] = useState(false);
  const [showContinueFields, setShowContinueFields] = useState(false);
  const [image, setImage] = useState(null);
  const [appointment_id, setAppointmentId] = useState(null);
  const [customEndTime, setCustomEndTime] = useState(''); // State cho thời gian đặt lịch
  const [data, setDoctors] = useState([]); // State cho danh sách bác sĩ
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [SelectedAppointmentDetail, setSelectedAppointmentDetail] = useState(null); // Trạng thái cho modal
  const [BooleantDetail, SelectBooleantDetail] = useState(false);
  // Danh sách khoa
  const departments = [
    'Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi', 'Khoa Da Liễu',
    'Khoa Mắt', 'Khoa Tai Mũi Họng', 'Khoa Răng Hàm Mặt',
    'Khoa Chẩn Đoán Hình Ảnh', 'Khoa Cấp Cứu'
  ]; // Danh sách 10 khoa
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
  const handleDoctorChange = (event) => {
    if (event.target.value === '') {
      return
    }
    setSelectedDoctor(data[parseInt(event.target.value)])
  };
  const convertToCustomFormat = (date, time) => {
    // Chuyển đổi `date` từ `dd/mm/yyyy` sang `yyyy-mm-dd`
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    // Tạo đối tượng Date mới từ định dạng chuẩn `yyyy-mm-ddThh:mm:ss`
    const dateTime = new Date(`${formattedDate}T${time}`);

    // Kiểm tra nếu `dateTime` không hợp lệ
    if (isNaN(dateTime)) {
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
  const UpdateAppointmentOther = async () => {
    try {
      // Chuyển đổi `startDate` và `startTime` sang định dạng yêu cầu
      const formattedStartTime = customEndTime ? convertToCustomFormat(getTimeAndDate(SelectedAppointmentDetail.start_time).date, customEndTime) : '';
      const formattedEndTime = (calculateEndTime()) ? convertToCustomFormat(getTimeAndDate(SelectedAppointmentDetail.start_time).date, (calculateEndTime())) : '';
      const startTime = formattedStartTime;
      const endTime = formattedEndTime; // Nếu có custom thời gian kết thúc thì dùng, nếu không lấy từ hàm tính
      const appointment_id = SelectedAppointmentDetail.id
      const doctorId = data[0]?.doctor?.id;
      if (!doctorId || !startTime || !endTime) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      await axiosClient.put(`/appointment/doctor/${appointment_id}`, {
        doctor_id: doctorId,
        start_time: startTime,
        end_time: endTime,
      });
      fetchLichKham();
      closeDetailModal();
      closeModal();
      setFormData({
        diagnosis: '',
        prescription: '',
        payment_amount: '',
        test_name: '',
        test_room: '',
        test_result: '',
      })
      setStatusStep(false);
      toast.success('Đặt lịch thành công');
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật');
    }
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
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/appointment/doctors/me', {
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
  const [formData, setFormData] = useState({
    diagnosis: '',
    prescription: '',
    payment_amount: '',
    test_name: '',
    test_room: '',
    test_result: '',
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setShowTestFields(e.target.checked);
  };
  useEffect(() => {
    fetchLichKham();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
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
  const handleConfirmClick = async () => {
    setAppointmentId(selectedAppointment.id)
    if (selectedAppointment.confirmed_by_doctor_id === user_id && !status_step) {
      setLoading(true);
      if (!image) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng chọn ảnh để tiếp tục.',
        });
        setLoading(false); // Dừng loading nếu không có ảnh
        return; // Dừng hàm nếu không có ảnh
      }
      CreateMedical()
      updateAppointmentEndTime(); // This will confirm the appointment
      toast.success('Hồ sơ bệnh án đã được tạo thành công!');
    } else {
      const medicalDoctorResponse = await CreateMedicalDoctor();
      toast.success('Hồ sơ bệnh án bác sĩ đã được tạo thành công!');
      if (showTestFields) {
        CreateMedicalTest(medicalDoctorResponse.data.id); // Truyền ID từ medical record doctor để liên kết
      }
      closeModal();
      setShowContinueFields(true)
    }
  };
  // Hàm xử lý khi nhấn "Kết thúc"
  const handleEndAppointment = async () => {
    setLoading(true);
    await EndAppointment();
    fetchLichKham();
    setShowContinueFields(false);
    setStatusStep(false);
    toast.success("Lịch khám đã được kết thúc thành công!");

  };
  const EndAppointment = async () => {
    try {
      const response = await axiosClient.put(`/appointment/end/${appointment_id}`, {});
      return response;
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
      toast.error("Có lỗi xảy ra khi kết thúc lịch khám.");
    } finally {
      setLoading(false);
    }
  };


  // Hàm xử lý khi nhấn "Tạo lịch khám"
  const handleCreateNewAppointment = () => {
    setShowContinueFields(false)
    SelectBooleantDetail(true)
  };
  const CreateMedicalTest = async (medicalRecordId) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/lab-test', {
        medical_record_doctor_id: medicalRecordId,
        test_name: formData.test_name,
        department: formData.test_room,
        result_test: formData.test_result,
      });

      return response;
    } catch (error) {
      setError('Có lỗi xảy ra khi tạo xét nghiệm.');
      throw error; // Đẩy lỗi để hàm `handleConfirmClick` xử lý
    } finally {
      setLoading(false);
    }
  };


  async function CreateMedicalDoctor() {
    setLoading(true);
    try {
      const response = await axiosClient.post('/medical-record-doctor', {
        appointment_id: selectedAppointment.id,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        payment_amount: parseFloat(formData.payment_amount),
      });
      return response
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const CreateMedical = async () => {
    try {
      // Tạo FormData để gửi ảnh cùng dữ liệu
      const formData = new FormData();
      formData.append('file', image); // Thêm ảnh vào FormData

      // Thêm các thông tin khác vào formData
      formData.append('appointment_id', selectedAppointment.id);
      formData.append('patient_id', selectedAppointment.patient_id);
      formData.append('doctor_id', user_id);
      // Gửi dữ liệu lên backend
      await axiosClient.post('/medical-record', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    } catch (err) {
      setError('Có lỗi xảy ra khi tạo bệnh án.');
    } finally {
      setLoading(false);
    }
  };


  const updateAppointmentEndTime = async () => {
    setStatusStep(true)
    closeModal()
    setTimeout(() => handleRowClick(selectedAppointment), 0);
  };

  const fetchLichKham = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosClient.get('/appointment/for_doctor', {
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

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment); // Lưu dữ liệu của appointment được chọn
    setSelectedAppointmentDetail(appointment)


  };

  const closeModal = () => {
    setSelectedAppointment(null); // Đóng modal
  };
  const closeDetailModal = () => {
    setSelectedAppointmentDetail(null);
    SelectBooleantDetail(false)

  };
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };


  const handlePopConfirmRender = () => {
    return (
      <Popconfirm
        title={
          selectedAppointment.confirmed_by_doctor_id === user_id && !status_step
            ? "Tạo hồ sơ bệnh án"
            : "Tạo hồ sơ bệnh án bác sĩ"
        }
        onConfirm={handleConfirmClick}
        onCancel={closeModal}
        okText="Xác nhận"
        cancelText="Đóng"
        visible={!!selectedAppointment}
        description={
          selectedAppointment.confirmed_by_doctor_id === user_id && !status_step ? (
            <div>
              <h2>Upload Image</h2>
              <form>
                <input type="file" onChange={handleImageChange} />
              </form>
            </div>
          ) : (
            <div>
              <Form>
                {/* Chuẩn đoán */}
                <Form.Item label="Chuẩn đoán" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Input style={{ width: '30%' }} placeholder="Nhập chuẩn đoán" onChange={handleInputChange} name='diagnosis' value={formData.diagnosis} />
                </Form.Item>

                {/* Đơn thuốc */}
                <Form.Item label="Đơn thuốc" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Input style={{ width: '30%' }} placeholder="Nhập đơn thuốc" onChange={handleInputChange} name='prescription' value={formData.prescription} />
                </Form.Item>

                {/* Giá tiền */}
                <Form.Item label="Giá tiền" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Input style={{ width: '30%' }} onChange={handleInputChange} placeholder="Nhập giá tiền khám bệnh" name='payment_amount' value={formData.payment_amount} />
                </Form.Item>

                {/* Checkbox Tạo xét nghiệm */}
                <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Checkbox
                    checked={showTestFields}
                    onChange={handleCheckboxChange}
                  >
                    <strong>Tạo xét nghiệm</strong>
                  </Checkbox>
                </Form.Item>

                {/* Additional fields for test when checkbox is selected */}
                {showTestFields && (
                  <div style={{ marginTop: '10px' }}>
                    <Form.Item label="Tên xét nghiệm" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                      <Input style={{ width: '30%' }} placeholder="Nhập tên xét nghiệm" onChange={handleInputChange} name='test_name' value={formData.test_name} />
                    </Form.Item>

                    <Form.Item label="Phòng xét nghiệm" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                      <Input style={{ width: '30%' }} placeholder="Nhập phòng xét nghiệm" onChange={handleInputChange} name='test_room' value={formData.test_room} />
                    </Form.Item>

                    <Form.Item label="Kết quả xét nghiệm" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                      <Input style={{ width: '30%' }} placeholder="Nhập kết quả xét nghiệm" onChange={handleInputChange} name='test_result' value={formData.test_result} />
                    </Form.Item>
                  </div>
                )}
              </Form>
            </div>
          )
        }
      />
    );
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
              Mã khám bệnh
            </th>
            <th>Tên bệnh nhân</th>
            <th>Ngày sinh</th>
            <th>Ngày khám</th>
            <th>Thời gian bắt đầu</th>
            <th>Thời gian kết thúc</th>
            <th>Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {lichKham.length > 0 && (
            lichKham.map((appointment) => {
              const { time: startTime, date: startDate } = getTimeAndDate(appointment.start_time);
              const { time: endTime } = getTimeAndDate(appointment.end_time || '');

              return (
                <tr key={appointment.id} onClick={() => {
                  handleRowClick(appointment)
                  setSelectedDoctor(null)
                }}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patient_name || ' '}</td>
                  <td>{formatDate(appointment.patient_dob) || ' '}</td>
                  <td>{startDate}</td>
                  <td>{formatTimeTo12Hour(startTime)}</td>
                  <td>{formatTimeTo12Hour(endTime) || ' '}</td>
                  <td className="description">{appointment.description}</td>
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
      {selectedAppointment && handlePopConfirmRender()}

      <Popconfirm
        open={showContinueFields}
        title="Bạn muốn làm gì tiếp theo?"
        onConfirm={handleCreateNewAppointment} // Xử lý hành động kết thúc  
        onCancel={handleEndAppointment} // Xử lý hành động tạo lịch khám mới
        okText="Tạo lịch khám"
        cancelText="Kết thúc"
      >
      </Popconfirm>
      {SelectedAppointmentDetail && BooleantDetail && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div colSpan="8" className="Detail">
              <img src={Info} alt="" className="DetailImage" />
              <span>Lịch khám tiếp theo</span>
            </div>
            <p style={{ marginTop: '17px' }}>
              <strong>Tên bệnh nhân: </strong>
              <input type="text" value={SelectedAppointmentDetail.patient_name} className="staticInput" readOnly />
            </p>

            <p style={{ marginTop: '17px' }}>
              <strong>Thời gian đặt lịch hiện tại: </strong>
              <input type="text" value={formatTimeTo12Hour(getTimeAndDate(SelectedAppointmentDetail.start_time).time)} className="staticInput" readOnly />
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
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={UpdateAppointmentOther} className="confirmButton">
                <span style={{ fontFamily: 'monospace', fontSize: '16px', color: 'green' }}>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorAppointments;

