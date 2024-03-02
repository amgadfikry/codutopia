// import required hooks, components and icons
import {
  FaPython, FaGolang, BiLogoJavascript, SiCsharp, SiCplusplus, SiRuby, SiTypescript, FaJava, SkillComponent
} from '../../../import.js';

// LearningSection component to display learning section of home page with skills
function LearningSection() {
  // skills array with language and icon
  const skills = [
    { lang: 'Python', Icon: FaPython },
    { lang: 'Go', Icon: FaGolang },
    { lang: 'JavaScript', Icon: BiLogoJavascript },
    { lang: 'C#', Icon: SiCsharp },
    { lang: 'C++', Icon: SiCplusplus },
    { lang: 'Ruby', Icon: SiRuby },
    { lang: 'TypeScript', Icon: SiTypescript },
    { lang: 'Java', Icon: FaJava }
  ];

  return (
    <section className="bg-dark-gray py-16">
      <div className="container mx-auto px-3 ">
        <h3 className="text-2xl text-darker-blue font-bold lg:text-3xl border-b-4 border-light-red w-fit
        pb-2 mb-10">
          Learn a new skill today
        </h3>
        {/* skills part of section */}
        <div className="flex flex-wrap justify-center items-center">
          {skills.map((skill, index) => (
            <SkillComponent key={index} Icon={skill.Icon} lang={skill.lang} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LearningSection
