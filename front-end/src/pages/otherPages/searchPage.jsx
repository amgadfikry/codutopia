/* eslint-disable no-unused-vars */
// import required hooks, components and images
import {
  CourseBox, Loading, useEffect, useState,
  useSelector, userAuth, useNavigate, useParams, SkillComponent, FaPython,
  FaGolang, BiLogoJavascript, SiCsharp, SiCplusplus, SiRuby, SiTypescript, FaJava,
  FaFolderTree, url, axios
} from '../../import';

function SearchPage() {
  // skills array
  const skills = [
    { lang: 'Python', Icon: FaPython },
    { lang: 'Golang', Icon: FaGolang },
    { lang: 'JavaScript', Icon: BiLogoJavascript },
    { lang: 'C#', Icon: SiCsharp },
    { lang: 'C++', Icon: SiCplusplus },
    { lang: 'Ruby', Icon: SiRuby },
    { lang: 'TypeScript', Icon: SiTypescript },
    { lang: 'Java', Icon: FaJava },
    { lang: 'All', Icon: FaFolderTree }
  ];
  // get search parameter from url
  const { search } = useParams();
  // get user authentication status
  const auth = useSelector(userAuth);
  // useNavigate hook
  const navigate = useNavigate();
  // state to see search result
  const [searchResult, setSearchResult] = useState([]);
  // state to see loading status
  const [loading, setLoading] = useState(false);

  // use effect to get search result from server
  useEffect(() => {
    // set loading to true
    setLoading(true);
    // if search is All, get all courses
    // set search result and loading to false
    // if error set search result to empty array and loading to false
    if (search === 'All') {
      axios.get(`${url}/courses/all`)
        .then((res) => {
          setSearchResult(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          setSearchResult([]);
          setLoading(false);
        });
    } else {
      // else get courses by category
      axios.get(`${url}/courses/category/${search}`)
        .then((res) => {
          setSearchResult(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          setSearchResult([]);
          setLoading(false);
        });
    }
  }, [auth, navigate, search]);

  return (
    <div className='container mx-auto pt-24 pb-16 px-1 min-h-screen relative'>
      <div className="flex flex-wrap justify-center items-center pb-3 mb-8 border-b border-darker-gray">
        {skills.map((skill, index) => (
          <SkillComponent key={index} Icon={skill.Icon} lang={skill.lang} />
        ))}
      </div>
      <h2 className="text-2xl text-center text-darker-blue font-bold mx-auto
          border-b-4 border-light-red w-fit pb-2 mb-10">{search.toUpperCase()} COURSES</h2>
      <div className='' >
        {loading && <Loading />}
        {!loading && searchResult.length === 0 &&
          <p className='flex justify-center 
            text-2xl font-semibold text-darker-gray'>No result found</p>}
        {!loading && searchResult.length > 0 &&
          <div className='flex flex-wrap justify-center items-center md:justify-start flex-row'>
            {searchResult.map((result) => (
              <CourseBox className='drop-shadow-lg' course={result} key={result._id} id={result._id} />
            ))}
          </div>
        }
      </div>
    </div>
  )
}

export default SearchPage
