import {
  CookiesProvider, Router, Routes, Route, NotFound, ServerDown, Register, AuthUser, LandingPage, Login,
  InstructorPage, SearchPage, LearnerPage
} from './import';

function App() {

  return (
    <>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <Router>
          <AuthUser />
          <Routes>
            <Route exact path='/' element={<LandingPage />}  ></Route>
            {/* <Route exact path='/learner' element={<AuthUser> <LandingPage /> </AuthUser>}  ></Route> */}
            <Route exact path='/instructor/*' element={<InstructorPage />}  ></Route>
            <Route exact path='/learner/*' element={<LearnerPage />}  ></Route>
            <Route exact path='/login' element={<AuthUser> <Login /> </AuthUser>}  ></Route>
            <Route exact path='/register' element={<AuthUser> <Register /> </AuthUser>}  ></Route>
            <Route path='/search/:search' element={<SearchPage />} ></Route>
            <Route path='/server-down' element={<ServerDown />} ></Route>
            <Route path='*' element={<NotFound />} ></Route>
          </Routes>
        </Router>
      </CookiesProvider>
    </>
  )
}

export default App
