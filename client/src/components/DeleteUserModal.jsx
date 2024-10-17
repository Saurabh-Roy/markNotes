
function Modal({onClose, visible, handleDeleteUser, username}) {
    if (!visible) return null;

    const handleOnClose = (e) => {
        if (e.target.id === 'container')
            onClose();
            
    }

    return (
        <div id="container"
            onClick={handleOnClose}
            className="text-white fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
            <div className=" bg-zinc-700 rounded-lg border-red-500 border-2 w-[300px] h-[130px] flex flex-col">
                <div className="flex-grow flex flex-col items-center">
                    <p className="text-center pt-3">
                        Are you sure you want to delete this User?
                    </p>
                    <p className="pt-1 font-bold tracking-wide text-center">
                        {username} ? {/** Put actual note title here */}
                    </p>
                </div>
                <div className="flex items-center justify-center pb-4 space-x-3">
                    <button 
                        onClick={handleDeleteUser}
                        className="bg-red-500 rounded-lg text-black px-1 text-sm active:text-white duration-300">
                        Delete
                    </button>
                    <button onClick={onClose} className="bg-green-500 rounded-lg px-1 text-black text-sm active:text-white duration-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal;