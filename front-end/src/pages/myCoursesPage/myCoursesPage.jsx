/* eslint-disable no-unused-vars */
// import required hooks, components, images and icons
import {
  useState, useEffect, useSelector, url, axios, userData, CourseBox, Loading,
  optionsWithCookies, Cookies, userAuth, useNavigate
} from '../../import';

// MyCoursesPage component to display course of instructor or courses enrolled by learner
function MyCoursesPage() {
  // use state variables for loading and search result
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  // get user auth and user data from redux store
  const user = useSelector(userData);
  const auth = useSelector(userAuth);
  // use navigate hook
  const navigate = useNavigate();

  // use effect hook to get courses of instructor or courses enrolled by learner
  useEffect(() => {
    // set loading to true
    setLoading(true);
    // if user is not logged in, redirect to login page
    if (auth === 'public') return navigate('/login');
    // set authorization token in request header from cookies
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    if (auth === 'instructor') {
      // if user is instructor, get courses of instructor created
      axios.get(`${url}/courses/instructor/${user._id}`, optionsWithCookies)
        .then((res) => {
          setSearchResult(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          setSearchResult([]);
          setLoading(false);
        });
    } else if (auth === 'learner') {
      // if user is learner, get courses enrolled by learner
      axios.get(`${url}/courses/enrolled/all`, optionsWithCookies)
        .then((res) => {
          setSearchResult(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          setSearchResult([]);
          setLoading(false);
        });
    }
  }, [user._id, auth, navigate]);

  return (
    <div className='container mx-auto pt-24 pb-16 px-1 min-h-screen relative'>
      <h2 className="text-2xl text-left text-darker-blue font-bold px-3
          border-b-4 border-light-red w-fit pb-2 mb-10">My Courses</h2>
      <div className='' >
        {loading && <Loading />}
        {!loading && searchResult.length === 0 &&
          <p className='flex justify-center 
            text-2xl font-semibold text-darker-gray'>
            {auth === 'instructor' ? 'No courses created yet' : 'No courses enrolled yet'}
          </p>}
        {!loading && searchResult.length > 0 &&
          <div className='flex flex-wrap justify-center items-center flex-row'>
            {searchResult.map((result) => (
              <CourseBox course={result} key={result._id} id={result._id} />
            ))}
          </div>
        }
      </div>
    </div>
  )
}

export default MyCoursesPage
