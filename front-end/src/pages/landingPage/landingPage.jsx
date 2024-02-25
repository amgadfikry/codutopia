/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavBar, useState, Sidebar, useEffect, useSelector, userAuth, useNavigate, Footer, LoginBox
} from "../../import"

function LandingPage() {
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const auth = useSelector(userAuth);
  const navigate = useNavigate();

  useEffect(() => {
    auth !== 'public' && navigate('/dashboard');
  }, []);

  return (
    <>
      <NavBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <Sidebar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />
      <div className="mt-20">LandingPage</div>
      <LoginBox />
      <Footer />
    </>
  )
}

export default LandingPage