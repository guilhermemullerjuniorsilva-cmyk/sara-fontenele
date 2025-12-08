
import React from 'react';
import { useSiteContent } from '../contexts/SiteContext';
import { Sparkles, Activity, Sun, ShieldCheck, ArrowRight, HeartPulse } from 'lucide-react';

const Services: React.FC = () => {
  const { content } = useSiteContent();

  const handleScheduleService = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    
    // Dispara evento para o componente Contact
    const event = new CustomEvent('trigger-schedule', { 
      detail: { serviceName: title } 
    });
    window.dispatchEvent(event);
  };

  // Helper function to try and pick a relevant icon
  const getIcon = (index: number) => {
    const icons = [ShieldCheck, Sparkles, Sun, Activity, HeartPulse];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div id="services" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-brand-600 font-semibold tracking-wide uppercase">Tratamentos</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Cuidado completo para seus pés
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 lg:mx-auto">
            Combinamos técnicas tradicionais e tecnologia moderna para garantir a saúde e a estética dos seus pés.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-x-8 md:gap-y-10">
            {content.services.map((service, index) => (
              <div key={service.id} className="relative group flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-90 transition-opacity sm:h-64 mb-6 shadow-md">
                   <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur'; // Fallback
                    }}
                  />
                </div>
                <div className="flex-1">
                    <dt>
                        <div className="absolute top-40 sm:top-56 left-4 flex items-center justify-center h-12 w-12 rounded-md bg-brand-500 text-white shadow-lg z-10">
                          {getIcon(index)}
                        </div>
                        <p className="mt-2 text-lg leading-6 font-medium text-slate-900">{service.title}</p>
                    </dt>
                    <dd className="mt-2 text-base text-slate-500 mb-4">
                        {service.description}
                    </dd>
                </div>
                <div className="mt-auto">
                    <button 
                        onClick={(e) => handleScheduleService(e, service.title)}
                        className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium transition-colors group-hover:translate-x-1 duration-200"
                    >
                        Agendar este serviço <ArrowRight className="ml-1 w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Services;
