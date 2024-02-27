import {
  InputField, Logo, useState, MdEmail, RiLockPasswordFill, Link, axios, Cookies, useNavigate,
  checkDataError, url, SelectField, AiFillWarning
} from '../import.js';

function LoginBox() {
  const [inputData, setInputData] = useState({ email: '', password: '', remember: false, role: 'learner' });
  const [errorData, setErrorData] = useState("");
  const navigate = useNavigate();

  const handleInputData = (e) => {
    if (e.target.name === 'remember') {
      return setInputData({ ...inputData, [e.target.name]: !inputData.remember });
    }
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  }

  const handleLogin = (e) => {
    setErrorData("");
    e.preventDefault();
    const errorDic = checkDataError(inputData, ['remember']);
    setErrorData(errorDic);
    if (errorDic) return;
    axios.post(`${url}/users/login`, inputData)
      .then((res) => {
        if (inputData.remember) {
          Cookies.set('authToken', res.headers['authorization'], { expires: 3 });
        } else {
          Cookies.set('authToken', res.headers['authorization']);
        }
        navigate(`/${inputData.role}`);
      })
      .catch((err) => {
        if (err.response.status === 500) {
          navigate('/server-down');
        }
        setErrorData(err.response.data.msg);
      });
  }

  return (
    <div className="w-full bg-opacity-90 bg-light-gray rounded-xl drop-shadow-lg  md:mt-0 sm:max-w-md xl:p-0 text-darker-blue" >
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <div className='text-center' ><Logo /></div>
        <h1 className="text-xl font-bold leading-tight tracking-tight  md:text-2xl text-center">
          Sign in to your account
        </h1>
        <form className="space-y-2 md:space-y-2" action="#">
          <div>
            <InputField type='email' Icon={MdEmail} label='Email address' name={'email'}
              placeholder='Your email address' value={inputData.email} onChange={handleInputData} />
          </div>
          <div>
            <InputField type='password' Icon={RiLockPasswordFill} label='Password' name={'password'}
              placeholder='Your password' value={inputData.password} onChange={handleInputData} />
          </div>
          <div>
            <SelectField name='role' label='Role' value={inputData.role} onChange={handleInputData}
              options={['learner', 'instructor']} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="remember" aria-describedby="remember" type="checkbox" name='remember' onChange={handleInputData}
                  className="w-4 h-4 border border-gray-300 rounded">
                </input>
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="remember" className="text-gray-500">Remember me</label>
              </div>
            </div>
            <a href="#" className="text-sm font-medium text-primary-600 hover:underline">Forgot password?</a>
          </div>
          <button type="submit" className="btn-dark-blue w-full" onClick={handleLogin}>
            Sign In
          </button>
          {
            errorData ?
              <div className="flex items-center mt-1">
                <AiFillWarning className="text-red-500" />
                <p className="ml-1 text-sm text-red-500">{errorData}</p>
              </div>
              : <div className="h-5"></div>
          }
          <p className='text-sm'>
            Don’t have an account yet?
            <Link to='/register' className="font-medium text-darker-blue hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginBox