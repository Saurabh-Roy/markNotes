import { PropTypes } from 'prop-types'
import { marked } from "marked";

const MarkdownComponent = ({data}) => {
    const createMarkUp = (val) => {
        return { __html: marked(val) }
    }
    
      return <div className='markdown w-1/2 h-[95vh] overflow-x-scroll overflow-y-scroll bg-zinc-900 text-white' dangerouslySetInnerHTML={createMarkUp(data)}></div>
    
}
 
export default MarkdownComponent;



MarkdownComponent.propTypes = {
    data:PropTypes.string
};

