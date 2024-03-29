/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import { FiSearch } from '../import';

// SearchField component to display search field
function SearchField({ placeholder, value, onChange, name }) {
  return (
    <div className="relative m-1">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-blue h-5 w-5" />
      <input
        className={`w-full pl-10 pr-3 py-2 placeholder-darker-gray text-light-black rounded-lg focus:outline-none
        focus:shadow-outline text-sm sm:text-base border border-darker-gray focus:border-light-black`}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
        name={name}
        id={name}
      />
    </div>
  )
}

export default SearchField