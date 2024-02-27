/* eslint-disable react/prop-types */
import {
  InputField, TextAreaField, FaVideo, useState, checkDataError, AiFillWarning,
  axios, url, optionsWithCookies, Cookies
} from '../../import';

function AddVideoField({ updateElement, index, content, deleteElemnet }) {
  const [collapse, setCollapse] = useState(false);
  const [error, setError] = useState('');

  const handleCollapse = (e) => {
    e.preventDefault();
    setCollapse(!collapse);
  }

  const handleAddVideo = (e) => {
    e.preventDefault();
    setError('');
    if (!checkDataError(content[index], ['complete'])) {
      console.log(content[index].video)
      const formData = new FormData();
      formData.append('video', content[index].video);
      axios.post(`${url}/files/upload`, formData, {
         headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': Cookies.get('authToken')
        },
      })
        .then(res => {
          const metadata = { ...res.data.data, objectKey: content[index].video.name}
          updateElement(index, 'metadata', metadata);
        })
        .catch(err => {
          console.log(err);
        })
      setCollapse(!collapse);
      updateElement(index, 'complete', true);
    } else {
      setError('Please fill all fields');
    }
  }

  return (
    <fieldset className="space-y-4 text-darker-blue border border-light-blue p-4">
      <legend className="text-xl font-bold px-2">{`Add Video (lesson ${index + 1})`}</legend>
      <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden origin-top
        ${collapse ? 'max-h-0 scale-y-0' : 'max-h-[600px] scale-y-100'}`}>
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
      <div className='flex items-center space-x-3'>
        <button className="btn-light-blue" onClick={(e) => deleteElemnet(e, index)}>Delete</button>
        {!collapse &&
          <button className='btn-light-blue' onClick={handleAddVideo} >Add Video</button>
        }
        {!content[index].complete &&
          <button className='btn-light-blue' onClick={handleCollapse}>{collapse ? 'Expand' : 'Collapse'}</button>  
        }
      </div>
      {error ?
        <div className="flex items-center mt-1">
          <AiFillWarning className="text-red-500" />
          <p className="ml-1 text-sm text-red-500">{error}</p>
        </div>
        : <div className="h-5"></div>
      }
    </fieldset>
  )
}

export default AddVideoField