/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavBar, useState, Sidebar, useEffect, useSelector, userAuth, useNavigate, Footer, Routes, Route,
  CreateNew, InstructorDashboard, Support, NotFound
} from "../../import"

function InstructorPage() {
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const auth = useSelector(userAuth);
  const navigate = useNavigate();

  useEffect(() => {
    auth !== 'public' ? navigate(`/${auth}`) : navigate('/login');
  }, []);

  return (
    <>
      <NavBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <Sidebar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <Routes>
        <Route path="/" element={<InstructorDashboard />} />
        <Route path="/createNew" element={<CreateNew />}></Route>
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}

export default InstructorPage