import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Button, Space, Segmented, Pagination, Modal , Collapse } from "antd";
import "./payment.css";
import axiosClient from "../../axiosClient";
import { toast } from 'react-toastify';


const PaymentPage = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0, // Khởi tạo tổng số bản ghi
  });
  const [filterType, setFilterType] = useState("PENDING"); // Mặc định là "Chưa thanh toán"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

      const response = await axiosClient.get("/payments", { params });

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

  // Gọi API khi trang hoặc filterType thay đổi
  useEffect(() => {
    fetchPayments(pagination.current, pagination.pageSize, filterType);
  }, [filterType, pagination.current, pagination.pageSize, fetchPayments]);

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
      render: (date) => new Date(date).toLocaleDateString(),
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
      render: (date) => (date ? new Date(date).toLocaleString() : "Chưa thanh toán"),
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
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
      toast.error("Có lỗi xảy ra khi kết thúc lịch khám.");
    } finally {
      setLoading(false);
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
  const convertToTimezone = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7); // Thêm 7 giờ để chuyển sang UTC+7
    return date.toLocaleString(); // Trả về định dạng ngày giờ theo múi giờ địa phương
  };
  const viewDetails = (record) => {
    Modal.info({
      title: `Chi tiết thanh toán`,
      content: (
        <div>
          <p><strong>Tên bệnh nhân:</strong> {record.patient_name}</p>
          <p><strong>Tên bác sĩ:</strong> {record.doctor_name}</p>
          <p><strong>Ngày khám:</strong> {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : "N/A"}</p>
          <p><strong>Số tiền:</strong> {record.payment_amount.toLocaleString()} VNĐ</p>
          <p><strong>Trạng thái:</strong>
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
          <p><strong>Thời gian thanh toán:</strong> {record.payment_date ? new Date(record.payment_date).toLocaleString() : "Chưa thanh toán"}</p>
  
          {/* Accordion cho danh sách medical_record_doctors */}
          <div>
            <h4>Chi tiết các lần điều trị:</h4>
            <Collapse>
              {record.medical_record_doctors && record.medical_record_doctors.length > 0 ? (
                record.medical_record_doctors.map((doctorDetail, index) => (
                  <Panel header={`Lần điều trị ${index + 1}`} key={index}>
                    <p><strong>Chuẩn đoán:</strong> {doctorDetail.diagnosis || "N/A"}</p>
                    <p><strong>Đơn thuốc:</strong> {doctorDetail.prescription || "N/A"}</p>
                    <p><strong>Số tiền:</strong> {doctorDetail.payment_amount.toLocaleString()} VNĐ</p>
                    {doctorDetail.lab_test_name && (
                      <>
                        <p><strong>Tên xét nghiệm:</strong> {doctorDetail.lab_test_name}</p>
                        <p><strong>Kết quả xét nghiệm:</strong> {doctorDetail.lab_test_result}</p>
                        <p><strong>Ngày xét nghiệm:</strong> {doctorDetail.test_date ? new Date(doctorDetail.test_date).toLocaleDateString() : "N/A"}</p>
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
      onOk() {},
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

export default PaymentPage;
