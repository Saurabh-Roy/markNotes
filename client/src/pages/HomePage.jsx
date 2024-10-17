import { useEffect, useState } from "react";
import HomepageMarkdownComponent from "../components/HomepageMarkdownComponent";
import Navbar from "../components/Navbar";
import '../index.css';
import ListOfNotes from "../components/ListOfNotes";
import { getUser } from '../utils/getUser';
import { getCookie } from "../utils/getCookie";
import {toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
// import Quill from "quill";
// import QuillToPlainText from 'quill-to-plaintext'


// function htmlToDelta(html) {
//     const div = document.createElement('div');
//     div.setAttribute('id', 'htmlToDelta');
//     div.innerHTML = `<div id="quillEditor" style="display:none">${html}</div>`;
//     document.body.appendChild(div);
//     const quill = new Quill('#quillEditor', {
//       theme: 'snow',
//     });
//     const delta = quill.getContents();
//     document.getElementById('htmlToDelta').remove();
//     return delta;
// }

function deltaToPlainText(delta) {
	let delta_obj = null;
	if (typeof delta === "string")
		delta_obj = JSON.parse(delta);
	else if (typeof delta === "object")
		delta_obj = delta;
	
	if (delta_obj === null || !("ops" in delta_obj)) throw "Can't convert invalid Quill Delta to plaintext!";
	
	let plaintext = "";
	for (let i=0; i < delta_obj.ops.length; i++) {
		let op = delta_obj.ops[i];
		if (op.insert) {
			if (typeof op.insert === "string") {
				plaintext += op.insert;
			} else {
				plaintext += " ";
			}
		}
	}
	
	return plaintext;
}

const HomePage = () => {
    const [text, setText] = useState('');
    const [note_title, setNoteTitle] = useState('Select a Note');
    const [id , setId] = useState(-1);

    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All');

    // I've done this so that filtered_notes are what's always displayed, but this allows me to store
    // all the user's notes so that when you want to change filters at any time, even within filters,
    // the kak works. Horrible description sorry, will try explain better later
    useEffect(() => {
        setFilteredNotes(notes);
    }, [notes]);

    const [categories, setCategories] = useState(
        [{category_name: "All", category_id: -1}]
    );

    const username = getUser(getCookie('token'));
    const navigate = useNavigate();
    
    const handleFilterCategories = async (category) => {
        
        if (category.category_id != -1) {
            const filtered_notes = notes.filter((note) => note.category_id === category.category_id);
            setFilteredNotes(filtered_notes);
            setFilterCategory(category.category_name);
        } else {
            setFilterCategory("All");
            handleFetchNotes();
        }
    }

    const [refereshNotes, setRefreshNotes] = useState(false);
    // Fetching list of notes
    const handleFetchNotes = () => {

        fetch(`/api/notes?user=${username}&order=recent`,{
            method:'GET',
            headers: {
                'Content-Type': 'application/json'
                }
        }).then(
            (response) => {
                console.log(response)
                return response.json();
            }
        ).then(
            (data) => {
                if (data.notes) {
                    console.log(data.notes);
                    setNotes(data.notes);
                }
            }
        ).catch(
            (err) =>{
                toast.error("Problem occurred with the server");
                console.log(err);
            }
        );

    }

    useEffect(() => {
        handleFetchNotes();
    }, [refereshNotes]);

    const [refereshCategories, setRefreshCategories] = useState(false);
    // Fetching list of notes
    const handleFetchCategories = () => {

        fetch(`/api/categories?user=${username}`,{
            method:'GET',
            headers: {
                'Content-Type': 'application/json'
                }
        }).then(
            (response) => {
                return response.json();
            }
        ).then(
            (data) => {
                if (data.categories) {
                    console.log(data.categories);
                    const tempCats = [{category_name: "All", category_id: -1}, ...data.categories];
                    setCategories(tempCats);
                }
            }
        ).catch(
            (err) =>{
                toast.error("Problem occurred with the server");
                console.log(err);
            }
        );

    }

    useEffect(() => {
        handleFetchCategories();
    }, [refereshCategories]);
    
    const get_text_from_note = async (note_text, note_title, note_id) => {
        console.log("text: "+note_text);
        console.log("title: "+note_title);
        console.log("id: "+note_id);
        


        const normal_text = deltaToPlainText(note_text);
        // console.log(htmlToDelta(note_text));

        setText(normal_text);
        setNoteTitle(note_title);
        setId(note_id);
    }

    const handleDeleteNote = async () => {
        console.log("Delete the note");

        const username = getUser(getCookie('token'));
        const response = await fetch(`/api/notes?user=${username}&id=${id}`, {

            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
            });
        
        if (response.ok) {
            toast.dark('Note Deleted!');
            handleFetchNotes();
           
        } else {
            const errorData = await response.json();
            toast.error(errorData);
        }
    }
    

    // Currently called every time a letter is changed in the search bar
    const handleSearchNote = (title) => {
        
        let catFilteredNotes = notes;

        if (filterCategory !== 'All') {
            catFilteredNotes = notes.filter((note) => note.category_name === filterCategory);
        }
        
        const catAndTitleFilteredNotes = catFilteredNotes.filter((note)=>{return note.title.toLowerCase().includes(title.toLowerCase())})
        setFilteredNotes(catAndTitleFilteredNotes);
    
    }

    const handleNewNote = (title, category) => {
        console.log("Create " + title + " with category = " + category);

        fetch(`/api/notes?user=${username}`,{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    body:' ',
                    title:title,
                    category:category
                })
        }).then(
            (response) => {
                return response.json();
            }
        ).then(
            (data) => {
                setId(data.note.note_id);
                const localID = data.note.note_id;
                navigate(`/edit-note/${localID}`, { state: '' });
                return localID;
            }
        ).catch(
            (err) =>{
                toast.error("Problem occurred with the server");
                console.log(err);
            }
        )
        return id;
        
    }

    const handleEditTitle = (title, note_id) => {
        console.log("New Title: "+title);

        fetch(`/api/notes?user=${username}&id=${note_id}`,{
            method:'PUT',
            headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title:title,
                })
        }).then(
            (response) => {
                return response.json();
            }
        ).then(
            (data) => {
                // setId(data.note.note_id);
                // const localID = data.note.note_id;
                // return localID;

                if (data.message === 'Note updated successfully') {
                    setNoteTitle(title);
                    handleFetchNotes();
                }
            }
        ).catch(
            (err) =>{
                toast.error("Problem occurred with the server");
                console.log(err);
            }
        )

    }

    const handleNewCategory = (categoryName) => {
        if (!categoryName || categoryName.trim() === '') {
            toast.error('Category name cannot be empty.');
            return;
        }
    
        fetch(`/api/categories?user=${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category_name: categoryName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "User Category added or already exists") {

                toast.dark('Category added successfully!');
                window.location.reload();
            } else {
                toast.error(data.message || "An error occurred.");
            }
        })
        .catch(err => {
            toast.error("Problem occurred with the server");
            console.log(err);
        });
    
        setRefreshNotes(prev => !prev);
        setRefreshCategories(prev => !prev);
    };
    
    
    

    const handleDeleteCategory = async (category) => {
        console.log("Delete Category: "+category);
      
        const username = getUser(getCookie('token'));
        const response = await fetch(`/api/categories?user=${username}&category=${category}`, {

            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
            });
        
        if (response.ok) {
            toast.dark('Category Deleted!');
            handleFetchCategories()           
        } else {
            const errorData = await response.json();
            toast.error(errorData);
        }

    }

    return (
        <>
            <Navbar/>
                <div className="flex h-[95] relative">
                    <ListOfNotes
                        notes={filteredNotes}
                        get_note_text={get_text_from_note}
                        get_filter_category={handleFilterCategories}
                        handleSearchNote={handleSearchNote}
                        categoryList={categories}
                        handleNewNote={handleNewNote}
                        handleNewCategory={handleNewCategory}
                        handleDeleteCategory={handleDeleteCategory}
                    />
                    <HomepageMarkdownComponent className="hidden md:flex" 
                        data={text}
                        id={id}
                        title={note_title}
                        handleDeleteNote={handleDeleteNote}
                        handleEditTitle={handleEditTitle}
                    />
                </div>
        </>
    );

    }
export default HomePage;
