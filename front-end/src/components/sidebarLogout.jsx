import {
  IoLogOut, useNavigate, axios, optionsWithCookies, Cookies, url
} from '../import';

function SidebarLogout() {
  const navigate = useNavigate();

  const logout = () => {
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.get(`${url}/users/logout`, optionsWithCookies)
      .then(res => {
        if (res.status === 200) Cookies.remove('authToken');
        navigate(0);
      })
      .catch(err => {
        if (err.response.status === 500) {
          navigate('/server-down');
        }
      });
  }

  return (
    <li className='sidebar-link cursor-pointer' onClick={logout} >
      <IoLogOut className='w-6 h-6 inline-block mr-2 text-light-red' />
      <p>Logout</p>
    </li>
  )
}

export default SidebarLogout