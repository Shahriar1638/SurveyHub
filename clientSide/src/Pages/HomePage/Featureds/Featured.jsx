/* eslint-disable react/prop-types */
import { IoIosPeople } from "react-icons/io";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import { FreeMode, Pagination } from 'swiper/modules';

const Featured = ({featured}) => {
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
                className="mySwiper">
                    {
                        featured.map((survey,idx) => (
                            <SwiperSlide key={idx}>
                                <div style={{borderRadius:'0.5rem'}} className="flex flex-col items-center w-full h-[25rem] bg-white shadow-md border-2 border-solid border-purple-700 p-8">
                                    <img className="object-cover w-full h-40 rounded-md mb-4 border-2 border-solid border-yellow-400" src={survey.image} alt={survey.title} />
                                    <h1 className="text-xl mb-4 h-10 font-bold">{survey.title}</h1>
                                    <p className="text-base mb-4">{survey.description.length > 80 ? survey.description.slice(0, 80) + "..." : survey.description}</p>
                                    <p className='flex flex-row items-center'> <IoIosPeople className="mr-2 text-2xl"></IoIosPeople> Total vote: {
                                        Object.values(survey.options).reduce((a, b) => a + b, 0)
                                    }</p>
                                </div>
                            </SwiperSlide>
                        ))
                    }
            </Swiper>

        </div>
    );
};

export default Featured;