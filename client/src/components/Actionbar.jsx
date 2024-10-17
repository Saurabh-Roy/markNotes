import { useState } from "react";
import save_icon from "../assets/icons8-save-30.png"
import share_icon from "../assets/icons8-share-30.png"
import home_icon from "../assets/icons8-home-30.png"
import { Link } from "react-router-dom";
import { PropTypes } from 'prop-types'


const ActionBar = ({title, category, openShareModal, openTitleModal, openCategoryModal}) => {

    // const [note_title, setNote_title] = useState(title);
    // const [note_category, setNote_category] = useState(category);
   

    // const shareNote = async () => {
    // //     fetch(`/api/usernotes?username=${getUser(getCookie('token'))}`,{
    // //         method:'POST',
    // //         headers: {
    // //             'Content-Type': 'application/json'
    // //             },
    // //             body: JSON.stringify({
    // //                 new_role:'collaborator',
    // //                 password:password,
    // //                 user_to_add:getUser(getCookie('token')),
    // //             })
    // //     })
    //     console.log("what");
    // }
    
    return (
        <>
        <nav className="w-full flex py-2 justify-between items-center navbar bg-zinc-900 h-[5vh] sticky top-0">
    
            <span className='w-1/2 inline-grid grid-cols-1 text-ellipsis text-white'>
            
                    <span className='text-ellipsis overflow-hidden whitespace-nowrap pl-4 text-3xl hover:bg-purple-600'
                        onClick={openTitleModal}
                    >
                    {title}
                    </span> 
                </span>
            

            
            {/* Desktop Navigation */}
            <ul className="list-none sm:flex justify-end items-center flex mt-0 text-white w-1/2">
                <li className="pr-5 w-1/3 text-ellipsis overflow-hidden whitespace-nowrap relative">
                    <b className="hover:bg-purple-800 rounded-lg mr-5"
                        onClick={openCategoryModal}
                    >{category}</b>
                </li>

                <li className="pr-5">
                    <Link to="/home"><img src={home_icon} className="hover:bg-purple-800 rounded-lg"/></Link>
                </li>
                <li className="pr-5">
                    <img src={save_icon} className="hover:bg-purple-800 rounded-lg"/>
                </li>
                <li className="pr-5" onClick={openShareModal}>
                    <img src={share_icon} className="hover:bg-purple-800 rounded-lg"/>
                </li>
            </ul>

        </nav>
        
        </>

    );
};
      
export default ActionBar;


ActionBar.propTypes = {
    title:PropTypes.string,
    category:PropTypes.string,
    openShareModal:PropTypes.func,
    openTitleModal:PropTypes.func,
    openCategoryModal:PropTypes.func,
}
