import React from 'react';

const LayoutOne = ({ children }) => {
  return (
    <div className="relative">
      <main>{children}</main>
    </div>
  );
};

export default LayoutOne;