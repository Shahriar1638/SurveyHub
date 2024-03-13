import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import { useContext, useEffect, useState } from "react";

const useUsers = () => {
    const { user } = useContext(AuthContext);
    const [ currentUser, setCurrentUser ] = useState(user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://surveyhubserver.vercel.app/users/${user.email}`)
        .then(res => res.json())
        .then(data => {
            setCurrentUser(data);
            setLoading(false);
        })
    }, [user.email]);

    return [ currentUser , loading];
};

export default useUsers;