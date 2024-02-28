// import images and components
import {
  LazyLoadImage, loginImage, useSelector, userAuth, useEffect, useNavigate
} from "../../import.js";
import LoginBox from "./loginBox.jsx";

// Login component to display login page with login box
function Login() {
  // get user authentication data from redux store
  const auth = useSelector(userAuth);
  const navigate = useNavigate();

  // redirect to home page if user is already authenticated
  useEffect(() => {
    if (auth !== 'public') navigate('/');
  }, [auth, navigate]);

  return (
    <div className="px-5 pt-24 pb-16 flex items-center relative justify-center  ">
      <div className='lg:w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
      lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0'>
        {/* display login image */}
        <LazyLoadImage
          alt="server down"
          src={loginImage}
          placeholderSrc={loginImage}
          className=""
        />
      </div>
      {/* display login box */}
      <div className='lg:w-1/2 flex justify-center items-center flex-1'>
        <LoginBox className='' />
      </div>
    </div>
  )
}

export default Login
