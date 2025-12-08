import React, { useState } from 'react';
import { useSiteContent } from '../contexts/SiteContext';
import { ServiceItem, Appointment, MedicalRecord, Testimonial } from '../types';
import { 
    X, Save, RotateCcw, Lock, Plus, Trash2, Edit2, Palette, Clock, Share2, 
    Calendar, Ban, Coffee, List, CheckCircle, Eye, ChevronLeft, ChevronRight,
    Home, Phone, Grid, Upload, UserPlus, LogIn, KeyRound, 
    ClipboardList, Printer, Search, AlertTriangle, FileText, Sparkles, Database, Cloud, RefreshCw, Users, Shield, ShieldAlert, MessageSquare,
    Activity, LayoutDashboard
} from 'lucide-react';

interface AdminProps {
  onClose: () => void;
}

const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const { 
      content, updateContent, resetContent, forceSaveSettings, appointments, removeAppointment,
      verifyLogin, registerUser, resetUserPassword, currentUser, setCurrentUser,
      medicalRecords, saveMedicalRecord, isSupabaseConnected, connectionError, hasEnvVars, forceReconnect,
      users, deleteUser, toggleUserRole
  } = useSiteContent();

  const [activeTab, setActiveTab] = useState<'geral' | 'agenda' | 'servicos' | 'contato' | 'aparencia' | 'agendamentos' | 'prontuarios' | 'usuarios' | 'depoimentos' | 'database'>('agendamentos');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showDbKeys, setShowDbKeys] = useState(false);
  
  // Auth State
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Editing States
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [tempService, setTempService] = useState<Partial<ServiceItem>>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Testimonials State
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [tempTestimonial, setTempTestimonial] = useState<Partial<Testimonial>>({});

  // Medical Record States
  const [recordSearch, setRecordSearch] = useState('');
  const [editingRecord, setEditingRecord] = useState<Partial<MedicalRecord> | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const tabs = [
    { id: 'agendamentos', label: 'Solicitações', icon: Calendar },
    { id: 'prontuarios', label: 'Prontuários', icon: ClipboardList },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'servicos', label: 'Serviços', icon: Grid },
    { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquare },
    { id: 'geral', label: 'Geral', icon: LayoutDashboard },
    { id: 'agenda', label: 'Horários', icon: Clock },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'contato', label: 'Contato', icon: Phone },
    { id: 'database', label: 'Banco de Dados', icon: Database },
  ];

  // --- Auth Handlers ---

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authView === 'login') {
        const user = verifyLogin(authForm.email, authForm.password);
        if (user) {
             if (user.role === 'admin') {
                setCurrentUser(user);
             } else {
                 setAuthError('Acesso negado. Esta área é restrita para administradores.');
             }
        } else {
            setAuthError('E-mail ou senha incorretos.');
        }
    } else if (authView === 'register') {
        setAuthError('O cadastro de novos administradores deve ser feito dentro do painel.');
    } else if (authView === 'forgot') {
        if (!authForm.email || !authForm.password) {
            setAuthError('Preencha o e-mail e a nova senha.');
            return;
        }
        const success = await resetUserPassword(authForm.email, authForm.password);
        if (success) {
            setAuthSuccess('Senha redefinida com sucesso!');
            setTimeout(() => setAuthView('login'), 1500);
        } else {
            setAuthError('E-mail não encontrado.');
        }
    }
  };

  const clearAuthForm = (view: 'login' | 'register' | 'forgot') => {
      setAuthView(view);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
      setAuthError('');
      setAuthSuccess('');
  };

  // --- Admin Logic Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateContent({ [name]: value });
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    updateContent({
        schedulingConfig: {
            ...content.schedulingConfig,
            [name]: type === 'number' ? Number(value) : value
        }
    });
  };

  // --- SERVICE IMAGE UPLOAD ---
  const handleEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setTempService({ ...service });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { 
          alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempService({ ...tempService, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveService = async () => {
    if (!tempService.title || !tempService.description) {
        alert("Título e Descrição são obrigatórios");
        return;
    }
    setSaveStatus('saving');
    let updatedServices = [...content.services];
    if (editingServiceId === 'new') {
        const newService = { ...tempService, id: Date.now().toString() } as ServiceItem;
        updatedServices.push(newService);
    } else {
        updatedServices = updatedServices.map(s => 
            s.id === editingServiceId ? { ...s, ...tempService } as ServiceItem : s
        );
    }
    await updateContent({ services: updatedServices });
    setEditingServiceId(null);
    setTempService({});
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1000);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
        const updatedServices = content.services.filter(s => s.id !== id);
        await updateContent({ services: updatedServices });
    }
  };

  const handleAddNewService = () => {
      setEditingServiceId('new');
      setTempService({
          title: '',
          description: '',
          image: 'https://picsum.photos/400/300',
          duration: 60
      });
  };

  const handleCancelEditService = () => {
      setEditingServiceId(null);
      setTempService({});
  };

  // --- GLOBAL IMAGE UPLOAD (Hero, About) ---
  const handleGlobalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'heroImage' | 'aboutImage') => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2000000) { 
            alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            updateContent({ [fieldName]: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  // --- TESTIMONIALS HANDLERS ---
  const handleEditTestimonial = (testimonial: Testimonial) => {
      setEditingTestimonialId(testimonial.id);
      setTempTestimonial({ ...testimonial });
  };

  const handleTestimonialImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2000000) {
            alert("A imagem é muito grande. Limite 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setTempTestimonial({ ...tempTestimonial, image: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveTestimonial = async () => {
      if (!tempTestimonial.name || !tempTestimonial.content) {
          alert("Nome e Conteúdo são obrigatórios.");
          return;
      }
      setSaveStatus('saving');
      let updatedList = [...content.testimonials];
      if (editingTestimonialId === 'new') {
          const newItem = { ...tempTestimonial, id: Date.now().toString() } as Testimonial;
          updatedList.push(newItem);
      } else {
          updatedList = updatedList.map(t => 
              t.id === editingTestimonialId ? { ...t, ...tempTestimonial } as Testimonial : t
          );
      }
      await updateContent({ testimonials: updatedList });
      setEditingTestimonialId(null);
      setTempTestimonial({});
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1000);
  };

  const handleDeleteTestimonial = async (id: string) => {
      if (confirm("Excluir este depoimento?")) {
          const updatedList = content.testimonials.filter(t => t.id !== id);
          await updateContent({ testimonials: updatedList });
      }
  };

  const handleAddNewTestimonial = () => {
      setEditingTestimonialId('new');
      setTempTestimonial({
          name: '',
          role: '',
          content: '',
          image: 'https://ui-avatars.com/api/?name=Cliente&background=random'
      });
  };

  const handleGlobalSave = async () => {
      setSaveStatus('saving');
      const success = await forceSaveSettings();
      if (success) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
          setSaveStatus('idle');
          alert("Erro ao salvar configurações.");
      }
  };

  // --- MEDICAL RECORD HANDLERS ---

  const handleNewRecord = (fromAppointment?: Appointment) => {
      const newRecord: MedicalRecord = {
          id: Date.now().toString(),
          patientName: fromAppointment?.customerName || '',
          patientPhone: fromAppointment?.phone || '',
          birthDate: '',
          anamnesis: {
              diabetes: false,
              hypertension: false,
              circulatoryProblems: false,
              anticoagulants: false,
              allergies: '',
              medications: '',
              sensitiveFeet: false,
              pacemaker: false,
              hepatitis: false,
              oncologicalHistory: false,
              smoker: false,
              pregnant: false,
              psoriasis: false,
              osteoporosis: false,
              renalProblems: false,
              epilepsy: false
          },
          assessment: {
              mainComplaint: fromAppointment?.notes || '',
              footType: 'G',
              skinTexture: '',
              nailCharacteristics: '',
              lesions: ''
          },
          procedureNotes: fromAppointment ? `Procedimento agendado: ${fromAppointment.service}` : '',
          homeCareRecommendations: '',
          lastUpdate: Date.now()
      };
      setEditingRecord(newRecord);
  };

  const handleSaveRecord = async () => {
      if (!editingRecord?.patientName || !editingRecord?.patientPhone) {
          alert('Nome e Telefone são obrigatórios.');
          return;
      }
      setSaveStatus('saving');
      await saveMedicalRecord(editingRecord as MedicalRecord);
      setEditingRecord(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1000);
  };

  const handlePrintRecord = () => {
      setShowPrintPreview(true);
      setTimeout(() => {
          window.print();
      }, 500);
  };

  const updateRecordField = (section: keyof MedicalRecord | 'anamnesis' | 'assessment', field: string, value: any) => {
      if (!editingRecord) return;
      
      if (section === 'anamnesis' || section === 'assessment') {
          setEditingRecord({
              ...editingRecord,
              [section]: {
                  ...editingRecord[section],
                  [field]: value
              }
          });
      } else {
          setEditingRecord({
              ...editingRecord,
              [field]: value
          });
      }
  };

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 bg-opacity-95 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
                <div className="bg-brand-100 p-3 rounded-full mb-4">
                    <Lock className="text-brand-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {authView === 'login' && 'Área Administrativa'}
                    {authView === 'forgot' && 'Recuperar Acesso'}
                </h2>
                <p className="text-slate-500 text-center mt-2 text-sm">
                    Acesso restrito para equipe e gestores.
                </p>
            </div>

            {authError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 text-center border border-red-100">
                    {authError}
                </div>
            )}
            {authSuccess && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded mb-4 text-center border border-green-100">
                    {authSuccess}
                </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <input
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                        className="w-full bg-white text-slate-900 border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {authView === 'forgot' ? 'Nova Senha' : 'Senha'}
                    </label>
                    <input
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                        className="w-full bg-white text-slate-900 border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-brand-600 text-white py-3 rounded-md font-semibold hover:bg-brand-700 transition-colors flex justify-center items-center gap-2"
                >
                    {authView === 'login' && <><LogIn size={18}/> Entrar</>}
                    {authView === 'forgot' && <><KeyRound size={18}/> Redefinir Senha</>}
                </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-center text-sm">
                {authView === 'login' && (
                    <button onClick={() => clearAuthForm('forgot')} className="text-slate-500 hover:text-brand-600 transition-colors">
                        Esqueci minha senha
                    </button>
                )}
                
                {authView === 'forgot' && (
                    <button onClick={() => clearAuthForm('login')} className="text-brand-600 hover:text-brand-800 font-medium transition-colors mt-2">
                        ← Voltar para o Login
                    </button>
                )}
            </div>
        </div>
      </div>
    );
  }

  // Common input styles for consistency
  const inputClass = "mt-1 block w-full bg-white text-slate-900 border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";
  const cardClass = "bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in";
  const headerClass = "text-lg font-bold text-slate-900 border-b pb-3 mb-6 flex items-center gap-2";

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col animate-fade-in text-left font-sans">
      {/* Header Admin */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-col md:flex-row justify-between items-center shadow-md gap-4 md:gap-0 z-10">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="md:hidden text-gray-300 hover:text-white"
            >
                {isSidebarExpanded ? <X size={24} /> : <List size={24} />}
            </button>
            <span className="bg-brand-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Admin</span>
            <div className="flex flex-col">
                <h1 className="font-serif text-lg md:text-xl truncate leading-tight">Painel Sara Fontenele</h1>
                <span className="text-xs text-slate-400">Olá, {currentUser.name}</span>
            </div>
            {isSupabaseConnected && (
                <span className="bg-green-900 text-green-200 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border border-green-700 ml-2 animate-pulse">
                    <Cloud size={10} /> Nuvem Conectada
                </span>
            )}
        </div>
        <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
                onClick={handleGlobalSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm bg-green-700 hover:bg-green-600 rounded transition-colors text-white disabled:opacity-50"
            >
                <Save size={16} className={saveStatus === 'saving' ? 'animate-spin' : ''} /> 
                <span className="hidden lg:inline">{saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
            <button 
                onClick={() => {
                    if(confirm('ATENÇÃO: Isso restaurará todos os textos e configurações originais. Agendamentos NÃO serão apagados. Continuar?')) {
                        resetContent();
                        alert('Configurações restauradas!');
                    }
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm bg-red-900/40 hover:bg-red-800/60 border border-red-800/50 rounded transition-colors text-red-100"
            >
                <RotateCcw size={16} /> <span className="hidden lg:inline">Restaurar</span>
            </button>
             <button 
                onClick={() => { setCurrentUser(null); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
                <X size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div 
            className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out absolute md:relative z-20 h-full ${
                isSidebarExpanded ? 'w-64 shadow-xl' : 'w-0 md:w-16 overflow-hidden md:overflow-visible'
            }`}
            onMouseEnter={() => window.innerWidth > 768 && setIsSidebarExpanded(true)}
            onMouseLeave={() => window.innerWidth > 768 && setIsSidebarExpanded(false)}
        >
            <nav className="p-2 space-y-1 mt-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                if (window.innerWidth < 768) setIsSidebarExpanded(false);
                            }}
                            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors group relative ${
                                isActive 
                                ? 'bg-brand-50 text-brand-700' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                            }`}
                            title={tab.label}
                        >
                            <div className={`${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'} flex-shrink-0`}>
                                <Icon size={20} />
                            </div>
                            
                            <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
                                isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:hidden'
                            }`}>
                                {tab.label}
                            </span>
                            {tab.id === 'agendamentos' && appointments.length > 0 && (
                                <span className={`absolute right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ${
                                    isSidebarExpanded ? '' : 'top-1 right-1'
                                }`}>
                                    {appointments.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 w-full">
            <div className="max-w-5xl mx-auto min-h-[500px]">
                
                {activeTab === 'geral' && (
                    <div className={cardClass}>
                        <h3 className={headerClass}>Configurações Gerais</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Nome da Empresa</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={content.companyName}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                />
                            </div>
                            
                            <div className="border-t pt-6">
                                 <h4 className="text-sm font-bold text-blue-800 mb-4 bg-blue-50 p-2 rounded inline-block">Topo do Site (Hero)</h4>
                                 <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className={labelClass}>Texto da Notificação (Badge)</label>
                                        <input type="text" name="heroNotificationText" value={content.heroNotificationText} onChange={handleInputChange} className={inputClass}/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Título Principal</label>
                                            <input type="text" name="heroTitle" value={content.heroTitle} onChange={handleInputChange} className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Texto do Botão</label>
                                            <input type="text" name="heroButtonText" value={content.heroButtonText} onChange={handleInputChange} className={inputClass}/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Subtítulo</label>
                                        <textarea name="heroSubtitle" rows={3} value={content.heroSubtitle} onChange={handleInputChange} className={inputClass}/>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className={cardClass}>
                        <h3 className={headerClass}>Conexão com Banco de Dados</h3>
                        
                        {/* Diagnóstico de Conexão */}
                        {!isSupabaseConnected && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                                    <AlertTriangle size={18} /> Falha na Conexão com Supabase (Vercel)
                                </h4>
                                <div className="text-sm text-red-700 space-y-1">
                                    <p>O site não está conectado ao banco de dados online.</p>
                                    
                                    <div className="mt-3 bg-white p-3 rounded border border-red-100 shadow-sm">
                                        <p className="font-semibold text-xs text-gray-500 uppercase mb-1">Diagnóstico:</p>
                                        <p>Variáveis de Ambiente (Vercel): {hasEnvVars ? <span className="text-green-600 font-bold">Detectadas (VITE_...)</span> : <span className="text-red-600 font-bold">Não detectadas</span>}</p>
                                        {connectionError && <p>Erro Técnico: <span className="font-mono bg-red-100 px-1 rounded block mt-1 p-1">{connectionError}</span></p>}
                                    </div>
                                    
                                    <div className="mt-4">
                                        <button 
                                            onClick={forceReconnect}
                                            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-red-200"
                                        >
                                            <RefreshCw size={14} /> Forçar Reconexão
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Config Manual Supabase */}
                         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Database size={16}/> Configuração Manual do Supabase
                                </h4>
                             </div>
                             <div className="mb-4 text-sm text-slate-500 bg-blue-50 p-3 rounded border border-blue-100 text-blue-700">
                                 <strong>Recomendado:</strong> Use as Variáveis de Ambiente da Vercel (VITE_SUPABASE_URL). Se não for possível, configure abaixo.
                             </div>
                             <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Supabase Project URL</label>
                                    <input
                                        type={showDbKeys ? "text" : "password"}
                                        name="supabaseUrl"
                                        value={content.supabaseUrl || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://xyz.supabase.co"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Supabase Anon Key</label>
                                    <div className="flex gap-2 relative">
                                        <input
                                            type={showDbKeys ? "text" : "password"}
                                            name="supabaseAnonKey"
                                            value={content.supabaseAnonKey || ''}
                                            onChange={handleInputChange}
                                            placeholder="Key"
                                            className={inputClass}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowDbKeys(!showDbKeys)}
                                            className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                                        >
                                            {showDbKeys ? <Eye size={18} /> : <div className="opacity-50"><Eye size={18} /></div>}
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button onClick={forceReconnect} className="text-sm text-brand-600 hover:text-brand-800 font-medium underline">Testar Conexão Agora</button>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'usuarios' && (
                     <div className={cardClass}>
                        <h3 className={headerClass}>
                            <Users size={20} /> Gestão de Usuários
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                    user.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {user.id !== 'admin-master' && user.id !== currentUser?.id && (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => toggleUserRole(user.id)}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                                            title={user.role === 'admin' ? 'Rebaixar para Cliente' : 'Promover a Admin'}
                                                        >
                                                            {user.role === 'admin' ? <ShieldAlert size={18}/> : <Shield size={18}/>}
                                                        </button>
                                                        <button 
                                                            onClick={() => { if(confirm('Excluir este usuário?')) deleteUser(user.id) }} 
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                                                            title="Excluir Usuário"
                                                        >
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    </div>
                                                )}
                                                {user.id === 'admin-master' && (
                                                    <span className="text-xs text-gray-400 italic bg-gray-100 px-2 py-1 rounded">Master</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'agendamentos' && (
                     <div className={cardClass}>
                         <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-lg font-bold leading-6 text-slate-900 flex items-center gap-2">
                                <List size={20} /> Solicitações Recebidas
                            </h3>
                            <span className="text-sm text-brand-600 font-bold bg-brand-50 px-3 py-1 rounded-full">{appointments.length} registros</span>
                        </div>
                        {appointments.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <Calendar className="mx-auto text-gray-300 mb-2" size={48} />
                                <p className="text-gray-500">Nenhum agendamento encontrado.</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {appointments.map((appt) => (
                                            <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{appt.customerName}</div>
                                                    <div className="text-xs font-normal text-gray-500">{appt.phone}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{appt.service}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{appt.date} <span className="text-gray-300">|</span> {appt.time}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setSelectedAppointment(appt)} className="text-brand-600 hover:text-brand-900 p-2 hover:bg-brand-50 rounded"><Eye size={18}/></button>
                                                        <button onClick={() => removeAppointment(appt.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'prontuarios' && (
                    <div className={cardClass}>
                        {!editingRecord ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4">
                                    <h3 className={headerClass.replace('border-b pb-3 mb-6', 'mb-0 border-b-0 pb-0')}>
                                        <ClipboardList size={20} /> Prontuários Digitais
                                    </h3>
                                    <button onClick={() => handleNewRecord()} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 flex items-center gap-2 shadow-sm transition-colors">
                                        <Plus size={16} /> Novo Prontuário
                                    </button>
                                </div>
                                <div className="relative mb-6">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar paciente por nome ou telefone..." 
                                        value={recordSearch}
                                        onChange={(e) => setRecordSearch(e.target.value)}
                                        className={`${inputClass} pl-10`}
                                    />
                                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                </div>
                                <div className="mt-4 mb-6">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Sugestões (Recentes)</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {appointments.slice(0, 5).map(appt => (
                                            <button 
                                                key={appt.id}
                                                onClick={() => handleNewRecord(appt)}
                                                className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 text-left min-w-[160px] transition-all hover:shadow-sm"
                                            >
                                                <p className="text-xs font-bold text-blue-900 truncate">{appt.customerName}</p>
                                                <p className="text-[10px] text-blue-600">{appt.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {medicalRecords.filter(r => 
                                                r.patientName.toLowerCase().includes(recordSearch.toLowerCase()) ||
                                                r.patientPhone.includes(recordSearch)
                                            ).map(record => (
                                                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.patientName}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record.patientPhone}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                        {record.anamnesis.diabetes && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 mr-1 border border-red-200">Diab</span>}
                                                        {record.anamnesis.hypertension && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 mr-1 border border-orange-200">Hiper</span>}
                                                        {!record.anamnesis.diabetes && !record.anamnesis.hypertension && <span className="text-gray-400 text-xs">-</span>}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => setEditingRecord(record)} className="text-brand-600 hover:text-brand-900 p-2 hover:bg-brand-50 rounded">
                                                            <FileText size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white animate-fade-in">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {editingRecord.id ? 'Editar Prontuário' : 'Novo Prontuário'}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingRecord(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors border border-gray-200">Cancelar</button>
                                        <button onClick={handlePrintRecord} className="px-4 py-2 bg-slate-700 text-white hover:bg-slate-800 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm">
                                            <Printer size={16}/> Imprimir
                                        </button>
                                        <button onClick={handleSaveRecord} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm">
                                            <Save size={16}/> Salvar
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div>
                                            <label className={labelClass}>Nome Completo</label>
                                            <input className={inputClass} value={editingRecord.patientName} onChange={(e) => updateRecordField('patientName', 'patientName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Telefone</label>
                                            <input className={inputClass} value={editingRecord.patientPhone} onChange={(e) => updateRecordField('patientPhone', 'patientPhone', e.target.value)} />
                                        </div>
                                     </div>

                                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Activity size={18}/> Anamnese / Histórico de Saúde</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Diabetes', key: 'diabetes' },
                                                { label: 'Hipertensão', key: 'hypertension' },
                                                { label: 'Prob. Circulatórios', key: 'circulatoryProblems' },
                                                { label: 'Anticoagulantes', key: 'anticoagulants' },
                                                { label: 'Marcapasso', key: 'pacemaker' },
                                                { label: 'Hepatite', key: 'hepatitis' },
                                                { label: 'Hist. Oncológico', key: 'oncologicalHistory' },
                                                { label: 'Tabagismo', key: 'smoker' },
                                                { label: 'Gestante', key: 'pregnant' },
                                                { label: 'Psoríase', key: 'psoriasis' },
                                                { label: 'Osteoporose', key: 'osteoporosis' },
                                                { label: 'Prob. Renais', key: 'renalProblems' },
                                                { label: 'Epilepsia', key: 'epilepsy' },
                                            ].map((item) => (
                                                <label key={item.key} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-300 cursor-pointer transition-colors shadow-sm">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={(editingRecord.anamnesis as any)?.[item.key]} 
                                                        onChange={(e) => updateRecordField('anamnesis', item.key, e.target.checked)} 
                                                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300" 
                                                    /> 
                                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Alergias</label>
                                                <input className={inputClass} value={editingRecord.anamnesis?.allergies} onChange={(e) => updateRecordField('anamnesis', 'allergies', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Medicamentos</label>
                                                <input className={inputClass} value={editingRecord.anamnesis?.medications} onChange={(e) => updateRecordField('anamnesis', 'medications', e.target.value)} />
                                            </div>
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className={labelClass}>Queixa Principal</label>
                                            <input className={inputClass} value={editingRecord.assessment?.mainComplaint} onChange={(e) => updateRecordField('assessment', 'mainComplaint', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Evolução / Procedimento Realizado</label>
                                            <textarea className={inputClass} rows={6} value={editingRecord.procedureNotes} onChange={(e) => updateRecordField('procedureNotes', 'procedureNotes', e.target.value)} />
                                        </div>
                                     </div>
                                 </div>
                            </div>
                        )}
                    </div>
                )}

                 {activeTab === 'agenda' && (
                    <div className={cardClass}>
                        <h3 className={headerClass}>Configuração de Horários</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700">Turno Principal</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Abertura</label>
                                        <input type="time" name="startHour" value={content.schedulingConfig.startHour} onChange={handleConfigChange} className={inputClass}/>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Fechamento</label>
                                        <input type="time" name="endHour" value={content.schedulingConfig.endHour} onChange={handleConfigChange} className={inputClass}/>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700">Pausa / Almoço</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Início Intervalo</label>
                                        <input type="time" name="breakStartHour" value={content.schedulingConfig.breakStartHour || ''} onChange={handleConfigChange} className={inputClass}/>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Fim Intervalo</label>
                                        <input type="time" name="breakEndHour" value={content.schedulingConfig.breakEndHour || ''} onChange={handleConfigChange} className={inputClass}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'servicos' && (
                     <div className={cardClass}>
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h3 className="text-lg font-bold leading-6 text-slate-900">Gerenciar Serviços</h3>
                            <button onClick={handleAddNewService} className="flex items-center gap-2 text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-semibold"><Plus size={16} /> Novo Serviço</button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {content.services.map((service) => (
                                <div key={service.id} className={`border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${editingServiceId === service.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    {editingServiceId === service.id ? (
                                        // EDIÇÃO INLINE
                                        <div className="w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Título</label>
                                                    <input className={inputClass} value={tempService.title || ''} onChange={(e) => setTempService({...tempService, title: e.target.value})} placeholder="Título" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Duração (min)</label>
                                                    <input className={inputClass} type="number" value={tempService.duration || 60} onChange={(e) => setTempService({...tempService, duration: Number(e.target.value)})} placeholder="60" />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className={labelClass}>Descrição</label>
                                                <textarea className={inputClass} value={tempService.description || ''} onChange={(e) => setTempService({...tempService, description: e.target.value})} placeholder="Descrição" rows={3} />
                                            </div>
                                            <div className="mb-4">
                                                <label className={labelClass}>Imagem</label>
                                                <div className="flex items-center gap-4">
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200" />
                                                    {tempService.image && <img src={tempService.image} alt="Preview" className="h-12 w-12 object-cover rounded border" />}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-2">
                                                <button onClick={handleCancelEditService} className="px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                                                <button onClick={handleSaveService} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm">Salvar Alterações</button>
                                            </div>
                                        </div>
                                    ) : (
                                        // VISUALIZAÇÃO
                                        <>
                                            <div className="flex items-center gap-4">
                                                <img src={service.image} alt={service.title} className="w-16 h-16 rounded-md object-cover border border-gray-100 shadow-sm" />
                                                <div>
                                                    <p className="font-bold text-slate-900 text-lg">{service.title}</p>
                                                    <p className="text-sm text-gray-500 mb-1 line-clamp-1">{service.description}</p>
                                                    <span className="inline-flex items-center text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                                                        <Clock size={10} className="mr-1"/> {service.duration} min
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <button onClick={() => handleEditService(service)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
                                                <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                         {/* MODO DE CRIAÇÃO (Novo Serviço) */}
                         {editingServiceId === 'new' && (
                             <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-dashed border-brand-300 animate-fade-in">
                                 <h4 className="font-bold text-brand-800 mb-4 flex items-center gap-2"><Plus size={18}/> Adicionar Novo Serviço</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                     <div className="md:col-span-2">
                                         <label className={labelClass}>Título</label>
                                         <input className={inputClass} value={tempService.title || ''} onChange={(e) => setTempService({...tempService, title: e.target.value})} placeholder="Ex: Reflexologia" autoFocus />
                                     </div>
                                     <div>
                                         <label className={labelClass}>Duração (min)</label>
                                         <input className={inputClass} type="number" value={tempService.duration || 60} onChange={(e) => setTempService({...tempService, duration: Number(e.target.value)})} placeholder="60" />
                                     </div>
                                 </div>
                                 <div className="mb-4">
                                     <label className={labelClass}>Descrição</label>
                                     <textarea className={inputClass} value={tempService.description || ''} onChange={(e) => setTempService({...tempService, description: e.target.value})} placeholder="Descreva os benefícios..." rows={3} />
                                 </div>
                                 <div className="mb-6">
                                     <label className={labelClass}>Imagem</label>
                                     <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-brand-700 hover:file:bg-brand-50" />
                                 </div>
                                 <div className="flex justify-end gap-3">
                                     <button onClick={handleCancelEditService} className="px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                                     <button onClick={handleSaveService} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm">Criar Serviço</button>
                                 </div>
                             </div>
                         )}
                     </div>
                )}

                {activeTab === 'depoimentos' && (
                     <div className={cardClass}>
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h3 className="text-lg font-bold leading-6 text-slate-900">Gerenciar Depoimentos</h3>
                            <button onClick={handleAddNewTestimonial} className="flex items-center gap-2 text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-semibold"><Plus size={16} /> Novo</button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {content.testimonials.map((t) => (
                                <div key={t.id} className={`border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors ${editingTestimonialId === t.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                                    {editingTestimonialId === t.id ? (
                                         <div className="w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className={labelClass}>Nome</label>
                                                    <input className={inputClass} value={tempTestimonial.name || ''} onChange={(e) => setTempTestimonial({...tempTestimonial, name: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Função (Opcional)</label>
                                                    <input className={inputClass} value={tempTestimonial.role || ''} onChange={(e) => setTempTestimonial({...tempTestimonial, role: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className={labelClass}>Depoimento</label>
                                                <textarea className={inputClass} value={tempTestimonial.content || ''} onChange={(e) => setTempTestimonial({...tempTestimonial, content: e.target.value})} rows={3} />
                                            </div>
                                            <div className="mb-4">
                                                <label className={labelClass}>Foto</label>
                                                <input type="file" accept="image/*" onChange={handleTestimonialImageUpload} className="text-sm" />
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                 <button onClick={() => { setEditingTestimonialId(null); setTempTestimonial({}); }} className="px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
                                                 <button onClick={handleSaveTestimonial} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Salvar</button>
                                            </div>
                                         </div>
                                    ) : (
                                        <>
                                             <div className="flex items-center gap-4 w-full">
                                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-100" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900">{t.name}</p>
                                                    <p className="text-xs text-gray-500 italic mb-1">"{t.content}"</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditTestimonial(t)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                                                <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {editingTestimonialId === 'new' && (
                             <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-dashed border-brand-300 animate-fade-in">
                                 <h4 className="font-bold text-brand-800 mb-4 flex items-center gap-2"><Plus size={18}/> Adicionar Depoimento</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <div>
                                         <label className={labelClass}>Nome</label>
                                         <input className={inputClass} value={tempTestimonial.name || ''} onChange={(e) => setTempTestimonial({...tempTestimonial, name: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className={labelClass}>Função (Opcional)</label>
                                         <input className={inputClass} value={tempTestimonial.role || ''} onChange={(e) => setTempTestimonial({...tempTestimonial, role: e.target.value})} />
                                     </div>
                                 </div>
                                 <div className="mb-4">
                                     <label className={labelClass}>Conteúdo</label>
                                     <textarea className={inputClass} value={tempTestimonial.content || ''} onChange={(e) => setTempTestimonial({...tempTestimonial, content: e.target.value})} rows={3} />
                                 </div>
                                 <div className="mb-6">
                                     <label className={labelClass}>Foto</label>
                                     <input type="file" accept="image/*" onChange={handleTestimonialImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-brand-700 hover:file:bg-brand-50" />
                                 </div>
                                 <div className="flex justify-end gap-3">
                                     <button onClick={() => { setEditingTestimonialId(null); setTempTestimonial({}); }} className="px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                                     <button onClick={handleSaveTestimonial} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm">Salvar Depoimento</button>
                                 </div>
                             </div>
                        )}
                     </div>
                )}

                {activeTab === 'aparencia' && (
                    <div className={cardClass}>
                         <h3 className={headerClass}>Aparência do Site</h3>
                         
                         <div className="mb-8">
                            <label className={labelClass}>Cor Principal da Marca</label>
                            <div className="flex items-center gap-4">
                                <input type="color" name="themeColor" value={content.themeColor} onChange={handleInputChange} className="h-12 w-24 p-1 border border-gray-300 rounded cursor-pointer shadow-sm" />
                                <span className="text-sm text-gray-500">Clique na cor para alterar toda a identidade visual do site.</span>
                            </div>
                         </div>

                         <div className="border-t pt-6 mb-8">
                            <label className={labelClass}>Imagem do Topo (Hero)</label>
                            <div className="mt-2 flex items-center gap-6">
                                {content.heroImage && (
                                    <img src={content.heroImage} alt="Hero Preview" className="h-32 w-48 object-cover rounded-lg shadow-sm border border-gray-200" />
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleGlobalImageUpload(e, 'heroImage')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"/>
                            </div>
                         </div>

                         <div className="border-t pt-6">
                            <label className={labelClass}>Imagem da Seção "Sobre"</label>
                            <div className="mt-2 flex items-center gap-6">
                                {content.aboutImage && (
                                    <img src={content.aboutImage} alt="About Preview" className="h-32 w-48 object-cover rounded-lg shadow-sm border border-gray-200" />
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleGlobalImageUpload(e, 'aboutImage')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"/>
                            </div>
                         </div>
                    </div>
                )}

                {activeTab === 'contato' && (
                    <div className={cardClass}>
                         <h3 className={headerClass}>Informações de Contato</h3>
                         <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Telefone Principal</label>
                                <input type="text" name="phone" value={content.phone} onChange={handleInputChange} className={inputClass} placeholder="(99) 99999-9999" />
                            </div>
                            <div>
                                <label className={labelClass}>WhatsApp (Somente números)</label>
                                <input type="text" name="whatsappNumber" value={content.whatsappNumber} onChange={handleInputChange} className={inputClass} placeholder="559999999999" />
                                <p className="text-xs text-gray-500 mt-1">Usado para gerar o link direto de agendamento.</p>
                            </div>
                            <div>
                                <label className={labelClass}>Endereço Completo</label>
                                <input type="text" name="address" value={content.address} onChange={handleInputChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>E-mail de Contato</label>
                                <input type="email" name="email" value={content.email} onChange={handleInputChange} className={inputClass} />
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      {/* ... (Modal logic remains same) ... */}
      {selectedAppointment && (
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                      <h3 className="text-xl font-bold text-gray-800">Detalhes do Agendamento</h3>
                      <button onClick={() => setSelectedAppointment(null)}><X size={24} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-sm text-gray-500">Cliente</p><p className="font-semibold">{selectedAppointment.customerName}</p></div>
                          <div><p className="text-sm text-gray-500">Telefone</p><p className="font-semibold">{selectedAppointment.phone}</p></div>
                          <div><p className="text-sm text-gray-500">Data</p><p className="font-semibold">{selectedAppointment.date}</p></div>
                          <div><p className="text-sm text-gray-500">Horário</p><p className="font-semibold">{selectedAppointment.time}</p></div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                          <p className="text-sm text-gray-500 font-bold mb-1">Observações do Cliente:</p>
                          <p className="text-gray-700 italic">{selectedAppointment.notes || 'Nenhuma observação.'}</p>
                      </div>
                  </div>
              </div>
          </div>
       )}
    </div>
  );
};

export default Admin;