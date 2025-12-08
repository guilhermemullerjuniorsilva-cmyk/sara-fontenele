import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ service_name: '', date_time: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('date_time', { ascending: true });

    if (error) console.error('Erro ao buscar agendamentos:', error);
    else setAppointments(data);
  }

  async function handleAddAppointment(e) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('appointments')
      .insert([{
        user_id: user.id,
        service_name: formData.service_name,
        date_time: formData.date_time,
        notes: formData.notes
      }]);

    if (error) {
      alert('Erro ao agendar: ' + error.message);
    } else {
      setFormData({ service_name: '', date_time: '', notes: '' });
      fetchAppointments();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) alert('Erro ao deletar');
    else fetchAppointments();
  }

  return (
    <div className="container">
      <nav className="nav">
        <Link href="/profile">Meu Perfil</Link>
        <Link href="/appointments">Agendamentos</Link>
        <Link href="/records">Prontuários</Link>
      </nav>

      <div className="card">
        <h2>Novo Agendamento</h2>
        <form onSubmit={handleAddAppointment}>
          <div className="input-group">
            <label>Serviço</label>
            <select 
              value={formData.service_name}
              onChange={e => setFormData({...formData, service_name: e.target.value})}
              required
            >
              <option value="">Selecione...</option>
              <option value="Podologia Clínica">Podologia Clínica</option>
              <option value="Reflexologia">Reflexologia</option>
              <option value="Spa dos Pés">Spa dos Pés</option>
            </select>
          </div>
          <div className="input-group">
            <label>Data e Hora</label>
            <input 
              type="datetime-local"
              value={formData.date_time}
              onChange={e => setFormData({...formData, date_time: e.target.value})}
              required
            />
          </div>
          <div className="input-group">
            <label>Observações</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Agendar'}
          </button>
        </form>
      </div>

      <h2>Meus Agendamentos</h2>
      {appointments.length === 0 ? <p>Nenhum agendamento encontrado.</p> : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {appointments.map(appt => (
            <div key={appt.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{appt.service_name}</h3>
                <p>📅 {new Date(appt.date_time).toLocaleString()}</p>
                <p>📝 {appt.notes || 'Sem observações'}</p>
                <span style={{ 
                  background: appt.status === 'pending' ? '#fef3c7' : '#dcfce7', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem' 
                }}>
                  {appt.status}
                </span>
              </div>
              <button className="secondary" onClick={() => handleDelete(appt.id)}>Cancelar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}