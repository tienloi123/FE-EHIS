import React from 'react';
import Slider from 'react-slick';  // Thêm dòng này để import Slider
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SliderHome.css';
const SliderHome = () => {
  const settings = {
    dots: true, // Hiển thị các chấm chuyển slide
    infinite: true, // Cho phép lặp lại slider
    speed: 500, // Tốc độ chuyển slide
    slidesToShow: 1, // Số slide hiển thị cùng một lúc
    slidesToScroll: 1, // Số slide lướt qua mỗi lần
    autoplay: true, // Tự động chuyển slide
    autoplaySpeed: 3000, // Thời gian giữa các lần chuyển slide (3 giây)
    pauseOnHover: true, // Dừng chuyển slide khi hover
  };
  return (
    <div className="slider-container">
      <Slider {...settings}>
        <div>
          <img src="./images/sl1.jpg" alt="Slide 1" className="slider-image" />
        </div>
        <div>
          <img src="./images/sl1.jpg" alt="Slide 2" className="slider-image" />
        </div>
        <div>
          <img src="./images/sl1.jpg" alt="Slide 3" className="slider-image" />
        </div>
      </Slider>
    </div>
  )
}

export default SliderHome;
