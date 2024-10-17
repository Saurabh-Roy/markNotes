import { Link, useNavigate } from "react-router-dom";
// import edit from "../assets/icons8-edit-20.png"
import MinidenticonImg from "./MinidenticonImg";
import home_icon from "../assets/icons8-home-30.png"
import logout_icon from "../assets/icons8-logout-30.png"
import { getAvatar } from "../utils/getAvatar";
import { getCookie } from "../utils/getCookie";
import { deleteCookie } from "../utils/deleteCookie";

export const navLinks = [
  {
    id: "/home",
    title: "Home",
  }
];

const Navbar = () => {
  const navigate = useNavigate('/');
  const handleLogout = () => {
    deleteCookie('token');
    navigate('/');

  }
  return (
    <nav className="w-full flex py-2 justify-between items-center navbar bg-zinc-900 h-[5vh] z-[999]">
      {/* Logo */}
      <Link to="/home"><h1 className="text-3xl text-white pl-8 sm:flex hidden">Mark Notes</h1></Link>
      
      {/* Desktop Navigation */}
      <ul className="list-none sm:flex justify-end items-center flex">
       
          <li
            
            className="cursor-pointer text-[16px] text-white pr-5 pl-8"
          >
        <Link to="/home"><img src={home_icon} className="hover:bg-purple-800 rounded-lg mb-3 " /></Link>
            
          </li>
          <li
            onClick={handleLogout}
            className="text-[16px] text-white pr-5"
          >
        <Link to="/"><img src={logout_icon} className="hover:bg-purple-800 rounded-sm mb-3" width="26" /></Link>
            
          </li>
        
        <div className="relative">
			<Link to="/profile"><MinidenticonImg username={localStorage.getItem('avatar')||""} saturation="90" width="35" height="35" /></Link>
            
            
          {/* <img src={edit} className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-black border-2 border-white dark:border-gray-800 rounded-full"></img> */}
        </div>

        
        
        
      </ul>

    </nav>
  );
};
export default Navbar;