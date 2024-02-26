/* eslint-disable react/prop-types */
import {
  useDispatch, setAuth, axios, optionsWithCookies, setUserData, useEffect, Loading,
  useState, useNavigate, url, Cookies
} from '../import';

function AuthUser({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    optionsWithCookies.headers['Authorization'] = Cookies.get('authToken');
    axios.get(`${url}/users/brief`, optionsWithCookies)
      .then(res => {
        if (res.status === 200) {
          dispatch(setAuth(res.data.data.role));
          dispatch(setUserData(res.data.data));
          setLoading(false);
          if (res.data.data.role === 'learner') {
            navigate('/learner');
          } else if (res.data.data.role === 'instructor') {
            navigate('/instructor');
          }
        }
      })
      .catch(err => {
        if (err.response.status === 401) {
          setLoading(false);
          dispatch(setAuth('public'));
          dispatch(setUserData({}));
          if (['instructor', 'learner'].includes(window.location.pathname.split('/')[1])) {
            navigate('/');
          }
        } else {
          setLoading(false);
          navigate('/server-down');
        }
      });
  }, [dispatch, navigate]);

  if (loading) {
    return <Loading />
  } else {
    return children;
  }
}

export default AuthUser