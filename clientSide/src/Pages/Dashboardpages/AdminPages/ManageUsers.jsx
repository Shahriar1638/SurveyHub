/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Listbox } from '@headlessui/react'
import { FaFilter } from "react-icons/fa";
import Buttonmd from "@/Components/buttons/Buttonmd";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import Subtitles from "@/Components/Sectiontitles/Subtitles";

const ManageUsers = () => {
    const roles = ['admin','user','prouser','surveyor','all']
    const [selectedPerson, setSelectedPerson] = useState(["all"])
    const axiosSecure = useAxiosSecure();
    const { data: users =[],refetch } = useQuery({
        queryKey: ["users"],
        queryFn: async () =>{
            const res = await axiosSecure.get("/users");
            return res.data;
        } 
    })
    const { data: payments = [] } = useQuery({
        queryKey: ["payments"],
        queryFn: async () =>{
            const res = await axiosSecure.get("/payments");
            return res.data;
        } 
    })
    console.log(payments)
    const [ displayUsers, setDisplayUsers ] = useState(users)
    useEffect(()=> {
        setDisplayUsers(users)
    },[users])
    const handleFilter = role => {
        console.log(role)
        if(role == "all"){
            setDisplayUsers(users)
        }else{
            const filteredUsers = users.filter(user => user.role === role)
            setDisplayUsers(filteredUsers)
        }
    }
    const handleMakeAdmin = user => {
        Swal.fire({
            title: `Are you sure You want to make ${user.name} an admin`,
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Proceed!"
          }).then((result) => {    
            axiosSecure.patch(`/users/admin/${user._id}`)
            .then(response => {
                if (result.isConfirmed) {
                    refetch();
                    Swal.fire({
                      title: "Promoted",
                      text: "User is now an admin",
                      icon: "success"
                    });
                  }  
            })
            .catch(error => {
                console.log(error);
                Swal.fire({
                    title: "..Oops",
                    text: "Something went wrong",
                    icon: "error"
                  });
            });
          });
    }
    const handleMakeSurveyor = user => {
        Swal.fire({
            title: `Are you sure You want to make ${user.name} a surveyor`,
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Vote it!"
          }).then((result) => {    
            axiosSecure.patch(`/user/surveyor/${user._id}`)
            .then(response => {
                if (result.isConfirmed) {
                    refetch();
                    Swal.fire({
                      title: "Promoted",
                      text: "User is now a surveyor",
                      icon: "success"
                    });
                  }  
            })
            .catch(error => {
                Swal.fire({
                    title: "..Oops",
                    text: "Something went wrong",
                    icon: "error"
                  });
            });
          });
    }

    return (
        <div>
            <Subtitles text={"Manage Users"}></Subtitles>
            <div className="flex justify-end rounded-lg">
                <div style={{borderRadius:'0.5rem'}} className="w-40 border-2 border-solid border-[#f88703] px-6 py-1 mr-20">
                    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
                        <Listbox.Button className="uppercase flex items-center text-[#f88703] font-medium"><FaFilter className="mr-2 text-xl"></FaFilter>{selectedPerson}</Listbox.Button>
                        <Listbox.Options>
                            {roles.map((user) => (
                                <Listbox.Option
                                    key={user}
                                    value={user}
                                    style={{borderRadius:'0.4rem'}}
                                    className="hover:cursor-pointer uppercase hover:text-white hover:bg-[#f88703] px-2"
                                    onClick={()=>handleFilter(user)}
                                >
                                    {user}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Listbox>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Payment Status</th>
                        <th>Promote to</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* body */}
                        {
                            displayUsers.map((user,idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.role}</td>      
                                    <td>
                                        {
                                            payments.some(payment => payment.email === user.email) 
                                                ? payments.find(payment => payment.email === user.email).status 
                                                : "Unpaid"
                                        }
                                    </td>                           
                                    <td className="flex items-center gap-2"><p onClick={()=>handleMakeAdmin(user)}><Buttonmd text={"Admin"}></Buttonmd></p>or<p onClick={()=>handleMakeSurveyor(user)}><Buttonmd text={"Surveyor"}></Buttonmd></p></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;