/* eslint-disable react-hooks/exhaustive-deps */
// import required hooks, components and icons
import {
  useState, useEffect, Loading
} from "../../import"
import MainSection from "./components/mainSection.jsx";
import LearningSection from "./components/learningSection.jsx";
import InstructorSection from "./components/instructorSection.jsx";
import WhatisSection from "./components/whatisSection.jsx";
import ServicesSections from "./components/servicesSections.jsx";
import SupportSection from "./components/supportSection.jsx";

// HomePage component to display home page with all sections
function HomePage() {
  // state loading to handle loading state
  const [loading, setLoading] = useState(true);

  // useEffect to set loading to false after 1 second
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <Loading />
  return (
    <>
      <MainSection />
      <LearningSection />
      <InstructorSection />
      <WhatisSection />
      <ServicesSections />
      <SupportSection />
    </>
  )
}

export default HomePage
