
import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../contexts/SiteContext';
import { X, User, Phone, Save, Calendar, Activity, FileHeart, ChevronRight, LogOut } from 'lucide-react';
import { MedicalRecord } from '../types';

interface ClientProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, updateUser, appointments, medicalRecords, saveMedicalRecord } = useSiteContent();
  const [activeTab, setActiveTab] = useState<'appointments' | 'health' | 'profile'>('appointments');
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '' });
  
  // Health Data State
  const [myRecord, setMyRecord] = useState<MedicalRecord | null>(null);

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setUserForm({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '',
          password: currentUser.password
      });

      // Find existing medical record linked to this user
      const foundRecord = medicalRecords.find(r => r.userId === currentUser.id || r.patientPhone === currentUser.phone);
      if (foundRecord) {
          setMyRecord(foundRecord);
      } else {
          // Create a blank draft record
          setMyRecord({
              id: `self-${Date.now()}`,
              userId: currentUser.id,
              patientName: currentUser.name,
              patientPhone: currentUser.phone || '',
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
                mainComplaint: '',
                footType: 'G',
                skinTexture: '',
                nailCharacteristics: '',
                lesions: ''
              },
              procedureNotes: '',
              homeCareRecommendations: '',
              lastUpdate: Date.now()
          });
      }
    }
  }, [isOpen, currentUser, medicalRecords]);

  if (!isOpen || !currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateUser(userForm);
      alert('Dados atualizados com sucesso!');
  };

  const handleSaveHealthData = async () => {
      if (myRecord) {
          await saveMedicalRecord(myRecord);
          alert('Ficha de saúde salva! Nosso especialista terá acesso a essas informações na sua consulta.');
      }
  };

  const updateHealthField = (section: 'anamnesis', field: string, value: any) => {
      if (!myRecord) return;
      setMyRecord({
          ...myRecord,
          [section]: {
              ...myRecord[section],
              [field]: value
          }
      });
  };

  // Filter appointments for this user
  const myAppointments = appointments.filter(a => a.userId === currentUser.id || a.phone === currentUser.phone);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-brand-50 border-r border-brand-100 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-brand-200 p-2 rounded-full">
                    <User className="text-brand-700" size={24} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 leading-tight">{currentUser.name.split(' ')[0]}</h2>
                    <p className="text-xs text-brand-600">Área do Cliente</p>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                <button 
                    onClick={() => setActiveTab('appointments')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'appointments' ? 'bg-white shadow-sm text-brand-600 font-semibold' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    <div className="flex items-center gap-3"><Calendar size={18} /> Agendamentos</div>
                    {activeTab === 'appointments' && <ChevronRight size={16} />}
                </button>
                <button 
                    onClick={() => setActiveTab('health')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'health' ? 'bg-white shadow-sm text-brand-600 font-semibold' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    <div className="flex items-center gap-3"><FileHeart size={18} /> Minha Saúde</div>
                    {activeTab === 'health' && <ChevronRight size={16} />}
                </button>
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-brand-600 font-semibold' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    <div className="flex items-center gap-3"><User size={18} /> Meus Dados</div>
                    {activeTab === 'profile' && <ChevronRight size={16} />}
                </button>
            </nav>

            <button 
                onClick={() => { setCurrentUser(null); onClose(); }}
                className="mt-auto flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors px-4 py-2"
            >
                <LogOut size={18} /> Sair
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
                <X size={24} />
            </button>

            {activeTab === 'appointments' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-2xl font-serif font-bold text-slate-800">Meus Agendamentos</h3>
                    <p className="text-slate-500">Acompanhe seu histórico de visitas e próximos horários.</p>

                    {myAppointments.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500">Você ainda não tem agendamentos registrados.</p>
                            <button onClick={onClose} className="mt-4 text-brand-600 font-medium hover:underline">Agendar agora</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myAppointments.map(appt => (
                                <div key={appt.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="font-bold text-lg text-slate-800">{appt.service}</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <Calendar size={14} /> {appt.date} às {appt.time}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                          appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {appt.status === 'pending' && 'Pendente'}
                                        {appt.status === 'confirmed' && 'Confirmado'}
                                        {appt.status === 'cancelled' && 'Cancelado'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'health' && myRecord && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-2xl font-serif font-bold text-slate-800">Ficha de Saúde</h3>
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm border border-blue-100 flex items-start gap-3">
                        <Activity className="flex-shrink-0 mt-0.5" size={18} />
                        <div>
                            <strong>Por que preencher?</strong> Informar suas condições de saúde ajuda nossos especialistas a planejar o tratamento mais seguro e eficaz para seus pés antes mesmo da consulta.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-700 border-b pb-2">Condições Gerais</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.diabetes} onChange={(e) => updateHealthField('anamnesis', 'diabetes', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Diabetes</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.hypertension} onChange={(e) => updateHealthField('anamnesis', 'hypertension', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Hipertensão</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.circulatoryProblems} onChange={(e) => updateHealthField('anamnesis', 'circulatoryProblems', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Prob. Circulatórios</span>
                            </label>
                             <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.anticoagulants} onChange={(e) => updateHealthField('anamnesis', 'anticoagulants', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Uso Anticoagulantes</span>
                            </label>
                             <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.pacemaker} onChange={(e) => updateHealthField('anamnesis', 'pacemaker', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Uso Marcapasso</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.smoker} onChange={(e) => updateHealthField('anamnesis', 'smoker', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Tabagismo</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.pregnant} onChange={(e) => updateHealthField('anamnesis', 'pregnant', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Gestante</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.psoriasis} onChange={(e) => updateHealthField('anamnesis', 'psoriasis', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Psoríase</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.osteoporosis} onChange={(e) => updateHealthField('anamnesis', 'osteoporosis', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Osteoporose</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.renalProblems} onChange={(e) => updateHealthField('anamnesis', 'renalProblems', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Prob. Renais</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" checked={myRecord.anamnesis.epilepsy} onChange={(e) => updateHealthField('anamnesis', 'epilepsy', e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"/> <span className="text-slate-700">Epilepsia</span>
                            </label>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alergias (Medicamentos, látex, iodo...)</label>
                            <input 
                                type="text" 
                                value={myRecord.anamnesis.allergies}
                                onChange={(e) => updateHealthField('anamnesis', 'allergies', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Liste suas alergias..."
                            />
                        </div>
                         <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Medicamentos de uso contínuo</label>
                            <input 
                                type="text" 
                                value={myRecord.anamnesis.medications}
                                onChange={(e) => updateHealthField('anamnesis', 'medications', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Liste seus medicamentos..."
                            />
                        </div>

                        <button 
                            onClick={handleSaveHealthData}
                            className="mt-6 w-full md:w-auto bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Salvar Informações de Saúde
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                     <h3 className="text-2xl font-serif font-bold text-slate-800">Meus Dados</h3>
                     <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={userForm.phone}
                                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                    placeholder="(99) 99999-9999"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Senha (Deixe em branco para manter)</label>
                            <input 
                                type="password" 
                                value={userForm.password}
                                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                        >
                            Atualizar Dados
                        </button>
                     </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
