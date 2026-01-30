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
    <div className="bg-gray-50/50 min-h-screen">
      <Banner></Banner>

      <div className="max-w-7xl lg:max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MainTitles text="Latest Surveys"></MainTitles>
        <Latests latest={latest}></Latests>
      </div>

      <div className="bg-brand-50 w-full py-16 border-y border-brand-100 relative overflow-hidden">
        {/* Decorative blob for depth */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl lg:max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <MainTitles text="Featured Surveys"></MainTitles>
          <Featured featured={featured}></Featured>
        </div>
      </div>

      <div className="max-w-7xl lg:max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        <Instructions></Instructions>
        <WebReviews></WebReviews>
      </div>
    </div>
  );
};

export default Home;
