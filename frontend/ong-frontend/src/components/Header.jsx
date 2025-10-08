import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Phone, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageCircleCodeIcon } from 'lucide-react';
import { MessageCircleHeartIcon } from 'lucide-react';
import { MessageCircleIcon } from 'lucide-react';
import { SettingsContext } from '../lib/settingsContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useContext(SettingsContext);

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Adoção', href: '/adocao' },
    { name: 'Voluntariado', href: '/voluntariado' },
    { name: 'Castração Social', href: '/castracao-social' },
    { name: 'Prestação de Contas', href: '/prestacao-contas' },
    { name: 'Blog', href: '/blog' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-max">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {settings?.logo ? (
              <img 
                src={settings.logo} 
                alt={settings.siteName} 
                className="h-20 w-auto object-contain" 
              />
            ) : (
              <div className="h-20 w-32 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-sm">Logo</span>
              </div>
            )}
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-md font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Botões de Ação */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline" size="lg">
              <Link to="/contato">
                <MessageCircleIcon className="w-4 h-4" />
                Contato
              </Link>
            </Button>
            <Button asChild className="btn-accent">
              <Link to="/doacoes"> 
              <DollarSign className="w-5 h-5" />
              Doar Agora</Link>
            </Button>
          </div>

          {/* Menu Mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu Mobile Expandido */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t">
                <Button asChild variant="outline" size="sm">
                  <Link to="/contato" onClick={() => setIsMenuOpen(false)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contato
                  </Link>
                </Button>
                <Button asChild className="btn-accent">
                  <Link to="/doacoes" onClick={() => setIsMenuOpen(false)}>
                    Doar Agora
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
