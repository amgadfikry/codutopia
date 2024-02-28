/* eslint-disable react/prop-types */
// footerList component to display footer list with title and list of links
function FooterList({ list, title }) {
  return (
    <div className="text-center sm:text-left user-select-none">
      <p className="text-lg font-medium text-white">{title}</p>
      <ul className="mt-8 space-y-4 text-sm">
        {list.map((item, index) => (
          <li key={index}>
            <a className="text-darker-gray transition hover:text-light-gray" href="#">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FooterList
