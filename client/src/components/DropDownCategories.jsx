import {useState} from 'react';
import {useRef} from 'react';
import dropdownIcon from "../assets/icons8-dropdown-30.png"

function Dropdown({categories, get_filter_category}) {

    const [isOpen, setIsOpen] = useState(false);
    const [dropdownName, setDropdownName] = useState('All');
    const dropdownButtonRef = useRef();
    const dropdownMenuRef = useRef();
    const dropdownIconRef = useRef();

    window.addEventListener('click', (e) => {
        if (e.target !== dropdownMenuRef.current && e.target !== dropdownButtonRef.current && e.target !== dropdownIconRef) {
            setIsOpen(false);
        }
    });

    const handleSelectCategory = async (category) => {
        setIsOpen(false);
        setDropdownName(category.category_name);
        get_filter_category(category);
    };

    return (

        <div className="relative rounded-lg w-[140px] pt-1">
            <button
                ref={dropdownButtonRef}
                onClick={() => setIsOpen((prev) => !prev)}
                className="bg-purple-400 w-full flex pl-2 font-semibold text-sm 
                rounded-lg text-white active:bg-purple-500">
                {dropdownName}
                
                <img 
                    ref={dropdownIconRef}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent the click event from propagating to the button
                        setIsOpen((prev) => !prev);
                      }}
                    src={dropdownIcon} className={`absolute right-0.5 top-2 w-[15px] ${
                        !isOpen ? '':'rotate-180'
                    }`}
                />

            </button>

            {isOpen && <div ref={dropdownMenuRef} className='bg-purple-400 absolute top-8 flex flex-col items-center rounded-lg p-2 w-full shadow-purple-500 shadow-sm'>
                {categories.map((category, i) => (
                    <div className="flex w-full hover:bg-purple-300 cursor-pointer rounded-r-lg hover:border-l-white hover:border-l-2" key={i}>
                        <button 
                            onClick={() => handleSelectCategory(category)}
                            className="w-full text-xs py-1 text-left pl-1">
                            {category.category_name}
                        </button>
                    </div>
                ))}
                </div>}

        </div>

    )

}

export default Dropdown;
