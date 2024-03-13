import MainTitles from "../../../Components/Sectiontitles/MainTitles";
import useSurveys from "../../../Hooks/useSurveys";
import Banner from "../Banner/Banner";
import Featured from "../Featureds/Featured";
import Instructions from "../How It works/Instructions";
import Latests from "../Latests/Latests";
import WebReviews from "../Testimonials/WebReviews";

const Home = () => {
    const [, , featured, latest] = useSurveys();

    return (
        <div>
          <Banner></Banner>      
          <div  className="max-w-7xl lg:max-w-[90rem] mx-auto">
            <MainTitles text="Latest Surveys"></MainTitles>
            <Latests latest={latest}></Latests>
          </div>
          <div className="bg-[#ffd29e] w-full pb-8">
            <div  className="max-w-7xl lg:max-w-[90rem] mx-auto">
              <MainTitles text="Featured Surveys"></MainTitles>
              <Featured featured={featured}></Featured>
            </div>
          </div>   
          <div  className="max-w-7xl lg:max-w-[90rem] mx-auto">
            <Instructions></Instructions>
            <WebReviews></WebReviews>
          </div>
        </div>
    );
};

export default Home;