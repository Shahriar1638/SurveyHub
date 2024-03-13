import { useState } from "react";
import MainTitles from "../../Components/Sectiontitles/MainTitles";
import { GiCash } from "react-icons/gi";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_Payment_Gateway_PK);
const Payment = () => {
    const [open, setOpen] = useState(true)
    const [payment, setPayment] = useState(0);
    const packages = [
        {
            cost: 12,
            period: "Weekly"
        },
        {
            cost: 50,
            period: "monthly"
        },
        {
            cost: 550,
            period: "yearly"
        }
    ]
    const handleClick = (price) => {
        setPayment(price)
        setOpen(false)
    }
    return (
        <div className="mt-44 max-w-7xl lg:max-w-[90rem] mx-auto">
            <MainTitles text="Explore Our subscription package" />
            <div className={open? `flex flex-col items-center justify-center w-full` : `w-full`}>           
                {
                    open? <div className="flex flex-col items-center justify-center w-full space-y-4">
                    {
                        packages.map((item, index) => (
                            <div onClick={()=>handleClick(item.cost)} key={index} className="flex flex-col items-center justify-center w-full max-w-2xl p-4 border-2 border-[#f88703] rounded-lg hover:cursor-pointer hover:bg-[#f88703] hover:text-white">
                                <h1 className="text-3xl flex items-center font-semibold ">${item.cost} <GiCash className="ml-2 text-xl"></GiCash> </h1>
                                <p className="text-lg font-semibold "> <span className="text-2xl font-bold">/</span> {item.period}</p>
                            </div>
                        ))
                    }
                </div>  : 
                <div className="border-2 border-solid border-[#f88703] rounded-lg p-8">
                    <Elements stripe={stripePromise}>
                        <CheckoutForm price={payment}></CheckoutForm>
                    </Elements>
                </div> 
                }                         
            </div>
        </div>
    );
};

export default Payment;