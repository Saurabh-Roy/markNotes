import { PropTypes } from 'prop-types'
import Note from './Note';
import DropdownCategories from './DropDownCategories';
import {useState} from 'react';
import NewNoteModal from './NewNoteModal';
import NewCategoryModal from './NewCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import newNoteIcon from '../assets/icons8-plus-64.png';
import newCategoryIcon from '../assets/icons8-plus-64.png';
import deleteCategoryIcon from '../assets/icons8-minus-64.png';

// eslint-disable-next-line react/prop-types
const ListOfNotes = ({notes, get_note_text, get_filter_category, handleSearchNote, categoryList, handleNewNote, handleNewCategory, handleDeleteCategory}) => {
    
    const [showNewNoteModal, setShowNewNoteModal] = useState(false);
    const handleCloseNewNoteModal = () => setShowNewNoteModal(false);

    const handleNewNoteAndCloseModal = (title, category) => {
        setShowNewNoteModal(false);
        const id = handleNewNote(title, category);
        return id;
    };

    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const handleCloseNewCategoryModal = () => setShowNewCategoryModal(false);

    const handleNewCategoryAndCloseModal = (category) => {
        setShowNewCategoryModal(false);
        handleNewCategory(category);
    };

    const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
    const handleCloseDeleteCategoryModal = () => setShowDeleteCategoryModal(false);

    const handleDeleteCategoryAndCloseModal = (category) => {
        setShowDeleteCategoryModal(false);
        handleDeleteCategory(category);
    };

    let row_number = 0;
    return (
        <div className="w-4/6 h-[95vh] overflow-y-scroll resize-none bg-zinc-800">
            <div className="flex justify-between items-center">
                <div>
                    <input
                        type="text"
                        className="bg-zinc-800 border-2 mt-5 mb-5 ml-1
                        border-purple-400 text-white w-5/6 rounded-xl
                        focus:border-purple-600 focus:outline-none pl-1"
                        placeholder='Search For Note'
                        onChange={(e) => handleSearchNote(e.target.value)}
                    />
                </div>
                <div className='flex justify-between items-center'>
                    <button
                        onClick={() => setShowNewCategoryModal(true)}
                        className="flex items-center text-white bg-purple-600 rounded-full mt-6 mb-5 mr-2.5 pl-2 pr-1 font-bold">
                        <span>New Category</span>
                        <img
                            onClick={() => setShowNewCategoryModal(true)}
                            src={newCategoryIcon}
                            className='w-5 ml-1'
                        />
                    </button>

                    <button
                        onClick={() => setShowDeleteCategoryModal(true)}
                        className="flex items-center text-white bg-purple-600 rounded-full mt-6 mb-5 mr-2.5 pl-2 pr-1 font-bold">
                        <span>Delete Category</span>
                        <img
                            onClick={() => setShowDeleteCategoryModal(true)}
                            src={deleteCategoryIcon}
                            className='w-5 ml-1'
                        />
                    </button>

                    <button
                        onClick={() => setShowNewNoteModal(true)}
                        className="flex items-center text-white bg-purple-600 rounded-full mt-6 mb-5 mr-4 pl-2 pr-1 font-bold">
                        <span>New Note</span>
                        <img
                            onClick={() => setShowNewNoteModal(true)}
                            src={newNoteIcon}
                            className='w-5 ml-1'
                        />
                    </button>
                </div>
                
            </div>

            <div className="border-4 border-zinc-950 border-b-purple-600 py-2 pl-1 bg-zinc-950 text-white">
                <span className='w-2/3 inline-grid grid-cols-2 text-ellipsis text-white'>
                    <span><h5>Title</h5></span>
                    <span>
                        <div className="flex items-center space-x-3">
                            <h5>Category</h5>
                            <DropdownCategories categories={categoryList} get_filter_category={get_filter_category}/>
                        </div>
                    </span>
                </span>
                <span className="float-right pr-5"><h5>Last Updated</h5></span>
            </div>

            {
                notes.map((note) => (
                    <Note
                        key={note.id}
                        id={note.id}
                        title={note.title}
                        category={note.category_name}
                        created_at={note.created_at}
                        updated_at={note.last_used}
                        note_text={note.body}
                        row_number={++row_number}
                        get_note_text={get_note_text}
                    />
                ))
            }
            <NewNoteModal onClose={handleCloseNewNoteModal} visible={showNewNoteModal} handleNewNote={handleNewNoteAndCloseModal} />
            <NewCategoryModal onClose={handleCloseNewCategoryModal} visible={showNewCategoryModal} handleNewCategory={handleNewCategoryAndCloseModal}/>
            <DeleteCategoryModal onClose={handleCloseDeleteCategoryModal} visible={showDeleteCategoryModal} handleDeleteCategory={handleDeleteCategoryAndCloseModal}/>
        </div>
    );
}
 
export default ListOfNotes;

ListOfNotes.propTypes = {
    notes:PropTypes.list,
    // get_note_text:PropTypes.func,
}

