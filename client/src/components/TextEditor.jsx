import Quill from "quill";
import { PropTypes } from 'prop-types'
import { useEffect } from "react";
import "quill/dist/quill.snow.css"

const TextEditor = ({classNames}) => {

    useEffect(() => {
        new Quill('#container' , {modules: {
            toolbar: null
          }
        },);
    },[]);
    return ( 
        <div className={`${classNames}`} id="container">

        </div> 
    );
}
 
export default TextEditor;

TextEditor.propTypes = {
    classNames:PropTypes.string
}