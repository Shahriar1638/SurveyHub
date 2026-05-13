import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import { useContext, useEffect, useState } from "react";

const useUsers = () => {
  const { user } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if user exists
    if(user?.email) {
      fetch(`${import.meta.env.VITE_API_URL}/users/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setCurrentUser(data);
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  return [currentUser, loading];
};

export default useUsers;