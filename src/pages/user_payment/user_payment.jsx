import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Button, Space, Segmented, Pagination, Modal, Collapse } from "antd";
import "./user_payment.css";
import axiosClient from "../../axiosClient";


const UserPaymentPage = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0, // Khởi tạo tổng số bản ghi
  });
  const [filterType, setFilterType] = useState("PENDING"); // Mặc định là "Chưa thanh toán"
  const { Panel } = Collapse;

  // Hàm gọi API để lấy dữ liệu thanh toán
  const fetchPayments = useCallback(async (page, pageSize, filter) => {
    try {
      const params = {
        offset: (page - 1) * pageSize, // Cập nhật offset cho chính xác
        limit: pageSize,
      };

      // Thêm tham số `status` nếu filter là "PENDING"
      if (filter === "PENDING") {
        params.status = "PENDING";
      } else {
        delete params.status;
      }

      const response = await axiosClient.get("/payments/user", { params });

      setPaymentList(response.data); // Lấy danh sách từ `data`
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: response.data.meta.total || 0, // Nếu meta không có `total`, dùng giá trị mặc định
      });
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu thanh toán:", err);
    }
  }, [pagination]);

  useEffect(() => {
    fetchPayments(pagination.current, pagination.pageSize, filterType);
  }, [filterType, pagination, fetchPayments]); // Theo dõi toàn bộ đối tượng pagination


  const columns = [
    {
      title: "Tên bệnh nhân",
      dataIndex: "patient_name",
      key: "patient_name",
    },
    {
      title: "Ngày khám",
      dataIndex: "visit_date",
      key: "visit_date",
      render: (date) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-GB', options); // en-GB định dạng ngày theo dd/mm/yyyy
      },
    },
    {
      title: "Tên bác sĩ",
      dataIndex: "doctor_name",
      key: "doctor_name",
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "payment_amount",
      key: "payment_amount",
      render: (amount) => amount.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "green" : status === "FAILED" ? "red" : "gold"}>
          {status === "PENDING" ? "Chưa thanh toán" : status === "COMPLETED" ? "Đã thanh toán" : "Thanh toán lỗi"}
        </Tag>
      ),
    },
    {
      title: "Thời gian thanh toán",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (date) =>
        date
          ? (() => {
            const d = new Date(date);
            const time = d.toLocaleTimeString('en-GB', { hour12: false }); // Định dạng giờ, phút, giây
            const formattedDate = d.toLocaleDateString('en-GB'); // Định dạng ngày, tháng, năm
            return `${time}, ${formattedDate}`; // Kết hợp giờ và ngày
          })()
          : "Chưa thanh toán",
    },

    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            className="online-payment-button"
            onClick={() => handleConfirmPayment(record.id, record.payment_amount)}
            disabled={record.payment_status === "COMPLETED"}
          >
            Thanh toán online
          </Button>

          <Button type="link" onClick={() => viewDetails(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const ConfirmPayment = async (id, amount) => {
    try {
      const response = await axiosClient.post("payments/zalopay/create-payment", {
        payment_id: id, // ID giao dịch của bạn
        amount: amount,  // Số tiền thanh toán
      });

      // Lấy URL từ dữ liệu trả về của backend
      const zalopayUrl = response.zalopay_url; // URL từ ZaloPay trả về
      localStorage.setItem('payment_id', id);
      localStorage.setItem('payment_amount', amount);

      if (zalopayUrl) {
        // Mở URL ZaloPay trong cửa sổ mới
        window.location.href = zalopayUrl;
      } else {
        console.error("Không nhận được URL ZaloPay");
      }
    } catch (err) {
      console.error("Lỗi khi tạo thanh toán:", err);
    }
  };

  const handleConfirmPayment = (id, amount) => {
    Modal.confirm({
      title: "Xác nhận thanh toán",
      content: "Bạn có muốn thanh toán qua ZaloPay không?",
      onOk: () => {
        ConfirmPayment(id, amount);
      },
      onCancel: () => { },
    });
  };

  const viewDetails = (record) => {
    const imageUrl = `http://localhost:8000/${record.patient_image}`;
    console.log(record)


    Modal.info({
      title: `Chi tiết thanh toán`,
      content: (
        <div className="medical-record-modal">
          {/* Phần thông tin bệnh nhân */}
          <div className="patient-info">
            <div className="patient-image">
              <img src={imageUrl} alt="patient" />
            </div>
            <div className="patient-details">
              <p><strong>Tên bệnh nhân:</strong> {record.patient_name}</p>
              <p><strong>Ngày sinh:</strong> {record.patient_dob ? new Date(record.patient_dob).toLocaleDateString('en-GB') : "N/A"}</p>
              <p><strong>Giới tính:</strong> {record.patient_gender}</p>
              <p><strong>Nơi cư trú:</strong> {record.patient_residence}</p>
            </div>
          </div>

          {/* Phần thông tin bác sĩ và khám */}
          <div className="doctor-info">
            <p style={{ textAlign: "left" }}><strong>Tên bác sĩ:</strong> {record.doctor_name}</p>
            <p style={{ textAlign: "left" }}><strong>Ngày khám:</strong> {record.visit_date ? new Date(record.visit_date).toLocaleDateString('en-GB') : "N/A"}</p>
          </div>

          {/* Phần thông tin thanh toán */}
          <div className="payment-info" style={{ textAlign: "left" }}>
            <p><strong>Số tiền:</strong> {record.payment_amount.toLocaleString()} VNĐ</p>
            <p style={{ marginTop: "7px" }}><strong>Trạng thái: </strong>
              <Tag
                color={
                  record.payment_status === "COMPLETED"
                    ? "green"
                    : record.payment_status === "FAILED"
                      ? "red"
                      : "gold"
                }
              >
                {record.payment_status === "PENDING"
                  ? "Chưa thanh toán"
                  : record.payment_status === "COMPLETED"
                    ? "Đã thanh toán"
                    : "Thanh toán lỗi"}
              </Tag>
            </p>
            <p style={{ marginTop: "10px" }}>
              <strong>Thời gian thanh toán: </strong>
              {record.payment_date
                ? (() => {
                  const date = new Date(record.payment_date);
                  const time = date.toLocaleTimeString('en-GB', { hour12: false }); // Format giờ, phút, giây
                  const formattedDate = date.toLocaleDateString('en-GB'); // Format ngày, tháng, năm
                  return `${time}, ${formattedDate}`;
                })()
                : "Chưa thanh toán"}
            </p>


          </div>

          {/* Chi tiết các lần điều trị */}
          <div className="treatment-details">
            <h4>Chi tiết các lần khám bệnh:</h4>
            <Collapse>
              {record.medical_record_doctors && record.medical_record_doctors.length > 0 ? (
                record.medical_record_doctors.map((doctorDetail, index) => (
                  <Panel header={`Lần khám ${index + 1}`} key={index}>
                    <p style={{ textAlign: "left" }}><strong>Chuẩn đoán:</strong> {doctorDetail.diagnosis || "N/A"}</p>
                    <p style={{ textAlign: "left" }}><strong>Đơn thuốc:</strong> {doctorDetail.prescription || "N/A"}</p>
                    <p style={{ textAlign: "left" }}><strong>Số tiền:</strong> {doctorDetail.payment_amount.toLocaleString()} VNĐ</p>
                    {doctorDetail.lab_test_name && (
                      <>
                        <p style={{ textAlign: "left" }}><strong>Tên xét nghiệm:</strong> {doctorDetail.lab_test_name}</p>
                        <p style={{ textAlign: "left" }}><strong>Kết quả xét nghiệm:</strong> {doctorDetail.lab_test_result}</p>
                        <p style={{ textAlign: "left" }}><strong>Ngày xét nghiệm: </strong>
                          {doctorDetail.test_date
                            ? new Date(doctorDetail.test_date).toLocaleDateString('en-GB')
                            : "Chưa có ngày xét nghiệm"}
                        </p>

                      </>
                    )}
                  </Panel>
                ))
              ) : (
                <p>Không có thông tin điều trị.</p>
              )}
            </Collapse>
          </div>
        </div>
      ),
      onOk() { },
      okText: "Đồng ý", // Bạn có thể thay đổi nội dung nút Ok nếu muốn
      okButtonProps: {
        style: {
          backgroundColor: "#1890ff", // Màu nền
          borderColor: "#1890ff", // Màu viền
          color: "#fff", // Màu chữ
        },
      },
    });
  };



  const handlePageChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize: pageSize,
    });
  };

  return (
    <div className="payment-page" style={{ alignItems: "center" }}>
      <div>
        <h1>Thanh toán bệnh nhân</h1>
      </div>
      <Segmented
        options={[
          { label: "Chưa thanh toán", value: "PENDING" },
          { label: "Tất cả", value: "ALL" },
        ]}
        value={filterType}
        onChange={(value) => setFilterType(value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={paymentList}
        rowKey={(record) => record.id}
        pagination={false} // Tắt phân trang mặc định của bảng
      />
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        pageSizeOptions={["1", "5", "10", "20", "50", "100", "500"]}
        showSizeChanger
        onChange={handlePageChange} // Thay đổi trang
        onShowSizeChange={handlePageChange} // Thay đổi số lượng bản ghi mỗi trang
        style={{ marginTop: 16, textAlign: "center" }}
      />
    </div>
  );
};

export default UserPaymentPage;
