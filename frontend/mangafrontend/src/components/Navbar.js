import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import SearchBar from "./SearchBar";
import '../Navbar.css';

const Navbar = ({user,onMenuToggle,setIsModalOpen,logout}) => {
    const [isMenuOpen,setIsMenuOpen] = useState(false);
    const [isModalOpenState,setIsModalOpenState] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        onMenuToggle(!isMenuOpen);
    };

  const toggleModal = () => {
      setIsModalOpenState(!isModalOpenState);
        setIsModalOpen(!isModalOpenState);
    }

    const handleSearch = (term) => {
        navigate(`/search?search=${term}`);
    }

    const handleLogout = () => {
        logout();
        setIsModalOpenState(false)
        navigate("/login");
};

const handleLogin = () => {
       setIsModalOpenState(false)
     navigate("/login");
    }

const handleRegister = () => {
      setIsModalOpenState(false)
       navigate("/register");
   }
   
   console.log("Navbar user prop:", user);

  return (
    <nav className="navbar navbar-light bg-light">
        <div className="container d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <Link to="/" className="navbar-brand">Manga App</Link>
            </div>
            <div className="d-flex align-items-center">
                <SearchBar onSearch={handleSearch} />
              {user ? (
                <div className='d-flex align-items-center'>
                     <button className="user-button" onClick={toggleModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                             <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                         </svg>
                     </button>
                    {isModalOpenState && (
                    <div className="user-modal">
                        <div className="user-modal-header">
                             <p>Welcome, {user.sub}!</p>
                        </div>
                        <div className="user-modal-body">
                              <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                <>
                      <button className="user-button" onClick={toggleModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                        </svg>
                     </button>
                      {isModalOpenState &&(
                          <div className="user-modal">
                            <div className="user-modal-header">
                                <p>Guest</p>
                            </div>
                            <div className="user-modal-body">
                               <div className="d-flex flex-column">
                                <button onClick={handleLogin} className="btn btn-primary btn-sm" >Login</button>
                                <button onClick = {handleRegister} className="btn btn-secondary btn-sm mt-1">Register</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
             )}

            </div>
        </div>

        {isMenuOpen && (
            <div className="side-menu">
                <div className="side-menu-header">
                    <h5 className="side-menu-title">Manga App</h5>
                    <button className="close-menu-button" onClick={toggleMenu}>X</button>
                </div>
                <ul className="side-menu-list">
                    <li className="side-menu-item">
                        <strong>Follows</strong>
                        <ul className="sub-menu">
                            <li>
                                <Link to="/" onClick={toggleMenu}>Updates (WIP)</Link>
                            </li>
                            <li>
                                <Link to="/" onClick={toggleMenu}>Library (WIP)</Link>
                            </li>
                            <li>
                                <Link to="/user-history" onClick={toggleMenu}>Reading history</Link>
                            </li>
                            <li>
                                <Link to="/user-favourites" onClick={toggleMenu}>Favourites</Link>
                            </li>
                        </ul>
                    </li>
                    <li className="side-menu-item">
                        <strong>Titles</strong>
                        <ul className="sub-menu">
                            <li>
                                <Link to="/advanced-search" onClick={toggleMenu}>Advanced search</Link>
                            </li>
                            <li>
                                <Link to="/recent-manga" onClick={toggleMenu}>Recently added</Link>
                            </li>
                            <li>
                                <Link to="/random-manga" onClick={toggleMenu}>Random</Link>
                            </li>
                            <li>
                                <Link to="/" onClick={toggleMenu}>Recommended (WIP)</Link>
                            </li>
                        </ul>
                    </li>
                    <li className="side-menu-item">
                        <strong>Community</strong>
                        <ul className="sub-menu">
                            <li>
                                <Link to="/" onClick={toggleMenu}>Users (WIP)</Link>
                            </li>
                            <li>
                                <Link to="/" onClick={toggleMenu}>Groups (WIP)</Link>
                            </li>
                        </ul>
                    </li>
                    <li className="side-menu-item">
                        <strong>Website</strong>
                        <ul className="sub-menu">
                            <li>
                                <Link to="/" onClick={toggleMenu}>Rules (WIP)</Link>
                            </li>
                            <li>
                                <Link to="/" onClick={toggleMenu}>About us (WIP)</Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        )}
    </nav>
);
}


export default Navbar;