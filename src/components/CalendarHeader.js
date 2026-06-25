import React from 'react';
import { motion } from 'framer-motion';

const styles = {
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 22,
    flexWrap: 'wrap'
  },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  eyebrow: { margin: 0, color: '#EF4444', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em' },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: '#FFFFFF' },
  summary: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#18181B',
    border: '1px solid #27272A',
    borderRadius: 999,
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  chipStrong: { color: '#EF4444' },
  controls: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  navBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    border: '1px solid #27272A',
    background: '#18181B',
    color: '#FFFFFF',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  month: {
    minWidth: 210,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#FFFFFF'
  },
  addBtn: {
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.22)'
  },
  filterGroup: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  select: {
    fontSize: 13,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #27272A',
    background: '#18181B',
    color: '#FFFFFF',
    outline: 'none'
  }
};

export default function CalendarHeader({
  monthLabel,
  year,
  onPrev,
  onNext,
  totalPosts,
  approvedCount,
  pendingCount,
  scheduledCount,
  onOpenModal,
  filters,
  onFilterChange,
  clientes,
  equipe,
  statusOptions,
}) {
  return (
    <motion.div
      style={styles.topbar}
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div style={styles.titleWrap}>
        <p style={styles.eyebrow}>PLANEJAMENTO</p>
        <h2 style={styles.title}>Calendário</h2>
        <div style={styles.summary}>
          <span style={styles.chip}><span style={styles.chipStrong}>{totalPosts}</span> posts</span>
          <span style={styles.chip}><span style={styles.chipStrong}>{approvedCount}</span> aprovados</span>
          <span style={styles.chip}><span style={styles.chipStrong}>{pendingCount}</span> revisão</span>
          <span style={styles.chip}><span style={styles.chipStrong}>{scheduledCount}</span> agendados</span>
        </div>
      </div>

      <div style={styles.filterGroup}>
        <select style={styles.select} value={filters.cliente} onChange={(e) => onFilterChange('cliente', e.target.value)}>
          <option value="">Todos os clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select style={styles.select} value={filters.responsavel} onChange={(e) => onFilterChange('responsavel', e.target.value)}>
          <option value="">Todos os responsáveis</option>
          {equipe.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        <select style={styles.select} value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)}>
          <option value="">Todos os status</option>
          {statusOptions.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select style={styles.select} value={filters.rede} onChange={(e) => onFilterChange('rede', e.target.value)}>
          <option value="">Todas as redes</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="ambos">Instagram + Facebook</option>
        </select>
        <button style={styles.addBtn} onClick={onOpenModal}>+ Novo post</button>
      </div>

      <div style={styles.controls}>
        <button style={styles.navBtn} onClick={onPrev} aria-label="Mês anterior">‹</button>
        <span style={styles.month}>{monthLabel} {year}</span>
        <button style={styles.navBtn} onClick={onNext} aria-label="Próximo mês">›</button>
      </div>
    </motion.div>
  );
}
