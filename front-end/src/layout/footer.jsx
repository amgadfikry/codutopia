import { FooterList, Link, FaLinkedinIn, FaGithub, FaXTwitter } from '../import.js';

function Footer() {
  const aboutusList = ["Our History", "Meet the Team", "Careers"];
  const servicesList = ["Courses", "Become Instructor", "Assesments"];
  const resourcesList = ["Terms of Service", "Privacy Policy", "Sitemap"];
  const HelpfulLinks = ["FAQs", "Support", "Live Chat"];

  return (
    <footer className="bg-darker-blue">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterList list={aboutusList} title={"About Us"} />
          <FooterList list={servicesList} title={"Our Services"} />
          <FooterList list={resourcesList} title={"Resources"} />
          <FooterList list={HelpfulLinks} title={"Helpful Links"} />
        </div>
        <div className="mt-16">
          <ul className="flex justify-center gap-6 sm:justify-end sm:pr-5">
            <a href="https://github.com/amgadfikry" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn className='text-white text-xl transition-all duration-300 hover:text-light-red' />
            </a>
            <a href="https://www.linkedin.com/in/amgadfikry/" target="_blank" rel="noopener noreferrer">
              <FaGithub className='text-white text-xl transition-all duration-300 hover:text-light-red' />
            </a>
            <a href="https://twitter.com/amgadfikrymoter" target="_blank" rel="noopener noreferrer">
              <FaXTwitter className='text-white text-xl transition-all duration-300 hover:text-light-red' />
            </a>
          </ul>
          <div className="mt-16 sm:flex sm:items-center sm:justify-between flex flex-col sm:flex-row">
            <Link to="/" className='text-xl cursor-pointer mr-auto whitespace-nowrap font-[700] text-white
            relative before:content-[""] before:absolute before:w-5 before:h-5 before:bg-light-red
            before:top-[-3px] before:left-[-5px] before:rounded-full mx-auto sm:mx-0
            after:content-[""] after:absolute after:w-5 after:h-5 after:bg-light-red after:bottom-[-3px]
            after:right-[-5px] after:rounded-full after:animate-ping before:animate-ping'>
              E-Learnig
            </Link>
            <div className="mt-4 text-center text-sm text-light-gray sm:mt-0 sm:text-right flex flex-col items-center">
              <p className="mb-2">
                Copyright &copy; {new Date().getFullYear()}. All rights reserved. by Amgad Fikry Mohamed<br></br>
              </p>
              <p><a href="https://www.freepik.com/free-vector/access-control-system-abstract-concept_12085707.htm#&position=0&from_view=author&uuid=2a1f8587-54e7-4185-9be8-804ca95d8131">
                Image by <span className='underline' >vectorjuice</span></a> on Freepik
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer