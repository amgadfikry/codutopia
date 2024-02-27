import {
  CreateDescription, LazyLoadImage, instructorImage, useState, AddVideoField, produce,
  checkDataError, AiFillWarning, AddResourceField
} from '../../import';

function CreateNew() {
  const [courseData, setCourseData] = useState({
    title: '',
    category: 'Python',
    level: 'Beginner',
    description: '',
    content: [],
  });
  const [content, setContent] = useState([]);
  const [error, setError] = useState('');

  const handleData = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setCourseData(produce(draft => {
      draft[name] = value;
    }));
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkDataError(courseData, ['content'])) {
      if (content.every(item => item.complete)) {
        console.log('all complete')
      } else {
        setError('Please fill all content fields');
      }
    } else {
      setError('Please fill description fileds');
    }
  }
  const addVideo = (e) => {
    e.preventDefault();
    setContent([...content, { type: 'video', name: '', description: '', video: '', complete: false }]);
  }
  const addResource = (e) => {
    e.preventDefault();
    setContent([...content, { type: 'resource', name: '', description: '', url: '', complete: false }]);
  }
  const updateElement = (index, name, value) => {
    setContent(produce(draft => {
      draft[index][name] = value;
    }));
  }
  const deleteElemnet = (e, index) => {
    e.preventDefault();
    setContent(content.filter((_, i) => i !== index));
  }

  return (
    <div className=" min-h-screen container mx-auto relative pt-24 pb-16 
    w-full md:w-lg">
      <h2 className="text-3xl text-center text-darker-blue font-bold lg:text-5xl
      border-b-4 border-light-red w-fit pb-2 mb-10 mx-auto">Create New Course</h2>
      <LazyLoadImage
        src={instructorImage}
        alt="instructor"
        className=' absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[-1]'
        placeholderSrc={instructorImage}
      />
      <form className="shadow-md px-8 py-6 mb-4 bg-opacity-90 bg-dark-gray lg:w-8/12 lg:mx-auto
        rounded-md space-y-8">
        <CreateDescription courseData={courseData} handleData={handleData} />
        {
          content.map((item, index) => {
            if (item.type === 'video') {
              return <AddVideoField key={index} updateElement={updateElement} index={index} content={content}
                deleteElemnet={deleteElemnet} />
            } else if (item.type === 'resource') {
              return <AddResourceField key={index} updateElement={updateElement} index={index} content={content}
                deleteElemnet={deleteElemnet} />
            }
          })
        }
        <div className="flex items-center justify-end space-x-3 mt-4">
          <button onClick={addVideo} className="btn-dark-blue">Add Video</button>
          <button onClick={addResource} className="btn-dark-blue">Add Resource</button>
        </div>
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

export default CreateNew