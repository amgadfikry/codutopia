import {
  IoLogOut, useNavigate, axios, optionsWithCookies, Cookies,
} from '../import';

function SidebarLogout() {
  const navigate = useNavigate();

  const logout = () => {
    axios.get(`url/users/logout`, optionsWithCookies)
      .then(res => {
        res.status === 200 && Cookies.remove('authToken')
      })
      .catch(err => {
        if (err.response.status === 500) {
          navigate('/server-down');
        }
      });
    navigate('/')
  }

  return (
    <li className='sidebar-link cursor-pointer' onClick={logout} >
      <IoLogOut className='w-6 h-6 inline-block mr-2 text-light-red' />
      <p>Logout</p>
    </li>
  )
}

export default SidebarLogout