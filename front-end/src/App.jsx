/* eslint-disable react-hooks/exhaustive-deps */
// import required hooks, components, images and icons
import {
  CookiesProvider, Routes, Route, useEffect, useDispatch, setAuth, setUserData,
  axios, Cookies, url, optionsWithCookies, useState, useNavigate
} from './import';
// import required components
import NavBar from './layout/navbar.jsx';
import Sidebar from './layout/sidebar.jsx';
import Footer from './layout/footer.jsx';
import HomePage from './pages/homePage/homePage.jsx';
import CreateNewPage from './pages/createNewPage/createNewPage.jsx';
import MyCoursesPage from './pages/myCoursesPage/myCoursesPage.jsx';
import SearchPage from './pages/otherPages/searchPage.jsx';
import Login from './pages/loginPage/login.jsx';
import Register from './pages/registerPage/register.jsx';
import Support from './pages/otherPages/support.jsx';
import ServerDown from './pages/otherPages/serverDown.jsx';
import NotFound from './pages/otherPages/notFound.jsx';
import CoursePage from './pages/courseDetails/coursePage.jsx';

// App component to display all pages and components
function App() {
  // use state variables for loading and toggle sidebar
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // use effect hook to set user data and auth from server
  useEffect(() => {
    // set authorization token in request header from cookies
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    // send get request to get user data and auth
    axios.get(`${url}/users/details`, optionsWithCookies)
      .then(res => {
        // if success, set user data and auth from server
        dispatch(setUserData(res.data.data));
        dispatch(setAuth(res.data.data.role));
      })
      .catch(err => {
        // if error, set auth to public and user data to empty
        if (err.response.status === 401) {
          dispatch(setAuth('public'));
          dispatch(setUserData({}));
        } else {
          // if server error, navigate to server down page
          navigate('/server-down');
        }
      });
  }, [navigate, dispatch]);

  // if loading, show loading component
  return (
    <>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <NavBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
        <Sidebar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/createNew" element={<CreateNewPage />} />
          <Route path="/myCourses" element={<MyCoursesPage />} />
          <Route path="/search/:search" element={<SearchPage />} />
          <Route path="/course/:id/*" element={<CoursePage />} />
          {/* <Route path="/learn/:id" element={<LearnCourse />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/support" element={<Support />} />
          <Route path="/server-down" element={<ServerDown />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </CookiesProvider>
    </>
  )
}

export default App
