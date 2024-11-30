import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS styles

import MainLayout from './layouts/MainLayout'; 
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Home from './pages/home/Home';
import BookingAppointment from './pages/appointment/BookingAppointment';
import GetAppointment from './pages/get_appointment/appointment';
import SetAppointment from './pages/create_appointment/appointment';
import DoctorAppointments from './pages/doctor_appointment/doctor_appointment';
import PaymentPage from './pages/payment/payment';
import UserPaymentPage from './pages/user_payment/user_payment';
import PaymentSuccessPage from './pages/payment-success/payment_success';
import Settings from './components/header/Settings';
import VerifyImage from './pages/auth/LoginFace';

export const mainRouters = [
  {
    path: '/',
    component: Home,
    layout: MainLayout,
  },
  {
    path: '/register',
    component: Register,
    layout: MainLayout,
  },
  {
    path: '/login',
    component: Login,
    layout: MainLayout,
  },
  {
    path: '/dat-lich-kham', // Route mới cho trang Đặt Lịch Khám
    component: BookingAppointment,
    layout: MainLayout,
  },
  {
    path: '/dat-lich-kham', // Route mới cho trang Đặt Lịch Khám
    component: BookingAppointment,
    layout: MainLayout,
  },
  {
    path: '/xem-lich-kham',
    component: GetAppointment,
    layout: MainLayout,
  },
  {
    path: '/lich-hen-benh-nhan',
    component: SetAppointment,
    layout: MainLayout,
  },
  {
    path: '/lich-hen-bac-si',
    component: DoctorAppointments,
    layout: MainLayout,
  },
  {
    path: '/thanh-toan',
    component: PaymentPage,
    layout: MainLayout,
  },
  {
    path: '/thanh-toan-nguoi-dung',
    component: UserPaymentPage,
    layout: MainLayout,
  },
  {
    path: '/thanh-toan-thanh-cong',  // Route trang thanh toán thành công
    component: PaymentSuccessPage,
    layout: MainLayout,
  },
  {
    path: '/settings',  // Route trang thanh toán thành công
    component: Settings,
    layout: MainLayout,
  },
  {
    path: '/login-face',  // Route trang thanh toán thành công
    component: VerifyImage,
    layout: MainLayout,
  }
];

const App = () => {
  return (
    <Router>
      <ToastContainer /> {/* Thêm ToastContainer ở đây */}
      <Routes>
        {mainRouters.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<route.layout><route.component /></route.layout>}
          />
        ))}
      </Routes>
    </Router>
  );
};

export default App;
