import { Link } from 'react-router-dom';
import Buttonlg from '../../../Components/buttons/Buttonlg';
import banner from '../../../assets/navBanner.png';

const Banner = () => {
    return (
        <div className=''>
            <div className='w-full' style={{ backgroundImage: `linear-gradient(to right,rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3)),url(${banner})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div className='max-w-7xl mx-auto py-10 text-white pt-40'>
                    <div className='mb-8'>
                        <h1 className='text-4xl font-extrabold mb-4'>Welcome to SurveyHub</h1>
                        <p className='text-lg w-[50rem]'>
                            SurveyHub is a feature-rich platform that allows you to create, participate in, and analyze surveys on various
                            topics. From entertainment preferences to tech gadgets, explore the diverse world of opinions and share your
                            insights with the community.Become a pro user to unlock premium features and enjoy an enhanced survey experience. Explore our surveys or
                            create your own to gather valuable feedback. Join SurveyHub today and be part of the conversation!
                        </p>
                    </div>
                    <Link to={'/surveys'}><Buttonlg text={"Explore more"}/></Link>
                </div>
            </div>
        </div>
    );
};

export default Banner;