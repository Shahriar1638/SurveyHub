import { Outlet } from "react-router-dom";
import Footer from "../Pages/Shared/Navbar & Footer/Footer";
import Navbar from "../Pages/Shared/Navbar & Footer/Navbar";

const Layout = () => {
    return (
        <div>
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default Layout;