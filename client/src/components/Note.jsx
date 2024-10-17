import { PropTypes } from 'prop-types'
import { useNavigate } from 'react-router-dom';

function formatDate(isoString) {
    const dateObj = new Date(isoString);
    
    const padZero = (num) => num < 10 ? '0' + num : num;

    return `${padZero(dateObj.getHours())}:${padZero(dateObj.getMinutes())} ${padZero(dateObj.getDate())}/${padZero(dateObj.getMonth() + 1)}/${dateObj.getFullYear()} `;
}


const Note = ({id,title,category,updated_at,row_number,note_text, get_note_text}) => {
    // border-2 border-white border-b-black border-t-black
    const navigate = useNavigate();
    return ( 
        // <div className={`w-full py-2 pr-3 pl-3 pb-0 pt-5 text-white 
            
        //     ${row_number%2?'hover:bg-purple-400 hover:text-black':'hover:bg-purple-600'}
        //     `}
        //     onClick={()=>navigate('/edit-note',{state:note_text})}
        //     onMouseMove={()=>get_note_text(note_text)}
        //     >
        //     <span className='w-2/3 inline-grid grid-cols-2 text-ellipsis'>
        //         <span className='w-full text-ellipsis overflow-hidden whitespace-nowrap pr-3 pl-3'><b>{title}</b></span>  
        //         <span className='float-left'>{category}</span>  
        //     </span>
        //     <span className='float-right pr-5'>{updated_at}</span>  
        //     <hr className={`${row_number%2?'border-purple-400':'border-purple-600'}`}/>
        // </div>
        <div
            className={`w-full py-2 pr-2 pl-3 pt-5 text-white pb-5 ${row_number % 2
                    ? 'hover:bg-purple-400 hover:text-black bg-zinc-800'
                    : 'hover:bg-purple-600 bg-zinc-900'
                }`}
            onClick={() => get_note_text(note_text, title, id)}
        >
            <span className='w-2/3 inline-grid grid-cols-2 text-ellipsis'>
                <div className='flex'>
                    <span className='w-full text-ellipsis overflow-hidden whitespace-nowrap pr-3'>
                        <b>{title}</b>
                    </span>
                </div>
                <span className='float-left'>{category}</span>
            </span>
            <span className={`float-right ${row_number % 2
                    ? 'text-zinc-300'
                    : 'text-zinc-400'
                }`}
            
            >{formatDate(updated_at)}</span>

            {/* <hr className={`${row_number % 2 ? 'border-purple-400' : 'border-purple-600'}`} /> */}
        </div>

     );
}
 
export default Note;

Note.propTypes = {
    id:PropTypes.integer,
    title:PropTypes.string,
    category:PropTypes.string,
    updated_at:PropTypes.string,
    row_number:PropTypes.int,
    note_text:PropTypes.string,
    get_note_text:PropTypes.function,
}

