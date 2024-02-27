/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavBar, useState, Sidebar, useEffect, useSelector, userAuth, useNavigate, Footer, Routes, Route,
  CreateNew, InstructorDashboard
} from "../../import"

function InstructorPage() {
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
      <Routes>
        <Route path="/" element={<InstructorDashboard />} />
        <Route path="/createNew" element={<CreateNew />}></Route>
      </Routes>
      <Footer />
    </>
  )
}

export default InstructorPage