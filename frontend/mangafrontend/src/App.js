import React, { useState,useEffect } from 'react';
import './App.css';

import {BrowserRouter,Routes,Route} from 'react-router-dom';

import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import SearchResults from './pages/SearchResults';
import AdvancedSearch from './pages/AdvancedSearch';
import {jwtDecode} from 'jwt-decode';
import ProtectedRoute from './components/ProtectedRoute'
import MangaDetailsPage from './pages/MangaDetailsPage';
import RandomMangaDetailsPage from './pages/RandomMangaDetailsPage';
import UserMangas from './pages/UserMangas';
import Layout from './components/Layout';

function App() {
  const [isMenuOpen,setIsMenuOpen] = useState(false);
  const [user,setUser] = useState(null);
  const [isModalOpen,setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setUser(decodedToken);
                } catch (e) {
                    console.error("Invalid token");
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
  },[]);

  const handleMenuToggle = (isOpen) => {
       setIsMenuOpen(isOpen);
    }


  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <div className="vh-100 gradient-custom">
      <div className="container">
        <BrowserRouter>
           <Routes>
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
               <Route path ="/*" element = {
                    <Layout  onMenuToggle = {handleMenuToggle} user = {user}  setIsModalOpen = {toggleModal} logout={logout}  isMenuOpen = {isMenuOpen}>
                        <Routes>
                             <Route path="/" element={<LandingPage />} />
                             <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
                              <Route path="/advanced-search" element={<ProtectedRoute><AdvancedSearch /></ProtectedRoute>} />
                            <Route path="/random-manga" element={<ProtectedRoute><RandomMangaDetailsPage /></ProtectedRoute>} />
                           <Route path="/user-history" element={<ProtectedRoute><UserMangas url={`user_history`} title="User history: "/></ProtectedRoute>} />
                         <Route path="/user-favourites" element={<ProtectedRoute><UserMangas url={`user_favourites`} title="User favourites: "/></ProtectedRoute>} />
                            <Route path="/recent-manga" element={<ProtectedRoute><UserMangas url={`recent_manga`} title="Recent mangas: "/></ProtectedRoute>} />
                         <Route path="/mangas/:mangaId" element={<ProtectedRoute><MangaDetailsPage /></ProtectedRoute>} />
                     </Routes>
                   </Layout>
                  }
                />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
