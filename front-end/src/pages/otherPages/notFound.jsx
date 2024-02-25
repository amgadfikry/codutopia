// not found page component
import { Link, LazyLoadImage, error404 } from '../../import';

function NotFound() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-h-screen p-2">
      <LazyLoadImage src={error404} placeholderSrc={error404} alt="Error 404" className="w-[500px]" />
      <Link to="/" className=" md:text-lg btn-light-blue mt-2">Go back to home</Link>
    </div>
  );

}

export default NotFound;