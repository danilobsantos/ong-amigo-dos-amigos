import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="ONG Amigo dos Amigos Logo" className="h-20 w-auto" />
            </Link>
            <p className="text-gray-300 text-sm">
              Dedicados ao resgate, cuidado e adoção responsável de cachorros de rua. 
              Transformando vidas através do amor e cuidado.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/amigodosamigosguaranesia/" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/amigodosamigossos/" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/amigodosamigos" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
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
                <Link to="/adocao" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Adotar
                </Link>
              </li>
              <li>
                <Link to="/doacoes" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Fazer Doação
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
                  Rua Paschoal Romanelli, 486<br />
                  Várzea , Guaranésia/MG<br />
                  CEP: 37810-000
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-300 text-sm">(35) 9821-5366</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-300 text-sm">ongamigodosamigos@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Separação e Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
              © 2025 ONG Amigo dos Amigos CNPJ: 20.240.965.0001-69 | Desenvolvido por @DevStudio.
            </a>
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
