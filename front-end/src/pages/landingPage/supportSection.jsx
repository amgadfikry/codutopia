import { Link } from '../../import';

function SupportSection() {
  return (
    <section className="bg-dark-gray py-16">
      <div className="container mx-auto px-3 flex flex-col items-center justify-center">
        <h3 className="text-3xl text-darker-blue font-bold lg:text-5xl border-b-4 border-light-red w-fit
        pb-2 mb-10 mx-auto">
          Available 24/7 Support
        </h3>
        <p className="mt-4 text-dark-blue font-light text-center lg:font-normal">
          We are here to help you with any questions you have. Just send us a message and we will get back to you as soon as possible.
        </p>
        <Link to='/support' className='mt-6'>
          <button className="btn-dark-red mt-4 text-lg">
            Contact Support
          </button>
        </Link>
      </div>
    </section>
  )
}

export default SupportSection