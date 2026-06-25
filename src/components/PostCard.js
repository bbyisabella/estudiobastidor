import React from 'react';
import { motion } from 'framer-motion';

const STATUS = {
  rascunho: { label: 'Rascunho', cor: '#94A3B8' },
  revisao_interna: { label: 'Revisão', cor: '#F59E0B' },
  enviado_cliente: { label: 'Enviado', cor: '#3B82F6' },
  aprovado: { label: 'Aprovado', cor: '#10B981' },
  agendado: { label: 'Agendado', cor: '#6366F1' },
  publicado: { label: 'Publicado', cor: '#059669' },
};

const ICONES = {
  feed: '📝',
  stories: '📱',
  reels: '🎥',
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    padding: '10px 10px',
    borderRadius: 12,
    border: '1px solid #27272A',
    background: '#18181B',
    cursor: 'pointer',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  top: { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  time: { fontSize: 10, color: '#A1A1AA', fontWeight: 600 },
  badge: {
    padding: '4px 8px',
    borderRadius: 999,
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  title: {
    margin: 0,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  metaPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 9,
    color: '#A1A1AA',
    background: '#0F0F11',
    borderRadius: 999,
    padding: '5px 7px'
  }
};

export default function PostCard({ post, onClick }) {
  const status = STATUS[post.status] || STATUS.rascunho;
  const data = post.data_agendamento ? new Date(post.data_agendamento) : null;
  const hora = data ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const tipo = post.tipo_post || 'feed';
  const Icone = ICONES[tipo];
  const redeLabel = post.rede === 'ambos' ? 'IG + FB' : post.rede === 'instagram' ? 'Instagram' : 'Facebook';

  return (
    <motion.button
      type="button"
      style={styles.card}
      whileHover={{ y: -1, backgroundColor: '#202024' }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
    >
      <div style={styles.top}>
        <span style={styles.time}>{hora || 'Sem horário'}</span>
        <span style={{ ...styles.badge, background: status.cor }}>{status.label}</span>
      </div>
      <p style={styles.title}>{post.titulo || post.clientes?.nome || 'Post sem título'}</p>
      <div style={styles.footer}>
        <span style={styles.metaPill}>{Icone && <>{Icone} </>}{tipo}</span>
        <span style={styles.metaPill}>{redeLabel}</span>
      </div>
    </motion.button>
  );
}
