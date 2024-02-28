// import required hooks, components and icons
import {
  IoLogOut, useNavigate, axios, optionsWithCookies, Cookies, url, useDispatch, setAuth, setUserData
} from '../../import.js';

// SidebarLogout component to display sidebar logout link with handle logout function on click
function SidebarLogout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // function to handle logout
  const logout = () => {
    // set headers with authorization token from cookies
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    // send get request to logout user and remove authToken from cookies if logout is successful
    // and redirect to home page if logout is successful
    // and redirect to server down page if server is down
    axios.get(`${url}/users/logout`, optionsWithCookies)
      .then(res => {
        if (res.status === 200) Cookies.remove('authToken');
        dispatch(setAuth('public'));
        dispatch(setUserData({}));
        return navigate(0);
      })
      .catch(err => {
        if (err.response.status === 500) {
          return navigate('/server-down');
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
