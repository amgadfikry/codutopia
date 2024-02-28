// import required hooks, components and images
import {
  liveImage, resourceImage, responsiveImage, assesmentImage
} from '../../../import';
import ServiceComponent from './serviceComponent.jsx';

function ServicesSections() {
  // Services data
  const services = [
    {
      image: liveImage,
      title: 'Live Sessions',
      description: 'We provide live sessions to help you understand the concept better and ask questions in real time.',
      sequence: false
    },
    {
      image: resourceImage,
      title: 'Full documented resources',
      description: 'We provide resources to help you understand the concept better and get all the information you need.',
      sequence: true
    },
    {
      image: responsiveImage,
      title: 'Available on all devices',
      description: 'We provide responsive design to help continue your learning on any device of your choice.',
      sequence: false
    },
    {
      image: assesmentImage,
      title: 'Real time assesment',
      description: 'We provide assesment to help you grasp the concept better and know where you stand.',
      sequence: true
    }
  ]

  return (
    <section className="py-16">
      <h1 className="text-2xl text-center text-darker-blue font-bold lg:text-3xl
      border-b-4 border-light-red w-fit pb-2 mb-10 mx-auto">Our Services</h1>
      <div className="container mx-auto mt-10">
        {services.map((service, index) => (
          <ServiceComponent
            key={index}
            image={service.image}
            title={service.title}
            description={service.description}
            sequence={service.sequence}
          />
        ))}
      </div>
    </section>
  )
}

export default ServicesSections
