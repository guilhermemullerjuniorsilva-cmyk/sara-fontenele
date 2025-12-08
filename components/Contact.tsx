
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Phone, Mail, Send, Smartphone, Calendar, Clock as ClockIcon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

const Contact: React.FC = () => {
  const { content, addAppointment } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Podologia Clínica',
    date: '',
    time: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');
  
  // Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date()); // Current month view
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find selected service to get duration
  const selectedService = useMemo(() => {
      return content.services.find(s => s.title === formData.service);
  }, [formData.service, content.services]);

  // Generate Available Time Slots based on Config
  const availableTimeSlots = useMemo(() => {
      // Se não tiver data selecionada, não gera horários
      if (!formData.date || dateError) return [];

      const { startHour, endHour, intervalMinutes, breakStartHour, breakEndHour } = content.schedulingConfig;
      const slots = [];
      
      const [startH, startM] = startHour.split(':').map(Number);
      const [endH, endM] = endHour.split(':').map(Number);
      
      // Calculate break in minutes if configured
      let breakStartMins = -1;
      let breakEndMins = -1;
      if (breakStartHour && breakEndHour) {
          const [bh, bm] = breakStartHour.split(':').map(Number);
          const [beh, bem] = breakEndHour.split(':').map(Number);
          breakStartMins = bh * 60 + bm;
          breakEndMins = beh * 60 + bem;
      }

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // Verificação de "Hoje" para filtrar horários passados
      const now = new Date();
      const [y, m, d] = formData.date.split('-').map(Number);
      const selectedDateObj = new Date(y, m - 1, d);
      const isToday = selectedDateObj.toDateString() === now.toDateString();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

      while (currentMinutes < endMinutes) {
          // 1. Verificar se o horário já passou (apenas se a data for hoje)
          if (isToday && currentMinutes <= currentTimeMinutes) {
              currentMinutes += intervalMinutes;
              continue;
          }

          // 2. Verificar Intervalo de Almoço/Pausa
          // Se o início do agendamento cai dentro do intervalo de pausa, pula
          if (breakStartMins !== -1 && breakEndMins !== -1) {
              if (currentMinutes >= breakStartMins && currentMinutes < breakEndMins) {
                  currentMinutes += intervalMinutes;
                  continue; 
              }
          }

          // Formatar para string HH:mm
          const h = Math.floor(currentMinutes / 60);
          const m = currentMinutes % 60;
          const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          slots.push(timeString);
          
          currentMinutes += intervalMinutes;
      }
      
      return slots;
  }, [content.schedulingConfig, formData.date, dateError]);

  // Escuta eventos de agendamento vindos de outros componentes
  useEffect(() => {
    const handleTriggerSchedule = (event: CustomEvent) => {
      const { serviceName } = event.detail || {};
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        if (serviceName) {
           setFormData(prev => ({ ...prev, service: serviceName }));
        }

        setTimeout(() => {
          const nameInput = document.getElementById('name');
          if (nameInput) {
            nameInput.focus();
            nameInput.classList.add('ring-2', 'ring-brand-500', 'ring-offset-2');
            setTimeout(() => nameInput.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-2'), 1000);
          }
        }, 800);
      }
    };

    window.addEventListener('trigger-schedule' as any, handleTriggerSchedule as any);

    return () => {
      window.removeEventListener('trigger-schedule' as any, handleTriggerSchedule as any);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha pelo menos seu nome e telefone.');
      return;
    }

    if (!formData.date || !formData.time) {
        alert('Por favor, selecione uma data e horário disponíveis.');
        return;
    }

    setIsSubmitting(true);

    // Salvar no sistema interno
    addAppointment({
      customerName: formData.name,
      phone: formData.phone,
      service: formData.service,
      date: formData.date || 'Não informada',
      time: formData.time || 'Não informado',
      notes: formData.message
    });

    const phoneNumber = content.whatsappNumber; 
    const dateStr = formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'A combinar';
    const timeStr = formData.time || 'A combinar';
    const durationStr = selectedService?.duration ? `(${selectedService.duration} min)` : '';

    const text = `*📅 Novo Pedido de Agendamento*\n\n` +
      `👤 *Cliente:* ${formData.name}\n` +
      `📱 *Telefone:* ${formData.phone}\n` +
      `🦶 *Serviço:* ${formData.service} ${durationStr}\n` +
      `📆 *Data:* ${dateStr}\n` +
      `⏰ *Horário:* ${timeStr}\n\n` +
      `${formData.message ? `📝 *Obs:* ${formData.message}` : ''}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setIsSubmitting(false);
        setFormData({
            name: '',
            phone: '',
            service: 'Podologia Clínica',
            date: '',
            time: '',
            message: ''
        });
    }, 800);
  };

  // --- CUSTOM CALENDAR LOGIC ---

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    // Create date string YYYY-MM-DD manually to avoid timezone issues
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setFormData(prev => ({ ...prev, date: dateStr, time: '' })); // Reset time when date changes
    setDateError('');
    setIsCalendarOpen(false);
  };

  const isDateDisabled = (day: number) => {
      const year = calendarViewDate.getFullYear();
      const month = calendarViewDate.getMonth();
      const checkDate = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Past dates
      if (checkDate < today) return true;

      // 2. Working days (0=Sun, 6=Sat)
      if (!content.schedulingConfig.workingDays.includes(checkDate.getDay())) return true;

      // 3. Blocked dates
      if (content.schedulingConfig.blockedDates.includes(dateStr)) return true;

      return false;
  };

  const renderCalendar = () => {
      const year = calendarViewDate.getFullYear();
      const month = calendarViewDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      
      const days = [];
      // Empty slots for days before start of month
      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
      }

      // Actual days
      for (let day = 1; day <= daysInMonth; day++) {
          const disabled = isDateDisabled(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = formData.date === dateStr;

          days.push(
              <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDateSelect(day)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${isSelected ? 'bg-brand-600 text-white' : ''}
                      ${!disabled && !isSelected ? 'hover:bg-brand-100 text-slate-700' : ''}
                      ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
                  `}
              >
                  {day}
              </button>
          );
      }
      return days;
  };

  return (
    <div id="contact" className="bg-slate-900 text-white py-16 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Info Column */}
          <div>
            <h2 className="text-3xl font-extrabold font-serif mb-6">Agende sua Consulta</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Escolha o melhor horário para você. Nossa agenda inteligente exibe apenas horários disponíveis conforme o funcionamento da clínica.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start group hover:translate-x-1 transition-transform cursor-default">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-brand-400 group-hover:text-brand-300" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium whitespace-pre-line">{content.address}</p>
                </div>
              </div>

              <div className="flex items-center group hover:translate-x-1 transition-transform cursor-pointer" onClick={() => window.open(`https://wa.me/${content.whatsappNumber}`, '_blank')}>
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-brand-400 group-hover:text-brand-300" />
                </div>
                <div className="ml-3 text-base">
                  <p>{content.phone}</p>
                  <p className="text-sm text-slate-400">Clique para chamar no WhatsApp</p>
                </div>
              </div>

              <div className="flex items-center group hover:translate-x-1 transition-transform cursor-default">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-brand-400 group-hover:text-brand-300" />
                </div>
                <div className="ml-3 text-base">
                  <p>{content.email}</p>
                </div>
              </div>
              
               <div className="flex items-start group hover:translate-x-1 transition-transform cursor-default">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-brand-400 group-hover:text-brand-300" />
                </div>
                <div className="ml-3 text-base whitespace-pre-line">
                  {content.openingHoursText}
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white rounded-lg p-8 text-slate-900 shadow-xl">
             <div className="flex items-center gap-2 mb-4">
               <Smartphone className="text-brand-600" />
               <h3 className="text-xl font-semibold">Solicitar Agendamento</h3>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                     <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                     <input 
                        type="text" 
                        id="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 border p-2 transition-all" 
                        placeholder="Seu nome" 
                     />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefone / WhatsApp</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 border p-2" 
                            placeholder="(99) 99999-9999" 
                        />
                    </div>
                    <div>
                        <label htmlFor="service" className="block text-sm font-medium text-slate-700">Procedimento</label>
                        <select 
                            id="service" 
                            value={formData.service}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 border p-2"
                        >
                            {content.services.map(service => (
                                <option key={service.id} value={service.title}>{service.title}</option>
                            ))}
                            <option value="Avaliação Geral">Avaliação Geral</option>
                        </select>
                        {selectedService && (
                            <p className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                                <ClockIcon size={10} /> Duração: {selectedService.duration || 60} min
                            </p>
                        )}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative" ref={calendarRef}>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 flex items-center gap-1">
                            <Calendar size={14} /> Data Preferida
                        </label>
                        
                        {/* Custom Date Input Trigger */}
                        <div 
                            className={`mt-1 flex items-center justify-between w-full rounded-md shadow-sm border p-2 cursor-pointer bg-gray-50 ${isCalendarOpen ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-300'}`}
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                            <span className={formData.date ? 'text-slate-900' : 'text-gray-400'}>
                                {formData.date 
                                    ? new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR') 
                                    : 'Selecionar data...'
                                }
                            </span>
                            <Calendar size={16} className="text-gray-400" />
                        </div>

                        {/* Custom Calendar Popover */}
                        {isCalendarOpen && (
                            <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-4">
                                    <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {months[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                                    </div>
                                    <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {daysOfWeek.map(d => (
                                        <div key={d} className="text-center text-xs font-medium text-gray-400">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {renderCalendar()}
                                </div>
                                <div className="mt-2 text-xs text-gray-400 text-center">
                                    Dias em cinza estão indisponíveis.
                                </div>
                            </div>
                        )}
                        
                        {dateError && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium animate-pulse">
                                <AlertCircle size={10} /> {dateError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-slate-700 flex items-center gap-1">
                            <ClockIcon size={14} /> Horário Disponível
                        </label>
                        <select 
                            id="time" 
                            value={formData.time}
                            onChange={handleChange}
                            required
                            disabled={!formData.date}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 border p-2 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">
                                {!formData.date ? 'Selecione a data primeiro' : 
                                 availableTimeSlots.length === 0 ? 'Sem horários livres nesta data' : 'Selecione um horário...'}
                            </option>
                            {availableTimeSlots.map((slot) => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                 </div>

                 <div>
                     <label htmlFor="message" className="block text-sm font-medium text-slate-700">Observações (Opcional)</label>
                     <textarea 
                        id="message" 
                        rows={2} 
                        value={formData.message}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 border p-2"
                        placeholder="Ex: Tenho diabetes, sinto dor na unha..."
                     ></textarea>
                 </div>

                 <button 
                    type="submit"
                    disabled={isSubmitting || !!dateError} 
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all ${isSubmitting || !!dateError ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                 >
                     <Send className={`w-4 h-4 mr-2 ${isSubmitting ? 'animate-ping' : ''}`} />
                     {isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
                 </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
