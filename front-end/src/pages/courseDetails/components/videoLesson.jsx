/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  url
} from '../../../import';
import ReactPlayer from 'react-player/lazy'

// video lesson component
function VideoLesson({ data, handleComplete }) {
  return (
    <div className='w-full md:w-[600px] mx-auto border-2 border-deaker-blue overflow-hidden rounded-md mt-5 '>
      <ReactPlayer url={`${url}/files/get/video/${data.file.objectKey}`}
        controls={true}
        width='100%'
        playbackRate={1}
        onEnded={handleComplete}
        config={{
          headers: {
            'Content-Type': 'video/mp4',
          }
        }}
      />
    </div>
  )
}

export default VideoLesson
