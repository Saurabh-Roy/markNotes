import { useEffect, useState } from "react";
import { getUser } from "../utils/getUser";
import { getCookie } from "../utils/getCookie";
import { toast } from "react-toastify";
import { PropTypes } from 'prop-types'

const ShareNoteModal = ({onClose, visible, note_id}) => {
    

    const [all_users, setAll_users] = useState([]);
    const [chosen_user, setChosen_user] = useState('');
    const [role, setRole] = useState('collaborator');

    //This use Effect fetches all of the users
    useEffect(() => {
        fetch("/api/usersall",{
            "method":"GET",
            headers: {
                'Accept': 'application/json'
                },
        }).then(
            response => {
                return response.json();
            }
        ).then(
            data =>{               
                setAll_users(data)
            }
        )
    },[])
    


    const handleOnClose = (e) => {
        if (e.target.id === 'container')
            onClose();
    }

    const handleShareNote = () => {
        const user = getUser(getCookie("token"));
        fetch(`/api/usernotes?user=${user}`,{
            method:"POST",
            headers:{
                'Content-Type':"application/json"
            },
            body: JSON.stringify({
                user_to_add:chosen_user,
                new_role:role,
                note_id:note_id
            })
        }).then(
            (response) => {
                if(response.ok){
                    toast.dark("Successfully shared note");
                }else{
                    toast.error("Problem occurred sharing note");
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
                        Share note
                    </p>
                    <div className="pt-2 flex flex-col items-center space-y-1">
                        <input
                            // placeholder={ogTitle}
                            onChange={(e) => setChosen_user(e.target.value)}
                            list="searchOptions"
                            className="font-bold tracking-wide pl-1 rounded-lg border-2 border-purple-400 bg-zinc-700 text-sm focus:border-purple-600 focus:outline-none"
                        />
                        <datalist id="searchOptions">
                            {all_users.map((user, index) => (
                            <option key={index} value={user.username} />
                        
                    ))}
                    </datalist>
                    </div>
                    <div className="bg-purple-600 text-black my-5 rounded-full px-2 ">
                    <b>Role:</b>
                        <select name="Role" id="roles" className="bg-purple-600 rounded-full"
                            onChange={(e) => {setRole(e.target.value)}}
                        >
                            <option value="collaborator">Collaborator</option>
                            <option value="viewer">Viewer</option>
                            <option value="owner">Make new owner</option>

                        </select>
                    </div>
                    {/* {errorMsg && <p className="text-red-600 text-xs font-bold tracking-wide pt-1">{errorMsg}</p>} */}
                </div>
                <div className="flex items-center justify-center pb-3 space-x-3">
                    <button 
                        onClick={() => {handleShareNote()}}
                        className="bg-purple-600 rounded-lg text-black px-1 text-sm active:text-white duration-300">
                        Share
                    </button>
                    <button onClick={onClose} className="bg-red-600 rounded-lg px-1 text-black text-sm active:text-white duration-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
 
export default ShareNoteModal;


ShareNoteModal.propTypes = {
    visible:PropTypes.bool,
    onClose:PropTypes.func,
    note_id:PropTypes.string,
}