import { useState } from "react";
import Navbar from "../components/Navbar";
import ActionBar from "../components/Actionbar";
import Spinner from "../components/Spinner";
import ImageGrid from "../components/ImageGrid";
import { minidenticon } from 'minidenticons'
import React, { Component } from 'react';
import {toast } from "react-toastify";
import edit from "../assets/icons8-edit-20.png";
import MinidenticonImg from "../components/MinidenticonImg";
import { getCookie } from "../utils/getCookie";
import { getUser } from "../utils/getUser";
import { getEmail} from "../utils/getEmail"
import { getAvatar } from "../utils/getAvatar";
import { useNavigate } from "react-router-dom";
import DeleteUserModal from "../components/DeleteUserModal";
import { deleteCookie } from "../utils/deleteCookie";


const ProfilePage = () => {
    const [username, setUsername] = useState(getUser(getCookie('token'))); // TODO Replace with the username you want to update. How to do dynamically?
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState(localStorage.getItem('email')?localStorage.getItem('email'):"");
    const [clickedAvatar, setClickedAvatar] = useState(localStorage.getItem('avatar')?localStorage.getItem('avatar'):"");
    const [customAvatarSeed, setCustomAvatarSeed] = useState(clickedAvatar);
    const [temp, setTemp] = useState(email)

    const [passwordConfirmation, setPasswordConfirmationInput] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showPassConfirmation, setPasswordConfirmation] = useState(false)
    const [showingAvatar, showAvatar] = useState(false);

    const [edit_username, setEdit_username] = useState(false);
    const [edit_email, setEdit_email] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    

    const navigate = useNavigate();
    
    const seeds = [
        "silly goose", "angry cow", "salty shark", "motivated moose", "shy cat", "mad dog", "curious octopus", "happy snail",
        "humble butterfly", "patriotic Eagle", "nosey spider", "furious tiger", "ridiculous donkey ", "melancholy mule", "heroic horse", "nervous sheep",
        "boastful bear", "ditzy duck", "wonderful whale", "ecstatic fly", "elegant swan", "joyful jellyfish", "slow shongololo", "strong jaguar",
        "dumb buffalo", "daring dear", "sneaky crocodile", "enthusiastic penguin", "mellow meerkat", "perfect panda", "crusty crane", "mysterious panther",
        "crafty kangaroo", "scrawny snake", "lazy lizard", "loyal lion", "dangerous dragonfly", "inquisitive iguana", "tactical turtle", "delightful dolphin",
        "scary ostrich", "wasteful rabbit", "enraged wolverine", "majestic owl", "caring fox", "charismatic camel", "placid pangolin", "brave bison",
        "jolly scorpion", "funny lemur", "eclectic sloth", "fuzzy bunny", "prickly hedgehog", "gleeful giraffe", "crawly centipede", "intelligent elephant",
        "slimy gecko", "sleepy koala", "wise wombat", "mystical mouse", "zesty zebra", "perry the platypus", "pesky parrot" , "elusive eel"
      ];

    const [avatarSeeds, setAvatarSeeds] = useState(seeds);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';


    // const updateUserInfo = async () => {

    //     if (email == temp) {
    //         console.log("they equal")
    //         setTemp(null)
    //     } else {
    //         setTemp(email)
    //         console.log("they not eual")
    //     }
    //     try {

    //         const requestBody = {
    //             new_username: username,
    //             email: temp,
    //             password: password,
    //             avatar_url: clickedAvatar,
    //             };
            
            
    //       const response = await fetch(`/api/user?user=${username}`, {
    //         method: 'PUT',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(requestBody),
    //       });
    
    //       if (!response.ok) {
    //         const errorData = await response.json();
    //         toast.error(errorData.message);
    //         setSaveLoading(false);
    //         return;
    //       }
          
    //       toast.success('User information updated successfully!');
    //       setSaveLoading(false);
    //     } catch (error) {
          
    //       toast.error('Internal Server Error');
    //       setSaveLoading(false);
    //     }
    //   };

    
    const updateUsername = () => {
        const current_username = getUser(getCookie('token'))
        fetch(`/api/username?username=${current_username}`, {
            method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_username:username,
                    email: getEmail(getCookie('token')),
                    avatar_url: getAvatar(getCookie('token'))
                }),
        }).then(
            (response) => {
                console.log(response)
                if(response.ok){
                    toast.dark("Updated Username");
                    
                }else{
                    toast.error("Problem occurred while updating username");
                   
                }
                return response.json()
            }
        ).then(
            (data) => {
                console.log(data.token);
                if (data.token != null)
                    document.cookie = 'token=' + data.token;
            }
        )
    }

    const updatePassword = () => {
        const email  = getEmail(getCookie('token'));

        fetch(`/api/password?email=${email}`,{
            method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password:password,
                    
                }),
        }).then(
            (response) => {
                if(response.status === 200){
                    toast.dark("Updated Password");
                }else{
                    toast.error("Could not update password")
                }
            }
        )
    }

    const updateEmail = () => {
        // const email  = getEmail(getCookie('token'));
        const username  = getUser(getCookie('token'));


        fetch(`/api/verify-new-email?email=${email}&username=${username}`,{
            method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
        }).then(
            (response) => {
                if(response.status === 201){
                    toast.dark("Sent Email verification link");
                }else{
                    toast.error("Problem occurred sending email verification link")
                }
            }
        )
    }

    const deleteUser = async () => {

    const response = await fetch(`/api/user?user=${username}`, {
        
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
            const errorData = await response.json();
            // TODO ADD ERROR CHECKS HERE... ERROR: Cant deleteUser notes...
        }
        
        toast.dark('User Deleted!');
        setSaveLoading(false);
        deleteCookie('token');
        navigate('/');
    }

        
    const randomAvatarSeed = () => {
        const length = 3; // Length of 3 gives unique string for char set
        const charactersLength = characterSet.length;
        let seed = "";
            for (let j = 0; j < length; j++) {
                const randomIndex = Math.floor(Math.random() * charactersLength);
                seed += characterSet.charAt(randomIndex);
            }
           
        return seed;
    }

    const handleShowAvatarButton = () => {
        // Save current seed
        setCustomAvatarSeed(clickedAvatar)

        showingAvatar?
        showAvatar(false)
        :showAvatar(true)
    };

    const handleAvatarClick = (avatarSeed) => {
        setClickedAvatar(avatarSeed);
        localStorage.setItem('avatar',avatarSeed);
    };

    const handleDeleteUser = () => {
        setShowDeleteModal(true)
        //DeleteUserModal()
        //setDeleteLoading(true);
        //setShowConfirmation(true);
    };
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    const confirmDelete = () =>{
        setShowConfirmation(false);
        deleteUser();
        handleCloseDeleteModal()

    };

    const handleDeleteUserAndCloseModal = () => {
        deleteUser(username)
        setShowDeleteModal(false);
    };
        
    const cancelDelete = () => {
        setDeleteLoading(false);
        setShowConfirmation(false);
    };
        
    const handleSave = () => {
        setSaveLoading(true);
        updateUserInfo();

    };

    const handlePasswordChange = (e) => {
        (password=='123456')?
        setPassword(""):
        setPassword(e.target.value)

        setPasswordConfirmation(true);
    }

    const customAvatar = (e) => {
        setClickedAvatar(e);
        localStorage.setItem('avatar',e);
    }

    const saveCustomAvatarSeed = () => {
        showAvatar(!showingAvatar);

        const email  = getEmail(getCookie('token'));

        fetch(`/api/avatar?email=${email}`,{
            method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_avatar:clickedAvatar,
                    
                }),
        }).then(
            (response) => {
                if(response.status === 200){
                    toast.dark("Updated Avatar");
                }else{
                    toast.error("Could not update Avatar on the server");
                }
            }
        )
    }

    const discardCustomAvatar = (e) => {
        setClickedAvatar(customAvatarSeed);
        localStorage.setItem('avatar',customAvatarSeed);



        showingAvatar?
        showAvatar(false)
        :showAvatar(true)
    }

    const randomizeSeed = (e) => {
        const randomSeed = randomAvatarSeed();
        setClickedAvatar(randomSeed);
        localStorage.setItem('avatar',randomSeed);

    }

    const handleEmailChanged = (e) => {
        //setEmailChanged(true)
        setEmail(e.target.value)
    }

    return  (
        <>
        <Navbar/>
        <div className="bg-zinc-800">
            <div className="relative flex flex-col justify-center min-h-[95vh] overflow-hidden mx-8">
                <div className="w-full p-6 m-auto bg-zinc-800 rounded-md lg:max-w-xl">              
                    <div className="flex items-center justify-center">            

                        <div className="relative">
                        <MinidenticonImg username={clickedAvatar} saturation="90" width="150" height="150" />
                        {/* <minidenticon-svg username={clickedAvatar}></minidenticon-svg> */}
                            <a href="#Edit" onClick={handleShowAvatarButton} className="bottom-6 right-6 absolute w-6 h-6 bg-black border-2 border-white dark:border-gray-800 rounded-full">
                                <img src={edit} alt="Edit" className="w-full h-full hover:bg-purple-600 rounded-full" />
                            </a>
                        </div>
                    </div>
                    <br/>


                    {showingAvatar && (
                        
                            <div>
                               <div className="flex items-center justify-between">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                    value={clickedAvatar}
                                    onChange={(e) => customAvatar(e.target.value)}
                                />
                                <button
                                    className="ml-2 px-4 py-1 tracking-wide text-black transition-colors duration-200 transform bg-green-600 text-white rounded-full hover:bg-gray-500 focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    type="button"
                                    onClick={randomizeSeed}
                                >
                                    Random
                                </button>
                                <button
                                    className="ml-2 px-4 py-1 tracking-wide text-black transition-colors duration-200 transform bg-purple-600 rounded-full text-white hover:bg-gray-500 focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    type="button"
                                    onClick={saveCustomAvatarSeed}
                                >
                                    Save
                                </button>
                                <button
                                    className="ml-2 px-4 py-1 tracking-wide text-black transition-colors duration-200 transform bg-red-500 text-white rounded-full hover:bg-gray-500 focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    type="button"
                                    onClick={discardCustomAvatar}
                                >
                                    Close
                                </button>
                                
                            </div>
 
                                <br />                           
                                <div className="avatar-grid">      
                                    {avatarSeeds.map((avatarSeed) => (                                           
                                        <button key={avatarSeed} type ="button" onClick={() => handleAvatarClick(avatarSeed)}>
                                            <minidenticon-svg username={avatarSeed}></minidenticon-svg>
                                        </button>
                                    ))}                                                                                          
                                </div>                  
                                <br />
                                <button
                                    className="w-full px-4 py-2 tracking-wide text-black transition-colors 
                                    duration-200 transform bg-gray-200 rounded-md hover:bg-gray-500 
                                    focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    type = "button"
                                    onClick={handleShowAvatarButton}>
                                    Close                   
                                </button>     
                            </div> 
                        )}
                        <hr className="border-purple-600 my-2 border-2"/>
                   
                    <form className="mt-6">
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Username
                            </label>
                           
                           { 
                            edit_username?
                            
                                <span>
                                <input
                                    type="text"
                                    className="block w-full px-4 py-2 mt-2 
                                    text-black bg-white border rounded-md focus:border-purple-600 
                                    focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"                              
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}                               
                                />
                                <button className="bg-purple-600 hover:bg-purple-800 rounded-full text-white px-3 mx-1 my-2"
                                    onClick={() =>{updateUsername(); setEdit_username(false)}}
                                    type='button'
                                >
                                    Update
                                </button>
                                <button className="bg-red-500 hover:bg-gray-500 rounded-full my-2 text-white px-3 mx-1"
                                    onClick={() => setEdit_username(false)}
                                    type='button'
                                >
                                    Cancel
                                </button>
                                </span>
                            : 
                            <>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="text-white w-full">{username}</div>
                                <button
                                    className="bg-grey-600 bg-purple-600 hover:bg-purple-800 rounded-full px-3 my-2 text-white"
                                    onClick={() => setEdit_username(true)}
                                    type='button'
                                    >
                                    Edit
                                    </button>
                          </div>
                          <hr />
                          </>
                                
                           }
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Email
                            </label>
                            { 
                            edit_email?
                            <span>
                            <input
                                type="text"
                                className="block w-full px-4 py-2 mt-2 
                                text-black bg-white border rounded-md focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"                              
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}                               
                            />
                            <button className="bg-purple-600 hover:bg-purple-800 rounded-full text-white px-3 mx-1 my-2"
                                onClick={() =>{updateEmail(); setEdit_email(false)}}
                            >
                                Update
                            </button>
                            <button className="bg-red-500 hover:bg-gray-500 rounded-full my-2 text-white px-3 mx-1"
                                onClick={() => setEdit_email(false)}
                                type='button'
                            >
                                Cancel
                            </button>
                            </span>
                            : 
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="text-white w-full"> {email}</div>
                                <button  className="bg-grey-600 bg-purple-600 hover:bg-purple-800 rounded-full px-3 my-2 text-white"
                                    
                                    onClick={() => setEdit_email(true)}
                                    type='button'
                                >
                                    Edit
                                </button>
                                </div>
                                <hr />
                            </div>
                           }
                        </div>
                        <div className="mb-2">
                            {/* <label className="block text-sm font-semibold text-gray-100">
                                Password
                            </label>
                            <input
                                type="password"
                                className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={password}
                                onChange = {handlePasswordChange}
                            /> */}
                           
                            
                        </div>

                            { showPassConfirmation && (
                                <div className="mb-2">
                                <label className="block text-sm font-semibold text-gray-100">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}  
                                />
                                <label className="block text-sm font-semibold text-gray-100">
                                    re-enter Password
                                </label>
                                <input
                                    type="password"
                                    className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmationInput(e.target.value)}  
                                />
                                </div>
                            )}
                            
                            {
                            !showPassConfirmation?    
                            <button className="bg-purple-600 hover:bg-purple-800 rounded-full px-3 my-2 text-white"
                                type='button'
                                onClick={() => setPasswordConfirmation(true)}
                            >
                                Change Password?
                            </button>
                            :
                            <>
                            <button className="bg-purple-600 hover:bg-purple-800 rounded-full text-white px-3 mx-1 my-2 disabled:bg-purple-950"
                                    disabled={password !== passwordConfirmation}
                                    onClick={() => {updatePassword(); setPasswordConfirmation(false)}}
                                    type='button'
                            >
                                Update
                            </button>

                            <button className="bg-red-500 hover:bg-gray-500 rounded-full px-3 my-2 text-white"
                                type='button'
                                onClick={() => setPasswordConfirmation(false)}
                            >
                                Cancel
                            </button>

                            </>
                            }
                           
                        <div className="mt-6">
                            {
                               !deleteLoading?                            
                                <button 
                                    className="w-full px-4 py-2 tracking-wide text-black transition-colors 
                                    duration-200 transform bg-red-500 rounded-md hover:bg-gray-500 
                                    focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    onClick={handleDeleteUser}
                                    type="button"                                   
                                >
                                    Delete Account
                                </button>:
                                <Spinner className='text-purple-600'/>
                            }
                        
                        </div>
                        {showConfirmation && (
                            <div className="absolute top-1/3 left-1/4 w-1/2 h-1/2 bg-red-200 opacity-100 transition-opacity duration-300">
                                <p className="text-center mt-4 text-lg">Are you sure you want to delete your account? (This action is irreversiable)
                                </p>
                                <div className="flex justify-center mt-4">
                                    <button className="px-4 py-2 mx-2 bg-red-500 text-white rounded-md hover:bg-gray-500" onClick={confirmDelete}>Yes</button>
                                    <button className="px-4 py-2 mx-2 bg-gray-300 text-black rounded-md hover:bg-gray-500" onClick={cancelDelete}>No</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
            <DeleteUserModal onClose={handleCloseDeleteModal} visible={showDeleteModal} handleDeleteUser={handleDeleteUserAndCloseModal} username={username}/>
         </div>
            </>

     );
}


export default ProfilePage;