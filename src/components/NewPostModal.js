import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 5, 7, 0.78)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 900,
  },
  modal: {
    background: '#0F0F11',
    borderRadius: 18,
    width: 920,
    maxWidth: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    border: '1px solid #27272A',
    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
    padding: 28,
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 901
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#FFFFFF' },
  closeBtn: { width: 40, height: 40, borderRadius: 12, border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  label: { fontSize: 12, color: '#A1A1AA', fontWeight: 700 },
  input: {
    width: '100%',
    fontSize: 13,
    padding: '11px 12px',
    borderRadius: 10,
    border: '1px solid #27272A',
    background: '#18181B',
    color: '#FFFFFF',
    boxSizing: 'border-box',
    outline: 'none'
  },
  textarea: { minHeight: 112, resize: 'vertical' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 },
  cancelBtn: { padding: '12px 16px', borderRadius: 12, border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 },
  saveBtn: { padding: '12px 18px', borderRadius: 12, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontWeight: 700 },
};

export default function NewPostModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  clientes,
  equipe,
  isEditing,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          style={styles.modal}
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.header}>
            <h3 style={styles.title}>{isEditing ? 'Editar post' : 'Novo post'}</h3>
            <button style={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">✕</button>
          </div>
          <form onSubmit={onSubmit}>
            <div style={styles.grid}>
              <div>
                <div style={styles.field}>
                  <label style={styles.label}>Título</label>
                  <input style={styles.input} value={form.titulo} onChange={(e) => onChange('titulo', e.target.value)} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Cliente *</label>
                  <select style={styles.input} required value={form.cliente_id} onChange={(e) => onChange('cliente_id', e.target.value)}>
                    <option value="">Selecione</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Legenda</label>
                  <textarea style={{ ...styles.input, ...styles.textarea }} value={form.legenda} onChange={(e) => onChange('legenda', e.target.value)} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Hashtags</label>
                  <input style={styles.input} value={form.hashtags} onChange={(e) => onChange('hashtags', e.target.value)} />
                </div>
              </div>
              <div>
                <div style={styles.field}>
                  <label style={styles.label}>Primeiro comentário</label>
                  <input style={styles.input} value={form.primeiro_comentario} onChange={(e) => onChange('primeiro_comentario', e.target.value)} />
                </div>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Rede</label>
                    <select style={styles.input} value={form.rede} onChange={(e) => onChange('rede', e.target.value)}>
                      <option value="ambos">Instagram + Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Tipo</label>
                    <select style={styles.input} value={form.tipo_post} onChange={(e) => onChange('tipo_post', e.target.value)}>
                      <option value="feed">Feed</option>
                      <option value="stories">Stories</option>
                      <option value="reels">Reels</option>
                    </select>
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Data e hora</label>
                  <input style={styles.input} type="datetime-local" value={form.data_agendamento} onChange={(e) => onChange('data_agendamento', e.target.value)} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Responsável</label>
                  <select style={styles.input} value={form.responsavel_id} onChange={(e) => onChange('responsavel_id', e.target.value)}>
                    <option value="">Selecione</option>
                    {equipe.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Status</label>
                  <select style={styles.input} value={form.status} onChange={(e) => onChange('status', e.target.value)}>
                    <option value="rascunho">Rascunho</option>
                    <option value="revisao_interna">Revisão interna</option>
                    <option value="enviado_cliente">Enviado pro cliente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="agendado">Agendado</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={styles.actions}>
              <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancelar</button>
              <button type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar post'}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
