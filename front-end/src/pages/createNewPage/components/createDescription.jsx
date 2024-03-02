/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  InputField, TextAreaField, SelectField, MdSubtitles, axios, url, Cookies, useNavigate
} from '../../../import';

// CreateDescription component to create course description form fieldset
function CreateDescription({ courseData, handleData }) {
  // array of categories and levels
  const categories = ['Python', 'Java', 'JavaScript', 'Go', 'C++', 'Ruby', 'C#', 'TypeScript']
  const levels = ['Beginner', 'Intermediate', 'Advanced']
  const navigate = useNavigate();

  const handleImage = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    axios.post(`${url}/files/upload/image`, formData, {
      headers: {
        // set authorization token in request header from cookies and content type to multipart/form-data
        'Content-Type': 'multipart/form-data',
        'Authorization': Cookies.get('authToken')
      },
    })
      .then(res => {
        const metaData = { ...res.data.data, objectKey: file.name };
        handleData({ target: { name: 'image', value: metaData } });
      })
      .catch(err => {
        navigate('/server-down');
      });
  }

  return (
    <fieldset className="space-y-4 text-darker-blue border border-light-blue p-4">
      <legend className="text-xl font-bold px-2">Course Description</legend>
      <div className='space-y-4'>
        {/* course title input*/}
        <InputField
          label="Course Title"
          type="text"
          placeholder="Course Title"
          name="title"
          Icon={MdSubtitles}
          value={courseData.title}
          onChange={handleData}
        />
        {/* course category select*/}
        <SelectField
          name="category"
          label="Category"
          options={categories}
          value={courseData.category}
          onChange={handleData}
        />
        {/* course level select*/}
        <SelectField
          name="level"
          label="Level"
          options={levels}
          value={courseData.level}
          onChange={handleData}
        />
        {/* course description textarea*/}
        <TextAreaField
          label="Description"
          name="description"
          placeholder="Enter Course Description"
          value={courseData.description}
          onChange={handleData}
        />
        <div className='flex justify-center items-center'>
          <input
            className='px-2 py-1 border border-gray-600 rounded-md w-10/12 md:w-1/2 lg:w-1/3'
            type='file'
            name="file"
            onChange={handleImage}
          />
        </div>
      </div>
    </fieldset>
  )
}

export default CreateDescription
