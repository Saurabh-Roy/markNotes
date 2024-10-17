import { PropTypes } from 'prop-types'
import MarkdownComponent from "../components/MarkdownComponent";
import { useEffect, useState, useRef } from "react";
import { useLocation,useNavigate,useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import { getUser } from '../utils/getUser';
import { getCookie } from '../utils/getCookie';
import ActionBar from '../components/Actionbar';
import ShareNoteModal from '../components/shareNoteModal';
import ChangeTitleModal from '../components/ChangeTitleModal';
import ChangeCategoryModal from '../components/ChangeCategoryModal';
  
const TIME_FOR_SAVING_MS = 1000;


const EditPage =  () => {
    const location = useLocation();
    const [text, setText] = useState(location.state?location.state:'');
    const [quill_text, setQuill_text] = useState(location.state?location.state:'');
    const [note_title, setNoteTitle] = useState('New Note');
    const [note_category, setNote_category] = useState('No Category');
    const [socket, setSocket] = useState();
    const [read_only,setRead_only] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [user_role, setUser_role] = useState('');
    const [editors, setEditors] = useState([]);
    const [display_editors, setDisplay_editors] = useState(true);
    

    const navigate = useNavigate();

    const handleCloseShareModal = () => {
        setShowShareModal(false);
    }

    const handleOpenShareModal = () => {
        setShowShareModal(true);
    }

    const handleCloseTitleModal = () => {
        setShowTitleModal(false);
    }

    const handleOpenTitleModal = () => {
        setShowTitleModal(true);
    }

    const handleCloseCategoryModal = () => {
        setShowCategoryModal(false);
    }

    const handleOpenCategoryModal = () => {
        setShowCategoryModal(true);
    }
    const {id: note_id} = useParams();
    
    // const data = location.state;
    // console.log(data);

    //This useEffect connects to the socket
    useEffect(() => {
        const s = io('http://localhost:5000',{      // change to : 'https://webdev-server-bf3aa5b31c03.herokuapp.com' for deployment
            withCredentials: true,
        })
        setSocket(s)

        return () => {
            s.disconnect();
        }
    },[])

    const handleChange = (content, delta, source, editor) => {
        
        setQuill_text(content);
        setText(editor.getText());

        // Checks if changes to the note are coming from the current user and that
        // the changes are not coming from another user through the socket
        // i.e only send changes to socket if the changes are from the current user
        if(source === 'user'){
            if(socket != null) socket.emit("send-changes",{delta:delta,username:getUser(getCookie('token'))});
        }
    }

    //This useEffect checks if a user has access to the current note
    useEffect(() => {
        if(note_id == null) navigate("/home");
        const user = getUser(getCookie('token'));
        fetch(`/api/notes?user=${user}&id=${note_id}`,{
            method:'GET',
            headers:{
                'Accept': 'application/json'
                },
        }).then(
            (response) => {
                if(response.ok){
                    return response.json();
                }else{
                    navigate("/home")
                }
            }
        ).then(
            (data) => {
                setUser_role(data.notes[0].role);
                // console.log(data.notes[0].role);
            }
        )
    },[navigate,note_id])

    //This use effects enforces viewers not being able to edit a note
    useEffect(() => {
        if(user_role === 'viewer'){
            setRead_only(true);
            console.log("this is a viewer");
        }
    },[user_role, read_only])

    //This useEffect receives other peoples changes to the document
    useEffect(() => {
        if (socket == null) return;
        

        const receiveChange = (data) => {
            console.log('is this not being called?');

            if(quill_ref != null){
                quill_ref.current.getEditor().updateContents(data.delta);
                if(!editors.includes(" "+data.username)){
                    setEditors(editors.concat(" "+data.username));
                    setDisplay_editors(true);
                }
                
                // setText(quill_ref.current.getEditor().getText());
            }
        }
        socket.on('receive-changes',receiveChange);
        console.log(editors);

        return () => {
            socket.off('receive-changes',receiveChange);
        }
    },[socket,quill_text])

    //This useEffect receives the note from the database
    useEffect(() => {
        if (socket == null) return;

        socket.once('load-note', (note_contents) => {
            // console.log(note_contents);
            setNoteTitle(note_contents.title);
            setNote_category(note_contents.category_name);
            // setQuill_text(note_contents.body);
            quill_ref.current.getEditor().setContents(JSON.parse(note_contents.body));

            // console.log(deltaToHTML(note_contents.body));
            // console.log("###############",QuillDeltaToHtmlConverter(note_contents.body,null).convert())
            // setQuill_text(QuillDeltaToHtmlConverter(note_contents.body));
            // console.log(quill_ref.current.getEditor().getText());
            
            setRead_only(false);
        })

        socket.emit('get-note', {note_id:note_id, user:getUser(getCookie('token'))});
    },[socket,note_id])

    //This useEffect just changes the text
    useEffect(() => {
        setText(quill_ref.current.getEditor().getText());
    },[quill_text])

    //This useEffect handles saving a note
    useEffect(() => {
        if(socket == null) return;
        const save_interval = setInterval(() => {
            // console.log(quill_ref.current.getEditor().getContents());

            socket.emit("save-note",quill_ref.current.getEditor().getContents());
        },TIME_FOR_SAVING_MS)

        return () => {
            clearInterval(save_interval);
        }
    },[socket,quill_text])

    //useEffect which stops displaying who is editing
    useEffect(() => {
        
          // Display the component for 3 seconds
          const timeoutId = setTimeout(() => {
            setDisplay_editors(false);
            editors.shift();
          }, 700);
    
          // Clear the timeout when the component is unmounted or displayComponent changes
          return () => clearTimeout(timeoutId);
        
      }, [display_editors]);
    
    const modules = {toolbar:null};
    const formats = [
            null
        ]

    const quill_ref = useRef(null);
    return ( 
        <div className='relative'>
            <ActionBar
                openShareModal={handleOpenShareModal}
                openTitleModal={handleOpenTitleModal}
                openCategoryModal={handleOpenCategoryModal}
                title={note_title}
                category={note_category}
            />
            <div className="flex">
                <ReactQuill
                    value={quill_text}
                    modules={modules}
                    onChange={handleChange}
                    formats={formats}
                    ref={quill_ref}
                    readOnly={read_only}
                />
                <MarkdownComponent data={text}/>
            </div>
            {/* <Footer /> */}
            <ShareNoteModal
                visible={showShareModal}
                onClose={handleCloseShareModal}
                note_id={note_id}
            />
            <ChangeTitleModal
                visible={showTitleModal}
                onClose={handleCloseTitleModal}
                category={note_category}
                body={quill_text}
                note_id={note_id}
                setTitle={setNoteTitle}
            />
            <ChangeCategoryModal
                visible={showCategoryModal}
                onClose={handleCloseCategoryModal}
                title={note_title}
                body={quill_text}
                note_id={note_id}
                setCategory={setNote_category}
            />
            <span 
                className={`absolute bottom-0 right-0 bg-purple-600 text-white rounded-full px-3 m-1
                opacity-90
                    ${!display_editors?'hidden':''}
                `}
            >
                {editors}
            </span>
        </div>
     );
}
 
export default EditPage;

EditPage.propTypes = {
    note_text:PropTypes.string
}