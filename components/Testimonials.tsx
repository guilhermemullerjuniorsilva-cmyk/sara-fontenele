
import React from 'react';
import { Star } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

const Testimonials: React.FC = () => {
  const { content } = useSiteContent();

  return (
    <section className="py-12 bg-white overflow-hidden md:py-20 lg:py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
               O que dizem nossos clientes
            </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {content.testimonials.map((t) => (
                <div key={t.id} className="bg-brand-50 rounded-2xl p-8 text-center relative hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <img 
                            className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover" 
                            src={t.image} 
                            alt={t.name}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`;
                            }}
                        />
                    </div>
                    <div className="mt-6 flex justify-center text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <blockquote className="text-slate-600 mb-6 italic">
                        "{t.content}"
                    </blockquote>
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-sm text-brand-600">{t.role}</div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
