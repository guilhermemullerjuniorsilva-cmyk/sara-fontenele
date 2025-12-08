
import React from 'react';
import { Facebook, Instagram, Twitter, Lock } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

interface FooterProps {
  onOpenAdmin: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { content } = useSiteContent();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between">
        <div className="flex space-x-6 md:order-2">
          {content.socialLinks.facebook && (
            <a 
              href={content.socialLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-brand-400 transition-colors transform hover:scale-110"
            >
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
          )}
          {content.socialLinks.instagram && (
            <a 
              href={content.socialLinks.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-brand-400 transition-colors transform hover:scale-110"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
          )}
          {content.socialLinks.twitter && (
            <a 
              href={content.socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-brand-400 transition-colors transform hover:scale-110"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
          )}
        </div>
        <div className="mt-8 md:mt-0 md:order-1 flex flex-col md:flex-row items-center gap-4">
          <p className="text-center text-base text-slate-400">
            &copy; {new Date().getFullYear()} {content.companyName}. Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 md:mt-0 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
              <span className="opacity-70">Desenvolvido por <span className="text-slate-400 font-medium">Guilherme Müller</span></span>
              <span className="text-slate-800">|</span>
              <button 
                onClick={onOpenAdmin}
                className="text-slate-700 hover:text-slate-500 flex items-center gap-1 transition-colors"
                title="Área Restrita"
              >
                <Lock size={12} /> Área Restrita
              </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
