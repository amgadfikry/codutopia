/* eslint-disable react/prop-types */
import {
  InputField, TextAreaField, SelectField, MdSubtitles
} from '../../../import';


function CreateDescription({ courseData, handleData }) {
  const categories = ['Python', 'Java', 'JavaScript', 'Go', 'C++', 'Ruby', 'C#', 'TypeScript']
  const levels = ['Beginner', 'Intermediate', 'Advanced']

  return (
    <fieldset className="space-y-4 text-darker-blue border border-light-blue p-4">
      <legend className="text-xl font-bold px-2">Course Description</legend>
      <div className='space-y-4'>
        <InputField
          label="Course Title"
          type="text"
          placeholder="Course Title"
          name="title"
          Icon={MdSubtitles}
          value={courseData.title}
          onChange={handleData}
        />
        <SelectField
          name="category"
          label="Category"
          options={categories}
          value={courseData.category}
          onChange={handleData}
        />
        <SelectField
          name="level"
          label="Level"
          options={levels}
          value={courseData.level}
          onChange={handleData}
        />
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