import {
  SkillComponent, FaPython, FaGolang,
  BiLogoJavascript, SiCsharp, SiCplusplus, SiRuby, SiTypescript,
} from '../../import.js';

function LearningSection() {
  const skills = [
    { lang: 'Python', Icon: FaPython },
    { lang: 'Golang', Icon: FaGolang },
    { lang: 'JavaScript', Icon: BiLogoJavascript },
    { lang: 'C#', Icon: SiCsharp },
    { lang: 'C++', Icon: SiCplusplus },
    { lang: 'Ruby', Icon: SiRuby },
    { lang: 'TypeScript', Icon: SiTypescript },
  ];

  return (
    <section className="bg-dark-gray py-16">
      <div className="container mx-auto px-3 ">
        <h3 className="text-3xl text-darker-blue font-bold lg:text-5xl border-b-4 border-light-red w-fit
        pb-2 mb-10">
          Learn a new skill today
        </h3>
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