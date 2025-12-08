
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

const About: React.FC = () => {
  const { content } = useSiteContent();

  return (
    <div id="about" className="py-16 bg-brand-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="relative">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl font-serif">
              Sua saúde começa pelos pés
            </h3>
            <p className="mt-3 text-lg text-slate-500">
              No estúdio Sara Fontenele, acreditamos que pés saudáveis são a base para uma vida ativa e feliz. Nossa clínica oferece um ambiente esterilizado, acolhedor e equipado com a mais alta tecnologia.
            </p>

            <dl className="mt-10 space-y-4">
              {[
                'Profissionais graduados em Podologia',
                'Materiais 100% esterilizados em autoclave',
                'Ambiente climatizado e relaxante',
                'Atendimento personalizado para cada caso'
              ].map((item, index) => (
                <div key={index} className="relative">
                  <dt>
                    <CheckCircle2 className="absolute h-6 w-6 text-brand-500" aria-hidden="true" />
                    <p className="ml-9 text-lg leading-6 font-medium text-slate-900">{item}</p>
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
             <div className="relative mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-md">
                 <img
                    className="w-full h-full object-cover"
                    src={content.aboutImage}
                    alt="Podóloga atendendo paciente"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = 'https://picsum.photos/id/447/600/800';
                    }}
                 />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
