/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavBar, useState, Sidebar, useEffect, useSelector, userAuth, useNavigate, Footer,
  MainSection, LearningSection, InstructorSection, WhatisSection, ServicesSections,
  SupportSection
} from "../../import"

function LandingPage() {
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const auth = useSelector(userAuth);
  const navigate = useNavigate();

  useEffect(() => {
    auth !== 'public' && navigate(`/${auth}`);
  }, []);

  return (
    <>
      <NavBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <Sidebar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <MainSection />
      <LearningSection />
      <InstructorSection />
      <WhatisSection />
      <ServicesSections />
      <SupportSection />
      <Footer />
    </>
  )
}

export default LandingPage