import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabase';

const FUNCOES = ['admin', 'gestor', 'designer', 'redator'];

export default function Equipe() {
  const [membros, setMembros] = useState([]);
  const [modal, setModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', funcao: 'designer' });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data } = await supabase.from('equipe').select('*').order('nome');
    setMembros(data || []);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.auth.admin ? 
      await supabase.from('equipe').insert([form]) :
      await supabase.from('equipe').insert([form]);
    setSalvando(false);
    if (!error) {
      setModal(false);
      setForm({ nome: '', email: '', funcao: 'designer' });
      carregar();
    }
  }

  async function remover(id) {
    if (!window.confirm('Remover este membro?')) return;
    await supabase.from('equipe').delete().eq('id', id);
    carregar();
  }

  function set(campo, valor) { setForm(f => ({ ...f, [campo]: valor })); }

  function corFuncao(funcao) {
    const map = { admin: '#EF4444', gestor: '#F59E0B', designer: '#4B5EFF', redator: '#10B981' };
    return map[funcao] || '#AAA';
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <h2 style={styles.title}>Equipe</h2>
            <p style={styles.sub}>{membros.length} membros cadastrados</p>
          </div>
          <button style={styles.addBtn} onClick={() => setModal(true)}>+ Novo membro</button>
        </div>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Nome', 'E-mail', 'Função', 'Ações'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membros.length === 0 ? (
                <tr><td colSpan={4} style={styles.empty}>Nenhum membro cadastrado.</td></tr>
              ) : membros.map(m => (
                <tr key={m.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.membroInfo}>
                      <div style={{ ...styles.avatar, background: corFuncao(m.funcao) }}>
                        {m.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <span style={styles.membroNome}>{m.nome}</span>
                    </div>
                  </td>
                  <td style={styles.td}><span style={styles.email}>{m.email}</span></td>
                  <td style={styles.td}>
                    <span style={{ ...styles.funcaoBadge, background: corFuncao(m.funcao) + '22', color: corFuncao(m.funcao) }}>
                      {m.funcao}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.removeBtn} onClick={() => remover(m.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.permCard}>
          <p style={styles.secLabel}>Tabela de permissões</p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ação</th>
                {FUNCOES.map(f => <th key={f} style={styles.th}>{f}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['Ver clientes', true, true, true, true],
                ['Criar/editar clientes', true, true, false, false],
                ['Criar posts', true, true, true, true],
                ['Aprovar posts', true, true, false, false],
                ['Editar briefing', true, true, false, false],
                ['Criar demandas', true, true, true, false],
                ['Gerenciar equipe', true, false, false, false],
              ].map(([acao, ...perms]) => (
                <tr key={acao} style={styles.tr}>
                  <td style={styles.td}><span style={styles.acaoLabel}>{acao}</span></td>
                  {perms.map((p, i) => (
                    <td key={i} style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{ fontSize: 16 }}>{p ? '✅' : '—'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modal && (
          <div style={styles.overlay} onClick={() => setModal(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitulo}>Novo membro</p>
              <form onSubmit={salvar}>
                <div style={styles.mfield}>
                  <label style={styles.mlabel}>Nome completo *</label>
                  <input style={styles.minput} required value={form.nome} onChange={e => set('nome', e.target.value)} />
                </div>
                <div style={styles.mfield}>
                  <label style={styles.mlabel}>E-mail *</label>
                  <input style={styles.minput} type="email" required value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div style={styles.mfield}>
                  <label style={styles.mlabel}>Função</label>
                  <select style={styles.minput} value={form.funcao} onChange={e => set('funcao', e.target.value)}>
                    {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" style={styles.saveBtn} disabled={salvando}>{salvando ? 'Salvando...' : 'Adicionar membro'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'Arial, sans-serif' },
  main: { marginLeft: 220, padding: '32px 36px', flex: 1 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' },
  sub: { fontSize: 13, color: '#888', margin: 0 },
  addBtn: { background: '#4B5EFF', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  card: { background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #EEE', marginBottom: 20, overflow: 'hidden' },
  permCard: { background: '#fff', borderRadius: 12, padding: '20px 4px', border: '1px solid #EEE', overflow: 'hidden' },
  secLabel: { fontSize: 11, fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px', paddingLeft: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 11, fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #F0F0F0' },
  tr: { borderBottom: '1px solid #F9F9F9' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1A1A2E', verticalAlign: 'middle' },
  membroInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  membroNome: { fontWeight: 600 },
  email: { color: '#888' },
  funcaoBadge: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  removeBtn: { background: 'none', border: '1px solid #EEE', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#AAA', cursor: 'pointer' },
  acaoLabel: { fontSize: 13, color: '#555' },
  empty: { textAlign: 'center', padding: 30, color: '#AAA' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard: { background: '#fff', borderRadius: 16, padding: 28, width: 400 },
  modalTitulo: { fontSize: 16, fontWeight: 700, color: '#1A1A2E', margin: '0 0 20px' },
  mfield: { marginBottom: 14 },
  mlabel: { display: 'block', fontSize: 12, color: '#555', marginBottom: 5 },
  minput: { width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #DDD', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' },
  cancelBtn: { flex: 1, padding: 10, borderRadius: 8, border: '1px solid #DDD', background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: 10, borderRadius: 8, border: 'none', background: '#4B5EFF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
};