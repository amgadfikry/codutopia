/* eslint-disable react/prop-types */
import {
  InputField, TextAreaField, FaFile, useState, checkDataError, AiFillWarning
} from '../../../import';

function AddResourceField({ updateElement, index, content, deleteElemnet }) {
  const [collapse, setCollapse] = useState(false);
  const [error, setError] = useState('');

  const handleCollapse = (e) => {
    e.preventDefault();
    setCollapse(!collapse);
  }

  const handleAddResource = (e) => {
    e.preventDefault();
    setError('');
    if (!checkDataError(content[index], ['complete'])) {
      setCollapse(!collapse);
      updateElement(index, 'complete', true);
    } else {
      setError('Please fill all fields');
    }
    setTimeout(() => {
      setError('');
    }, 3000);
  }

  const handleDeleteResource = (e) => {
    e.preventDefault();
    deleteElemnet(index);
  }

  return (
    <fieldset className="text-darker-blue border border-light-blue p-2">
      <legend className="text-xl font-bold px-2">{`Add Resource (lesson ${index + 1})`}</legend>
      <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden origin-top
        ${collapse ? 'max-h-0 scale-y-0' : 'max-h-[600px] scale-y-100'}`}>
        <InputField
          Icon={FaFile}
          label="Resource Title"
          type="text"
          placeholder="Resource Title"
          name="name"
          value={content[index].name}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
        <TextAreaField
          label="Description"
          name="description"
          placeholder="Enter Resources Description"
          value={content[index].description}
          onChange={(e) => updateElement(index, e.target.name, e.target.value)}
        />
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