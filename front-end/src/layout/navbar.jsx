/* eslint-disable react/prop-types */
import {
  useState, MdDarkMode, MdLightMode, IoMdNotifications, Link, TbMenu2, TbMenuDeep,
  useSelector, userAuth, BsFillPersonFill, Logo
} from '../import'

function NavBar({ toggleSidebar, setToggleSidebar }) {
  const [darkMode, setDarkMode] = useState(false)
  const auth = useSelector(userAuth);

  const handleTheme = () => {
    setDarkMode(!darkMode)
  }

  const handleSidebar = () => {
    setToggleSidebar(!toggleSidebar)
  }

  return (
    <div className={`container mx-auto bg-white py-2 px-3 flex items-center text-darker-blue
      drop-shadow-lg rounded-bl-md rounded-br-md fixed left-1/2 -translate-x-1/2 top-0 z-50`}>
      <Logo />
      <div className='mr-3 ml-auto' onClick={handleTheme}>
        {darkMode
          ? <MdDarkMode className='text-2xl text-darker-blue font-bold cursor-pointer' />
          : <MdLightMode className='text-2xl text-darker-blue font-bold cursor-pointer' />
        }
      </div>
      {
        auth !== 'public' &&
        <IoMdNotifications className="text-2xl text-darker-blue font-bold cursor-pointer mr-3 whitespace-nowrap" />
      }
      {
        auth === 'public' ?
          <div className='flex items-center mr-2'>
            <Link to="/login" className='mr-2'>
              <button className='btn-light-blue'>Login</button>
            </Link>
            <Link to="/register">
              <button className='btn-dark-blue'>Register</button>
            </Link>
          </div>
          :
          <div className='flex items-center'>
            <BsFillPersonFill className='text-2xl font-bold cursor-pointer' />
          </div>
      }
      <div className=''>
        {toggleSidebar
          ? <TbMenu2 className='text-2xl font-bold cursor-pointer' onClick={handleSidebar} />
          : <TbMenuDeep className='text-2xl font-bold cursor-pointer' onClick={handleSidebar} />
        }
      </div>
    </div>
  )
}

export default NavBar