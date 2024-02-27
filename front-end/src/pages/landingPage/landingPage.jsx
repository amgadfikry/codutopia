/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavBar, useState, Sidebar, useEffect, useSelector, userAuth, useNavigate, Footer,
  MainSection, LearningSection, InstructorSection, WhatisSection, ServicesSections,
  SupportSection, Loading
} from "../../import"

function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const auth = useSelector(userAuth);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
    auth !== 'public' && navigate(`/${auth}`);
  }, []);

  if (loading) return <Loading />
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