
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

const Hero: React.FC = () => {
  const { content } = useSiteContent();

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const event = new CustomEvent('trigger-schedule', { 
      detail: { serviceName: 'Avaliação Geral' } 
    });
    window.dispatchEvent(event);
  };

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('services');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-brand-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-brand-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              {content.heroNotificationText && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-sm font-medium mb-4 animate-float hover:scale-105 transition-transform duration-300 cursor-default shadow-sm border border-brand-200">
                  <Sparkles className="w-4 h-4 mr-2 text-brand-600" />
                  {content.heroNotificationText}
                </div>
              )}
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl animate-fade-in-up">
                {/* Dynamic Title - splitted for styling */}
                <span className="block xl:inline">{content.heroTitle.split(' ').slice(0, 3).join(' ')}</span>{' '}
                <span className="block text-brand-600 xl:inline">{content.heroTitle.split(' ').slice(3).join(' ')}</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
                {content.heroSubtitle}
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
                <div className="rounded-md shadow">
                  <button
                    onClick={handleScheduleClick}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 md:py-4 md:text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    {content.heroButtonText}
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#services"
                    onClick={handleServicesClick}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-brand-700 bg-brand-100 hover:bg-brand-200 md:py-4 md:text-lg transition-all duration-200 hover:shadow-md"
                  >
                    Nossos Serviços <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full animate-fade-in"
          src={content.heroImage}
          alt="Terapia Podal e Relaxamento"
          style={{animationDelay: '0.2s', animationFillMode: 'both'}}
          onError={(e) => {
             (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=1200&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent lg:via-brand-50/20"></div>
      </div>
    </div>
  );
};

export default Hero;
