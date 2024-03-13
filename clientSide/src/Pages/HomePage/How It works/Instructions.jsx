import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import image from "../../../assets/howitworks.jpg"
import MainTitles from "@/Components/Sectiontitles/MainTitles";

const Instructions = () => {
    
    const howItWorks = [
    {
        title: 'Homepage Overview',
        description: 'Upon landing on the homepage, users are greeted with a banner providing an overview of the website\'s purpose and features. This sets the tone and introduces users to the platform.',
    },
    {
        title: 'Featured and Latest Surveys',
        description: 'The homepage includes dedicated sections showcasing featured surveys and the latest surveys. Users can quickly discover interesting surveys and stay updated on the newest additions to the platform.',
    },
    {
        title: 'Surveys Page (Public)',
        description: 'The public surveys page displays a comprehensive list of all available surveys, complete with essential information such as titles, short descriptions, and total votes. Users can conveniently filter surveys by title, category, and vote count.',
    },
    {
        title: 'Survey Details Page (Public and Pro User)',
        description: 'Survey details pages provide in-depth information about a specific survey. While all users can view the survey details and vote in polls, only authorized users (pro users) can add comments. All users can see comments, fostering transparency.',
    },
    {
        title: 'Pricing and Pro User Membership',
        description: 'The public pricing page integrates a payment system, allowing users to become pro-user members by subscribing to enhanced features. A dedicated "Pro" nav link in the navigation bar directs users to the pro-user membership page, where they can become pro users upon successful payment. Account creation is facilitated using email and password, with JWT tokens securely stored on the client side for authentication.',
    },
    ];
  return (
    <div>
        <MainTitles text={"how it works?"}></MainTitles>
        <div className="flex flex-col lg:flex-row items-center gap-52">
            <div className="lg:w-2/5">
                <img src={image} alt="" />
            </div>
            <div>
                {
                    howItWorks.map((item, index) => (
                        <Accordion collapsible type="single" key={index}>
                            <AccordionItem value={`item-${index+1}`}>
                                <AccordionTrigger>
                                    <h3 className="text-xl font-semibold">{item.title}</h3>   
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="">{item.description}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ))
                }
            </div>
        </div>
    </div>
  );
};

export default Instructions;
