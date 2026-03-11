import { Link } from 'react-router-dom';

import banner from '../../../assets/navBanner.png';

const Banner = () => {
    return (
        <div className='relative w-full overflow-hidden bg-navy-950'>
            {/* Background Image with Gradient Overlays */}
            <div 
                className='absolute inset-0 z-0'
                style={{ 
                    backgroundImage: `url(${banner})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat' 
                }}
            >
                {/* Horizontal Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-transparent"></div>
                {/* Vertical Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-brand-900/40 mix-blend-multiply"></div>
            </div>

            <div className='relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-48 pt-40 md:pt-56'>
                <div className='max-w-2xl text-left'>
                    <div className="inline-block px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-sm mb-6">
                        <span className="text-brand-400 text-sm font-bold uppercase tracking-widest pl-1">Data Driven Decisions</span>
                    </div>
                    
                    <h1 className='text-5xl md:text-7xl font-black mb-6 text-white leading-tight tracking-tight'>
                        Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Insights</span><br />
                        With SurveyHub
                    </h1>
                    
                    <p className='text-lg md:text-xl text-gray-300 mb-10 leading-relaxed font-light max-w-xl'>
                        Create, participate, and analyze surveys instantly. Explore real-time community opinions on tech, lifestyle, and global trends. Join the conversation today.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                        <Link to={'/surveys'}>
                            <button className="px-8 py-4 bg-brand-500 hover:bg-brand-600 hover:-translate-y-1 transition-all text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 text-lg flex items-center gap-2 group">
                                Explore Surveys
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;