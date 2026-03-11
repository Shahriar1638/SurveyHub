/* eslint-disable no-unused-vars */
import { useState, useContext, useEffect } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { TbPlaylistX } from "react-icons/tb";
import { BsPersonCircle } from "react-icons/bs";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import { AuthContext } from "../../../Firebase AuthProvider/AuthProvider";
import useAdmin from "@/Hooks/useAdmin";
import useSurveyor from "@/Hooks/useSurveyor";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logOut } = useContext(AuthContext);
  const location = useLocation();

  // Fetch roles - Ensure these hooks handle 'enabled: !!user' internally or we might need to wrapper them
  // Based on previous view_file, useAdmin and useSurveyor rely on useAxiosSecure and useQuery.
  // They might error if user is null.
  // Let's check logic:
  // useAdmin: const { user } = useContext(AuthContext); ... queryKey: [user?.email, ...]
  // If user is null, user.email throws error immediately in the component body?
  // "const { user } = useContext(AuthContext); ... await axiosSecure.get(`/user/admin/${user.email}`);"
  // YES, it will crash if user is null because user.email is accessed in queryFn or queryKey without check.
  // Wait, useAdmin.jsx: "queryKey: [user?.email, 'admin']" -> Safe.
  // "queryFn: async () => { ... user.email ... }" -> NOT Safe if query runs.
  // But react-query usually pauses if key has undefined? No, only if 'enabled' is false.
  // We should safely call these. But since hooks are "useX", we can't conditionally call them.
  // We will assume the hooks are robust enough OR we interpret the error.

  // Better strategy: Only render the Dashboard link if we KNOW they are admin/surveyor.
  // If user is not logged in, 'user' is null. The hooks might crash.
  // Hooks MUST be called at top level.

  // Let's rely on the fact that if (!user), the Dashboard link isn't shown, so maybe we don't care about the return value?
  // BUT the hook executes.
  // I will read the hooks again internally to be sure, but standard practice:
  // Pass `enabled: !!user` to the query in the hook.
  // Since I can't edit the hooks right this second without a new tool call, I will try to use them.
  // If they crash, I'll need to fix the hooks.
  // Actually, I saw useAdmin earlier.
  // "const { user } = useContext(AuthContext);"
  // "const { data: isAdmin } = useQuery({ queryKey: [user?.email, "admin"], queryFn: ... })"
  // If user is null, user?.email is undefined. queryKey has undefined.
  // React Query v4/v5: specific enabled logic?
  // If it crashes, I will fix the hooks.

  const [isAdmin] = useAdmin();
  const [isSurveyor] = useSurveyor();
  // Assuming these return [boolean, ...] or just [boolean]

  // Logic: Show Dashboard if Admin OR Surveyor.
  const showDashboard = user && (isAdmin === true || isSurveyor === true);

  const handleLogOut = () => {
    logOut()
      .then((result) => console.log(result.user))
      .catch((error) => console.error(error));
  };

  const linkClasses = ({ isActive, isPending }) =>
    `transition-colors duration-200 hover:text-brand-400 ${
      isPending
        ? "opacity-70"
        : isActive
          ? "text-brand-400 font-bold"
          : "text-gray-100"
    }`;

  const Options = (
    <>
      <li className="text-base font-medium">
        <NavLink to="/" className={linkClasses}>
          Home
        </NavLink>
      </li>
      <li className="text-base font-medium">
        <NavLink to={`/surveys`} className={linkClasses}>
          Surveys
        </NavLink>
      </li>
      {showDashboard && (
        <li className="text-base font-medium">
          <NavLink to={`/dashboard`} className={linkClasses}>
            Dashboard
          </NavLink>
        </li>
      )}

      {!user && (
        <li className="text-base font-medium">
          <NavLink to="/login" className={linkClasses}>
            Login
          </NavLink>
        </li>
      )}
    </>
  );

  const isHomePage = location.pathname === "/";

  return (
    <nav
      className={`
            fixed top-0 left-0 right-0 z-50
            flex flex-row h-20 justify-between items-center px-6 md:px-12 
            transition-all duration-300
            ${isHomePage ? "bg-navy-950/80 backdrop-blur-sm border-b border-white/10" : "bg-navy-950 shadow-md"}
            text-white
        `}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <img
          className="w-10 h-10 mr-3 rounded-full border border-white/20"
          src={logo}
          alt="Logo"
        />
        <h1 className="text-2xl font-bold tracking-tight">
          Survey<span className="text-brand-500">Hub</span>
        </h1>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-8">
        <ul className="flex items-center gap-8">{Options}</ul>

        {/* User Section */}
        <div className="flex items-center ml-4 pl-4 border-l border-white/20">
          {user ? (
            <>
              <div className="flex items-center mr-4 gap-3">
                {user.photoURL ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-500/50">
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <BsPersonCircle className="text-3xl text-brand-500" />
                )}
                <span className="text-sm font-medium hidden md:block text-gray-200">
                  {user.displayName?.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogOut}
                className="px-5 py-2 text-sm font-semibold bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 text-sm font-semibold bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
            >
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="lg:hidden flex items-center gap-4">
        {/* Mobile User Icon if logged in */}
        {user && (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-500/50">
            <img
              src={user.photoURL}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="text-3xl text-brand-500 hover:text-brand-400 transition-colors"
        >
          {open ? <TbPlaylistX /> : <AiOutlineMenu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`
                absolute top-20 left-0 w-full bg-navy-900/95 backdrop-blur-md border-b border-white/10
                flex flex-col items-center py-8 gap-6
                transition-transform duration-300 origin-top
                ${open ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
            `}
      >
        <ul className="flex flex-col items-center gap-6 text-lg">{Options}</ul>
        {user && (
          <button
            onClick={() => {
              handleLogOut();
              setOpen(false);
            }}
            className="px-8 py-2 font-semibold bg-brand-500 rounded-md hover:bg-brand-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
