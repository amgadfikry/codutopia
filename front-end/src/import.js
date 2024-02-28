// fetch data import
const url = import.meta.env.VITE_MAIN_SERVER
import Cookies from 'js-cookie';
import axios from 'axios';
const optionsWithCookies = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': ''
  }
}
// import components
import Loading from './components/loading.jsx';
import InputField from './components/inputField.jsx';
import TextAreaField from './components/textareaField.jsx';
import SelectField from './components/selectField.jsx';
import SearchField from './components/searchField.jsx';
import SidebarLink from './components/sidebarLink.jsx';
import SidebarLogout from './components/sidebarLogout.jsx';
import AuthUser from './components/authUser.jsx';
import FooterList from './components/footerList.jsx';
import Logo from './components/logo.jsx';
import CourseBox from './components/courseBox.jsx';
// import layouts
import NavBar from './layout/navbar.jsx';
import Sidebar from './layout/sidebar.jsx';
import Footer from './layout/footer.jsx';
import LoginBox from './layout/loginBox.jsx';
import RegisterBox from './layout/registerBox.jsx';
import Login from './pages/otherPages/login.jsx';
// import other Pages
import NotFound from './pages/otherPages/notFound.jsx';
import ServerDown from './pages/otherPages/serverDown.jsx';
import Register from './pages/otherPages/register.jsx';
import Support from './pages/otherPages/support.jsx';
import SearchPage from './pages/otherPages/searchPage.jsx';
// import landing page
import LandingPage from './pages/landingPage/landingPage.jsx';
import MainSection from './pages/landingPage/mainSection.jsx';
import LearningSection from './pages/landingPage/learningSection.jsx';
import SkillComponent from './pages/landingPage/skillComponent.jsx';
import InstructorSection from './pages/landingPage/instructorSection.jsx';
import WhatisSection from './pages/landingPage/whatisSection.jsx';
import ServiceComponent from './pages/landingPage/serviceComponent.jsx';
import ServicesSections from './pages/landingPage/servicesSections.jsx';
import SupportSection from './pages/landingPage/supportSection.jsx';
// import instructor page
import InstructorPage from './pages/instructorPage/instructorPage.jsx';
import InstructorDashboard from './pages/instructorPage/instructorDashboard.jsx';
import CreateNew from './pages/instructorPage/createNew.jsx';
import CreateDescription from './pages/instructorPage/createNew/createDescription.jsx';
import AddVideoField from './pages/instructorPage/createNew/addVideoField.jsx';
import AddResourceField from './pages/instructorPage/createNew/addResourceField.jsx';
// import learner page
import LearnerPage from './pages/learnerPage/learnerPage.jsx';
// import redux
import { useSelector, useDispatch } from 'react-redux';
import { setUserData, userData, setAuth, userAuth } from './redux/user';
// router-dom
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Link, useLocation, useParams } from 'react-router-dom';
// import cookies
import { useCookies, CookiesProvider } from 'react-cookie';
// react hooks
import { useEffect, useState, useRef } from 'react'
//import immer
import { produce } from 'immer';
// import lazy loading
import { LazyLoadImage } from 'react-lazy-load-image-component';
// import functions
import { samilarData, checkDataError, checkPassword } from './functions.js';
// import icons
import { AiFillWarning, AiOutlineClose } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import {
  MdDarkMode, MdLightMode, MdOutlineSupportAgent, MdEmail, MdDriveFileRenameOutline, MdTopic,
  MdSubtitles
} from 'react-icons/md';
import { TbMenu2, TbMenuDeep, TbCategoryFilled, TbReportMoney, TbBrandGoogleHome } from 'react-icons/tb';
import { IoMdNotifications } from 'react-icons/io';
import { IoCreate, IoSettingsSharp, IoLogOut } from "react-icons/io5";
import { BsFillPersonFill } from 'react-icons/bs';
import { FcAbout } from "react-icons/fc";
import { RiFileInfoFill, RiLockPasswordFill } from "react-icons/ri";
import {
  FaFolderTree, FaLinkedinIn, FaGithub, FaXTwitter, FaUser, FaPython, FaJava, FaGolang,
  FaVideo, FaFile
} from "react-icons/fa6";
import { BiLogoJavascript } from "react-icons/bi";
import { SiCsharp, SiCplusplus, SiRuby, SiTypescript } from "react-icons/si";
// import images
import serverImage from './assets/fixServer.jpg';
import error404 from './assets/error404.jpg';
import registerImage from './assets/register.jpg';
import loginImage from './assets/login.jpg';
import supportImage from './assets/support.jpg';
import mainImage from './assets/main.jpg';
import instructorImage from './assets/instructor.jpg';
import assesmentImage from './assets/assesment.jpg';
import liveImage from './assets/live.jpg';
import resourceImage from './assets/resource.jpg';
import responsiveImage from './assets/responsive.jpg';

// export
export {
  // export axios
  axios, Cookies, url, optionsWithCookies,
  // export components
  Loading, InputField, TextAreaField, SelectField, SearchField, SidebarLink, SidebarLogout, AuthUser,
  FooterList, LoginBox, CourseBox,
  // export layout
  NavBar, Sidebar, Footer, Logo, RegisterBox,
  // export other Pages
  NotFound, ServerDown, Register, Login, Support, SearchPage,
  // export landing page
  LandingPage, MainSection, LearningSection, SkillComponent, InstructorSection, WhatisSection,
  ServiceComponent, ServicesSections, SupportSection,
  // export instructor page
  InstructorPage, CreateNew, InstructorDashboard, CreateDescription, AddVideoField, AddResourceField,
  // export learner page
  LearnerPage,
  // export redux
  useSelector, useDispatch, setUserData, userData, setAuth, userAuth,
  // export router-dom
  Router, Routes, Route, useNavigate, NavLink, Link, useLocation, useParams,
  // export cookies
  useCookies, CookiesProvider,
  // export immer
  produce,
  // export react hooks
  useEffect, useState, useRef,
  // export lazy loading
  LazyLoadImage,
  // export functions
  samilarData, checkDataError, checkPassword,
  // export icons
  AiFillWarning, AiOutlineClose,
  FiSearch,
  MdDarkMode, MdLightMode, MdOutlineSupportAgent, MdEmail, MdDriveFileRenameOutline, MdTopic, MdSubtitles,
  TbMenu2, TbMenuDeep, TbCategoryFilled, TbReportMoney, TbBrandGoogleHome,
  IoMdNotifications, IoCreate, IoSettingsSharp, IoLogOut,
  BsFillPersonFill,
  FcAbout,
  RiFileInfoFill, RiLockPasswordFill,
  FaFolderTree, FaLinkedinIn, FaGithub, FaXTwitter, FaUser, FaPython, FaJava, FaGolang, FaVideo, FaFile,
  BiLogoJavascript,
  SiCsharp, SiCplusplus, SiRuby, SiTypescript,
  // export images
  serverImage, error404, registerImage, loginImage, supportImage, mainImage, instructorImage,
  assesmentImage, liveImage, resourceImage, responsiveImage,
};