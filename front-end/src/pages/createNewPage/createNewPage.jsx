/* eslint-disable no-unused-vars */
// import required hooks, components, images and icons
import {
  LazyLoadImage, instructorImage, useState, produce,
  checkDataError, AiFillWarning, axios, url, Cookies, optionsWithCookies,
  useNavigate, useEffect, useSelector, userAuth, Loading, FaVideo, FaFile
} from '../../import';
import CreateDescription from './components/createDescription.jsx';
import AddFileSection from './components/addFileSection.jsx';

// CreateNewPage component to create new course by instructor
function CreateNewPage() {
  // use state variables for course data, content and error
  const [courseData, setCourseData] = useState({
    title: '',
    category: 'Python',
    level: 'Beginner',
    description: '',
    image: ''
  });
  const [content, setContent] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // use navigate hook
  const navigate = useNavigate();
  // get user auth from redux store
  const auth = useSelector(userAuth);

  // use effect hook to check user auth
  useEffect(() => {
    // if user is not logged in, redirect to login page
    if (auth !== 'instructor') return navigate('/login');
  }, [auth, navigate]);

  // handleData function to handle course data change
  const handleData = (e) => {
    const { name, value } = e.target;
    setCourseData(produce(draft => {
      draft[name] = value;
    }));
  }

  // handleSubmit function to handle form submit
  const handleSubmit = (e) => {
    // prevent default form submission and set error to empty
    e.preventDefault();
    setError('');
    // check if course data is not empty and content is complete
    if (!checkDataError(courseData, [])) {
      if (content.every(item => item.complete)) {
        // set authorization token in request header from cookies
        optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
        // set content data in course data
        const data = { ...courseData, content };
        // set loading to true
        setLoading(true);
        // send post request to create new course with course data
        // if success, redirect to myCourses page
        axios.post(`${url}/courses/create`, data, optionsWithCookies)
          .then(res => {
            return navigate('/myCourses');
          })
          .catch(err => {
            // if error, redirect to server down page
            return navigate('/server-down')
          })
      } else {
        // if content is not complete, set error
        setError('Please fill all content fields');
      }
    } else {
      // if course data is empty, set error
      setError('Please fill description fileds');
    }
  }
  // addSection function to create new section content
  const addSection = (e, type) => {
    e.preventDefault();
    setContent([...content, { type: type, name: '', description: '', file: '', complete: false }]);
  }

  // return create new course form
  if (loading) return <Loading />;
  return (
    <div className=" min-h-screen container mx-auto relative pt-24 pb-16 
    w-full md:w-lg">
      <h2 className="text-2xl text-center text-darker-blue font-bold lg:text-3xl
      border-b-4 border-light-red w-fit pb-2 mb-10 mx-auto">Create New Course</h2>
      {/* lazy load image background*/}
      <LazyLoadImage
        src={instructorImage}
        alt="instructor"
        className=' absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[-1]'
        placeholderSrc={instructorImage}
      />
      {/* create new course form */}
      <form className="shadow-md px-8 py-6 mb-4 bg-opacity-90 bg-dark-gray lg:w-8/12 lg:mx-auto
        rounded-md space-y-8">
        {/* course data description */}
        <CreateDescription courseData={courseData} handleData={handleData} />
        {/* contents fields */}
        {
          content.map((item, index) =>
            <AddFileSection key={index} index={index} content={content} setContent={setContent}
              Icon={item.type === 'video' ? FaVideo : FaFile} />
          )
        }
        {/* add video and resource buttons */}
        <div className="flex items-center justify-end space-x-3 mt-4">
          <button onClick={(e) => addSection(e, 'video')} className="btn-dark-blue">Add Video</button>
          <button onClick={(e) => addSection(e, 'pdf')} className="btn-dark-blue">Add Resource</button>
        </div>
        {/* create course button and error message */}
        <div className='pb-6'>
          <button onClick={handleSubmit} className='btn-dark-red'>
            Create Course
          </button>
          {error ?
            <div className="flex items-center mt-1">
              <AiFillWarning className="text-red-500" />
              <p className="ml-1 text-sm text-red-500">{error}</p>
            </div>
            : <div className="h-6"></div>
          }
        </div>
      </form>
    </div>
  )
}

export default CreateNewPage;
