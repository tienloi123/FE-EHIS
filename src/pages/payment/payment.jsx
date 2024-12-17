import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Button, Space, Segmented, Pagination, Modal, Collapse, message, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./payment.css";
import axiosClient from "../../axiosClient";
import { toast } from 'react-toastify';


const PaymentPage = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPaymentList, setFilteredPaymentList] = useState([]); // Danh sách sau khi lọc
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [filterType, setFilterType] = useState("PENDING");
  const { Panel } = Collapse;

  const fetchPayments = useCallback(async (page, pageSize, filter) => {
    try {
      const params = {
        offset: (page - 1) * pageSize,
        limit: pageSize,
      };

      if (filter === "PENDING") {
        params.status = "PENDING";
      } else {
        delete params.status;
      }

      const response = await axiosClient.get("/payments", { params });

      setPaymentList(response.data);
      setFilteredPaymentList(response.data);  // Đặt giá trị mặc định cho danh sách lọc
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: response.data.meta.total || 0,
      });
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 405) {
          const detailMessage = data?.detail?.message || "Hành động không được phép.";
          message.error(`Lỗi: ${detailMessage}`, 5);
        } else {
          // Xử lý các lỗi khác
          message.error("Đã xảy ra lỗi trong quá trình tải dữ liệu.", 5);
        }
      }
    }
  }, [pagination]);

  // Gọi API khi trang hoặc filterType thay đổi
  useEffect(() => {
    fetchPayments(pagination.current, pagination.pageSize, filterType);
  }, [filterType, pagination, fetchPayments]);  // Thêm 'pagination' vào mảng phụ thuộc

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filteredData = paymentList.filter((record) => {
      const matchesId = record.id.toString().includes(value);
      const matchesName = record.patient_name.toLowerCase().includes(value.toLowerCase());
      return matchesId || matchesName;
    });
    setFilteredPaymentList(filteredData);
  };

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "id",
      key: "id",
    },
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
            type="primary"
            onClick={() => handleConfirmPayment(record.id)}
            disabled={record.payment_status === "COMPLETED"}
            className="online-payment-button"
          >
            Xác nhận
          </Button>
          <Button type="link" onClick={() => viewDetails(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const ConfirmPayment = async (id) => {
    try {
      await axiosClient.put(`/payments/${id}`, {});
      toast.success('Thanh toán thành công')
      refreshData();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi kết thúc lịch khám.");
    } finally {
    }
  };
  const refreshData = () => {
    fetchPayments(pagination.current, pagination.pageSize, filterType);
  };
  const handleConfirmPayment = (id) => {
    Modal.confirm({
      title: "Xác nhận thanh toán",
      content: `Bạn có chắc chắn muốn xác nhận thanh toán cho bệnh nhân?`,
      onOk: () => {
        ConfirmPayment(id);
      },
      onCancel: () => {
      },
    });
  };
  const viewDetails = (record) => {
    const imageUrl = `${process.env.REACT_APP_API_URL}/${record.patient_image}`;

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
            <p  style={{ textAlign: "left" }}><strong>Tên bác sĩ:</strong> {record.doctor_name}</p>
            <p  style={{ textAlign: "left" }}><strong>Ngày khám:</strong> {record.visit_date ? new Date(record.visit_date).toLocaleDateString('en-GB') : "N/A"}</p>
          </div>

          {/* Phần thông tin thanh toán */}
          <div className="payment-info">
            <p  style={{ textAlign: "left" }}><strong>Số tiền:</strong> {record.payment_amount.toLocaleString()} VNĐ</p>
            <p  style={{ textAlign: "left", marginTop:"10px"  }} ><strong>Trạng thái:</strong>
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
            <p  style={{ textAlign: "left", marginTop:"10px" }}>
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
        <h1>Danh sách thanh toán</h1>
      </div>
      
      <div style={{display: 'flex', justifyContent:'space-between', alignItems: 'center', marginBottom: 16}}>
        <Segmented
          options={[
            { label: "Chưa thanh toán", value: "PENDING" },
            { label: "Tất cả", value: "ALL" },
          ]}
          value={filterType}
          onChange={(value) => setFilterType(value)}
          style={{marginTop: 0}}
        />
        <Input
          placeholder="Tìm kiếm theo mã hồ sơ hoặc tên bệnh nhân"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{  width: "330px" }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredPaymentList}
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

export default PaymentPage;
