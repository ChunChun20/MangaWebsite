import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children,onMenuToggle,user,setIsModalOpen,logout,isMenuOpen}) => {
    return (
        <div style={{ position: 'relative', left: isMenuOpen ? '100px' : '0', transition: 'left 0.3s ease' }}>
            <Navbar onMenuToggle={onMenuToggle} user={user} setIsModalOpen={setIsModalOpen} logout={logout} />
             {children}
        </div>
    );
};

export default Layout;