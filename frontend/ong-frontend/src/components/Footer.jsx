import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Amigo dos Amigos</h3>
                <p className="text-sm text-gray-400">ONG</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Dedicados ao resgate, cuidado e adoção responsável de cachorros de rua. 
              Transformando vidas através do amor e cuidado.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/adocao" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Adoção
                </Link>
              </li>
              <li>
                <Link to="/voluntariado" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Voluntariado
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Como Ajudar */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Como Ajudar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/doacoes" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Fazer Doação
                </Link>
              </li>
              <li>
                <Link to="/adocao" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Adotar um Cão
                </Link>
              </li>
              <li>
                <Link to="/voluntariado" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Ser Voluntário
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Divulgar Nosso Trabalho
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Rua das Flores, 123<br />
                  Centro, São Paulo - SP<br />
                  CEP: 01234-567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-300 text-sm">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-300 text-sm">contato@amigodosamigos.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Separação e Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ONG Amigo dos Amigos. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
