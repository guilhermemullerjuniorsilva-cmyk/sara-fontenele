
import React, { useState, useEffect } from 'react';
import { Menu, X, HeartPulse, LogIn, User, LogOut, LayoutDashboard, Layout } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenClientProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenAdmin, onOpenClientProfile }) => {
  const { content, currentUser, setCurrentUser } = useSiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detecta rolagem para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função unificada de navegação suave
  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false); // Fecha o menu mobile se estiver aberto

    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      // Compensa a altura do header fixo (aprox 80px)
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Função específica para o botão de Agendar (abre o formulário)
  const handleScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    // Dispara evento para o componente Contact rolar e focar
    const event = new CustomEvent('trigger-schedule', { 
      detail: { serviceName: 'Avaliação Geral' } 
    });
    window.dispatchEvent(event);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Início', id: 'home' },
    { name: 'Serviços', id: 'services' },
    { name: 'Sobre', id: 'about' },
    { name: 'Contato', id: 'contact' },
  ];

  return (
    <header 
      className={`fixed w-full top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a 
            href="#" 
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center cursor-pointer group"
          >
            <HeartPulse className={`h-8 w-8 transition-colors ${isScrolled ? 'text-brand-600' : 'text-brand-700 group-hover:text-brand-800'}`} />
            <span className={`ml-2 text-xl font-serif font-bold transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900 group-hover:text-brand-900'}`}>
              {content.companyName}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`text-base font-medium hover:text-brand-600 transition-colors relative group ${
                  isScrolled ? 'text-slate-700' : 'text-slate-800'
                }`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Right Side Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
             {currentUser ? (
                <div className="flex items-center gap-3 mr-2">
                   <div className="text-right hidden lg:block">
                      <p className={`text-xs font-bold ${isScrolled ? 'text-slate-900' : 'text-slate-800'}`}>Olá, {currentUser.name.split(' ')[0]}</p>
                   </div>
                   
                   {currentUser.role === 'admin' ? (
                      <button 
                        onClick={onOpenAdmin}
                        title="Acessar Painel"
                        className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
                      >
                        <LayoutDashboard size={18} />
                      </button>
                   ) : (
                      <button 
                        onClick={onOpenClientProfile}
                        title="Minha Conta"
                        className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 transition-colors"
                      >
                        <User size={18} />
                      </button>
                   )}

                   <button 
                      onClick={handleLogout}
                      title="Sair"
                      className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                   >
                      <LogOut size={18} />
                   </button>
                </div>
             ) : (
               <button
                  onClick={onOpenAuth}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    isScrolled 
                      ? 'border-brand-600 text-brand-600 hover:bg-brand-50' 
                      : 'border-white/50 text-slate-800 hover:bg-white/50 bg-white/20 backdrop-blur-sm'
                  }`}
               >
                  <LogIn size={16} /> Entrar
               </button>
             )}

             <button 
               onClick={handleScheduleClick}
               className="bg-brand-600 text-white px-5 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transform hover:scale-105 duration-200"
             >
                 Agendar
             </button>
          </div>

          {/* Botão Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-brand-600 p-2 focus:outline-none"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 transition-all duration-300 ease-in-out origin-top ${mobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
        <div className="px-4 pt-4 pb-6 space-y-2">
            {currentUser && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                    <div className="bg-brand-100 p-2 rounded-full text-brand-600">
                        <User size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                </div>
            )}

            {navLinks.map((item) => (
            <a
              key={item.name}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors border-l-4 border-transparent hover:border-brand-500"
            >
              {item.name}
            </a>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                {currentUser ? (
                    <>
                        {currentUser.role === 'admin' ? (
                          <button 
                             onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                             className="flex w-full items-center justify-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-md font-medium hover:bg-slate-700 transition-colors"
                          >
                              <LayoutDashboard size={18} /> Acessar Painel
                          </button>
                        ) : (
                          <button 
                             onClick={() => { onOpenClientProfile(); setMobileMenuOpen(false); }}
                             className="flex w-full items-center justify-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-md font-medium hover:bg-brand-700 transition-colors"
                          >
                              <User size={18} /> Minha Conta
                          </button>
                        )}
                        <button 
                           onClick={handleLogout}
                           className="flex w-full items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                        >
                            <LogOut size={18} /> Sair da conta
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                        className="flex w-full items-center justify-center gap-2 bg-white border border-brand-200 text-brand-600 px-5 py-3 rounded-md font-medium hover:bg-brand-50 transition-colors"
                    >
                        <LogIn size={18} /> Fazer Login / Criar Conta
                    </button>
                )}

                <button 
                  onClick={handleScheduleClick} 
                  className="block w-full text-center bg-brand-600 text-white px-5 py-3 rounded-md font-medium hover:bg-brand-700 transition-colors shadow-sm"
                >
                    Agendar Agora
                </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
