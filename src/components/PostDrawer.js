import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS = [
  { key: 'rascunho', label: 'Rascunho', cor: '#94A3B8' },
  { key: 'revisao_interna', label: 'Revisão interna', cor: '#F59E0B' },
  { key: 'enviado_cliente', label: 'Enviado pro cliente', cor: '#3B82F6' },
  { key: 'aprovado', label: 'Aprovado', cor: '#10B981' },
  { key: 'agendado', label: 'Agendado', cor: '#6366F1' },
  { key: 'publicado', label: 'Publicado', cor: '#059669' },
];

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 5, 7, 0.78)',
    zIndex: 900,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 420,
    maxWidth: '92vw',
    height: '100vh',
    background: '#0F0F11',
    borderLeft: '1px solid #27272A',
    boxShadow: '-18px 0 60px rgba(0,0,0,0.4)',
    overflowY: 'auto',
    zIndex: 901,
    padding: 28,
    boxSizing: 'border-box'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 },
  closeBtn: { border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF', width: 38, height: 38, borderRadius: 12, cursor: 'pointer' },
  badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 700, marginBottom: 18 },
  section: { display: 'grid', gap: 8, marginBottom: 18 },
  label: { fontSize: 11, color: '#A1A1AA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' },
  value: { margin: 0, color: '#FFFFFF', fontSize: 14, lineHeight: 1.5 },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  hashtags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  hashtag: { background: '#18181B', color: '#EF4444', padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: '1px solid #27272A' },
  actions: { display: 'flex', gap: 10, marginTop: 8 },
  actionBtn: { flex: 1, borderRadius: 12, padding: '11px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  editBtn: { border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF' },
  deleteBtn: { border: 'none', background: 'rgba(239,68,68,0.12)', color: '#EF4444' },
  select: { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF' },
};

export default function PostDrawer({ post, onClose, onEdit, onDelete, onChangeStatus }) {
  if (!post) return null;

  const status = STATUS.find((s) => s.key === post.status) || STATUS[0];
  const data = post.data_agendamento ? new Date(post.data_agendamento) : null;
  const legenda = post.legenda || '';
  const hashtags = (post.hashtags || '').split(/\s+/).filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        style={styles.drawer}
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div>
            <p style={styles.label}>Post</p>
            <h3 style={styles.title}>{post.titulo || 'Post sem título'}</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Fechar drawer">✕</button>
        </div>

        <span style={{ ...styles.badge, background: status.cor }}>{status.label}</span>

        <div style={styles.section}>
          <span style={styles.label}>Cliente</span>
          <p style={styles.value}>{post.clientes?.nome || 'Sem cliente'}</p>
        </div>

        <div style={styles.section}>
          <span style={styles.label}>Responsável</span>
          <p style={styles.value}>{post.equipe?.nome || 'Sem responsável'}</p>
        </div>

        <div style={styles.metaGrid}>
          <div style={styles.section}>
            <span style={styles.label}>Rede</span>
            <p style={styles.value}>{post.rede === 'ambos' ? 'Instagram + Facebook' : post.rede}</p>
          </div>
          <div style={styles.section}>
            <span style={styles.label}>Tipo</span>
            <p style={styles.value}>{post.tipo_post}</p>
          </div>
        </div>

        <div style={styles.section}>
          <span style={styles.label}>Data</span>
          <p style={styles.value}>{data ? data.toLocaleString('pt-BR') : 'Sem data'}</p>
        </div>

        {legenda && (
          <div style={styles.section}>
            <span style={styles.label}>Legenda</span>
            <p style={styles.value}>{legenda}</p>
          </div>
        )}

        {hashtags.length > 0 && (
          <div style={styles.section}>
            <span style={styles.label}>Hashtags</span>
            <div style={styles.hashtags}>
              {hashtags.map((tag) => (
                <span key={tag} style={styles.hashtag}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div style={styles.section}>
          <span style={styles.label}>Status</span>
          <select style={styles.select} value={post.status} onChange={(e) => onChangeStatus(post, e.target.value)}>
            {STATUS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.actions}>
          <button type="button" style={{ ...styles.actionBtn, ...styles.editBtn }} onClick={onEdit}>Editar</button>
          <button type="button" style={{ ...styles.actionBtn, ...styles.deleteBtn }} onClick={onDelete}>Excluir</button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
