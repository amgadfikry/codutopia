/* eslint-disable no-unused-vars */
import {
  useState, useEffect, useSelector, url, axios, userData, CourseBox, Loading,
  optionsWithCookies, Cookies
} from '../../import';

function InstructorDashboard() {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const user = useSelector(userData);

  useEffect(() => {
    setLoading(true);
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.get(`${url}/courses/instructor/${user._id}`, optionsWithCookies)
      .then((res) => {
        setSearchResult(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setSearchResult([]);
        setLoading(false);
      });
  }, [user._id]);

  return (
    <>
      <div className='container mx-auto pt-24 pb-16 px-1 min-h-screen relative'>
        <h2 className="text-3xl text-left text-darker-blue font-bold
          border-b-4 border-light-red w-fit pb-2 mb-10">My Courses</h2>
        <div className='' >
          {loading && <Loading />}
          {!loading && searchResult.length === 0 &&
            <p className='flex justify-center 
            text-2xl font-semibold text-darker-gray'>No result found</p>}
          {!loading && searchResult.length > 0 &&
            <div className='flex flex-wrap justify-center items-center md:justify-start flex-row'>
              {searchResult.map((result) => (
                <CourseBox course={result} key={result._id} id={result._id} />
              ))}
            </div>
          }
        </div>
      </div>
    </>
  )
}

export default InstructorDashboard
