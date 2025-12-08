import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      // Buscar dados da tabela app_users
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);

      // Buscar última imagem
      const { data: imgData } = await supabase
        .from('user_images')
        .select('image_url')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();
      
      if (imgData) setImageUrl(imgData.image_url);

    } catch (error) {
      console.error('Erro ao carregar perfil:', error.message);
    }
  }

  async function uploadImage(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecione uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Salvar referência no Banco
      const { error: dbError } = await supabase
        .from('user_images')
        .insert([{ user_id: user.id, image_url: publicUrl }]);

      if (dbError) throw dbError;

      setImageUrl(publicUrl);
      alert('Imagem atualizada com sucesso!');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (!profile) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <nav className="nav">
        <Link href="/profile">Meu Perfil</Link>
        <Link href="/appointments">Agendamentos</Link>
        <Link href="/records">Prontuários</Link>
        <button onClick={signOut} className="secondary" style={{ marginLeft: 'auto' }}>Sair</button>
      </nav>

      <div className="card">
        <h2>Meu Perfil</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
          <div>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Avatar" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Sem Foto
              </div>
            )}
          </div>
          <div>
            <h3>{profile.full_name}</h3>
            <p>{profile.email}</p>
            <label className="button primary" style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
              {uploading ? 'Enviando...' : 'Alterar Foto'}
              <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}