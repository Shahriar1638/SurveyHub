/* eslint-disable react/prop-types */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import { FreeMode, Pagination, Autoplay } from "swiper/modules";
import SurveyCard from "../../../Components/Cards/SurveyCard";

const Latests = ({ latest }) => {
  return (
    <div className="py-4">
      <Swiper
        slidesPerView={1}
        spaceBetween={24}
        freeMode={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1280: {
            slidesPerView: 3,
            spaceBetween: 32,
          },
        }}
        modules={[FreeMode, Pagination, Autoplay]}
        className="mySwiper !pb-12" // Padding bottom for pagination bullets
      >
        {latest.map((survey, idx) => (
          <SwiperSlide key={idx} className="h-auto">
            {/* h-auto on slide is crucial for equal height children */}
            <div className="h-full py-2">
              {/* py-2 to prevent shadow clipping */}
              <SurveyCard survey={survey} type="latest" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Latests;
