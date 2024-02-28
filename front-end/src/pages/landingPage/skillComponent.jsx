/* eslint-disable react/prop-types */
import { Link } from '../../import.js';

function SkillComponent({ lang, Icon }) {
  return (
    <Link to={`/search/${lang}`}
      className="flex justify-center items-center bg-white rounded-md px-4 py-2 relative min-w-[150px] min-h-[70px]
      before:content-[''] before:absolute before:bottom-0 before:left-0 before:h-1 before:bg-light-red before:rounded-md
      before:w-full before:transition-all before:duration-300 before:ease-in-out drop-shadow-md before:z-[-1] mb-6 mr-6
      hover:before:h-full text-darker-blue transition-all duration-300 ease-in-out lg:min-w-[190px] lg:min-h-[90px] ">
      <Icon className="text-3xl mr-1 lg:text-4xl  " />
      <p className='text-xl font-medium lg:text-2xl' >{lang}</p>
    </Link>
  )
}

export default SkillComponent
