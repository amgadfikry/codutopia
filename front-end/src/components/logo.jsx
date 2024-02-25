import { Link } from '../import.js';

function Logo() {
  return (
    <div>
      <Link to="/" className='text-xl cursor-pointer whitespace-nowrap font-[700] text-darker-blue
        relative before:content-[""] before:absolute before:w-5 before:h-5 before:bg-light-red
        before:top-[-3px] before:left-[-5px] before:rounded-full before:z-[-1]
        after:content-[""] after:absolute after:w-5 after:h-5 after:bg-light-red after:bottom-[-3px]
        after:right-[-5px] after:rounded-full after:z-[-1] after:animate-bounce before:animate-bounce'>
        E-Learnig
      </Link>
    </div>
  )
}

export default Logo