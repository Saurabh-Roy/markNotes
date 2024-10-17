import { PropTypes } from 'prop-types'
import { marked } from "marked";
import { useNavigate } from 'react-router-dom';
import DeleteNoteModal from './DeleteNoteModal';
import EditTitleModal from './EditTitleModal';
import {useState} from 'react';

const MarkdownComponent = ({id, data, title, handleDeleteNote, handleEditTitle}) => {
    const createMarkUp = (val) => {
        return { __html: marked(val) }
    }

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    const handleDeleteNoteAndCloseModal = () => {
        handleDeleteNote();
        setShowDeleteModal(false);
    };

    const [showEditTitleModal, setShowEditTitleModal] = useState(false);
    const handleCloseEditTitleModal = () => setShowEditTitleModal(false);

    const navigate = useNavigate();
    
    return (
        
    <div className="w-1/2 bg-zinc-900">
        <div className='markdown h-[91vh] overflow-x-scroll overflow-y-scroll text-white' dangerouslySetInnerHTML={createMarkUp(data)}></div>
        
        <div className="flex w-full justify-between items-center h-[4vh] border-2 border-zinc-900 border-t-purple-600">
            <h2 
                onClick={title !== "Select a Note" ? () => setShowEditTitleModal(true) : null}
                className="text-xl text-white font-black w-2/3 h-[4vh] text-ellipsis overflow-hidden whitespace-nowrap"> 
                {title}
            </h2>
            <div>
                {title !== "Select a Note" && (
                    <>
                        {/* Edit Button */}
                        <button className="float-right text-white px-1.5 mr-3 rounded-lg bg-purple-600 text-sm"
                            onClick={() => navigate(`/edit-note/${id}`, { state: data })}>
                            Edit
                        </button>
                        {/* Delete Button */}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="float-right text-white px-1 mr-2 rounded-lg bg-red-600 text-sm">
                            Delete
                        </button>
                    </>
                )}
                
            </div>
            <DeleteNoteModal onClose={handleCloseDeleteModal} visible={showDeleteModal} handleDeleteNote={handleDeleteNoteAndCloseModal} title={title}/>
            <EditTitleModal onClose={handleCloseEditTitleModal} visible={showEditTitleModal} ogTitle={title} handleEditTitle={handleEditTitle} note_id={id}/>
        </div>
    </div>
      
    )
    
}
 
export default MarkdownComponent;



MarkdownComponent.propTypes = {
    id:PropTypes.integer,
    data:PropTypes.string,
    title:PropTypes.string,
    handleDeleteNote:PropTypes.func,
    handleEditTitle:PropTypes.func,
};

