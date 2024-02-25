/* eslint-disable react/prop-types */
import { Link } from '../import';

function SidebarLink({ Icon, path, text }) {
  return (
    <Link to={path}>
      <li className='sidebar-link '>
        <Icon className='w-6 h-6 inline-block mr-2 text-light-red ' />
        <p>{text}</p>
      </li>
    </Link>
  )
}

export default SidebarLink
