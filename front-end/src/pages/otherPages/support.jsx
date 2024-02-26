/* eslint-disable no-unused-vars */
import {
  LazyLoadImage, supportImage, useState, InputField, MdEmail, AiFillWarning, MdTopic,
  TextAreaField, NavBar, Sidebar, Footer
} from '../../import';

function Support() {
  const [inputData, setInputData] = useState({ email: '', subject: '', message: '' });
  const [errorData, setErrorData] = useState("");
  const [toggleSidebar, setToggleSidebar] = useState(true);

  const handleInputData = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  }

  const handleSend = (e) => {
    e.preventDefault();
  }

  return (
    <>
      <NavBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <Sidebar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <section className="mt-14">
        <div className="p-4 flex items-center relative min-h-screen justify-center  ">
          <div className='lg:w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full
      lg:relative lg:top-0 lg:left-0 lg:translate-x-0 lg:translate-y-0'>
            <LazyLoadImage
              alt="server down"
              src={supportImage}
              placeholderSrc={supportImage}
              className=""
            />
          </div>
          <div className='lg:w-1/2 flex justify-center items-center flex-1'>
            <div className="w-full bg-opacity-90 bg-light-gray rounded-xl drop-shadow-lg  md:mt-0 sm:max-w-lg xl:p-0 text-darker-blue" >
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight  md:text-2xl text-center">
                  Contact Us
                </h1>
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
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Support