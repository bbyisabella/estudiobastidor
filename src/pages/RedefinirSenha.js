import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function RedefinirSenha() {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // pronto para redefinir
      }
    });
  }, []);

  async function handleRedefinir(e) {
    e.preventDefault();
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) {
      setErro('Erro ao redefinir senha. Tente novamente.');
    } else {
      setSucesso(true);
      setTimeout(() => navigate('/'), 2000);
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>ESTÚDIO</p>
        <h1 style={styles.logo}>BASTIDØR</h1>
        <p style={styles.sub}>Redefinir senha</p>

        {sucesso ? (
          <p style={styles.sucesso}>Senha redefinida com sucesso! Redirecionando...</p>
        ) : (
          <form onSubmit={handleRedefinir}>
            <div style={styles.field}>
              <label style={styles.label}>NOVA SENHA</label>
              <input
                style={styles.input}
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>CONFIRMAR SENHA</label>
              <input
                style={styles.input}
                type="password"
                value={confirmacao}
                onChange={e => setConfirmacao(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {erro && <p style={styles.erro}>{erro}</p>}
            <button style={styles.btn} type="submit" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: '100vh', background: '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#111111', borderRadius: 4, padding: '48px 44px', width: '100%', maxWidth: 380 },
  eyebrow: { fontSize: 10, letterSpacing: '0.2em', color: '#888', margin: '0 0 4px', fontFamily: 'Arial, sans-serif' },
  logo: { fontSize: 32, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px', fontFamily: 'Arial, sans-serif', letterSpacing: '0.08em' },
  sub: { fontSize: 12, color: '#666', margin: '0 0 36px', fontFamily: 'Arial, sans-serif' },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 10, color: '#888', marginBottom: 6, letterSpacing: '0.12em', fontFamily: 'Arial, sans-serif' },
  input: { width: '100%', fontSize: 13, padding: '11px 14px', borderRadius: 2, border: '1px solid #2A2A2A', background: '#1A1A1A', color: '#FFF', outline: 'none', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' },
  erro: { fontSize: 12, color: '#CC1111', margin: '0 0 14px', fontFamily: 'Arial, sans-serif' },
  sucesso: { fontSize: 13, color: '#10B981', fontFamily: 'Arial, sans-serif' },
  btn: { width: '100%', padding: '12px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', background: '#CC1111', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: 'Arial, sans-serif', marginTop: 8 },
};