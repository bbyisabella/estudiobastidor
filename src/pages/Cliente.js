import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabase';

export default function Cliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [aba, setAba] = useState('briefing');
  const [posts, setPosts] = useState([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    supabase.from('clientes').select('*').eq('id', id).single().then(({ data }) => {
      setCliente(data);
      setForm(data || {});
    });
    supabase.from('posts').select('*').eq('cliente_id', id).order('created_at', { ascending: false }).then(({ data }) => setPosts(data || []));
  }, [id]);

  async function salvarEdicao() {
    await supabase.from('clientes').update(form).eq('id', id);
    setCliente(form);
    setEditando(false);
  }

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  function statusColor(status) {
    const map = { rascunho: '#AAA', revisao_interna: '#F59E0B', enviado_cliente: '#3B82F6', aprovado: '#10B981', agendado: '#6366F1', publicado: '#059669', falha: '#EF4444' };
    return map[status] || '#AAA';
  }

  function statusLabel(status) {
    const map = { rascunho: 'Rascunho', revisao_interna: 'Revisão interna', enviado_cliente: 'Enviado pro cliente', aprovado: 'Aprovado', agendado: 'Agendado', publicado: 'Publicado', falha: 'Falha' };
    return map[status] || status;
  }

  if (!cliente) return <div style={{ padding: 40, fontFamily: 'Arial' }}>Carregando...</div>;

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        <button style={styles.back} onClick={() => navigate('/')}>← Clientes</button>

        <div style={styles.header}>
          <div style={{ ...styles.avatar, background: cliente.tipo === 'social_media' ? '#4B5EFF' : '#F59E0B' }}>
            {cliente.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h2 style={styles.nome}>{cliente.nome}</h2>
            <p style={styles.sub}>
              {cliente.instagram && `@${cliente.instagram}`}
              {cliente.instagram && cliente.facebook && ' · '}
              {cliente.facebook && `@${cliente.facebook}`}
              {cliente.segmento && ` · ${cliente.segmento}`}
            </p>
          </div>
          <span style={{ ...styles.badge, background: cliente.tipo === 'social_media' ? '#4B5EFF22' : '#F59E0B22', color: cliente.tipo === 'social_media' ? '#4B5EFF' : '#F59E0B' }}>
            {cliente.tipo === 'social_media' ? 'Social Media' : 'Design'}
          </span>
        </div>

        <div style={styles.abas}>
          {['briefing', 'posts', 'contato'].map(a => (
            <button key={a} onClick={() => setAba(a)} style={{ ...styles.aba, ...(aba === a ? styles.abaActive : {}) }}>
              {a === 'briefing' ? 'Briefing' : a === 'posts' ? 'Conteúdos' : 'Contato'}
            </button>
          ))}
        </div>

        {aba === 'briefing' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <p style={styles.secLabel}>Identidade & Briefing</p>
              {!editando
                ? <button style={styles.editBtn} onClick={() => setEditando(true)}>✏️ Editar</button>
                : <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.cancelBtn} onClick={() => { setEditando(false); setForm(cliente); }}>Cancelar</button>
                    <button style={styles.saveBtn} onClick={salvarEdicao}>Salvar</button>
                  </div>
              }
            </div>

            {[
              { label: 'Link do Canva / Figma', campo: 'identidade_link' },
              { label: 'Cores da marca', campo: 'identidade_cores' },
              { label: 'Fontes utilizadas', campo: 'identidade_fontes' },
              { label: 'Links adicionais', campo: 'identidade_links_extras' },
              { label: 'Tom de voz e diretrizes', campo: 'observacoes' },
            ].map(({ label, campo }) => (
              <div style={styles.field} key={campo}>
                <label style={styles.fieldLabel}>{label}</label>
                {editando
                  ? <input style={styles.input} value={form[campo] || ''} onChange={e => set(campo, e.target.value)} />
                  : <p style={styles.fieldValue}>{cliente[campo] || <span style={{ color: '#CCC' }}>—</span>}</p>
                }
              </div>
            ))}
          </div>
        )}

        {aba === 'posts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button style={styles.saveBtn} onClick={() => navigate(`/calendario`)}>+ Novo post</button>
            </div>
            {posts.length === 0
              ? <p style={{ color: '#AAA', fontSize: 14 }}>Nenhum post cadastrado ainda.</p>
              : posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={{ flex: 1 }}>
                    <p style={styles.postTitulo}>{post.titulo || 'Post sem título'}</p>
                    <p style={styles.postLegenda}>{post.legenda?.slice(0, 100)}{post.legenda?.length > 100 ? '...' : ''}</p>
                    <p style={styles.postMeta}>{post.rede} · {post.tipo_post} · {post.data_agendamento ? new Date(post.data_agendamento).toLocaleDateString('pt-BR') : 'Sem data'}</p>
                  </div>
                  <span style={{ ...styles.statusBadge, background: statusColor(post.status) + '22', color: statusColor(post.status) }}>
                    {statusLabel(post.status)}
                  </span>
                </div>
              ))
            }
          </div>
        )}

        {aba === 'contato' && (
          <div style={styles.card}>
            <p style={styles.secLabel}>Contato responsável</p>
            {[
              { label: 'Nome', valor: cliente.contato_nome },
              { label: 'WhatsApp', valor: cliente.contato_whatsapp },
              { label: 'E-mail', valor: cliente.contato_email },
              { label: 'Cidade / Estado', valor: [cliente.cidade, cliente.estado].filter(Boolean).join(' / ') },
            ].map(({ label, valor }) => (
              <div style={styles.field} key={label}>
                <label style={styles.fieldLabel}>{label}</label>
                <p style={styles.fieldValue}>{valor || <span style={{ color: '#CCC' }}>—</span>}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'Arial, sans-serif' },
  main: { marginLeft: 220, padding: '32px 36px', flex: 1 },
  back: { background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 },
  nome: { fontSize: 20, fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' },
  sub: { fontSize: 13, color: '#888', margin: 0 },
  badge: { fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, marginLeft: 'auto', whiteSpace: 'nowrap' },
  abas: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #EEE', paddingBottom: 0 },
  aba: { padding: '8px 18px', border: 'none', background: 'none', fontSize: 13, color: '#888', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1 },
  abaActive: { color: '#4B5EFF', fontWeight: 600, borderBottom: '2px solid #4B5EFF' },
  card: { background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #EEE' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  secLabel: { fontSize: 11, fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 },
  editBtn: { background: 'none', border: '1px solid #DDD', borderRadius: 7, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#555' },
  cancelBtn: { background: 'none', border: '1px solid #DDD', borderRadius: 7, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#555' },
  saveBtn: { background: '#4B5EFF', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, color: '#AAA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#1A1A2E', margin: 0 },
  input: { width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #DDD', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' },
  postCard: { background: '#fff', borderRadius: 10, padding: '14px 18px', border: '1px solid #EEE', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 },
  postTitulo: { fontSize: 13, fontWeight: 600, color: '#1A1A2E', margin: '0 0 3px' },
  postLegenda: { fontSize: 12, color: '#888', margin: '0 0 4px' },
  postMeta: { fontSize: 11, color: '#BBB', margin: 0 },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' },
};