import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import CalendarHeader from '../components/CalendarHeader';
import CalendarDay from '../components/CalendarDay';
import PostDrawer from '../components/PostDrawer';
import NewPostModal from '../components/NewPostModal';
import { supabase } from '../supabase';

const STATUS = [
  { key: 'rascunho', label: 'Rascunho', cor: '#94A3B8' },
  { key: 'revisao_interna', label: 'Revisão interna', cor: '#F59E0B' },
  { key: 'enviado_cliente', label: 'Enviado pro cliente', cor: '#3B82F6' },
  { key: 'aprovado', label: 'Aprovado', cor: '#10B981' },
  { key: 'agendado', label: 'Agendado', cor: '#6366F1' },
  { key: 'publicado', label: 'Publicado', cor: '#059669' },
];

const INITIAL_FORM = {
  titulo: '',
  cliente_id: '',
  legenda: '',
  hashtags: '',
  primeiro_comentario: '',
  rede: 'ambos',
  tipo_post: 'feed',
  status: 'rascunho',
  data_agendamento: '',
  responsavel_id: '',
};

export default function Calendario() {
  const [posts, setPosts] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [postAberto, setPostAberto] = useState(null);
  const [modalDia, setModalDia] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filtros, setFiltros] = useState({
    cliente: '',
    responsavel: '',
    status: '',
    rede: '',
  });
  const [form, setForm] = useState(INITIAL_FORM);

  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 980);

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  async function carregar() {
    setLoading(true);
    const [p, c, e] = await Promise.all([
      supabase.from('posts').select('*, clientes(nome), equipe(nome)').order('data_agendamento'),
      supabase.from('clientes').select('id, nome').eq('tipo', 'social_media'),
      supabase.from('equipe').select('id, nome'),
    ]);
    setPosts(p.data || []);
    setClientes(c.data || []);
    setEquipe(e.data || []);
    setLoading(false);
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setIsEditing(false);
  }

  function fecharModal() {
    setModal(false);
    resetForm();
  }

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvarPost(e) {
    e.preventDefault();
    if (!form.cliente_id) return;

    setSalvando(true);

    if (isEditing && postAberto?.id) {
      await supabase.from('posts').update(form).eq('id', postAberto.id);
      setPosts((prev) => prev.map((p) => (p.id === postAberto.id ? { ...p, ...form } : p)));
      setPostAberto((prev) => (prev ? { ...prev, ...form } : prev));
    } else {
      await supabase.from('posts').insert([form]);
    }

    setSalvando(false);
    fecharModal();
    await carregar();
  }

  async function atualizarStatus(post, novoStatus) {
    await supabase.from('posts').update({ status: novoStatus }).eq('id', post.id);
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: novoStatus } : p)));
    setPostAberto((p) => (p ? { ...p, status: novoStatus } : p));
  }

  async function excluirPost(post) {
    if (!window.confirm('Deseja excluir este post?')) return;
    await supabase.from('posts').delete().eq('id', post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setPostAberto(null);
    await carregar();
  }

  const meses = useMemo(
    () => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    []
  );

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const mesLabel = `${meses[mes]} ${ano}`;

  const postsFiltrados = useMemo(() => {
    return posts.filter((p) => {
      const clienteOk = !filtros.cliente || p.cliente_id === filtros.cliente;
      const responsavelOk = !filtros.responsavel || p.responsavel_id === filtros.responsavel;
      const statusOk = !filtros.status || p.status === filtros.status;
      const redeOk = !filtros.rede || p.rede === filtros.rede || (filtros.rede === 'ambos' && p.rede === 'ambos');
      return clienteOk && responsavelOk && statusOk && redeOk;
    });
  }, [posts, filtros]);

  const postsDoMes = useMemo(() => {
    return postsFiltrados.filter((p) => {
      if (!p.data_agendamento) return false;
      const d = new Date(p.data_agendamento);
      return d.getMonth() === mes && d.getFullYear() === ano;
    });
  }, [postsFiltrados, mes, ano]);

  const postsDoDia = (dia) => {
    return postsDoMes.filter((p) => {
      if (!p.data_agendamento) return false;
      const d = new Date(p.data_agendamento);
      return d.getDate() === dia && d.getMonth() === mes && d.getFullYear() === ano;
    });
  };

  const totalAprovados = postsDoMes.filter((p) => p.status === 'aprovado').length;
  const totalPendentes = postsDoMes.filter((p) => p.status === 'revisao_interna' || p.status === 'rascunho').length;
  const totalAgendados = postsDoMes.filter((p) => p.status === 'agendado').length;

  const abrirPost = (post) => setPostAberto(post);
  const abrirModalNovo = () => {
    resetForm();
    setModal(true);
  };
  const abrirModalEdicao = (post) => {
    setForm({
      titulo: post.titulo || '',
      cliente_id: post.cliente_id || '',
      legenda: post.legenda || '',
      hashtags: post.hashtags || '',
      primeiro_comentario: post.primeiro_comentario || '',
      rede: post.rede || 'ambos',
      tipo_post: post.tipo_post || 'feed',
      status: post.status || 'rascunho',
      data_agendamento: post.data_agendamento ? new Date(post.data_agendamento).toISOString().slice(0, 16) : '',
      responsavel_id: post.responsavel_id || '',
    });
    setIsEditing(true);
    setModal(true);
  };

  const abrirDia = (dia) => {
    const diaPosts = postsDoDia(dia);
    setModalDia({ dia, posts: diaPosts });
  };

  const mudarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const navegarMes = (direcao) => {
    if (direcao === 'prev') {
      if (mes === 0) {
        setMes(11);
        setAno((a) => a - 1);
      } else {
        setMes((m) => m - 1);
      }
    } else if (direcao === 'next') {
      if (mes === 11) {
        setMes(0);
        setAno((a) => a + 1);
      } else {
        setMes((m) => m + 1);
      }
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={{ ...styles.main, marginLeft: isMobile ? 0 : 220 }}>
        {loading && (
          <motion.div
            style={styles.loadingBar}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            Carregando posts...
          </motion.div>
        )}

        <motion.div
          style={styles.backgroundGlow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div style={styles.glow1} animate={{ x: [0, 80, -40, 0], y: [0, -50, 30, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div style={styles.glow2} animate={{ x: [0, -60, 40, 0], y: [0, 30, -20, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div style={styles.glow3} animate={{ x: [0, 50, -70, 0], y: [0, -30, 40, 0] }} transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.div>

        <CalendarHeader
          monthLabel={mesLabel}
          year={ano}
          onPrev={() => navegarMes('prev')}
          onNext={() => navegarMes('next')}
          totalPosts={postsDoMes.length}
          approvedCount={totalAprovados}
          pendingCount={totalPendentes}
          scheduledCount={totalAgendados}
          onOpenModal={abrirModalNovo}
          filters={filtros}
          onFilterChange={mudarFiltro}
          clientes={clientes}
          equipe={equipe}
          statusOptions={STATUS}
        />

        <motion.div
          style={styles.calCard}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div style={styles.diasSemana}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} style={styles.diaSemLabel}>{d}</div>
            ))}
          </div>

          <div style={styles.grade}>
            {Array.from({ length: primeiroDia }).map((_, i) => <div key={`vazio-${i}`} style={styles.dayPlaceholder} />)}
            {Array.from({ length: diasNoMes }).map((_, i) => {
              const dia = i + 1;
              const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
              const postsDoDiaAtual = postsDoDia(dia);
              return (
                <CalendarDay
                  key={dia}
                  day={dia}
                  isToday={isHoje}
                  posts={postsDoDiaAtual}
                  onOpenPost={abrirPost}
                  onOpenDay={() => abrirDia(dia)}
                />
              );
            })}
          </div>
        </motion.div>

        <PostDrawer
          post={postAberto}
          onClose={() => setPostAberto(null)}
          onEdit={() => abrirModalEdicao(postAberto)}
          onDelete={() => excluirPost(postAberto)}
          onChangeStatus={atualizarStatus}
        />

        <NewPostModal
          open={modal}
          onClose={fecharModal}
          form={form}
          onChange={setCampo}
          onSubmit={salvarPost}
          saving={salvando}
          clientes={clientes}
          equipe={equipe}
          isEditing={isEditing}
        />

        <AnimatePresence>
          {modalDia && (
            <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalDia(null)}>
              <motion.div
                style={styles.dayModal}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.dayModalHeader}>
                  <div>
                    <p style={styles.dayModalEyebrow}>Posts do dia</p>
                    <h3 style={styles.dayModalTitle}>{modalDia.dia} de {meses[mes]}</h3>
                  </div>
                  <button style={styles.closeBtn} onClick={() => setModalDia(null)}>✕</button>
                </div>
                <div style={styles.dayModalList}>
                  {modalDia.posts.length === 0 ? (
                    <div style={styles.emptyDayState}>Nenhuma demanda cadastrada para este dia.</div>
                  ) : (
                    modalDia.posts.map((p) => (
                      <button key={p.id} style={styles.dayModalItem} onClick={() => { setModalDia(null); abrirPost(p); }}>
                        <span>{p.titulo || p.clientes?.nome || 'Post sem título'}</span>
                        <span style={styles.dayModalHour}>{p.data_agendamento ? new Date(p.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0B0B0D', fontFamily: 'Arial, sans-serif' },
  main: { flex: 1, padding: '32px 36px 48px', position: 'relative', overflowX: 'hidden', zIndex: 1 },
  loadingBar: { position: 'relative', zIndex: 2, marginBottom: 18, padding: '10px 14px', background: '#18181B', color: '#EF4444', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'inline-flex' },
  backgroundGlow: { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 },
  glow1: { position: 'absolute', width: 240, height: 240, background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0) 70%)', top: 40, right: 120 },
  glow2: { position: 'absolute', width: 220, height: 220, background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0) 70%)', bottom: 60, left: 180 },
  glow3: { position: 'absolute', width: 180, height: 180, background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, rgba(245,158,11,0) 70%)', top: 200, left: 360 },
  calCard: { background: '#111113', borderRadius: 20, padding: 24, border: '1px solid #27272A', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.24)', position: 'relative', zIndex: 1 },
  diasSemana: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 10 },
  diaSemLabel: { fontSize: 11, color: '#71717A', fontWeight: 700, textAlign: 'center', padding: '8px 0', letterSpacing: '0.08em', textTransform: 'uppercase' },
  grade: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 },
  dayPlaceholder: { minHeight: 132, borderRadius: 14, background: 'transparent' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(5, 5, 7, 0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 900 },
  dayModal: { background: '#0F0F11', width: 430, maxWidth: '100%', borderRadius: 18, padding: 22, border: '1px solid #27272A', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', position: 'relative', zIndex: 901 },
  dayModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  dayModalEyebrow: { margin: 0, color: '#A1A1AA', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' },
  dayModalTitle: { margin: '6px 0 0', fontSize: 18, fontWeight: 800, color: '#FFFFFF' },
  closeBtn: { width: 38, height: 38, border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF', borderRadius: 12, cursor: 'pointer' },
  dayModalList: { display: 'flex', flexDirection: 'column', gap: 8 },
  dayModalItem: { background: '#18181B', border: '1px solid #27272A', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, cursor: 'pointer', color: '#FFFFFF', fontSize: 13, fontWeight: 600 },
  dayModalHour: { color: '#A1A1AA', fontSize: 12 },
  emptyDayState: { background: '#18181B', color: '#A1A1AA', borderRadius: 12, padding: '16px 14px', textAlign: 'center', fontSize: 13 },
};