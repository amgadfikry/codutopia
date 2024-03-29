// import custom components and hooks
import {
  InputField, Logo, useState, MdEmail, RiLockPasswordFill, Link, axios, useNavigate,
  checkDataError, url, SelectField, AiFillWarning, checkPassword, FaUser, MdDriveFileRenameOutline
} from '../../import.js';

// RegisterBox component to display register form and handle register request
function RegisterBox() {
  // states for input data and error data
  const [inputData, setInputData] = useState({
    email: '', password: '', role: 'learner', userName: '', fullName: '', confirmPassword: ''
  });
  const [errorData, setErrorData] = useState("");
  const navigate = useNavigate();

  // handle input data change
  const handleInputData = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  }

  // handle register request and set error data if any error occurs
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorData("");
    // check if any error occurs in input data and set error data if any error occurs
    const errorData = checkDataError(inputData, []);
    if (errorData) {
      setErrorData(errorData);
      return;
    }
    // check if any error occurs in password and set error data if any error occurs
    const passwordError = checkPassword(inputData);
    if (passwordError) {
      setErrorData(passwordError);
      return;
    }
    // send register request and navigate to login page if register request is successful
    // and set error data if any error occurs in register request and navigate to server down page if server is down
    axios.post(`${url}/users/register`, inputData)
      .then((res) => {
        if (res.status === 201) navigate('/login');
      })
      .catch((err) => {
        if (err.response.status === 500) {
          navigate('/server-down');
        }
        setErrorData(err.response.data.msg);
      });
  }

  return (
    <div className="w-full bg-light-gray bg-opacity-90 rounded-xl drop-shadow-lg  md:mt-0 sm:max-w-md xl:p-0 text-darker-blue" >
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        {/* display logo, title */}
        <div className='text-center' ><Logo /></div>
        <h1 className="text-xl font-bold leading-tight tracking-tight  md:text-2xl text-center">
          Create new account for free
        </h1>
        <form className="space-y-2 md:space-y-2" action="#">
          {/* display input fields for full name, user name, email, role, password, confirm password*/}
          <div>
            <InputField type='text' Icon={MdDriveFileRenameOutline} label='Full Name' name={'fullName'}
              placeholder='Your Full Name' value={inputData.fullName} onChange={handleInputData} />
          </div>
          <div>
            <InputField type='text' Icon={FaUser} label='User Name' name={'userName'}
              placeholder='Your User Name' value={inputData.userName} onChange={handleInputData} />
          </div>
          <div>
            <InputField type='email' Icon={MdEmail} label='Email address' name={'email'}
              placeholder='Your email address' value={inputData.email} onChange={handleInputData} />
          </div>
          <div>
            <SelectField name='role' label='Role' value={inputData.role} onChange={handleInputData}
              options={['learner', 'instructor']} />
          </div>
          <div>
            <InputField type='password' Icon={RiLockPasswordFill} label='Password' name={'password'}
              placeholder='Your password' value={inputData.password} onChange={handleInputData} />
          </div>
          <div>
            <InputField type='password' Icon={RiLockPasswordFill} label='Confirm password' name={'confirmPassword'}
              placeholder='Confirm password' value={inputData.confirmPassword} onChange={handleInputData} />
          </div>
          {/* display create account button and error data if any error occurs */}
          <button type="submit" className="btn-dark-blue w-full" onClick={handleLogin}>
            Create Account
          </button>
          {
            errorData ?
              <div className="flex items-center mt-1">
                <AiFillWarning className="text-red-500" />
                <p className="ml-1 text-sm text-red-500">{errorData}</p>
              </div>
              : <div className="h-5"></div>
          }
          {/* display sign in link */}
          <p className='text-sm'>
            Already have an account?
            <Link to='/login' className="font-medium text-darker-blue hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterBox
