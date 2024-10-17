import { PropTypes } from 'prop-types'
/**
 * Description. Component of a spinning loading symbol.
 * @prop {String} className Additional classes you want to add to the spinner component
 * @returns jsx loading symbol
 */
const Spinner = ({className}) => {
    //Use h-{*} and w-{*} utility classes to create a bigger spinner.
    return ( 
        <div className="flex justify-center">
            <div
                className={`inline-block h-8 w-8 animate-spin rounded-full 
                border-4 border-solid border-current border-r-transparent align-[-0.125em] 
                text-success motion-reduce:animate-[spin_1.5s_linear_infinite] 
                ${className}`}
                
                role="status"
            >
                <span
                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >
                    Loading...
                </span>
            </div>
        </div>
     );
}
 
export default Spinner;

Spinner.propTypes = {
    className:PropTypes.string
}