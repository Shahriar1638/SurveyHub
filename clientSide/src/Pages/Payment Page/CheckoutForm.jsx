/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useContext, useEffect, useState } from "react";
import Buttonmd from "../../Components/buttons/Buttonmd";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import moment from "moment";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CheckoutForm = ({price}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('')
    const [error, setError] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        axiosSecure.post('/create-payment-intent', {price: price})
        .then(res => {
            setClientSecret(res.data.clientSecret)
        })
    },[axiosSecure, price])

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        const card = elements.getElement(CardElement);
        if (card===null) {
            return;
        }
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card
        });
        if (error) {
            console.log('error:', error);
            setError(error.message);
        } else {
            console.log('PaymentMethod:', paymentMethod);
            setError('');
        }
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    email: user?.email || 'anonymous',
                    name: user?.displayName || 'anonymous person',
                },
            }
        });
        if (confirmError) {
            setError(confirmError.message);
        } else {
            console.log('Payment intent', paymentIntent);
            if (paymentIntent.status === 'succeeded') {
                setTransactionId(paymentIntent.id);
                setError('');
                const payment = {
                    email: user?.email || 'anonymous',
                    price: price,
                    transactionId: paymentIntent.id,
                    date: moment().format('LL'),
                    status: 'paid',
                }
                const res = await axiosSecure.post('/payments', payment)
                if (res.status === 200) {
                    axiosSecure.patch(`/users/upgrade/${user.email}`)
                    .then(res => {
                        if (res.data.acknowledged){
                            Swal.fire({
                                icon: 'success',
                                title: 'Payment Successful',
                                text: 'You have successfully upgraded your account to prouser. Your transaction id is: ' + paymentIntent.id,
                                confirmButtonText: 'Okay'
                            });
                            navigate('/');
                        }
                    })
                }
                
            }
        }
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }}
            />
            <div className="mt-6"><Buttonmd text={'pay'} type="submit" disabled={!stripe || !clientSecret}></Buttonmd></div>
            {/* <button className="px-4 font-bold border-2 border-solid uppercase border-[#f88703] py-2 rounded-lg my-4" type="submit" disabled={!stripe || !clientSecret}>
                Pay
            </button> */}
            <p className="text-red-600">{error}</p>
            {transactionId && <p className="text-green-600"> Your transaction id: {transactionId}</p>}
        </form>
    );
};

export default CheckoutForm;