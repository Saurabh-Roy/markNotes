import { getUser } from "../utils/getUser";
import { getCookie } from "../utils/getCookie";
import { toast } from "react-toastify";
import { PropTypes } from 'prop-types'
import { useState } from "react";

const ChangeTitleModal = ({onClose, visible,category, body, note_id, setTitle}) => {
    

    const [new_title, setNew_title] = useState('');

    
    


    const handleOnClose = (e) => {
        if (e.target.id === 'container')
            onClose();
    }

    //Change title of note
    const handleChangeTitle = () => {
        const user = getUser(getCookie("token"));
        fetch(`/api/notes?user=${user}&id=${note_id}`,{
            method:"PUT",
            headers:{
                'Content-Type':"application/json"
            },
            body: JSON.stringify({
                body:body,
                title:new_title,
                category:category
            })
        }).then(
            (response) => {
                if(response.ok){
                    toast.dark("Successfully updated title");
                    setTitle(new_title);
                }else{
                    toast.error("Problem occurred updating title");
                }
            }
        )
    }

    if (!visible) return null;
    return (
        <div id="container"
            onClick={handleOnClose}
            className="text-white fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-60">
            <div className=" bg-zinc-700 rounded-lg border-purple-500 border-2 w-[300px] h-[160px] flex flex-col">
                <div className="flex-grow flex flex-col items-center">
                    <p className="text-center pt-1 font-bold tracking-wide text-2xl">
                        Edit Note title
                    </p>
                    <div className="pt-2 flex flex-col items-center space-y-1">
                        <input
                            value={new_title}
                            onChange={(e) => setNew_title(e.target.value)}
                            list="searchOptions"
                            className="font-bold tracking-wide pl-1 rounded-lg border-2 border-purple-400 bg-zinc-700 text-sm focus:border-purple-600 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center pb-3 space-x-3">
                    <button 
                        onClick={() => {handleChangeTitle(); onClose()}}
                        className="bg-purple-600 rounded-lg text-black px-1 text-sm active:text-white duration-300"
                        disabled={new_title===""}

                        >
                        Update
                    </button>
                    <button onClick={onClose} className="bg-red-600 rounded-lg px-1 text-black text-sm active:text-white duration-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
 
export default ChangeTitleModal;


ChangeTitleModal.propTypes = {
    visible:PropTypes.bool,
    onClose:PropTypes.func,
    body:PropTypes.string,
    category:PropTypes.string,
    note_id:PropTypes.string,
    setTitle:PropTypes.func,
}