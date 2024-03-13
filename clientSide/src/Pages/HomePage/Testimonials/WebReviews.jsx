import MainTitles from "@/Components/Sectiontitles/MainTitles";

const WebReviews = () => {
    const testimonialsData = [
        {
            name: "John Doe",
            review: "This survey platform is amazing! It's so easy to create and share surveys, and the data analysis tools are fantastic."
        },
        {
            name: "Jane Smith",
            review: "I've been using this website for all my survey needs for years. It's reliable, affordable, and has all the features I need."
        },
        {
            name: "Bob Johnson",
            review: "I've tried many survey platforms, but this one is the best. It's easy to use, and the customer support is excellent."
        },
        {
            name: "Michael Brown",
            review: "I was hesitant to try a paid survey platform, but this one is worth every penny. The premium features are game-changers."
        }
    ];

    return (
        <div>
            <MainTitles text={"What our users say:"}></MainTitles>
            <div className="flex flex-col lg:flex-row items-center gap-52">
                <div className="w-full">
                    <div className="flex flex-col gap-10">
                        {
                            testimonialsData.map((item, index) => (
                                <div className="flex flex-col gap-2" key={index}>
                                    <p className="text-xl font-semibold"> {`" ${item.review} "`} </p>
                                    <p className="text-lg font-bold"> - {item.name}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>    
            </div>
        </div>
    );
};

export default WebReviews;