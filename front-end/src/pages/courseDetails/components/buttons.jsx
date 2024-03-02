/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  Link, axios, url, optionsWithCookies, Cookies, useNavigate, useDispatch, setUserData,
  useSelector, userData
} from '../../../import';

// buttons component
function Buttons({ auth, userCourse, lesson, id, edit, setEdit }) {
  // use navigate hook
  const navigate = useNavigate();
  // use dispatch hook
  const dispatch = useDispatch();
  // get user data from store
  const user = useSelector(userData);

  // handle enroll to course
  const handleEnroll = (e) => {
    if (auth === 'public') return navigate('/login');
    e.preventDefault();
    // add course to user courses and set progress to 0
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.get(`${url}/courses/enroll/${id}`, optionsWithCookies)
      .then(res => {
        dispatch(setUserData({ ...user, courses: [...user.courses, { courseId: id, progress: 0, score: 0 }] }))
        // set course details
        navigate(`/course/${id}/${lesson}`);
      })
      .catch(err => {
        navigate('/server-down');
      });
  }

  // handle unenroll from course
  const handleUnenroll = (e) => {
    e.preventDefault();
    // remove course from user courses
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.delete(`${url}/courses/unenroll/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        navigate('/myCourses')
      })
      .catch(err => {
        navigate('/server-down');
      });
  }

  const handleDelete = (e) => {
    e.preventDefault();
    // delete course
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.delete(`${url}/courses/delete/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        navigate('/myCourses')
      })
      .catch(err => {
        navigate('/server-down');
      });
  }

  return (
    <>
      {/* course control button */}
      {window.location.pathname.split('/').length === 3 &&
        <div className='flex justify-end items-center mt-6 px-2'>
          {auth === 'public' &&
            <button className='btn-dark-red' onClick={handleEnroll} >Enroll Now</button>
          }
          {auth === 'learner' && !userCourse &&
            <button className='btn-dark-red' onClick={handleEnroll} >Enroll Now</button>
          }
          {auth === 'learner' && userCourse &&
            <>
              {userCourse.progress !== 100 &&
                <Link to={`${window.location.pathname}/${lesson}`} className='btn-light-red mr-2' >
                  {userCourse.progress === 0 ? 'Start' : 'Continue'}
                </Link>
              }
              <button className='btn-dark-red' onClick={handleUnenroll} >Unenroll</button>
            </>
          }
          {auth === 'instructor' &&
            <>
              <button className='btn-light-red mr-2' onClick={() => setEdit(!edit)} >
                {edit ? 'Done' : 'Edit'}
              </button>
              <button className='btn-dark-red' onClick={handleDelete} >Delete</button>
            </>
          }
        </div>}
    </>
  )
}

export default Buttons
