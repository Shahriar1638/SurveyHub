/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { FaFilter, FaUsers, FaUserShield, FaPoll } from "react-icons/fa";
import Buttonmd from "@/Components/buttons/Buttonmd";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import Subtitles from "@/Components/Sectiontitles/Subtitles";

const ManageUsers = () => {
  const roles = ["admin", "user", "prouser", "surveyor", "all"];
  const [selectedPerson, setSelectedPerson] = useState("all");
  const axiosSecure = useAxiosSecure();

  // Improved role display helper
  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      user: "bg-blue-100 text-blue-700 border-blue-200",
      surveyor: "bg-brand-100 text-brand-700 border-brand-200",
      prouser: "bg-green-100 text-green-700 border-green-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${styles[role] || "bg-gray-100"}`}
      >
        {role}
      </span>
    );
  };

  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await axiosSecure.get("/payments");
      return res.data;
    },
  });

  const [displayUsers, setDisplayUsers] = useState(users);
  useEffect(() => {
    setDisplayUsers(users);
  }, [users]);

  const handleFilter = (role) => {
    setSelectedPerson(role);
    if (role == "all") {
      setDisplayUsers(users);
    } else {
      const filteredUsers = users.filter((user) => user.role === role);
      setDisplayUsers(filteredUsers);
    }
  };

  const handleMakeAdmin = (user) => {
    Swal.fire({
      title: `Promote ${user.name}?`,
      text: "They will have full admin access.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f88703", // Brand Color
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Promote to Admin",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .patch(`/users/admin/${user._id}`)
          .then((response) => {
            refetch();
            Swal.fire({
              title: "Promoted!",
              text: `${user.name} is now an admin`,
              icon: "success",
              confirmButtonColor: "#f88703",
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleMakeSurveyor = (user) => {
    Swal.fire({
      title: `Promote ${user.name}?`,
      text: "They will be able to create and manage surveys.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f88703",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Make Surveyor",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .patch(`/user/surveyor/${user._id}`)
          .then((response) => {
            refetch();
            Swal.fire({
              title: "Promoted!",
              text: `${user.name} is now a surveyor`,
              icon: "success",
              confirmButtonColor: "#f88703",
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  return (
    <div className="p-6 md:p-12 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <Subtitles text={"Manage Users"}></Subtitles>

        {/* Modern Filter Dropdown */}
        <div className="relative z-10">
          <Listbox value={selectedPerson} onChange={handleFilter}>
            <Listbox.Button
              className="
                            flex items-center gap-2 px-6 py-2.5 
                            bg-white border text-brand-600 font-semibold border-brand-200 
                            rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer w-48 justify-between
                        "
            >
              <span className="flex items-center gap-2 capitalize">
                <FaFilter className="text-brand-500" />
                {selectedPerson}
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-1 focus:outline-none">
              {roles.map((role) => (
                <Listbox.Option
                  key={role}
                  value={role}
                  className={({ active }) =>
                    `cursor-pointer select-none rounded-lg px-4 py-2 capitalize transition-colors ${
                      active ? "bg-brand-50 text-brand-700" : "text-gray-700"
                    }`
                  }
                >
                  {role}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-950 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-center text-sm font-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayUsers.map((user, idx) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-gray-900">
                        {user.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    {payments.some(
                      (payment) => payment.email === user.email,
                    ) ? (
                      <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">
                        Paid
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleMakeAdmin(user)}
                        className="tooltip tooltip-top p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                        data-tip="Make Admin"
                        disabled={user.role === "admin"}
                      >
                        <FaUserShield className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleMakeSurveyor(user)}
                        className="tooltip tooltip-top p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                        data-tip="Make Surveyor"
                        disabled={user.role === "surveyor"}
                      >
                        <FaPoll className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-6">
        Showing {displayUsers.length} users
      </div>
    </div>
  );
};

export default ManageUsers;
