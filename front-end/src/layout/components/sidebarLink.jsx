/* eslint-disable react/prop-types */
// import required hooks
import { Link } from '../../import.js';

// SidebarLink component to display sidebar link with icon, path and text
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

export default SidebarLink;
