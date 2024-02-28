/* eslint-disable react/prop-types */
// import required hooks, components and images
import { LazyLoadImage } from '../../../import';

// ServiceComponent component to display service component of services section using props
function ServiceComponent({ image, title, description, sequence }) {
  return (
    <div className="container mx-auto flex lg:items-center lg:flex-row flex-col">
      <div className={`lg:w-1/2 ${sequence && 'lg:order-2'}`}>
        <LazyLoadImage
          src={image}
          alt="server"
          placeholderSrc={image}
          className="w-full" />
      </div>
      <div className="lg:w-1/2 text-center lg:text-left px-3 mt-[-30px] lg:mt-0">
        <h1 className="text-xl text-darker-blue font-bold lg:text-2xl">{title}</h1>
        <p className="mt-4 text-dark-blue font-light">
          {description}
        </p>
      </div>
    </div>
  )
}

export default ServiceComponent