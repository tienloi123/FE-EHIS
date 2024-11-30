import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd'; // Hoặc sử dụng bất kỳ thư viện UI nào bạn muốn
import { CheckCircleOutlined } from '@ant-design/icons'; // Biểu tượng thành công

const PaymentSuccessPage = () => {
  const navigate = useNavigate(); // Để điều hướng về trang thanh toán
  const [paymentAmount, setPaymentAmount] = useState(null); // State để lưu giá trị tiền thanh toán

  // Lấy giá trị từ localStorage khi component được render
  useEffect(() => {
    const amount = localStorage.getItem('payment_amount');
    if (amount) {
      setPaymentAmount(amount);
    }
  }, []);
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(paymentAmount);
    

  // Hàm quay lại trang thanh toán
  const goBackToPayment = () => {
    navigate('/thanh-toan-nguoi-dung');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <CheckCircleOutlined style={styles.icon} />
        <h2 style={styles.title}>Thanh Toán Thành Công</h2>
        <p style={styles.message}>Cảm ơn bạn đã thực hiện thanh toán. Bạn đã thanh toán thành công.</p>
        
        {/* Hiển thị số tiền thanh toán nếu có */}
        {formattedAmount && (
          <p style={styles.amount}>
            <strong>Số tiền thanh toán: {formattedAmount}</strong>
          </p>
        )}

        <Button type="primary" onClick={goBackToPayment} style={styles.button}>
          Quay lại Trang Thanh Toán
        </Button>
      </div>
    </div>
  );
};

// Styling cho trang
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    backgroundColor: '#f0f2f5',
  },
  content: {
    textAlign: 'center',
    padding: '40px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '400px',
  },
  icon: {
    fontSize: '48px',
    color: '#52c41a',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
  message: {
    fontSize: '16px',
    margin: '20px 0',
    color: '#555',
  },
  amount: {
    fontSize: '18px',
    margin: '20px 0',
    color: '#333',
  },
  button: {
    width: '100%',
  },
};

export default PaymentSuccessPage;
