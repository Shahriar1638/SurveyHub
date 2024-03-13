/* eslint-disable react/prop-types */
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import { FreeMode, Pagination } from 'swiper/modules';
import { MdDateRange } from "react-icons/md";

const Latests = ({latest}) => {
    return (
        <div>
            <Swiper
                slidesPerView={3}
                spaceBetween={30}
                freeMode={true}
                pagination={{
                clickable: true,
                }}
                modules={[FreeMode, Pagination]}
                className="mySwiper"
            >
                {
                    latest.map((survey,idx) => (
                        <SwiperSlide key={idx}>
                            <div style={{borderRadius:'0.5rem'}} className="flex flex-col items-center w-full h-[25rem] bg-white shadow-md border-2 border-solid border-purple-700 p-8">
                                <img className="object-cover w-full h-40 rounded-md mb-4 border-2 border-solid border-yellow-400" src={survey.image} alt={survey.title} />
                                <h1 className="text-xl mb-4 h-10 font-bold">{survey.title}</h1>
                                <p className="text-base mb-4">{survey.description.length > 80 ? survey.description.slice(0, 80) + "..." : survey.description}</p>
                                <p className='flex flex-row items-center'><MdDateRange className="mr-2 text-2xl"></MdDateRange>{survey.date}</p>
                            </div>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
    );
};

export default Latests;