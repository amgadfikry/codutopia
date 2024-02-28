/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  InputField, TextAreaField, FaVideo, useState, checkDataError, AiFillWarning,
  axios, url, Cookies
} from '../../../import';

// AddVideoField component to add video to course content form fieldset and handle video upload and delete
function AddVideoField({ updateElement, index, content, deleteElemnet }) {
  // use state variables for collapse, error and uploading bar
  const [collapse, setCollapse] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // handleCollapse function to handle collapse button click
  const handleCollapse = (e) => {
    e.preventDefault();
    setCollapse(!collapse);
  }

  // handleAddVideo function to handle add video button click and video upload
  const handleAddVideo = (e) => {
    // prevent default form submission and set error to empty
    e.preventDefault();
    setError('');
    // check if video is not empty and complete all fields
    if (!checkDataError(content[index], ['complete'])) {
      // create form data and append video file to it
      const formData = new FormData();
      formData.append('video', content[index].video);
      // set uploading to true
      setUploading(true);
      // send post request to upload video file
      axios.post(`${url}/files/upload`, formData, {
        headers: {
          // set authorization token in request header from cookies and content type to multipart/form-data
          'Content-Type': 'multipart/form-data',
          'Authorization': Cookies.get('authToken')
        },
      })
        .then(res => {
          // if success, set uploading to false, set metadata and update element
          // set collapse to true and set complete to true
          setUploading(false);
          const metadata = { ...res.data.data, objectKey: content[index].video.name }
          updateElement(index, 'video', metadata);
          setCollapse(!collapse);
          updateElement(index, 'complete', true);
        })
        .catch(err => {
          // if error, set error and set uploading to false
          setError(err.response.data.msg || 'Server Error');
        })
    } else {
      // if fields are empty, set error
      setError('Please fill all fields');
    }
    // set error to empty after 3 seconds
    setTimeout(() => {
      setError('');
    }, 3000);
  }

  // handleDeleteVideo function to handle delete video button click and video delete
  const handleDeleteVideo = (e) => {
    // prevent default form submission and set error to empty
    e.preventDefault();
    setError('');
    // check if video is complete
    if (content[index].complete) {
      // get video key and send delete request to delete video file from cloud storage
      const videoKey = content[index].video.objectKey;
      axios.delete(`${url}/files/delete/${videoKey}`, {
        headers: {
          'Authorization': Cookies.get('authToken')
        }
      })
        .then(res => {
          // if success, set collapse to true and delete element from content
          deleteElemnet(index);
        })
        .catch(err => {
          // if error, set error
          setError(err.response.data.msg || 'Server Error');
          setTimeout(() => {
            setError('');
          }, 3000);
        })
    } else {
      // if video is not complete, set collapse to true and delete element from content
      deleteElemnet(index);
    }
  }

  return (
    <fieldset className=" text-darker-blue border border-light-blue p-2 ">
      <legend className="text-xl font-bold px-2">{`Add Video (lesson ${index + 1})`}</legend>
      <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden origin-top
        ${collapse ? 'max-h-0 scale-y-0' : 'max-h-[500px] scale-y-100'}`}>
        {/* input fields for video title */}
        <InputField
          Icon={FaVideo}
          label="Video Title"
          type="text"
          placeholder="Video Title"
          name="name"
          value={content[index].name}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        {/* input fields for video description */}
        <TextAreaField
          label="Description"
          name="description"
          placeholder="Enter Video Description"
          value={content[index].description}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        {/* input fields for video file upload */}
        <div className='flex justify-center items-center'>
          <input
            className='px-2 py-1 border border-gray-600 rounded-md w-10/12 md:w-1/2 lg:w-1/3'
            type='file'
            name="video"
            onChange={(e) => updateElement(index, e.target.name, e.target.files[0])}
          />
        </div>
      </div>
      {/* buttons for add video, delete video, collapse and error message */}
      <div className={`flex items-center ${content[index].complete && 'justify-center'}
      ${!collapse && 'mt-3'}`}>
        <button className="btn-light-red mr-2" onClick={handleDeleteVideo}>Delete</button>
        <button className={`btn-light-blue ${content[index].complete && 'pointer-events-none btn-dark-blue'}`}
          onClick={handleAddVideo} >
          {content[index].complete ? 'Video Added' : 'Add Video'}
        </button>
        {!content[index].complete &&
          <button className='btn-light-blue ml-auto' onClick={handleCollapse}>{collapse ? 'Expand' : 'Collapse'}</button>
        }
      </div>
      {error &&
        <div className="flex items-center mt-1">
          <AiFillWarning className="text-red-500" />
          <p className="ml-1 text-sm text-red-500">{error}</p>
        </div>
      }
      {/* uploading bar */}
      {uploading &&
        <div className="mt-2">
          <div className="w-full h-1 bg-light-red rounded-md animate-pulse"></div>
        </div>
      }
    </fieldset>
  )
}

export default AddVideoField
