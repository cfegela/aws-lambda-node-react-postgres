import React, { useState } from 'react';
import Login from './components/Login';
import Items from './components/Items';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (idToken) => {
    setToken(idToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="App">
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Items token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
