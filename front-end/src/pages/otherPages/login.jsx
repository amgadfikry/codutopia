import { LoginBox, LazyLoadImage, loginImage } from "../../import";

function Login() {
  return (
    <div className="p-5 flex items-center relative min-h-screen justify-center  ">
      <div className='lg:w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
      lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0'>
        <LazyLoadImage
          alt="server down"
          src={loginImage}
          placeholderSrc={loginImage}
          className=""
        />
      </div>
      <div className='lg:w-1/2 flex justify-center items-center flex-1'>
        <LoginBox className='' />
      </div>
    </div>
  )
}

export default Login