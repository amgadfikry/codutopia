/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  LazyLoadImage, courseImage, url
} from '../../../import';

// CourseHead component to display course head
function CourseHead({ courseDetails, auth, userCourse }) {
  const imageUrl = `${url}/files/get/image/${courseDetails.image.objectKey}`;

  return (
    <div className='flex flex-col md:flex-row p-1 bg-darker-blue rounded-lg'>
      <LazyLoadImage
        src={imageUrl}
        alt='course'
        className='md:w-80 rounded-lg object-cover'
        placeholderSrc={courseImage}
      />
      <div className='flex flex-col px-4 py-2  w-full'>
        <h1 className='text-2xl lg:text-3xl font-bold mb-3'>{courseDetails.title}</h1>
        <p className='text-dark-gray md:mb-auto mb-5 font-light text-sm'>{courseDetails.description}</p>
        <div className="text-light-red font-semibold text-xs">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1
          mr-2">#{courseDetails.category}</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1
          mr-2">#{courseDetails.level}</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1
          mr-2">#Free</span>
        </div>
        {auth === 'learner' && userCourse &&
          <div className='flex items-center mt-1'>
            <p className='text-light-blue text-sm'>Progress: </p>
            <div className='w-48 h-2 bg-light-blue rounded-lg ml-2'>
              <div className='h-2 bg-light-red rounded-lg'
                style={{ width: `${userCourse.progress}%` }}>
              </div>
            </div>
            <p className='ml-2 text-light-blue'>{userCourse.progress.toFixed(2)}%</p>
          </div>
        }
      </div>
    </div>
  )
}

export default CourseHead
