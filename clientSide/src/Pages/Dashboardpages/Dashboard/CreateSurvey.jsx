/* eslint-disable no-unused-vars */
import Subtitles from "@/Components/Sectiontitles/Subtitles";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import useUsers from "@/Hooks/useUsers";
import { useState } from 'react';
import Swal from "sweetalert2";
import Buttonmd from "@/Components/buttons/Buttonmd";

const CreateSurvey = () => {
    const [currentUser] = useUsers();
    const [numOptions, setNumOptions] = useState(0);
    const [options, setOptions] = useState([]);
    const axiosPublic = useAxiosPublic();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNumOptionsChange = (e) => {
        const num = parseInt(e.target.value) || 0;
        setNumOptions(num);
        setOptions(Array(num).fill(''));
    };
    
    const handleFormSubmit = async (e) => {   
        e.preventDefault();
        setIsSubmitting(true);
        const updatedOptions = {};
        options.forEach((option) => {
            if(option.trim()) {
                updatedOptions[option] = 0;
            }
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
        try {
            const response = await axiosPublic.post('/pending-surveys', surveyInfo, {
                headers: {
                  authorization: `Bearer ${token}`
                }
            });
            if (response.data.acknowledged) {
                Swal.fire({
                    title: "Survey Published",
                    text: "Your survey is now pending admin approval.",
                    icon: "success",
                    confirmButtonColor: "#f98602"
                });
                e.target.reset();
                setOptions([]);
                setNumOptions(0);
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Could not publish the survey.",
                icon: "error",
                confirmButtonColor: "#d33a2f"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionChange = (e, index) => {
        const updatedOptions = [...options];
        updatedOptions[index] = e.target.value;
        setOptions(updatedOptions);
    };

    return (
        <div className="p-6 md:p-12 bg-gray-50/50 min-h-screen">
            <Subtitles text={"Publish a New Survey"}></Subtitles>
            
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-8 max-w-5xl mx-auto">
                <form onSubmit={handleFormSubmit} className="space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-800">Survey Title</label>
                            <input 
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-gray-50/50" 
                                type="text" 
                                name="title" 
                                placeholder="Enter an engaging title..." 
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-800">Category</label>
                            <select 
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-gray-50/50" 
                                name="category" 
                                required
                            >
                                <option value="Lifestyle">LifeStyle</option>
                                <option value="Health">Health</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Technology">Technology</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-800">Cover Image URL</label>
                            <input 
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-gray-50/50" 
                                type="url" 
                                name="image" 
                                placeholder="https://..." 
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy-800">Description</label>
                        <textarea 
                            className="w-full px-4 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-gray-50/50 min-h-[120px] resize-y" 
                            name="description" 
                            placeholder="Describe the survey's goals and context..." 
                            required
                        ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-brand-50/30 rounded-xl border border-brand-100/50">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-800">Number of Options</label>
                            <input 
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-white" 
                                type="number" 
                                min="2"
                                max="10"
                                placeholder="e.g. 4" 
                                onChange={handleNumOptionsChange} 
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-navy-800">Deadline</label>
                            <input 
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-white" 
                                type="date" 
                                name="deadline" 
                                required
                            />
                        </div>
                    </div>

                    {options.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-100 pb-2">Survey Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {options.map((option, index) => (
                                    <div className="flex items-center gap-3" key={index}>
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-navy-100 text-navy-700 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <input 
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-white" 
                                            type="text" 
                                            placeholder={`Option ${index + 1}`}
                                            value={option} 
                                            onChange={(e) => handleOptionChange(e, index)} 
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all ${
                                isSubmitting 
                                ? "bg-brand-400 cursor-not-allowed opacity-70" 
                                : "bg-brand-500 hover:bg-brand-600 hover:-translate-y-0.5 shadow-brand-500/30"
                            }`}
                        >
                            {isSubmitting ? "Publishing Survey..." : "Publish Survey to Pending"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSurvey;