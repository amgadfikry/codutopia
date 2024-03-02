/* eslint-disable no-unused-vars */
// import required hooks, components, images and icons
import {
  Routes, Route, useNavigate, useParams, useEffect, useState, axios, url, optionsWithCookies,
  Loading, useSelector, userAuth, userData
} from '../../import';
import CourseHead from './components/courseHead.jsx';
import Buttons from './components/buttons.jsx';
import CourseContent from './components/courseContent.jsx';
import Lesson from './components/lesson.jsx';

// course page component
function CoursePage() {
  // use state variables for loading and course details
  const [courseDetails, setCourseDetails] = useState({});
  const [lesson, setLesson] = useState(0);
  const [edit, setEdit] = useState(false);
  const [imageUrls, setImageUrls] = useState('');
  const navigate = useNavigate();
  // get course id from url
  const { id } = useParams();
  // use selector hook to get auth and user data from store
  const auth = useSelector(userAuth);
  const user = useSelector(userData);
  // set userCourse to null and get user course if auth is learner
  let userCourse = null;
  if (auth === 'learner' && user.courses) {
    userCourse = user.courses.find(course => course.courseId === id);
  }

  // use effect to get course details
  useEffect(() => {
    // get course details
    axios.get(`${url}/courses/${id}`, optionsWithCookies)
      .then(res => {
        // set course details
        if (res.data.data) {
          setCourseDetails(res.data.data);
          setImageUrls(`${url}/files/get/image/${res.data.data.image.objectKey}`);
          // calculate current lesson if auth is learner
          if (auth === 'learner' && userCourse) {
            const progress = userCourse.progress;
            const numberOfLessons = res.data.data.content.length;
            const currentLesson = Math.ceil((progress / 100) * numberOfLessons);
            setLesson(currentLesson);
          }
        } else {
          navigate('/404');
        }
      })
      .catch(err => {
        // set loading to false
        navigate('/server-down');
      });
  }, [id, navigate, userCourse, auth]);

  return (
    <section className='container mx-auto pt-24 pb-16 relative text-white px-2' >
      <CourseHead courseDetails={courseDetails} auth={auth} userCourse={userCourse} imageUrls={imageUrls} />
      <Buttons auth={auth} userCourse={userCourse} lesson={lesson} id={id} edit={edit} setEdit={setEdit} />
      <Routes>
        <Route path="/" element={<CourseContent
          courseDetails={courseDetails} lesson={lesson} userCourse={userCourse} edit={edit}
          setCourseDetails={setCourseDetails} />}
        />
        <Route path="/:lesson" element={
          <Lesson content={courseDetails.content} setLesson={setLesson} userCourse={userCourse} />}
        />
      </Routes>
    </section>
  )
}

export default CoursePage
