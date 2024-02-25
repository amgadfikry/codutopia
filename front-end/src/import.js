// fetch data import
const url = import.meta.env.VITE_MAIN_SERVER
import Cookies from 'js-cookie';
import axios from 'axios';
const optionsWithCookies = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': Cookies.get('authToken')
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
import LoginBox from './components/loginBox.jsx';
import Logo from './components/logo.jsx';
// import layouts
import NavBar from './layout/navbar.jsx';
import Sidebar from './layout/sidebar.jsx';
import Footer from './layout/footer.jsx';
// import other Pages
import NotFound from './pages/otherPages/notFound.jsx';
import ServerDown from './pages/otherPages/serverDown.jsx';
// import landing page
import LandingPage from './pages/landingPage/landingPage.jsx';
// import redux
import { useSelector, useDispatch } from 'react-redux';
import { setUserData, userData, setAuth, userAuth } from './redux/user';
// router-dom
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
// import cookies
import { useCookies, CookiesProvider } from 'react-cookie';
// react hooks
import { useEffect, useState, useRef } from 'react'
// import lazy loading
import { LazyLoadImage } from 'react-lazy-load-image-component';
// import functions
import { samilarData, checkDataError } from './functions.js';
// import icons
import { AiFillWarning, AiOutlineClose } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { MdDarkMode, MdLightMode, MdOutlineSupportAgent, MdEmail } from 'react-icons/md';
import { TbMenu2, TbMenuDeep, TbCategoryFilled, TbReportMoney, TbBrandGoogleHome } from 'react-icons/tb';
import { IoMdNotifications } from 'react-icons/io';
import { IoCreate, IoSettingsSharp, IoLogOut } from "react-icons/io5";
import { BsFillPersonFill } from 'react-icons/bs';
import { FcAbout } from "react-icons/fc";
import { RiFileInfoFill, RiLockPasswordFill } from "react-icons/ri";
import { FaFolderTree, FaLinkedinIn, FaGithub, FaXTwitter } from "react-icons/fa6";

// import images
import serverImage from './assets/fixServer.jpg';
import error404 from './assets/error404.jpg';

// export
export {
  // export axios
  axios, Cookies, url, optionsWithCookies,
  // export components
  Loading, InputField, TextAreaField, SelectField, SearchField, SidebarLink, SidebarLogout, AuthUser,
  FooterList, LoginBox, Logo,
  // export layout
  NavBar, Sidebar, Footer,
  // export other Pages
  NotFound, ServerDown,
  // export landing page
  LandingPage,
  // export redux
  useSelector, useDispatch, setUserData, userData, setAuth, userAuth,
  // export router-dom
  Router, Routes, Route, useNavigate, NavLink, Link, useLocation,
  // export cookies
  useCookies, CookiesProvider,
  // export react hooks
  useEffect, useState, useRef,
  // export lazy loading
  LazyLoadImage,
  // export functions
  samilarData, checkDataError,
  // export icons
  AiFillWarning, AiOutlineClose,
  FiSearch,
  MdDarkMode, MdLightMode, MdOutlineSupportAgent, MdEmail,
  TbMenu2, TbMenuDeep, TbCategoryFilled, TbReportMoney, TbBrandGoogleHome,
  IoMdNotifications, IoCreate, IoSettingsSharp, IoLogOut,
  BsFillPersonFill,
  FcAbout,
  RiFileInfoFill, RiLockPasswordFill,
  FaFolderTree, FaLinkedinIn, FaGithub, FaXTwitter,
  // export images
  serverImage, error404
};