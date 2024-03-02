/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  InputField, TextAreaField, useState, checkDataError, AiFillWarning,
  axios, url, Cookies, produce
} from '../../../import';

// addFileSection component to add file to course content form fieldset and handle file upload and delete
function AddFileSection({ index, content, setContent, Icon }) {
  // use state variables for collapse, error and uploading bar
  const [collapse, setCollapse] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // handleCollapse function to handle collapse button click
  const handleCollapse = (e) => {
    e.preventDefault();
    setCollapse(!collapse);
  }

  // updateElement function to update content element
  const updateElement = (index, name, value) => {
    setContent(produce(draft => {
      draft[index][name] = value;
    }));
  }
  // deleteElemnet function to delete content element
  const deleteElemnet = (index) => {
    setContent(content.filter((_, i) => i !== index));
  }

  // handle add file function to handle add file button click and delete upload
  const handleAddFile = (e) => {
    // prevent default form submission and set error to empty
    e.preventDefault();
    setError('');
    // check if video is not empty and complete all fields
    if (!checkDataError(content[index], ['complete'])) {
      // create form data and append file to it
      const formData = new FormData();
      formData.append('file', content[index].file);
      // set uploading to true
      setUploading(true);
      // send post request to upload  file
      const fileType = content[index].type;
      axios.post(`${url}/files/upload/${fileType}`, formData, {
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
          const metadata = { ...res.data.data, objectKey: content[index].file.name }
          updateElement(index, 'file', metadata);
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

  // handleDeleteFile function to handle delete file button click and file delete
  const handleDeleteFile = (e) => {
    // prevent default form submission and set error to empty
    e.preventDefault();
    setError('');
    // check if fields is complete
    if (content[index].complete) {
      // get file key and send delete request to delete file file from cloud storage
      const fileKey = content[index].file.objectKey;
      const fileType = content[index].type;
      axios.delete(`${url}/files/delete/${fileType}/${fileKey}`, {
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
      <legend className="text-xl font-bold px-2">{`Add ${content[index].type} (lesson ${index + 1})`}</legend>
      <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden origin-top
        ${collapse ? 'max-h-0 scale-y-0' : 'max-h-[500px] scale-y-100'}`}>
        {/* input fields for file title */}
        <InputField
          Icon={Icon}
          label={`${content[index].type} Title`}
          type="text"
          placeholder={`${content[index].type} Title`}
          name="name"
          value={content[index].name}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        {/* input fields for video description */}
        <TextAreaField
          label="Description"
          name="description"
          placeholder={`Enter ${content[index].type} Description`}
          value={content[index].description}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        {/* input fields for file upload */}
        <div className='flex justify-center items-center'>
          <input
            className='px-2 py-1 border border-gray-600 rounded-md w-10/12 md:w-1/2 lg:w-1/3'
            type='file'
            name="file"
            onChange={(e) => updateElement(index, e.target.name, e.target.files[0])}
          />
        </div>
      </div>
      {/* buttons for add file, delete file, collapse and error message */}
      <div className={`flex items-center ${content[index].complete && 'justify-center'}
      ${!collapse && 'mt-3'}`}>
        <button className="btn-light-red mr-2" onClick={handleDeleteFile}>Delete</button>
        <button className={`btn-light-blue ${content[index].complete && 'pointer-events-none btn-dark-blue'}`}
          onClick={handleAddFile} >
          {content[index].complete ? 'Uploaded' : 'Upload'}
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

export default AddFileSection