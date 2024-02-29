/* eslint-disable no-unused-vars */
// import required hooks, components, images and icons
import {
  userAuth, useSelector, useState, useNavigate, useEffect, Loading, LazyLoadImage,
  url, axios, courseImage, useParams, optionsWithCookies, FaVideo, FaFile, userData,
  Cookies,
} from '../../import';

// course details component
function CourseDetails() {
  // use state variables for loading and course details
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState({});
  const navigate = useNavigate();
  // get user auth from redux
  const auth = useSelector(userAuth);
  const user = useSelector(userData);
  // get course id from url
  const { id } = useParams();

  // use effect to get course details
  useEffect(() => {
    // set loading to true
    setLoading(true);
    // get course details
    axios.get(`${url}/courses/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        if (res.data.data) {
          setCourseDetails(res.data.data);
        } else {
          navigate('/404');
        }
        setLoading(false);
      })
      .catch(err => {
        // set loading to false
        setLoading(false);
        navigate('/server-down');
      });
  }, [id, navigate]);

  // handle enroll to course
  const handleEnroll = (e) => {
    if (auth === 'public') return navigate('/login');
    e.preventDefault();
    // set loading to true
    setLoading(true);
    // add course to user courses
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.get(`${url}/courses/enroll/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        navigate(`/learn/${id}`);
      })
      .catch(err => {
        // set loading to false
        setLoading(false);
        navigate('/server-down');
      });
  }

  // handle unenroll from course
  const handleUnenroll = (e) => {
    e.preventDefault();
    // set loading to true
    setLoading(true);
    // remove course from user courses
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.delete(`${url}/courses/unenroll/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        navigate('/myCourses')
      })
      .catch(err => {
        // set loading to false
        setLoading(false);
        navigate('/server-down');
      });
  }

  // if loading, show loading component
  if (loading) return <Loading />;
  return (
    <section className='container mx-auto pt-24 pb-16 relative text-white px-2' >
      {/* display course details description */}
      <div className='flex flex-col md:flex-row p-1 bg-darker-blue rounded-lg'>
        <LazyLoadImage
          src={courseImage}
          alt='course'
          className='md:w-80 rounded-lg object-cover'
          placeholderSrc={courseImage}
        />
        <div className='flex flex-col px-4 py-2  w-full'>
          <h1 className='text-2xl lg:text-3xl font-bold mb-3'>{courseDetails.title}</h1>
          <p className='text-dark-gray md:mb-auto mb-5 font-light text-sm'>{courseDetails.description}</p>
          <div className="text-light-red font-semibold text-xs">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1
              mr-2 mb-2">#{courseDetails.category}</span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1
              mr-2 mb-2">#{courseDetails.level}</span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1
              mr-2 mb-2">#Free</span>
          </div>
          {auth === 'learner' && user.courses.some(course => course.courseId === id) &&
            <div className='flex items-center mt-2'>
              <p className='text-light-blue text-sm'>Progress: </p>
              <div className='w-48 h-2 bg-light-blue rounded-lg ml-2'>
                <div className='h-2 bg-light-red rounded-lg'
                  style={{ width: `${user.courses.find(course => course.courseId === id).progress}%` }}>
                </div>
              </div>
              <p className='ml-2 text-light-blue'>{user.courses.find(course => course.courseId === id).progress}%</p>
            </div>
          }
        </div>
      </div>
      {/* course control button */}
      <div className='flex justify-end items-center mt-6 px-2'>
        {auth === 'public' &&
          <button className='btn-dark-red' onClick={handleEnroll} >Enroll Now</button>
        }
        {auth === 'learner' && !user.courses.some(course => course.courseId === id) &&
          <button className='btn-dark-red' onClick={handleEnroll} >Enroll Now</button>
        }
        {auth === 'learner' && user.courses.some(course => course.courseId === id) &&
          <>
            <button className='btn-dark-red mr-2' onClick={() => navigate(`/learn/${id}`)}>Continue</button>
            <button className='btn-dark-red' onClick={handleUnenroll} >Unenroll</button>
          </>
        }
        {/* {auth === 'instructor' &&
          <>
            <button className='btn-dark-red'>Delete</button>
            <button className='btn-dark-red'>Edit</button>
          </>
        } */}
      </div>
      {/* display course details content */}
      <h1 className='text-2xl lg:text-3xl font-semibold  px-2 py-3 text-darker-blue mt-6'>
        Course Content
      </h1>
      <div className=' bg-dark-gray rounded-lg px-2 py-6 text-darker-blue'>
        {courseDetails.content && courseDetails.content.map((item, index) => (
          <div key={index} className='flex items-center px-2
            border-b border-light-blue py-2'>
            <div className='flex items-center text-light-blue'>
              {item.type === 'video' ? <FaVideo /> : <FaFile />}
              <p className='ml-3 text-darker-blue'>Lesson {index + 1}: {item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CourseDetails