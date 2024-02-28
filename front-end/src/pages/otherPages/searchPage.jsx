/* eslint-disable no-unused-vars */
import {
  NavBar, Footer, CourseBox, Loading, Sidebar, useEffect, useState,
  useSelector, userAuth, useNavigate, useParams, SkillComponent, FaPython,
  FaGolang, BiLogoJavascript, SiCsharp, SiCplusplus, SiRuby, SiTypescript, FaJava,
  FaFolderTree, url, axios
} from '../../import';

function SearchPage() {
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
  const { search } = useParams();
  const auth = useSelector(userAuth);
  const navigate = useNavigate();
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
    <>
      <NavBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <Sidebar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <div className='container mx-auto pt-24 pb-16 px-1 min-h-screen relative'>
        <div className="flex flex-wrap justify-center items-center mb-5">
          {skills.map((skill, index) => (
            <SkillComponent key={index} Icon={skill.Icon} lang={skill.lang} />
          ))}
        </div>
        <h2 className="text-3xl text-left text-darker-blue font-bold
      border-b-4 border-light-red w-fit pb-2 mb-10">{search.toUpperCase()} COURSES</h2>
        <div className='' >
          {loading && <Loading />}
          {!loading && searchResult.length === 0 &&
            <p className='flex justify-center 
            text-2xl font-semibold text-darker-gray'>No result found</p>}
          {!loading && searchResult.length > 0 &&
            <div className='flex flex-wrap justify-center items-center md:justify-start flex-row'>
              {searchResult.map((result) => (
                <CourseBox course={result} key={result._id} id={result._id} />
              ))}
            </div>
          }
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SearchPage