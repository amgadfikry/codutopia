/* eslint-disable react/prop-types */
function SelectField({ name, label, options, value, onChange }) {
  const randomKey = Math.random().toString(36).substring(7);
  const id = label + randomKey;

  return (
    <div className="flex flex-col p-1">
      <label className="mb-1 ml-1 font-medium text-lg text-light-black" htmlFor={id}>{label}</label>
      <select
        name={name}
        id={id}
        className={`w-full px-1 py-2 placeholder-darker-gray text-light-black rounded-lg focus:outline-none
        focus:shadow-outline text-sm sm:text-base border border-darker-gray focus:border-light-black bg-transparent`}
        value={value}
        onChange={onChange}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectField