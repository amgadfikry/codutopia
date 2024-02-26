import { RegisterBox, LazyLoadImage, registerImage } from "../../import";

function Register() {
  return (
    <div className="p-5 lg:flex lg:items-center relative">
      <div className='lg:w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
      lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0'>
        <LazyLoadImage
          alt="server down"
          src={registerImage}
          placeholderSrc={registerImage}
          className=""
        />
      </div>
      <div className='lg:w-1/2 flex justify-center items-center'>
        <RegisterBox className='' />
      </div>
    </div>
  )
}

export default Register