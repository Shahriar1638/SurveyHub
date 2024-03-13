/* eslint-disable no-unused-vars */
import Subtitles from "@/Components/Sectiontitles/Subtitles";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import useUsers from "@/Hooks/useUsers";

import { useState } from 'react';
import Swal from "sweetalert2";

const CreateSurvey = () => {
    const [currentUser] = useUsers();
    const [numOptions, setNumOptions] = useState(0);
    const [options, setOptions] = useState([]);
    const axiosPublic = useAxiosPublic();
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
          }, 300);
      };
    const clickStyle = {
        borderRadius: '0.45rem',
        transform: isClicked ? 'scale(0.95)' : 'scale(1)',
        backgroundColor: isClicked ? '#f88703' : '#fff',
        color: isClicked ? 'white' : '',
        transition: 'transform 0.2s ease-out',
      };

    const handleNumOptionsChange = (e) => {
        const num = parseInt(e.target.value);
        setNumOptions(num);
        setOptions(Array(num).fill(''));
    };
    
    const handleFormSubmit = (e) => {   
        e.preventDefault();
        const updatedOptions = {};
        options.forEach((option, index) => {
            updatedOptions[option] = 0;
        });
        const date = e.target.deadline.value;
        const inputDate = new Date(date);
        const deadline = inputDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const surveyInfo = {
            title: e.target.title.value,
            description: e.target.description.value,
            image: e.target.image.value,
            category: e.target.category.value,
            options: updatedOptions,
            status: 'pending',
            deadline: deadline,
            adminFeedback: "",
            email: currentUser.email
        };
        const token = localStorage.getItem('access-token');
        axiosPublic.post('/pending-surveys', surveyInfo, {
            headers: {
              authorization: `Bearer ${token}`
            }
          })
        .then(response => {
            if (response.data.acknowledged) {
                Swal.fire({
                    title: "Survey Published",
                    text: "Survey is now published",
                    icon: "success"
                });
            }
        })
        };

        const handleOptionChange = (e, index) => {
            const updatedOptions = [...options];
            updatedOptions[index] = e.target.value;
            setOptions(updatedOptions);
        };

        return (
            <div className="">
                <Subtitles text={"Fill up the form to publish survey"}></Subtitles>
                <div>
                    <form onSubmit={handleFormSubmit}>
                        <div className="flex items-center sm:flex-row mb-8 gap-4">
                            <div>
                                <h1 className="w-72 text-lg">Enter The title of your Survey</h1>
                                <input style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" type="text" name="title" placeholder="title" required/>
                            </div>
                            <div>
                                <h1 className="w-72 text-lg">Select the category of your Survey</h1>
                                <select style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" name="category" id="" required>
                                    <option value="Lifestyle">LifeStyle</option>
                                    <option value="Health">Health</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Technology">Technology</option>
                                </select>
                            </div>
                            <div>
                                <h1 className="w-72 text-lg">Enter The Image Url</h1>
                                <input style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" type="text" name="image" placeholder="image url" required/>
                            </div>
                        </div>
                        <div>
                            <textarea style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" name="description" id="" cols="70" rows="10" placeholder="Describe the survey in detail......." required></textarea>
                        </div>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="w-2/5">
                                <h1 className="w-full text-lg mb-2">How many options do you want to add ?</h1>
                                <input style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" type="number" placeholder="number of options" onChange={handleNumOptionsChange} required/>
                            </div>
                            <div className="w-2/5">
                                <h1 className="w-full text-lg mb-2">Set Deadline</h1>
                                <input style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" type="date" name="deadline" required/>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 mb-8">
                            {options.map((option, index) => (
                            <div className="flex items-center" key={index}>
                                <h1 className="text-lg w-40 mr-2">Option {index+1}:</h1>
                                <input style={{ borderRadius: '0.5rem' }} className="w-full border-2 border-solid border-[#f88703] px-4 py-2" type="text" value={option} onChange={(e) => handleOptionChange(e, index)} required/>
                            </div>
                        ))}
                    </div>
                    <input className="px-4 w-full font-bold border-2 border-solid uppercase border-[#f88703] py-2" type="submit" style={clickStyle} onClick={handleClick} value="submit" />
                </form>
            </div>
        </div>
    );
};

export default CreateSurvey;