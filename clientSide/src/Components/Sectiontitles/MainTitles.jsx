/* eslint-disable react/prop-types */
const MainTitles = ({ text }) => {
  return (
    <div className="my-10 md:my-16">
      <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-navy-900 to-brand-600">
          {text}
        </span>
      </h1>
      <div className="h-1 w-24 bg-brand-500 mx-auto mt-4 rounded-full"></div>
    </div>
  );
};

export default MainTitles;
