import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Phone, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageCircleCodeIcon } from 'lucide-react';
import { MessageCircleHeartIcon } from 'lucide-react';
import { MessageCircleIcon } from 'lucide-react';
import { SettingsContext } from '../lib/settingsContext';
import { normalizeImageUrl } from '@/lib/images';

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
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 border-b border-border/40">
      <div className="container-max">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
            {settings?.logo ? (
              <img 
                src={normalizeImageUrl(settings.logo) || '/images/logo.png'} 
                alt={settings.siteName} 
                className="h-16 md:h-20 w-auto object-contain drop-shadow-sm" 
              />
            ) : (
              <div className="h-16 w-16 md:h-20 md:w-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xs">Logo</span>
              </div>
            )}
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-[15px] font-semibold transition-all duration-300 relative py-2 ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />
                )}
              </Link>
            ))}
          </nav>

          {/* Botões de Ação */}
          <div className="hidden lg:flex items-center space-x-5">
            <Link 
              to="/contato" 
              className="group flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-primary transition-colors"
            >
              <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <MessageCircleIcon className="w-4 h-4" />
              </div>
              Contato
            </Link>
            <Button asChild className="btn-premium-md btn-accent">
              <Link to="/doacoes">
                <DollarSign className="w-4 h-4 mr-1.5" />
                Doar Agora
              </Link>
            </Button>
          </div>

          {/* Menu Mobile */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Menu Mobile Expandido */}
        {isMenuOpen && (
          <div className="md:hidden py-6 animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-lg font-bold px-4 py-3 rounded-2xl transition-all ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground/80 hover:text-primary hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 px-4 pt-6 mt-2 border-t border-border/40">
                <Button asChild variant="outline" className="btn-premium-lg border-2">
                  <Link to="/contato" onClick={() => setIsMenuOpen(false)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contato
                  </Link>
                </Button>
                <Button asChild className="btn-premium-lg btn-accent">
                  <Link to="/doacoes" onClick={() => setIsMenuOpen(false)}>
                    <DollarSign className="w-4 h-4 mr-2" />
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
