
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { SiteContent, ServiceItem, Appointment, User, MedicalRecord, Testimonial } from '../types';
import { initSupabase, getSupabase, checkConnection } from '../services/supabaseClient';

// Helper to safely get env vars (works in Vite, CRA, Next.js client-side)
const getEnv = (key: string, altKey?: string, altKey2?: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env[key]) return import.meta.env[key];
    // @ts-ignore
    if (altKey && import.meta.env[altKey]) return import.meta.env[altKey];
    // @ts-ignore
    if (altKey2 && import.meta.env[altKey2]) return import.meta.env[altKey2];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    if (process.env[key]) return process.env[key];
    // @ts-ignore
    if (altKey && process.env[altKey]) return process.env[altKey];
    // @ts-ignore
    if (altKey2 && process.env[altKey2]) return process.env[altKey2];
  }
  return '';
};

// Helper to generate shades
function generateShades(hexColor: string) {
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 4) {
    r = parseInt("0x" + hexColor[1] + hexColor[1]);
    g = parseInt("0x" + hexColor[2] + hexColor[2]);
    b = parseInt("0x" + hexColor[3] + hexColor[3]);
  } else if (hexColor.length === 7) {
    r = parseInt("0x" + hexColor[1] + hexColor[2]);
    g = parseInt("0x" + hexColor[3] + hexColor[4]);
    b = parseInt("0x" + hexColor[5] + hexColor[6]);
  }

  const shade = (p: number) => {
    const t = p < 0 ? 0 : 255;
    const P = p < 0 ? p * -1 : p;
    const R = Math.round((t - r) * P) + r;
    const G = Math.round((t - g) * P) + g;
    const B = Math.round((t - b) * P) + b;
    return `rgb(${R}, ${G}, ${B})`;
  };

  return {
    50: shade(0.95),
    100: shade(0.9),
    200: shade(0.8),
    300: shade(0.6),
    400: shade(0.4),
    500: `rgb(${r},${g},${b})`, // Base
    600: shade(-0.1),
    700: shade(-0.3),
    800: shade(-0.5),
    900: shade(-0.7),
  };
}

const defaultServices: ServiceItem[] = [
  {
    id: '1',
    title: 'Podologia Clínica',
    description: 'Tratamento especializado para unhas encravadas, calosidades, verrugas plantares e fissuras. Procedimentos seguros e esterilizados.',
    image: 'https://picsum.photos/id/65/400/300',
    duration: 60
  },
  {
    id: '2',
    title: 'Reflexologia Podal',
    description: 'Massagem terapêutica que estimula pontos específicos nos pés para aliviar tensões e promover o equilíbrio do corpo todo.',
    image: 'https://picsum.photos/id/1005/400/300',
    duration: 45
  },
  {
    id: '3',
    title: 'Spa dos Pés',
    description: 'Ritual completo de relaxamento com esfoliação, hidratação profunda com parafina e massagem relaxante.',
    image: 'https://picsum.photos/id/1025/400/300',
    duration: 90
  },
  {
    id: '4',
    title: 'Pés Diabéticos',
    description: 'Cuidado preventivo e tratamento especial para portadores de diabetes, focando na integridade da pele e prevenção de lesões.',
    image: 'https://picsum.photos/id/1084/400/300',
    duration: 60
  }
];

const defaultTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Maria Silva',
      role: 'Professora',
      content: 'Cheguei com muita dor devido a uma unha encravada. O atendimento foi impecável e sai de lá pisando nas nuvens!',
      image: 'https://picsum.photos/id/64/100/100'
    },
    {
      id: '2',
      name: 'Roberto Santos',
      role: 'Maratonista',
      content: 'Como corredor, meus pés sofrem muito. A reflexologia do estúdio Sara Fontenele é essencial para minha recuperação pós-prova.',
      image: 'https://picsum.photos/id/91/100/100'
    },
    {
      id: '3',
      name: 'Ana Costa',
      role: 'Empresária',
      content: 'O Spa dos Pés é meu momento favorito do mês. Ambiente super relaxante e profissionais muito educados.',
      image: 'https://picsum.photos/id/129/100/100'
    }
];

// Initialize with Environment Variables if available (Vercel/Vite support)
const defaultContent: SiteContent = {
  companyName: 'Sara Fontenele',
  address: 'Rua José Bonifácio, Centro, São Domingos do Maranhão',
  phone: '(99) 99999-8888',
  whatsappNumber: '5599999998888',
  email: 'contato@sarafontenele.com.br',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
  heroTitle: 'Saúde e leveza para os seus passos',
  heroSubtitle: 'Especialistas em podologia clínica e terapias relaxantes. Recupere o conforto e a beleza dos seus pés com tratamentos modernos e atendimento humanizado.',
  heroButtonText: 'Agendar Avaliação',
  heroNotificationText: 'Novidade: Laserterapia disponível',
  heroImage: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=1200&auto=format&fit=crop',
  aboutImage: 'https://picsum.photos/id/447/600/800',
  themeColor: '#db2777', 
  services: defaultServices,
  testimonials: defaultTestimonials,
  openingHoursText: 'Segunda a Sexta: 08h às 18h\nSábado: 08h às 12h',
  schedulingConfig: {
    startHour: '08:00',
    endHour: '18:00',
    breakStartHour: '12:00', 
    breakEndHour: '14:00',   
    intervalMinutes: 60,
    workingDays: [1, 2, 3, 4, 5, 6], 
    blockedDates: []
  },
  supabaseUrl: getEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'REACT_APP_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'REACT_APP_SUPABASE_ANON_KEY')
};

const defaultUser: User = {
  id: 'admin-master',
  name: 'Sara Fontenele',
  email: 'admin@sara.com',
  password: '123',
  role: 'admin'
};

interface SiteContextType {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => Promise<void>;
  resetContent: () => void;
  forceSaveSettings: () => Promise<boolean>;
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
  medicalRecords: MedicalRecord[];
  saveMedicalRecord: (record: MedicalRecord) => Promise<void>;
  verifyLogin: (email: string, pass: string) => User | null;
  registerUser: (name: string, email: string, pass: string) => Promise<boolean>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserRole: (id: string) => Promise<void>;
  resetUserPassword: (email: string, newPass: string) => Promise<boolean>;
  updateUser: (user: Partial<User>) => Promise<void>;
  users: User[]; 
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isSupabaseConnected: boolean;
  connectionError: string | null;
  hasEnvVars: boolean;
  forceReconnect: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const hasEnvVars = !!(defaultContent.supabaseUrl && defaultContent.supabaseAnonKey);

  // Apply colors
  useEffect(() => {
    const shades = generateShades(content.themeColor);
    const root = document.documentElement;
    Object.entries(shades).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });
  }, [content.themeColor]);

  // INITIALIZATION: STRICTLY SUPABASE
  useEffect(() => {
    const init = async () => {
        // We use defaultContent as a base structure, but we DO NOT load from LocalStorage.
        // We strictly look for Env Vars or defaults.
        
        let url = defaultContent.supabaseUrl;
        let key = defaultContent.supabaseAnonKey;

        if (url && key) {
            const sb = initSupabase(url, key);
            if (sb) {
                const check = await checkConnection();
                if (check.success) {
                    setIsSupabaseConnected(true);
                    setConnectionError(null);
                    await fetchAndSeedSupabaseData(); // Load or Seed if empty
                } else {
                    setIsSupabaseConnected(false);
                    setConnectionError(check.message || "Falha na conexão.");
                }
            } else {
                setConnectionError("URL ou Chave do Supabase inválida.");
            }
        } else {
            setConnectionError("Credenciais não configuradas. O site não salvará dados.");
        }
    };

    init();
  }, []);

  const forceReconnect = async () => {
      setConnectionError(null);
      setIsSupabaseConnected(false);
      
      const url = content.supabaseUrl;
      const key = content.supabaseAnonKey;

      if (!url || !key) {
          setConnectionError("Insira URL e Chave.");
          return;
      }

      const sb = initSupabase(url, key);
      if (sb) {
          const check = await checkConnection();
          if (check.success) {
              setIsSupabaseConnected(true);
              setConnectionError(null);
              await fetchAndSeedSupabaseData();
          } else {
              setConnectionError(check.message || "Falha ao conectar.");
          }
      } else {
          setConnectionError("URL inválida.");
      }
  };

  const fetchAndSeedSupabaseData = async () => {
    const sb = getSupabase();
    if (!sb) return;

    try {
        console.log("Fetching data from Supabase...");
        
        // 1. Settings
        const { data: settings } = await sb.from('site_settings').select('content').order('id', { ascending: false }).limit(1);
        if (settings && settings.length > 0 && settings[0].content) {
            setContent(prev => ({ 
                ...prev,
                ...settings[0].content, 
                // Ensure Env Vars take precedence for connection fields
                supabaseUrl: prev.supabaseUrl, 
                supabaseAnonKey: prev.supabaseAnonKey
            }));
        } else {
            // SEED SETTINGS if empty
            console.log("Seeding default settings to Supabase...");
            await sb.from('site_settings').insert([{ content: defaultContent }]);
        }

        // 2. Appointments
        const { data: appts } = await sb.from('appointments').select('data');
        if (appts) setAppointments(appts.map((row: any) => row.data));

        // 3. Medical Records
        const { data: records } = await sb.from('medical_records').select('data');
        if (records) setMedicalRecords(records.map((row: any) => row.data));

        // 4. Users
        const { data: dbUsers } = await sb.from('app_users').select('data');
        if (dbUsers && dbUsers.length > 0) {
            setUsers(dbUsers.map((row: any) => row.data));
        } else {
             // SEED ADMIN USER if empty
             console.log("Seeding default admin to Supabase...");
             setUsers([defaultUser]);
             await sb.from('app_users').insert([{ id: defaultUser.id, data: defaultUser }]);
        }

    } catch (error) {
        console.error("Error handling data from Supabase", error);
    }
  };

  // --- CRUD OPERATIONS (SUPABASE ONLY) ---

  const updateContent = async (newContent: Partial<SiteContent>) => {
    const sb = getSupabase();
    if (sb && isSupabaseConnected) {
        const fullContent = { ...content, ...newContent };
        const { error } = await sb.from('site_settings').insert([{ content: fullContent }]);
        if (error) {
            alert('Erro ao salvar no Supabase. Verifique sua conexão.');
            console.error(error);
        } else {
             // Only update local state if DB save was successful
            setContent(prev => ({ ...prev, ...newContent }));
        }
    } else {
        alert("Modo offline: Alterações não serão salvas permanentemente.");
        // We still update local state for demo purposes in offline mode
        setContent(prev => ({ ...prev, ...newContent }));
    }
  };

  const forceSaveSettings = async (): Promise<boolean> => {
      const sb = getSupabase();
      if (sb && isSupabaseConnected) {
          const { error } = await sb.from('site_settings').insert([{ content: content }]);
          if (error) {
              console.error(error);
              return false;
          }
          return true;
      }
      return false;
  };

  const resetContent = () => {
     updateContent(defaultContent);
  };

  const addAppointment = async (apptData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newAppointment: Appointment = {
      ...apptData,
      id: Date.now().toString(),
      userId: currentUser ? currentUser.id : undefined,
      createdAt: Date.now(),
      status: 'pending'
    };
    
    const sb = getSupabase();
    if (sb && isSupabaseConnected) {
        const { error } = await sb.from('appointments').insert([{ id: newAppointment.id, data: newAppointment }]);
        if (error) {
             console.error(error);
             alert('Erro ao salvar agendamento no banco de dados.');
        } else {
            // Update local state only after success
            setAppointments(prev => [newAppointment, ...prev]);
        }
    } else {
         alert("Não foi possível conectar ao banco de dados.");
    }
  };

  const removeAppointment = async (id: string) => {
    const sb = getSupabase();
    if (sb && isSupabaseConnected) {
        const { error } = await sb.from('appointments').delete().eq('id', id);
        if (!error) {
            setAppointments(prev => prev.filter(a => a.id !== id));
        }
    }
  };

  const saveMedicalRecord = async (record: MedicalRecord) => {
      const sb = getSupabase();
      if (sb && isSupabaseConnected) {
          const { error } = await sb.from('medical_records').upsert([{ id: record.id, data: record }]);
          if (!error) {
             setMedicalRecords(prev => {
                const exists = prev.findIndex(r => r.id === record.id);
                let updated;
                if (exists !== -1) {
                    updated = [...prev];
                    updated[exists] = record;
                } else {
                    updated = [record, ...prev];
                }
                return updated;
            });
          }
      }
  };

  const verifyLogin = (email: string, pass: string): User | null => {
    // Master Key Fallback (Always allows entry even if DB is down)
    if (email === 'admin@sara.com' && pass === '123') {
        return {
            id: 'admin-master',
            name: 'Sara Fontenele',
            email: 'admin@sara.com',
            password: '123',
            role: 'admin'
        };
    }

    // Login verifies against loaded state (which came from DB)
    const user = users.find(u => u.email === email && u.password === pass);
    return user || null;
  };

  const registerUser = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (users.some(u => u.email === email)) return false; 

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: pass,
      role: 'client'
    };

    const sb = getSupabase();
    if (sb && isSupabaseConnected) {
        const { error } = await sb.from('app_users').insert([{ id: newUser.id, data: newUser }]);
        if (!error) {
            setUsers(prev => [...prev, newUser]);
            return true;
        }
    }
    return false;
  };

  const resetUserPassword = async (email: string, newPass: string): Promise<boolean> => {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return false;

    const updatedUser = { ...users[userIndex], password: newPass };

    const sb = getSupabase();
    if (sb && isSupabaseConnected) {
        const { error } = await sb.from('app_users').upsert([{ id: updatedUser.id, data: updatedUser }]);
        if (!error) {
            setUsers(prev => {
                const updated = [...prev];
                updated[userIndex] = updatedUser;
                return updated;
            });
            return true;
        }
    }
    return false;
  };

  const deleteUser = async (id: string) => {
      if (id === 'admin-master' || id === currentUser?.id) {
          alert("Não é possível excluir este usuário.");
          return;
      }

      const sb = getSupabase();
      if (sb && isSupabaseConnected) {
          const { error } = await sb.from('app_users').delete().eq('id', id);
          if (!error) {
              setUsers(prev => prev.filter(u => u.id !== id));
          }
      }
  };

  const toggleUserRole = async (id: string) => {
      if (id === 'admin-master') return;

      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) return;

      const user = users[userIndex];
      const newRole: 'admin' | 'client' = user.role === 'admin' ? 'client' : 'admin';
      const updatedUser: User = { ...user, role: newRole };

      const sb = getSupabase();
      if (sb && isSupabaseConnected) {
          const { error } = await sb.from('app_users').upsert([{ id: updatedUser.id, data: updatedUser }]);
          if (!error) {
              setUsers(prev => {
                  const updated = [...prev];
                  updated[userIndex] = updatedUser;
                  return updated;
              });
          }
      }
  };

  const updateUser = async (updatedData: Partial<User>) => {
      if (!currentUser) return;
      
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) return;

      const updatedUser = { ...users[userIndex], ...updatedData };
      
      const sb = getSupabase();
      if (sb && isSupabaseConnected) {
          const { error } = await sb.from('app_users').upsert([{ id: updatedUser.id, data: updatedUser }]);
          if (!error) {
             setCurrentUser(updatedUser as User);
             setUsers(prev => {
                  const updated = [...prev];
                  updated[userIndex] = updatedUser as User;
                  return updated;
              });
          }
      }
  };

  return (
    <SiteContext.Provider value={{ 
      content, 
      updateContent, 
      resetContent,
      forceSaveSettings,
      appointments,
      addAppointment,
      removeAppointment,
      medicalRecords,
      saveMedicalRecord,
      verifyLogin,
      registerUser,
      deleteUser,
      toggleUserRole,
      resetUserPassword,
      updateUser,
      users,
      currentUser,
      setCurrentUser,
      isSupabaseConnected,
      connectionError,
      hasEnvVars,
      forceReconnect
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteProvider');
  }
  return context;
};
