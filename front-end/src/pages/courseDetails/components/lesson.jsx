/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import tequired hooks, components, images and icons
import {
  useParams, Link, useEffect, userAuth, useSelector, useNavigate, axios,
  url, optionsWithCookies, Cookies, userData, useState
} from '../../../import';
import VideoLesson from './videoLesson.jsx';
import PdfLesson from './pdfLesson.jsx';

function Lesson({ content, setLesson }) {
  // use state variables for description
  const [description, setDescription] = useState(true);
  // get lesson and course id from url
  const { lesson, id } = useParams();
  const navigate = useNavigate();
  // use selector hook to get auth and user data from store
  const auth = useSelector(userAuth);
  const user = useSelector(userData);
  // get user course from user data
  const userCourse = user.courses.find(course => course.courseId === id);
  const lessonComplete = (parseInt(lesson)) / content.length * 100 >= userCourse.progress;

  // function to handle complete lesson
  const handleComplete = () => {
    // set lesson to next lesson
    setLesson(parseInt(lesson) + 1);
    setDescription(true);
    // calculate new progress
    const newProgress = (parseInt(lesson) + 1) / content.length * 100;
    // send put request to update progress
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.put(`${url}/users/updateProgress`, { courseId: id, progress: newProgress }, optionsWithCookies)
      .then(res => {
        if (newProgress === 100) {
          navigate(`/course/${id}`);
        } else {
          navigate(`/course/${id}/${parseInt(lesson) + 1}`);
        }
      })
      .catch(err => {
        navigate('/server-down');
      });
  }

  // use effect to check if user is learner
  useEffect(() => {
    if (auth !== 'learner') return navigate('/login');
  }, [auth, navigate]);

  return (
    <div className='pt-24 pb-16 container mx-auto px-2'>
      {/* lesson navigation */}
      <ul className='border-t border-b border-dark-gray flex items-center text-darker-blue justify-center mb-6'>
        <Link to={`/course/${id}`} className={`border-r border-dark-gray px-2 py-2 hover:bg-darker-blue hover:text-white`}>
          <li>Course Content</li>
        </Link>
        <button onClick={() => setDescription(true)} className={`border-r border-dark-gray px-2 py-2 
        hover:bg-darker-blue hover:text-white ${description && 'bg-darker-blue text-white'}`}>
          <li>Lesson Description</li>
        </button>
        <button onClick={() => setDescription(false)} className={` px-2 py-2 hover:bg-darker-blue hover:text-white
          ${!description && 'bg-darker-blue text-white'}`}>
          <li>Lesson</li>
        </button>
      </ul>
      {/* lesson content */}
      <h2 className='text-xl font-bold w-fit mx-auto border-b-2 border-light-red text-darker-blue'>
        {content[lesson].name}
      </h2>
      {!description ?
        content[lesson].type === 'video' ?
          <VideoLesson data={content[lesson]} handleComplete={handleComplete} />
          : <PdfLesson data={content[lesson]} />
        : <p className='text-light-blue mt-6'>{content[lesson].description}</p>
      }
      <div className='mt-10 border-t border-dark-gray w-full flex justify-end py-2 px-3'>
        <button onClick={handleComplete} disabled={!lessonComplete}
          className={`min-w-[100px] 
            ${lessonComplete ? 'btn-dark-red' : 'pointer-events-none btn-dark-blue'}`}>
          {lessonComplete ? 'Mark As Complete' : 'Completed'}
        </button>
      </div>
    </div>
  )
}

export default Lesson