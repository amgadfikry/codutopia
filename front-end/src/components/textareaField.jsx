/* eslint-disable react/prop-types */
function TextAreaField({ name, label, placeholder, value, onChange }) {
  const randomKey = Math.random().toString(36).substring(7);
  const id = label + randomKey;

  return (
    <div className="flex flex-col p-1">
      <label className="mb-1 ml-1 font-medium text-light-black" htmlFor={id}>{label}</label>
      <textarea
        name={name}
        id={id}
        className={`w-full px-3 py-2 placeholder-darker-gray text-light-black rounded-lg focus:outline-none
        focus:shadow-outline text-sm sm:text-base border border-darker-gray focus:border-light-black resize-none `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={5}
      />
    </div>
  )
}

export default TextAreaField
