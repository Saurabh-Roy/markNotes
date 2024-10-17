import {useState} from 'react';

function Modal({onClose, visible, ogTitle, handleEditTitle, note_id}) {
    if (!visible) return null;
    const [title, setTitle] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleOnClose = (e) => {
        if (e.target.id === 'container')
            onClose();
    }

    const handleEditNoteTitle = () => {

        if (title.trim() === '') {
            setErrorMsg('Empty Fields');
        } else {
            setErrorMsg('');
            handleEditTitle(title, note_id);
            onClose();
        }
        

    }

    return (
        <div id="container"
            onClick={handleOnClose}
            className="text-white fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
            <div className=" bg-zinc-700 rounded-lg border-purple-500 border-2 w-[300px] h-[160px] flex flex-col">
                <div className="flex-grow flex flex-col items-center">
                    <p className="text-center pt-1 font-bold tracking-wide text-2xl">
                        Edit Note Title
                    </p>
                    <div className="pt-2 flex flex-col items-center space-y-1">
                        <input
                            placeholder={ogTitle}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-bold tracking-wide pl-1 rounded-lg border-2 border-purple-400 bg-zinc-700 text-sm focus:border-purple-600 focus:outline-none">
                        </input>
                    </div>
                    {errorMsg && <p className="text-red-600 text-xs font-bold tracking-wide pt-1">{errorMsg}</p>}
                </div>
                <div className="flex items-center justify-center pb-3 space-x-3">
                    <button 
                        onClick={() => {handleEditNoteTitle()}}
                        className="bg-purple-600 rounded-lg text-black px-1 text-sm active:text-white duration-300">
                        Confirm
                    </button>
                    <button onClick={onClose} className="bg-red-600 rounded-lg px-1 text-black text-sm active:text-white duration-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal;