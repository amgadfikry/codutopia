// import required hooks, components and images
import { Link, LazyLoadImage, serverImage } from '../../import';

// ServerDown component to display server down page
function ServerDown() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-16 px-3 container mx-auto ">
      <LazyLoadImage src={serverImage} placeholderSrc={serverImage} alt="server down" className="w-[500px]" />
      <Link to="/" className=" md:text-lg btn-light-blue mt-2">Go back to home</Link>
    </div>
  )
}

export default ServerDown;
