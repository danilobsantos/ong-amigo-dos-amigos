import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { settingsAPI } from '../lib/api';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Erro ao carregar configurações no footer:', error);
    }
  };

  return (
    <footer className="bg-accent text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo e Descrição */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center opacity-90 hover:opacity-100 transition-opacity">
              <img src="/images/1758659750139-logo.png" alt="ONG Amigo dos Amigos Logo" className="h-25 w-auto" />
            </Link>
            <p className="text-white/70 leading-relaxed">
              Dedicados ao resgate, cuidado e adoção responsável de animais em situação de risco.
              Transformando vidas através do amor e cuidado.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/amigodosamigosguaranesia/" className="p-2.5 rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/amigodosamigossos/" className="p-2.5 rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/amigodosamigos" className="p-2.5 rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] text-white/50 mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              {[{to: '/sobre', label: 'Sobre Nós'}, {to: '/adocao', label: 'Adoção'}, {to: '/voluntariado', label: 'Voluntariado'}, {to: '/blog', label: 'Blog'}].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-white/70 hover:text-secondary font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Como Ajudar */}
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] text-white/50 mb-6">Como Ajudar</h4>
            <ul className="space-y-3">
              {[{to: '/adocao', label: 'Adotar'}, {to: '/doacoes', label: 'Fazer Doação'}, {to: '/voluntariado', label: 'Ser Voluntário'}].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-white/70 hover:text-secondary font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="#" className="text-white/70 hover:text-secondary font-medium transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                  Divulgar Nosso Trabalho
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] text-white/50 mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-white/70 leading-relaxed">
                  {settings?.address || 'Rua Paschoal Romanelli, 486\nVárzea, Guaranésia/MG\nCEP: 37810-000'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-white/70 ">{settings?.phone || '(35) 9821-5366'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-white/70">{settings?.email || 'ongamigodosamigos@gmail.com'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40">
              © {new Date().getFullYear()} ONG Amigo dos Amigos · CNPJ: 20.240.965.0001-69 · Desenvolvido por <a href="https://devstudio.com.br" target="_blank" rel="noopener noreferrer" className="text-white/40 font-bold hover:text-white/70 transition-colors">@DevStudio</a>
            </p>
            {/* <div className="flex gap-6">
              <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Política de Privacidade</a>
              <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Termos de Uso</a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;