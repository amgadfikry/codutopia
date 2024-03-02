
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  LazyLoadImage, Link, url
} from '../import.js';

// CourseBox component to display course card
function CourseBox({ course }) {

  return (
    <Link to={`/course/${course._id}`} className='hover:scale-[101%] transition-all duration-300 ease-in-out' >
      <div className="md:max-w-[350px]
        max-w-full rounded overflow-hidden m-3 text-darker-blue shadow-xl p-2">
        {/* display course card image part*/}
        <div className='flex justify-center items-center w-full rounded-md overflow-hidden'>
          <LazyLoadImage
            className="w-full"
            src={`${url}/files/get/image/${course.image.objectKey}`}
            alt="Sunset in the mountains"
            placeholderSrc={`${url}/files/get/image/${course.image.objectKey}`}
          />
        </div>
        {/* display course card details part*/}
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{course.title}</div>
          <p className="text-light-blue text-sm font-light">{course.description}</p>
        </div>
        <div className="px-6 pt-4 pb-2">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
        font-semibold text-light-red mr-2 mb-2">#{course.category}</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
        font-semibold text-light-red mr-2 mb-2">#{course.level}</span>
        </div>
      </div>
    </Link>
  )
}

export default CourseBox
