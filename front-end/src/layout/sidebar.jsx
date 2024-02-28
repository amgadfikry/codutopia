/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components and images
import {
  useSelector, BsFillPersonFill, AiOutlineClose, userAuth, userData, TbCategoryFilled, Link,
  TbReportMoney, MdOutlineSupportAgent, TbBrandGoogleHome, RiFileInfoFill,
  FaFolderTree, IoCreate, IoSettingsSharp,
} from '../import.js'
import SidebarLink from './components/sidebarLink.jsx';
import SidebarLogout from './components/sidebarLogout.jsx';

// Sidebar component to display sidebar with links and user details
function Sidebar({ toggleSidebar, setToggleSidebar }) {
  // list of languages to display in sidebar
  const languages = ['Python', 'Java', 'JavaScript', 'Go', 'C++', 'Ruby', 'C#', 'TypeScript'];
  // get user authentication data and user data from redux store
  const auth = useSelector(userAuth);
  const user = useSelector(userData);

  // function to handle sidebar toggle
  const handleSidebar = () => {
    setToggleSidebar(!toggleSidebar)
  }

  return (
    <div className={`fixed top-1/2 translate-y-[-50%] left-4 translate-x-0 rounded-xl py-5 px-3 shadow-lg border whitespace-nowrap
      bg-white border-dark-gray z-50 text-dark-color transition duration-300 ${toggleSidebar && 'translate-x-[-103%]'}
      user-select-none`} onClick={handleSidebar} >
      <div className='h-full flex flex-col relative pr-10'>
        {/* display close icon */}
        <AiOutlineClose className='absolute  -top-2 right-0 text-xl cursor-pointer text-light-red'
          onClick={handleSidebar} />
        {/* display user details if user is authenticated */}
        {auth !== 'public' &&
          <Link to='/setting' className="flex flex-col items-center py-2 border-b px-8" >
            <BsFillPersonFill className='w-[80px] h-[80px] text-gray-600 bg-gray-200 p-1 rounded-full' />
            <p className='mt-3 text-xl whitespace-nowrap'>{user.userName}</p>
          </Link>
        }
        <ul className='flex flex-col flex-grow h-full mt-5 text-darker-blue font-medium'>
          {/* display my learning link if user is learner */}
          <SidebarLink Icon={TbBrandGoogleHome} path='/' text='Home' />
          {auth !== 'public' &&
            <SidebarLink Icon={FaFolderTree} path='/myCourses' text='My Courses' />
          }
          {/* display create new course if user is instructor */}
          {auth === 'instructor' &&
            <SidebarLink Icon={IoCreate} path='/createNew' text='Create New' />
          }
          {/* display list of languages and categories */}
          <SidebarLink Icon={TbCategoryFilled} path='/search/All' text='Categories' />
          <ul className='relative'>
            {languages.map((language, index) => (
              <Link key={index} to={`/search/${language}`}>
                <li className='sidebar-link-small sidebar-hover' >{language}</li>
              </Link>
            ))}
          </ul>
          {/* <SidebarLink Icon={TbReportMoney} path='/pricing' text='Pricing' /> */}
          {/* display about, support and logout */}
          <SidebarLink Icon={RiFileInfoFill} path='/about' text='About' />
          <SidebarLink Icon={MdOutlineSupportAgent} path='/support' text='Support' />
          <SidebarLink Icon={IoSettingsSharp} path='/setting' text='Setting' />
          <SidebarLogout func={handleSidebar} />
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
