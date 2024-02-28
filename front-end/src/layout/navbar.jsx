/* eslint-disable react/prop-types */
// import required hooks, components and images
import {
  useState, MdDarkMode, MdLightMode, IoMdNotifications, Link, TbMenu2, TbMenuDeep,
  useSelector, userAuth, BsFillPersonFill, Logo
} from '../import.js'

// NavBar component to display navigation bar with logo, theme, notifications, login and register buttons
function NavBar({ toggleSidebar, setToggleSidebar }) {
  // create state variables for dark mode and set dark mode
  const [darkMode, setDarkMode] = useState(false)
  // get user authentication data from redux store
  const auth = useSelector(userAuth);

  // function to handle theme change
  const handleTheme = () => {
    setDarkMode(!darkMode)
  }

  // function to handle sidebar toggle
  const handleSidebar = () => {
    setToggleSidebar(!toggleSidebar)
  }

  return (
    <div className={`container mx-auto bg-white py-2 px-3 flex items-center text-darker-blue
      drop-shadow-lg rounded-bl-md rounded-br-md fixed left-1/2 -translate-x-1/2 top-0 z-50`}>
      {/* display logo */}
      <Logo />
      {/* display theme according to dark mode state */}
      <div className='mr-3 ml-auto' onClick={handleTheme}>
        {darkMode
          ? <MdDarkMode className='text-2xl text-darker-blue font-bold cursor-pointer' />
          : <MdLightMode className='text-2xl text-darker-blue font-bold cursor-pointer' />
        }
      </div>
      {/* display notifications icon if user is authenticated */}
      {
        auth !== 'public' &&
        <IoMdNotifications className="text-2xl text-darker-blue font-bold cursor-pointer mr-3 whitespace-nowrap" />
      }
      {/* display login and register buttons if user is not authenticated and user icon if authenticated */}
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
      {/* display menu icon to toggle sidebar */}
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
