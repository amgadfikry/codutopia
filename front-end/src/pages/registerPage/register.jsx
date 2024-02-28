// import hooks and images
import {
  LazyLoadImage, registerImage, useNavigate, useSelector, userAuth, useEffect
} from "../../import.js";
import RegisterBox from "./registerBox.jsx";

// RegisterBox component to display register page with register box
function Register() {
  // get user authentication data from redux store
  const auth = useSelector(userAuth);
  const navigate = useNavigate();

  // redirect to home page if user is already authenticated
  useEffect(() => {
    if (auth !== 'public') navigate('/');
  }, [auth, navigate]);

  return (
    <div className="px-5 pt-24 pb-16 lg:flex lg:items-center relative">
      <div className='lg:w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
      lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0'>
        {/* display register image */}
        <LazyLoadImage
          alt="server down"
          src={registerImage}
          placeholderSrc={registerImage}
          className=""
        />
      </div>
      {/* display register box */}
      <div className='lg:w-1/2 flex justify-center items-center'>
        <RegisterBox className='' />
      </div>
    </div>
  )
}

export default Register