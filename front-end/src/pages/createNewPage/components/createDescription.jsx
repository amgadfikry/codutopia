/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  InputField, TextAreaField, SelectField, MdSubtitles
} from '../../../import';

// CreateDescription component to create course description form fieldset
function CreateDescription({ courseData, handleData }) {
  // array of categories and levels
  const categories = ['Python', 'Java', 'JavaScript', 'Go', 'C++', 'Ruby', 'C#', 'TypeScript']
  const levels = ['Beginner', 'Intermediate', 'Advanced']

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
      </div>
    </fieldset>
  )
}

export default CreateDescription
