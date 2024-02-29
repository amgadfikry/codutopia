/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// import required hooks, components, images and icons
import {
  axios, userAuth, userData, useDispatch, useEffect, useState, setUserData, setAuth,
  useNavigate, useSelector, url, optionsWithCookies, Cookies, useParams, Loading, useRef
} from '../../import';
import ReactPlayer from 'react-player/lazy'


// LearnCourse component to display learn course page
function LearnCourse() {
  // get course id from url
  const { id } = useParams();
  // use state variables for course and loading
  const [course, setCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(0);
  // use navigate hook
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // use selector hook to get auth and user data from store
  const auth = useSelector(userAuth);
  const user = useSelector(userData);
  const userCourses = user.courses.filter(course => course.courseId === id)[0];

  // use effect hook to get course data
  useEffect(() => {
    // set loading to true
    setLoading(true);
    // if user is not logged in, navigate to login page
    if (auth !== 'learner') return navigate('/login');
    // get course data from api
    axios.get(`${url}/courses/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        setCourse(res.data.data);
        const progress = userCourses.progress;
        const numberOfLessons = res.data.data.content.length;
        const currentLesson = Math.ceil((progress / 100) * numberOfLessons);
        setCurrentLesson(currentLesson);
        setLoading(false);
      })
      .catch(err => {
        // set loading to false
        console.log(err);
        setLoading(false);
        navigate('/server-down');
      });
  }, [id, navigate, auth]);

  // if loading, show loading component
  if (loading) return <Loading />;
  return (
    <div className='pt-24 pb-16 container mx-auto px-2'>
      <h1 className='text-2xl font-bold w-fit mx-auto border-b-2 border-light-red text-darker-blue mb-4 pb-2'>
        {course.title}
      </h1>
      <h2 className='text-xl font-bold text-center text-darker-blue'>
        {course.content[currentLesson].name}
      </h2>
      {course.content[currentLesson] && course.content[currentLesson].type === 'video' &&
        <div>
          <div className='w-full md:w-[600px] mx-auto border-2 border-deaker-blue overflow-hidden rounded-md '>
            <ReactPlayer url={`${url}/files/get/${course.content[currentLesson].video.objectKey}`}
              controls={true}
              width='100%'
              playbackRate={1}
              onEnded={() => {
                setCurrentLesson(currentLesson + 1);
                dispatch(setUserData({
                  ...user, courses: user.courses.map(course => course.courseId === id ?
                    { ...course, progress: (currentLesson + 1) / course.content.length * 100 } : course)
                }));
                axios.post(`${url}/courses/progress/${id}`, { progress: (currentLesson + 1) / course.content.length * 100 },
                  optionsWithCookies)
                  .then(res => {
                    console.log(res.data);
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }}
              config={{
                headers: {
                  'Content-Type': 'video/mp4',
                  'Authorization': Cookies.get('authToken')
                }
              }}
            />
          </div>
          <p className='text-light-blue'>{course.content[currentLesson].description}</p>
        </div>}
      {course.content[currentLesson] && course.content[currentLesson].type === 'resource' &&
        <div>
          <p className=' text-light-blue'>
            {course.content[currentLesson].description}
          </p>
          <a href={`${url}/files/get/${course.content[currentLesson].resource.url}`}
            target='_blank' rel='noreferrer'
            className='text-light-blue underline'>
            Visit Resource
          </a>
        </div>}
      <button onClick={() => setCurrentLesson(currentLesson + 1)} className='btn-dark-red' >Next</button>
    </div>
  )
}

export default LearnCourse
