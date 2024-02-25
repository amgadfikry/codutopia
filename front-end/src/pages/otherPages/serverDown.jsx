import { Link, LazyLoadImage, serverImage } from '../../import';

function ServerDown() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-h-screen p-2">
      <LazyLoadImage src={serverImage} placeholderSrc={serverImage} alt="server down" className="w-[500px]" />
      <Link to="/" className=" md:text-lg btn-light-blue mt-2">Go back to home</Link>
    </div>
  )
}

export default ServerDown