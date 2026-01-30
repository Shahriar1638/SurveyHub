/* eslint-disable react/prop-types */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import { FreeMode, Pagination } from "swiper/modules";
import SurveyCard from "../../../Components/Cards/SurveyCard";

const Featured = ({ featured }) => {
  return (
    <div className="py-8">
      <Swiper
        slidesPerView={1}
        spaceBetween={24}
        freeMode={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
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
        modules={[FreeMode, Pagination]}
        className="mySwiper !pb-12"
      >
        {featured.map((survey, idx) => (
          <SwiperSlide key={idx} className="h-auto">
            <div className="h-full py-2">
              {/* Passing totalVotes implicitly if it exists in the object or calculated */}
              <SurveyCard survey={survey} type="featured" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Featured;
