import Cards from "../../Components/Cards/Cards";
import MainTitles from "../../Components/Sectiontitles/MainTitles";
import useSurveys from "../../Hooks/useSurveys";

const Surveys = () => {
    const [surveys] = useSurveys();
    return (
        <div className="mt-56 max-w-7xl lg:max-w-[90rem] mx-auto">
            <MainTitles text="Explore our Surveys"></MainTitles>
            <div className="">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {
                        surveys.map((survey,idx) => (
                            <Cards key={idx} data={survey}></Cards>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Surveys;