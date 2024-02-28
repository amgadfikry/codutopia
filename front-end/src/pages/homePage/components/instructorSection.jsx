// import required hooks, components and icons
import {
  Link, LazyLoadImage, instructorImage, useSelector, userAuth
} from '../../../import';

// InstructorSection component to display instructor section of home page
function InstructorSection() {
  // get user auth from redux store
  const auth = useSelector(userAuth);

  return (
    <section className="py-16">
      <div className="container mx-auto flex lg:items-center lg:flex-row flex-col">
        {/*image part of section*/}
        <div className="lg:w-1/2">
          <LazyLoadImage
            src={instructorImage}
            alt="server"
            placeholderSrc={instructorImage}
            className="w-full" />
        </div>
        <div className="lg:w-1/2 mb-3 lg:mb-0 px-3">
          {/*text part of section*/}
          <h1 className="text-2xl text-darker-blue font-bold lg:text-3xl">Learn From Best<br></br> Instructor</h1>
          <p className="mt-4 text-dark-blue font-light">
            Learn from the best instructor in the world. Our instructor will help you to learn coding with the best way.
            You will learn the key patterns necessary to solve almost any interview question and gain the
            systematic knowledge you need to prove your expertise.
            Be more confident as you learn to think like a software engineer.
          </p>
          <Link to={auth === 'instructor' ? '/myCourses' : '/register'}>
            <button className="btn-dark-red mt-4 text-lg">
              {auth === 'instructor' ? 'Your Dashboard' : 'Become an instructor'}
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default InstructorSection
