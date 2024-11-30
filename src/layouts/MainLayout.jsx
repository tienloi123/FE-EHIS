import React from 'react';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import ToastNotify from '../components/common/ToastNotify';

const MainLayout = ({ children }) => {
  return (
    <>
      <div className="relative">
        <Header />
        <main>{children}</main>
        <Footer />
      </div></>
  );
};

export default MainLayout;