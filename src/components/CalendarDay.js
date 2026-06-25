import React from 'react';
import { motion } from 'framer-motion';

const styles = {
  dayButton: {
    minHeight: 132,
    borderRadius: 14,
    padding: '12px 10px',
    background: '#18181B',
    border: '1px solid #27272A',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    textAlign: 'left'
  },
  dayToday: {
    background: '#1C1C22',
    borderColor: '#EF4444',
    boxShadow: '0 0 0 1px rgba(239,68,68,0.12), 0 12px 24px rgba(239,68,68,0.08)'
  },
  dayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dayNumber: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: 12,
    fontWeight: 700,
    color: '#A1A1AA'
  },
  dayNumberToday: {
    background: '#EF4444',
    color: '#FFFFFF',
    boxShadow: '0 0 0 4px rgba(239,68,68,0.12)'
  },
  posts: { display: 'flex', flexDirection: 'column', gap: 6 },
  postPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    background: '#0F0F11',
    borderRadius: 10,
    padding: '7px 8px',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 600,
    border: '1px solid #27272A'
  },
  more: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F0F11',
    color: '#EF4444',
    borderRadius: 10,
    border: '1px solid #27272A',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    padding: '7px 8px'
  }
};

export default function CalendarDay({ day, isToday, posts, onOpenDay, onOpenPost }) {
  return (
    <motion.div
      style={{ ...styles.dayButton, ...(isToday ? styles.dayToday : {}) }}
      whileHover={{ y: -1, borderColor: '#3F3F46' }}
      transition={{ duration: 0.18 }}
      onClick={onOpenDay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDay();
        }
      }}
    >
      <div style={styles.dayHeader}>
        <span style={{ ...styles.dayNumber, ...(isToday ? styles.dayNumberToday : {}) }}>{day}</span>
      </div>
      <div style={styles.posts}>
        {posts.slice(0, 2).map((post) => (
          <button
            key={post.id}
            type="button"
            style={styles.postPreview}
            onClick={(e) => {
              e.stopPropagation();
              onOpenPost(post);
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.titulo || post.clientes?.nome || 'Post'}
            </span>
            <span style={{ color: '#A1A1AA' }}>{post.data_agendamento ? new Date(post.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </button>
        ))}
        {posts.length > 2 && (
          <button type="button" style={styles.more} onClick={(e) => { e.stopPropagation(); onOpenDay(); }}>
            + {posts.length - 2} mais
          </button>
        )}
      </div>
    </motion.div>
  );
}
