/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  mainImage, LazyLoadImage, useSelector, userAuth, Link, userData, axios,
  url, Cookies, optionsWithCookies, useNavigate
} from '../import.js';

function CourseBox({ course }) {
  const auth = useSelector(userAuth);
  const user = useSelector(userData);
  const navigate = useNavigate();
  const checkIfEnrolled = auth !== 'public' && user && user.courses.includes(course._id) ? true : false;

  const handleEnroll = () => {
    if (auth === 'public') {
      navigate('/login');
    }
    else if (checkIfEnrolled) {
      console.log(2)
      return navigate(`/course/${course._id}`)
    } else {
      console.log(3)
      optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
      axios.get(`${url}/courses/enroll/${course._id}`, optionsWithCookies)
        .then((res) => {
          navigate(`/course/${course._id}`);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    }
  }

  return (
    <div className="md:max-w-[350px] max-w-full rounded overflow-hidden m-3 text-darker-blue shadow-xl p-2">
      <LazyLoadImage
        className="w-full"
        src={mainImage}
        alt="Sunset in the mountains"
        placeholderSrc={mainImage}
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{course.title}</div>
        <p className="text-light-blue  text-light">{course.description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
        font-semibold text-light-red mr-2 mb-2">#{course.category}</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
        font-semibold text-light-red mr-2 mb-2">#{course.level}</span>
      </div>
      {
        auth === 'instructor' &&
        <Link to={`/instructor/edit/${course._id}`}>
          <button className="btn-dark-blue w-full">Edit</button>
        </Link>
      }
      {auth !== 'instructor' &&
        <button className="btn-dark-blue w-full"
          onClick={handleEnroll}>
          {checkIfEnrolled ? 'Resume' : 'Enroll'}
        </button>}
    </div>
  )
}

export default CourseBox