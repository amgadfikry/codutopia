/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
function InputField({ name, type, Icon, label, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col p-1">
      <label className="mb-1 ml-1 font-medium text-lg " htmlFor={label}>{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-blue font-medium text-xl" />}
        <input
          name={name}
          id={label}
          className={`w-full pl-10 pr-3 py-2 placeholder-darker-gray text-light-black rounded-lg focus:outline-none
          focus:shadow-outline text-sm sm:text-base border border-darker-gray focus:border-light-black`}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export default InputField