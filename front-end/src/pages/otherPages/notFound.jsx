// not found page component
// import required hooks, components and images
import { Link, LazyLoadImage, error404 } from '../../import';

// notFound component
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center container mx-auto pt-24 pb-16 px-3">
      <LazyLoadImage src={error404} placeholderSrc={error404} alt="Error 404" className="w-[500px]" />
      <Link to="/" className=" md:text-lg btn-light-blue mt-2">Go back to home</Link>
    </div>
  );

}

export default NotFound;
