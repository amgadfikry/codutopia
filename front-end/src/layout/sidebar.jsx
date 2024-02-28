/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  useSelector, BsFillPersonFill, AiOutlineClose, userAuth, userData, TbCategoryFilled, Link,
  TbReportMoney, MdOutlineSupportAgent, TbBrandGoogleHome, RiFileInfoFill, SidebarLink,
  FaFolderTree, IoCreate, IoSettingsSharp, SidebarLogout,
} from '../import'

function Sidebar({ toggleSidebar, setToggleSidebar }) {
  const languages = ['Python', 'Java', 'JavaScript', 'Go', 'C++', 'Ruby', 'C#', 'TypeScript'];
  const auth = useSelector(userAuth);
  const user = useSelector(userData);
  // const sidebarLinks = auth !== 'public' ? `/${auth}/search` : '/search';

  const handleSidebar = () => {
    setToggleSidebar(!toggleSidebar)
  }

  return (
    <div className={`fixed top-1/2 translate-y-[-50%] left-4 translate-x-0 rounded-xl py-5 px-3 shadow-lg border whitespace-nowrap
      bg-white border-dark-gray z-50 text-dark-color transition duration-300 ${toggleSidebar && 'translate-x-[-103%]'}
      user-select-none`} onClick={handleSidebar} >
      <div className='h-full flex flex-col relative pr-10'>
        <AiOutlineClose className='absolute  -top-2 right-0 text-xl cursor-pointer text-light-red' onClick={handleSidebar} />
        {auth !== 'public' &&
          <div className="flex flex-col items-center py-2 border-b px-8" >
            <BsFillPersonFill className='w-[80px] h-[80px] text-gray-600 bg-gray-200 p-1 rounded-full' />
            <p className='mt-3 text-xl whitespace-nowrap'>{user.userName}</p>
          </div>
        }
        <ul className='flex flex-col flex-grow h-full mt-5 text-darker-blue font-medium'>
          {auth !== 'public' &&
            <>
              <SidebarLink Icon={TbBrandGoogleHome} path={`/search/All`} text='Dashboard' />
              {/* <SidebarLink Icon={FaFolderTree} path={`mycourses`} text='My courses' /> */}
            </>
          }
          {auth === 'instructor' &&
            <SidebarLink Icon={IoCreate} path='/instructor/createNew' text='Create New' />
          }
          {auth !== 'instructor' &&
            <>
              <SidebarLink Icon={TbCategoryFilled} path={`/search/All`} text='Categories' />
              <ul className='relative'>
                {languages.map((language, index) => (
                  <Link key={index} to={`/search/${language}`}>
                    <li className='sidebar-link-small sidebar-hover' >{language}</li>
                  </Link>
                ))}
              </ul>
              {/* <SidebarLink Icon={TbReportMoney} path='/pricing' text='Pricing' /> */}
            </>
          }
          {/* <SidebarLink Icon={RiFileInfoFill} path='/about' text='About' /> */}
          {auth !== 'public' &&
            <>
              <SidebarLink Icon={MdOutlineSupportAgent} path={`/${auth}/support`} text='Support' />
              {/* <SidebarLink Icon={IoSettingsSharp} path='/setting' text='Setting' /> */}
              <SidebarLogout func={handleSidebar} />
            </>
          }
        </ul>
      </div>
    </div>
  )
}

export default Sidebar