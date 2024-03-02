// import required hooks, components and icons
import {
  LazyLoadImage, mainImage, Link, useSelector, userAuth
} from '../../../import.js';

// MainSection component to display main section of home page
function MainSection() {
  // get userAuth from redux store
  const auth = useSelector(userAuth);

  return (
    <section className="pt-24 pb-10">
      <div className="container mx-auto flex lg:items-center lg:flex-row flex-col">
        {/* text part of section */}
        <div className="lg:w-1/2 mb-3 lg:mb-0 px-3">
          <h1 className="text-2xl text-darker-blue font-bold lg:text-3xl">The Best Way to Learn<br></br> Coding</h1>
          <p className="mt-4 text-dark-blue font-light">
            Codutopia will help you to learn coding with the best way.
            You will learn the key patterns necessary
            to solve almost any interview question and gain the systematic knowledge you need to prove
            your expertise. Be more confident as you learn to think like a software engineer.
          </p>
          <Link to={auth !== 'public' ? '/search/All' : '/register'}>
            <button className="btn-dark-red mt-4 text-lg">
              {auth !== 'public' ? 'Explore Courses' : 'Get Started For Free'}
            </button>
          </Link>
        </div>
        <div className="lg:w-1/2">
          <LazyLoadImage
            src={mainImage}
            alt="server"
            placeholderSrc={mainImage}
            className="w-full" />
        </div>
      </div>
    </section>
  )
}

export default MainSection
