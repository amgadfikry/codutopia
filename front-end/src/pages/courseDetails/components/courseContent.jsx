/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  FaVideo, FaFile, Link, useSelector, userAuth, axios, url, optionsWithCookies, Cookies,
  useNavigate
} from '../../../import';

// courseContent component to display course content
function CourseContent({ courseDetails, lesson, userCourse, edit, setCourseDetails }) {
  // use selector hook to get auth from store
  const auth = useSelector(userAuth);
  // use navigate hook
  const navigate = useNavigate();

  // handle delete lesson
  const handleDeleteLesson = (e) => {
    e.preventDefault();
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.delete(`${url}/courses/lesson/${courseDetails._id}/${e.target.id}`, optionsWithCookies)
      .then(res => {
        setCourseDetails({ ...courseDetails, content: courseDetails.content.filter((item, index) => index !== parseInt(e.target.id)) });
      })
      .catch(err => {
        navigate('/server-down');
      });
  }

  return (
    <div>
      <h1 className='text-2xl lg:text-3xl font-semibold  px-2 py-3 text-darker-blue mt-6'>
        Course Content
      </h1>
      <div className=' bg-dark-gray rounded-lg px-2 py-6 text-darker-blue'>
        {courseDetails.content && courseDetails.content.length === 0 &&
          <p className='text-center text-light-blue'>No content available</p>
        }
        {courseDetails.content && courseDetails.content.map((item, index) => (
          <Link to={auth === 'learner' ? `${window.location.pathname}/${index}` : '/login'}
            key={index} className={`flex items-center px-2 border-b border-light-blue py-2
              ${(auth === 'instructor' || (auth === 'learner' && !userCourse)) && 'pointer-events-none'}`}>
            <div className='flex items-center text-light-blue w-full'>
              {item.type === 'video' ? <FaVideo /> : <FaFile />}
              <p className='ml-3 text-darker-blue ' >Lesson {index + 1}: {item.name}</p>
              <p className={`text-light-blue ml-auto ${lesson > index && 'text-darker-blue'}`}>
                {lesson > index && 'Completed'}</p>
              {auth === 'instructor' && edit &&
                <button className='btn-dark-red pointer-events-auto' onClick={handleDeleteLesson} id={index}>
                  Delete
                </button>
              }
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CourseContent
