/* eslint-disable react/prop-types */
import {
  InputField, TextAreaField, FaFile, useState, checkDataError, AiFillWarning
} from '../../import';

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
  }

  return (
    <fieldset className="space-y-4 text-darker-blue border border-light-blue p-4">
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
      <div className='flex items-center space-x-3'>
        <button className="btn-light-blue" onClick={(e) => deleteElemnet(e, index)}>Delete</button>
        {!collapse &&
          <button className='btn-light-blue' onClick={handleAddResource} >Add Resource</button>
        }
        <button className='btn-light-blue' onClick={handleCollapse}>{collapse ? 'Expand' : 'Collapse'}</button>
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

export default AddResourceField