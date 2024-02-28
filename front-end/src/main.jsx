// import React and ReactDOM
import React from 'react'
import ReactDOM from 'react-dom/client'
// import App component and index.css
import App from './App.jsx'
import './index.css'
// import Provider, store and Router from redux and react-router-dom
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { Router } from './import.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App className="scroll-smooth" />
      </Router>
    </Provider>
  </React.StrictMode>,
)
