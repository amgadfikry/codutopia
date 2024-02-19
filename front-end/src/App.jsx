import Cookies from 'js-cookie';
import axios from 'axios';

function App() {

  const url = import.meta.env.VITE_MAIN_SERVER;
  const user = {
    userName: 'test',
    password: '1234',
    fullName: 'test1',
    email: 'test6l46@yahoo',
    role: 'User',
    phoneNumber: '123456789'
  }
  const updatedUser = {
    password: 'sasda',
    fullName: 'amgad fikry',
    phoneNumber: '55555',
    otherData: "otherData"
  }

  const registerUser = () => {
    axios.post(url + '/users/register', user, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log('error', error);
      })
  }

  const addUserData = () => {
    axios.post(url + '/users/login', user, {
      headers: {
        'Content-Type': 'application/json',
      }

    })
      .then(response => {
        Cookies.set('authToken', response.headers.authorization, { expires: 3 });
        console.log(response.data);
      })
      .catch(error => {
        console.log('error', error);
      })
  }

  const handleData = () => {
    axios.put(url + '/users/update', updatedUser, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Cookies.get('authToken'),
      }
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log('error', error);
      })
  };

  const handleOtherData = () => {
    axios.get(url + '/users/details', {
      headers: {
        'Authorization': Cookies.get('authToken'),
      }
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log('error', error);
      })
  }


  return (
    <>
      <h1 className="font-bold text-center text-3xl underline text-violet-500">Frontend</h1>
      <div className="flex justify-center items-center p-8">
        <button className="bg-red-400 border px-6 py-2 border-gray-400 rounded-lg" onClick={registerUser}>
          register
        </button>
        <button className="bg-red-400 border px-6 py-2 border-gray-400 rounded-lg" onClick={addUserData}>
          add user
        </button>
        <button className="bg-red-400 border px-6 py-2 border-gray-400 rounded-lg" onClick={handleData}>
          update user
        </button>
        <button className="bg-red-400 border px-6 py-2 border-gray-400 rounded-lg" onClick={handleOtherData}>
          get user
        </button>
      </div>
    </>
  )
}

export default App
