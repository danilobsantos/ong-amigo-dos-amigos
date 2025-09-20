import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageCircleCodeIcon } from 'lucide-react';
import { MessageCircleHeartIcon } from 'lucide-react';
import { MessageCircleIcon } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Adoção', href: '/adocao' },
    { name: 'Doações', href: '/doacoes' },
    { name: 'Voluntariado', href: '/voluntariado' },
    { name: 'Blog', href: '/blog' },
    { name: 'Prestação de Contas', href: '/prestacao-contas' },
    { name: 'Contato', href: '/contato' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-max">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/logo.png" alt="ONG Amigo dos Amigos Logo" className="h-20 w-auto" />
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
                <MessageCircleIcon className="w-4 h-4 mr-2" />
                Whatsapp
              </Link>
            </Button>
            <Button asChild className="btn-accent">
              <Link to="/doacoes">Doar Agora</Link>
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
