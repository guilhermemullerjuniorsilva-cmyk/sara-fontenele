import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { verifyLogin, registerUser, resetUserPassword, setCurrentUser } = useSiteContent();
  
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simulating network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        if (view === 'login') {
            const user = verifyLogin(formData.email, formData.password);
            if (user) {
                setCurrentUser(user);
                setSuccess('Login realizado com sucesso!');
                setTimeout(() => {
                    onLoginSuccess();
                    onClose();
                }, 500);
            } else {
                setError('E-mail ou senha incorretos.');
            }
        } else if (view === 'register') {
            if (!formData.name || !formData.email || !formData.password) {
                setError('Preencha todos os campos.');
                setIsLoading(false);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('As senhas não coincidem.');
                setIsLoading(false);
                return;
            }
            if (formData.password.length < 3) {
                setError('A senha deve ter pelo menos 3 caracteres.');
                setIsLoading(false);
                return;
            }
            
            const isRegistered = await registerUser(formData.name, formData.email, formData.password);
            if (isRegistered) {
                setSuccess('Conta criada! Fazendo login...');
                // Auto login after register
                const user = verifyLogin(formData.email, formData.password);
                if (user) setCurrentUser(user);
                setTimeout(() => {
                    onLoginSuccess();
                    onClose();
                }, 1000);
            } else {
                setError('Este e-mail já está cadastrado.');
            }
        } else if (view === 'forgot') {
            if (!formData.email || !formData.password) {
                setError('Preencha o e-mail e a nova senha.');
                setIsLoading(false);
                return;
            }
            const isReset = await resetUserPassword(formData.email, formData.password);
            if (isReset) {
                setSuccess('Senha redefinida com sucesso! Faça login.');
                setTimeout(() => setView('login'), 1500);
            } else {
                setError('E-mail não encontrado.');
            }
        }
    } catch (err) {
        setError('Ocorreu um erro inesperado.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header Image/Gradient */}
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400 flex items-center justify-center relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
            <div className="text-white text-center">
                <div className="bg-white/20 p-3 rounded-full inline-block mb-2 backdrop-blur-md">
                    {view === 'login' && <LogIn size={32} />}
                    {view === 'register' && <UserPlus size={32} />}
                    {view === 'forgot' && <KeyRound size={32} />}
                </div>
                <h2 className="text-2xl font-serif font-bold">
                    {view === 'login' && 'Bem-vindo de volta'}
                    {view === 'register' && 'Criar Nova Conta'}
                    {view === 'forgot' && 'Recuperar Senha'}
                </h2>
            </div>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-fade-in">
                    <X size={16} /> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg flex items-center gap-2 animate-fade-in">
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'register' && (
                    <div className="relative group">
                        <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Nome Completo"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                )}

                <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                        type="email"
                        name="email"
                        placeholder="Seu e-mail"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                        type="password"
                        name="password"
                        placeholder={view === 'forgot' ? "Nova Senha" : "Senha"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                {view === 'register' && (
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar Senha"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            {view === 'login' && 'Entrar'}
                            {view === 'register' && 'Criar Conta'}
                            {view === 'forgot' && 'Redefinir Senha'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 text-center text-sm">
                {view === 'login' ? (
                    <>
                        <button onClick={() => setView('forgot')} className="text-slate-500 hover:text-brand-600 transition-colors">
                            Esqueceu sua senha?
                        </button>
                        <p className="text-slate-600">
                            Ainda não tem conta?{' '}
                            <button onClick={() => setView('register')} className="text-brand-600 font-bold hover:underline">
                                Cadastre-se
                            </button>
                        </p>
                    </>
                ) : (
                    <p className="text-slate-600">
                        Já tem uma conta?{' '}
                        <button onClick={() => setView('login')} className="text-brand-600 font-bold hover:underline">
                            Fazer Login
                        </button>
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;