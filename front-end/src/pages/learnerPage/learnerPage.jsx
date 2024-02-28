/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavBar, useState, Sidebar, useEffect, useSelector, userAuth, useNavigate, Footer, Routes, Route,
  Support, NotFound
} from "../../import"

function LearnerPage() {
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
        <Route path="/" element='' />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}

export default LearnerPage