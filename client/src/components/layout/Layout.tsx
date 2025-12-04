import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { Outlet } from 'react-router-dom';
import MenuFooter from '../common/MenuFooter';


const Layout: React.FC = () => {
    return (
        <>
            <div className='w-full'>

                <Header />
                <main className="container mx-auto p-4 pb-24">
                    <Outlet />
                </main>
                <Footer />
                <MenuFooter />
            </div>
        </>
    );
};

export default Layout;
