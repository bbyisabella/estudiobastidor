import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleEsqueci() {
    const emailDigitado = window.prompt('Digite seu e-mail para receber o link de redefinição:');
    if (emailDigitado) {
      await supabase.auth.resetPasswordForEmail(emailDigitado, {
        redirectTo: 'http://localhost:3000/redefinir-senha',
      });
      alert('E-mail enviado! Verifique sua caixa de entrada.');
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>ESTÚDIO</p>
        <h1 style={styles.logo}>BASTIDØR</h1>
        <p style={styles.sub}>Acesso restrito à equipe interna</p>

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>E-MAIL</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>SENHA</label>
            <input
              style={styles.input}
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && <p style={styles.erro}>{erro}</p>}

          <button style={styles.btn} type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <button type="button" style={styles.esqueciBtn} onClick={handleEsqueci}>
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#F2F2F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#111111',
    borderRadius: 4,
    padding: '48px 44px',
    width: '100%',
    maxWidth: 380,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: '0.2em',
    color: '#888',
    margin: '0 0 4px',
    fontFamily: 'Arial, sans-serif',
  },
  logo: {
    fontSize: 32,
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 6px',
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '0.08em',
  },
  sub: {
    fontSize: 12,
    color: '#666',
    margin: '0 0 36px',
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '0.02em',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontSize: 10,
    color: '#888',
    marginBottom: 6,
    letterSpacing: '0.12em',
    fontFamily: 'Arial, sans-serif',
  },
  input: {
    width: '100%',
    fontSize: 13,
    padding: '11px 14px',
    borderRadius: 2,
    border: '1px solid #2A2A2A',
    background: '#1A1A1A',
    color: '#FFF',
    outline: 'none',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
  erro: {
    fontSize: 12,
    color: '#CC1111',
    margin: '0 0 14px',
    fontFamily: 'Arial, sans-serif',
  },
  btn: {
    width: '100%',
    padding: '12px 0',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    background: '#CC1111',
    color: '#fff',
    border: 'none',
    borderRadius: 2,
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    marginTop: 8,
  },
  esqueciBtn: {
    width: '100%',
    padding: '10px 0',
    fontSize: 11,
    letterSpacing: '0.1em',
    background: 'none',
    color: '#666',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    marginTop: 8,
  },
};