import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import style from "./Header.module.css";
import {
  Film, 
  Home, 
  Search, 
  User, 
  LogOut,
  Menu, 
  X
} from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Discover', href: '/discover', icon: Search },
    { name: 'My Lists', href: '/lists', icon: Film },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-background-secondary border-b border-border-color sticky top-0 z-50 backdrop-blur-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Film className="h-8 w-8 text-primary-color" />
            <span className="text-2xl font-bold text-gradient">Trackd</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-primary-color shadow-lg'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={` ${style.userMenu} flex items-center space-x-3 p-2 rounded-lg `}
                >
                    <User className="text-white" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className={`${style.userDropdown} absolute right-0 mt-2 bg-background-secondary rounded-lg shadow-xl border border-border-color`}>
                    <Link
                      to="/profile"
                      className={style.item}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>

                    <hr className={style.line}/>
                    <button
                      onClick={handleSignOut}
                      className={style.item}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="btn btn-secondary text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-text-primary" />
              ) : (
                <Menu className="h-5 w-5 text-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border-color py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-primary-color shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
