/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import required hooks, components, images and icons
import {
  url
} from '../../../import';

// video lesson component
function PdfLesson({ data }) {
  const cloudurl = `${url}/files/get/pdf/${data.file.objectKey}`;

  return (
    <div className='w-full md:w-[600px] mx-auto border-2 border-deaker-blue overflow-hidden rounded-md mt-5'>
      <object data={cloudurl} type='application/pdf' width='100%' height='800px'></object>
    </div>
  );
}

export default PdfLesson
