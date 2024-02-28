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
    axios.get(`${url}/users/details`, optionsWithCookies)
      .then(res => {
        dispatch(setUserData(res.data));
        dispatch(setAuth(res.data.data.role));
        setLoading(false);
        const user = window.location.pathname.split('/')[1];
        const path = window.location.pathname.split('/')[2];
        if (path && user === res.data.data.role) {
          return navigate(`/${res.data.data.role}/${path}`);
        }
        return navigate(`/${res.data.data.role}`);
      })
      .catch(err => {
        if (err.response.status === 401) {
          setLoading(false);
          dispatch(setAuth('public'));
          dispatch(setUserData({}));
          if (['instructor', 'learner'].includes(window.location.pathname.split('/')[1])) {
            return navigate('/');
          }
        } else {
          setLoading(false);
          return navigate('/server-down');
        }
      });
  }, [navigate, dispatch]);

  if (loading) {
    return <Loading />
  } else {
    return children;
  }
}

export default AuthUser