/* eslint-disable no-unused-vars */
// import required hooks, components and images
import {
  LazyLoadImage, supportImage, useState, InputField, MdEmail, AiFillWarning, MdTopic,
  TextAreaField, useSelector, userAuth, useEffect, useNavigate
} from '../../import';

// Support component to display support page
function Support() {
  // use state to store input data and error data
  const [inputData, setInputData] = useState({ email: '', subject: '', message: '' });
  const [errorData, setErrorData] = useState("");
  // get user auth from redux store
  const auth = useSelector(userAuth);
  // use navigate hook
  const navigate = useNavigate();

  // handle input data
  const handleInputData = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  }

  // handle send message
  const handleSend = (e) => {
    e.preventDefault();
  }

  // useEffect to check if user is authenticated
  useEffect(() => {
    auth === 'public' && navigate('/login');
  }, [auth, navigate]);

  return (
    <section className="container mx-auto pt-24 pb-16 px-3">
      <div className="flex items-center relative justify-center  ">
        <div className='lg:w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
          lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0'>
          {/* Image part*/}
          <LazyLoadImage
            alt="server down"
            src={supportImage}
            placeholderSrc={supportImage}
            className=""
          />
        </div>
        <div className='lg:w-1/2 flex justify-center items-center flex-1'>
          {/* Form part*/}
          <div className="w-full bg-opacity-90 bg-light-gray rounded-xl drop-shadow-lg  md:mt-0 sm:max-w-lg xl:p-0 text-darker-blue" >
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight  md:text-2xl text-center">
                Contact Us
              </h1>
              {/* Email, Subject and Message input fields*/}
              <form className="space-y-2 md:space-y-2" action="#">
                <div>
                  <InputField type='email' Icon={MdEmail} label='Email address' name={'email'}
                    placeholder='Your email address' value={inputData.email} onChange={handleInputData} />
                </div>
                <div>
                  <InputField type='text' Icon={MdTopic} label='Subject' name={'subject'}
                    placeholder='Let us know how help you' value={inputData.subject} onChange={handleInputData} />
                </div>
                <div>
                  <TextAreaField label='Message' placeholder='Leave Your message'
                    value={inputData.message} onChange={handleInputData} />
                </div>
                <button type="submit" className="btn-dark-blue w-full" onClick={handleSend}>
                  Send Message
                </button>
                {
                  errorData ?
                    <div className="flex items-center mt-1">
                      <AiFillWarning className="text-red-500" />
                      <p className="ml-1 text-sm text-red-500">{errorData}</p>
                    </div>
                    : <div className="h-5"></div>
                }
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Support
