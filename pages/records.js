import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Records() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [anamnese, setAnamnese] = useState({ diabetes: false, alergias: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) console.error(error);
    else setRecords(data);
  }

  async function handleAddRecord(e) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Salvando estrutura JSONB
    const contentData = {
      tipo: 'Anamnese Inicial',
      diabetes: anamnese.diabetes,
      alergias: anamnese.alergias
    };

    const { error } = await supabase
      .from('medical_records')
      .insert([{
        user_id: user.id,
        content: contentData,
        doctor_notes: 'Auto-declaração do paciente'
      }]);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      setAnamnese({ diabetes: false, alergias: '' });
      fetchRecords();
    }
    setLoading(false);
  }

  return (
    <div className="container">
      <nav className="nav">
        <Link href="/profile">Meu Perfil</Link>
        <Link href="/appointments">Agendamentos</Link>
        <Link href="/records">Prontuários</Link>
      </nav>

      <div className="card">
        <h2>Adicionar Ficha de Saúde</h2>
        <form onSubmit={handleAddRecord}>
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox"
              id="diabetes"
              style={{ width: 'auto' }}
              checked={anamnese.diabetes}
              onChange={e => setAnamnese({...anamnese, diabetes: e.target.checked})}
            />
            <label htmlFor="diabetes">Tenho Diabetes</label>
          </div>
          <div className="input-group">
            <label>Alergias</label>
            <input 
              type="text"
              placeholder="Ex: Iodo, Dipirona..."
              value={anamnese.alergias}
              onChange={e => setAnamnese({...anamnese, alergias: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading}>Salvar Ficha</button>
        </form>
      </div>

      <h2>Histórico de Prontuários</h2>
      {records.length === 0 ? <p>Nenhum registro.</p> : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {records.map(rec => (
            <div key={rec.id} className="card">
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                Atualizado em: {new Date(rec.updated_at).toLocaleDateString()}
              </p>
              <h4>Detalhes:</h4>
              <ul>
                <li><strong>Diabetes:</strong> {rec.content.diabetes ? 'Sim' : 'Não'}</li>
                <li><strong>Alergias:</strong> {rec.content.alergias || 'Nenhuma'}</li>
              </ul>
              <p><em>Nota do Sistema: {rec.doctor_notes}</em></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}