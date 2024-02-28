/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  InputField, TextAreaField, FaFile, useState, checkDataError, AiFillWarning
} from '../../../import';

// AddResourceField component to add resource to course content form fieldset
function AddResourceField({ updateElement, index, content, deleteElemnet }) {
  // use state variables for collapse and error
  const [collapse, setCollapse] = useState(false);
  const [error, setError] = useState('');

  // handleCollapse function to handle collapse button click
  const handleCollapse = (e) => {
    e.preventDefault();
    setCollapse(!collapse);
  }

  // handleAddResource function to handle add resource button click
  const handleAddResource = (e) => {
    // prevent default form submission and set error to empty
    e.preventDefault();
    setError('');
    // check if resource is not empty and complete all fields
    if (!checkDataError(content[index], ['complete'])) {
      // set collapse to true and set complete to true
      setCollapse(!collapse);
      updateElement(index, 'complete', true);
    } else {
      // if fields are empty, set error
      setError('Please fill all fields');
    }
    // set error to empty after 3 seconds
    setTimeout(() => {
      setError('');
    }, 3000);
  }

  // handleDeleteResource function to handle delete resource button click
  const handleDeleteResource = (e) => {
    e.preventDefault();
    deleteElemnet(index);
  }

  return (
    <fieldset className="text-darker-blue border border-light-blue p-2">
      <legend className="text-xl font-bold px-2">{`Add Resource (lesson ${index + 1})`}</legend>
      <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden origin-top
        ${collapse ? 'max-h-0 scale-y-0' : 'max-h-[600px] scale-y-100'}`}>
        {/* resource title input*/}
        <InputField
          Icon={FaFile}
          label="Resource Title"
          type="text"
          placeholder="Resource Title"
          name="name"
          value={content[index].name}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        {/* resource description textarea*/}
        <TextAreaField
          label="Description"
          name="description"
          placeholder="Enter Resources Description"
          value={content[index].description}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        {/* resource url input*/}
        <InputField
          Icon={FaFile}
          label="Resource URL"
          type="text"
          placeholder="Resource URL"
          name="url"
          value={content[index].url}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
      </div>
      {/* buttons to add resource, delete resource, collapse and error message */}
      <div className={`flex items-center ${content[index].complete && 'justify-center'}
      ${!collapse && 'mt-3'}`}>
        <button className="btn-light-red mr-2" onClick={handleDeleteResource}>Delete</button>
        <button className={`btn-light-blue ${content[index].complete && 'pointer-events-none btn-dark-blue'}`}
          onClick={handleAddResource} >
          {content[index].complete ? 'Resource Added' : 'Add Resource'}
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
    </fieldset>
  )
}

export default AddResourceField
