/* eslint-disable react/prop-types */
function TextAreaField({ label, placeholder, error, value, onChange }) {
  return (
    <div className="flex flex-col p-1">
      <label className="mb-1 ml-1 font-medium text-light-black" htmlFor={label}>{label}</label>
      <textarea
        id={label}
        className={`w-full px-3 py-2 placeholder-darker-gray text-light-black rounded-lg focus:outline-none
        focus:shadow-outline text-sm sm:text-base border border-darker-gray focus:border-light-black resize-none `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={5}
      />
      {error && <p className="mt-1 ml-1 text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default TextAreaField
