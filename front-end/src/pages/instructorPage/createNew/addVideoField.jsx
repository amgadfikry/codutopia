/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  InputField, TextAreaField, FaVideo, useState, checkDataError, AiFillWarning,
  axios, url, Cookies
} from '../../../import';

function AddVideoField({ updateElement, index, content, deleteElemnet }) {
  const [collapse, setCollapse] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCollapse = (e) => {
    e.preventDefault();
    setCollapse(!collapse);
  }

  const handleAddVideo = (e) => {
    e.preventDefault();
    setError('');
    if (!checkDataError(content[index], ['complete'])) {
      const formData = new FormData();
      formData.append('video', content[index].video);
      setUploading(true);
      axios.post(`${url}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': Cookies.get('authToken')
        },
      })
        .then(res => {
          setUploading(false);
          const metadata = { ...res.data.data, objectKey: content[index].video.name }
          updateElement(index, 'video', metadata);
          setCollapse(!collapse);
          updateElement(index, 'complete', true);
        })
        .catch(err => {
          setError(err.response.data.msg || 'Server Error');
        })
    } else {
      setError('Please fill all fields');
    }
    setTimeout(() => {
      setError('');
    }, 3000);
  }

  const handleDeleteVideo = (e) => {
    e.preventDefault();
    setError('');
    if (content[index].complete) {
      const decodedName = content[index].video.objectKey;
      axios.delete(`${url}/files/delete/${decodedName}`, {
        headers: {
          'Authorization': Cookies.get('authToken')
        }
      })
        .then(res => {
          deleteElemnet(index);
        })
        .catch(err => {
          setError(err.response.data.msg || 'Server Error');
          setTimeout(() => {
            setError('');
          }, 3000);
        })
    } else {
      deleteElemnet(index);
    }
  }

  return (
    <fieldset className=" text-darker-blue border border-light-blue p-2 ">
      <legend className="text-xl font-bold px-2">{`Add Video (lesson ${index + 1})`}</legend>
      <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden origin-top
        ${collapse ? 'max-h-0 scale-y-0' : 'max-h-[500px] scale-y-100'}`}>
        <InputField
          Icon={FaVideo}
          label="Video Title"
          type="text"
          placeholder="Video Title"
          name="name"
          value={content[index].name}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        <TextAreaField
          label="Description"
          name="description"
          placeholder="Enter Video Description"
          value={content[index].description}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        <div className='flex justify-center items-center'>
          <input
            className='px-2 py-1 border border-gray-600 rounded-md w-10/12 md:w-1/2 lg:w-1/3'
            type='file'
            name="video"
            onChange={(e) => updateElement(index, e.target.name, e.target.files[0])}
          />
        </div>
      </div>
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
      {uploading &&
        <div className="mt-2">
          <div className="w-full h-1 bg-light-red rounded-md animate-pulse"></div>
        </div>
      }
    </fieldset>
  )
}

export default AddVideoField