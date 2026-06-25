import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabase';

const DESIGN_COLUMNS = [
  { key: 'a_fazer', label: 'A Fazer' },
  { key: 'em_andamento', label: 'Em Andamento' },
  { key: 'ajustes', label: 'Ajustes' },
  { key: 'enviado_cliente', label: 'Enviado para Cliente' },
  { key: 'aguardando_diretoria', label: 'Aguardando Aprovação da Diretoria' },
  { key: 'finalizada', label: 'Finalizada' },
];

const SOCIAL_COLUMNS = [
  { key: 'criar_copy', label: 'Criar Copy' },
  { key: 'copy_em_andamento', label: 'Copy em Andamento' },
  { key: 'ajustes_copy', label: 'Ajustes Copy' },
  { key: 'criar_design', label: 'Criar Design' },
  { key: 'design_em_andamento', label: 'Design em Andamento' },
  { key: 'ajustes_design', label: 'Ajustes Design' },
  { key: 'enviado_cliente', label: 'Enviado para Cliente' },
  { key: 'ajustes_cliente', label: 'Ajustes Cliente' },
  { key: 'agendado', label: 'Agendado' },
  { key: 'publicado', label: 'Publicado' },
];

const PRIORIDADE_MAP = {
  alta: { label: 'Alta', cor: '#EF4444' },
  media: { label: 'Média', cor: '#F59E0B' },
  baixa: { label: 'Baixa', cor: '#3B82F6' },
};

const INITIAL_FORM = {
  titulo: '',
  cliente_id: '',
  descricao: '',
  tipo: 'design',
  status: 'a_fazer',
  prioridade: 'media',
  responsavel_copy_id: '',
  responsavel_design_id: '',
  data_limite: '',
  data_publicacao: '',
  tipo_conteudo: 'feed',
  categoria: 'branding',
};

export default function Demandas() {
  const [demandas, setDemandas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const [modalOpen, setModalOpen] = useState(false);
  const [painelAberto, setPainelAberto] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    const [dRes, cRes, eRes] = await Promise.all([
      supabase.from('demandas').select('*').order('created_at', { ascending: false }),
      supabase.from('clientes').select('id, nome'),
      supabase.from('equipe').select('id, nome'),
    ]);

    setDemandas(dRes.data || []);
    setClientes(cRes.data || []);
    setEquipe(eRes.data || []);
    setLoading(false);
  }

  function resetForm() {
    setForm(INITIAL_FORM);
  }

  function setCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvarNova(e) {
    e.preventDefault();
    if (!form.titulo || !form.cliente_id) return;

    setSaving(true);
    const payload = {
      ...form,
      status: form.tipo === 'design' ? 'a_fazer' : 'criar_copy',
      created_at: new Date().toISOString(),
      data_limite: form.data_limite || null,
      data_publicacao: form.data_publicacao || null,
      responsavel_copy_id: form.responsavel_copy_id || null,
      responsavel_design_id: form.responsavel_design_id || null,
    };

    const { error } = await supabase.from('demandas').insert([payload]);
    setSaving(false);

    if (error) {
      alert('Erro ao salvar demanda: ' + error.message);
      return;
    }

    setModalOpen(false);
    resetForm();
    await carregar();
  }

  async function atualizarStatus(demanda, novoStatus) {
    await supabase.from('demandas').update({ status: novoStatus }).eq('id', demanda.id);
    setDemandas((prev) => prev.map((item) => (item.id === demanda.id ? { ...item, status: novoStatus } : item)));

    if (painelAberto?.id === demanda.id) {
      setPainelAberto((prev) => (prev ? { ...prev, status: novoStatus } : prev));
    }
  }

  async function salvarPainel(e) {
    e.preventDefault();
    if (!painelAberto) return;

    await supabase.from('demandas').update(painelAberto).eq('id', painelAberto.id);
    setDemandas((prev) => prev.map((item) => (item.id === painelAberto.id ? { ...item, ...painelAberto } : item)));
  }

  function onDragEnd(result) {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const demanda = demandas.find((item) => item.id === Number(draggableId));
    if (!demanda) return;

    atualizarStatus(demanda, destination.droppableId);
  }

  function dataInput(valor) {
    if (!valor) return '';
    const data = new Date(valor);
    return isNaN(data.getTime()) ? '' : data.toISOString().slice(0, 10);
  }

  function formatarData(valor) {
    if (!valor) return '—';
    const data = new Date(valor);
    return isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR');
  }

  function iniciais(nome = '') {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0])
      .join('')
      .toUpperCase();
  }

  function getResponsavel(demanda, campo) {
    return equipe.find((item) => item.id === demanda[campo])?.nome || 'Sem responsável';
  }

  function getClienteNome(id) {
    return clientes.find((item) => item.id === id)?.nome || 'Sem cliente';
  }

  function isAtrasada(dataLimite, status) {
    if (!dataLimite || ['finalizada', 'publicado'].includes(status)) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(dataLimite);
    alvo.setHours(0, 0, 0, 0);
    return alvo < hoje;
  }

  function estaProximo(dataLimite, status) {
    if (!dataLimite || ['finalizada', 'publicado'].includes(status)) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(dataLimite);
    alvo.setHours(0, 0, 0, 0);
    const diff = Math.ceil((alvo - hoje) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < 2;
  }

  const colunasAtivas = activeTab === 'design' ? DESIGN_COLUMNS : SOCIAL_COLUMNS;

  const demandasAtivas = useMemo(
    () => demandas.filter((item) => item.tipo === activeTab),
    [demandas, activeTab]
  );

  const demandasFiltradas = useMemo(() => {
    return demandasAtivas.filter((item) => {
      const buscaOk = item.titulo?.toLowerCase().includes(busca.toLowerCase());
      const clienteOk = !filtroCliente || item.cliente_id === filtroCliente;
      const responsavelOk = !filtroResponsavel || item.responsavel_design_id === filtroResponsavel || item.responsavel_copy_id === filtroResponsavel;
      const prioridadeOk = !filtroPrioridade || item.prioridade === filtroPrioridade;
      return buscaOk && clienteOk && responsavelOk && prioridadeOk;
    });
  }, [demandasAtivas, busca, filtroCliente, filtroResponsavel, filtroPrioridade]);

  const totais = useMemo(() => {
    const design = demandas.filter((item) => item.tipo === 'design');
    const social = demandas.filter((item) => item.tipo === 'social_media');

    const designEmAndamento = design.filter((item) => ['em_andamento', 'ajustes'].includes(item.status)).length;
    const designAtrasadas = design.filter((item) => isAtrasada(item.data_limite, item.status)).length;
    const designFinalizadas = design.filter((item) => item.status === 'finalizada').length;

    const socialAguardandoCopy = social.filter((item) => ['criar_copy', 'copy_em_andamento', 'ajustes_copy'].includes(item.status)).length;
    const socialEmDesign = social.filter((item) => ['criar_design', 'design_em_andamento', 'ajustes_design'].includes(item.status)).length;
    const socialAguardandoCliente = social.filter((item) => ['enviado_cliente', 'ajustes_cliente'].includes(item.status)).length;
    const socialAgendados = social.filter((item) => item.status === 'agendado').length;
    const socialPublicados = social.filter((item) => item.status === 'publicado').length;

    return {
      designTotal: design.length,
      designEmAndamento,
      designAtrasadas,
      designFinalizadas,
      socialTotal: social.length,
      socialAguardandoCopy,
      socialEmDesign,
      socialAguardandoCliente,
      socialAgendados,
      socialPublicados,
    };
  }, [demandas]);

  const colunasComCards = useMemo(() => {
    return colunasAtivas.map((coluna) => ({
      ...coluna,
      cards: demandasFiltradas.filter((item) => item.status === coluna.key),
    }));
  }, [colunasAtivas, demandasFiltradas]);

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.backgroundGlow}>
          <motion.div style={styles.glow1} animate={{ x: [0, 80, -40, 0], y: [0, -50, 30, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div style={styles.glow2} animate={{ x: [0, -60, 40, 0], y: [0, 30, -20, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div style={styles.glow3} animate={{ x: [0, 50, -70, 0], y: [0, -30, 40, 0] }} transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <motion.div style={styles.topbar} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div>
            <p style={styles.eyebrow}>GESTÃO</p>
            <h2 style={styles.title}>{activeTab === 'design' ? 'Demandas de Design' : 'Demandas Social Media'}</h2>
          </div>
          <button style={styles.addBtn} onClick={() => setModalOpen(true)}>+ Nova Demanda</button>
        </motion.div>

        <motion.div style={styles.tabs} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {[
            { key: 'design', label: 'Demandas de Design' },
            { key: 'social_media', label: 'Demandas Social Media' },
          ].map((tab) => (
            <button
              key={tab.key}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div style={styles.metricsRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {activeTab === 'design' ? (
            <>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.designTotal}</span><span style={styles.metricLabel}>Total de Demandas</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.designEmAndamento}</span><span style={styles.metricLabel}>Em Andamento</span></div>
              <div style={styles.metricCard}><span style={{ ...styles.metricValue, color: '#EF4444' }}>{totais.designAtrasadas}</span><span style={styles.metricLabel}>Atrasadas</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.designFinalizadas}</span><span style={styles.metricLabel}>Finalizadas</span></div>
            </>
          ) : (
            <>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.socialTotal}</span><span style={styles.metricLabel}>Total de Conteúdos</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.socialAguardandoCopy}</span><span style={styles.metricLabel}>Aguardando Copy</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.socialEmDesign}</span><span style={styles.metricLabel}>Em Design</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.socialAguardandoCliente}</span><span style={styles.metricLabel}>Aguardando Cliente</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.socialAgendados}</span><span style={styles.metricLabel}>Agendados</span></div>
              <div style={styles.metricCard}><span style={styles.metricValue}>{totais.socialPublicados}</span><span style={styles.metricLabel}>Publicados</span></div>
            </>
          )}
        </motion.div>

        <motion.div style={styles.toolbar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <input style={styles.searchInput} placeholder="Buscar por título..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <select style={styles.select} value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
            <option value="">Todos os clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
          <select style={styles.select} value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)}>
            <option value="">Todos os responsáveis</option>
            {equipe.map((membro) => (
              <option key={membro.id} value={membro.id}>{membro.nome}</option>
            ))}
          </select>
          <select style={styles.select} value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
            <option value="">Todas as prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </motion.div>

        {loading ? (
          <div style={styles.skeletonWrap}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={styles.skeletonCol} />
            ))}
          </div>
        ) : (
          <div style={styles.kanbanScroll}>
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={styles.kanbanBoard}>
                {colunasComCards.map((coluna) => (
                <Droppable key={coluna.key} droppableId={coluna.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        ...styles.column,
                        background: snapshot.isDraggingOver ? '#17171A' : '#111113',
                      }}
                    >
                      <div style={styles.columnHeader}>
                        <span style={styles.columnTitle}>{coluna.label}</span>
                        <span style={styles.columnCount}>{coluna.cards.length}</span>
                      </div>
                      <div style={styles.columnContent}>
                        {coluna.cards.length === 0 ? (
                          <div style={styles.emptyColumn}>Nenhuma demanda</div>
                        ) : (
                          coluna.cards.map((demanda, index) => {
                            const prioridade = PRIORIDADE_MAP[demanda.prioridade] || PRIORIDADE_MAP.media;
                            const responsavelDesign = getResponsavel(demanda, 'responsavel_design_id');
                            const responsavelCopy = getResponsavel(demanda, 'responsavel_copy_id');
                            const atrasada = isAtrasada(demanda.data_limite, demanda.status);
                            const proximo = estaProximo(demanda.data_limite, demanda.status);

                            return (
                              <Draggable key={demanda.id} draggableId={String(demanda.id)} index={index}>
                                {(draggableProvided, draggableSnapshot) => (
                                  <motion.div
                                    ref={draggableProvided.innerRef}
                                    {...draggableProvided.draggableProps}
                                    {...draggableProvided.dragHandleProps}
                                    style={{
                                      ...styles.card,
                                      transform: draggableSnapshot.isDragging ? 'rotate(1deg) scale(1.02)' : 'none',
                                      background: draggableSnapshot.isDragging ? '#18181B' : '#18181B',
                                    }}
                                    whileHover={{ y: -3, borderColor: '#EF4444' }}
                                    onClick={() => setPainelAberto(demanda)}
                                  >
                                    <div style={styles.cardTop}>
                                      <span style={{ ...styles.priorityBadge, background: `${prioridade.cor}18`, color: prioridade.cor }}>{prioridade.label}</span>
                                      {atrasada && <span style={styles.overdueBadge}>ATRASADA</span>}
                                    </div>
                                    <h4 style={styles.cardTitle}>{demanda.titulo}</h4>
                                    <p style={styles.cardClient}>{getClienteNome(demanda.cliente_id)}</p>
                                    <div style={styles.cardMetaRow}>
                                      <span style={styles.cardAvatar}>{iniciais(responsavelDesign)}</span>
                                      <span style={styles.cardPerson}>{responsavelDesign}</span>
                                    </div>
                                    <div style={styles.cardDates}>
                                      <span style={{ ...styles.dateChip, ...(proximo || atrasada ? { color: '#EF4444' } : {}) }}>📅 {formatarData(demanda.data_limite)}</span>
                                      {demanda.tipo === 'social_media' && demanda.data_publicacao && (
                                        <span style={styles.dateChip}>🚀 {formatarData(demanda.data_publicacao)}</span>
                                      )}
                                    </div>
                                    {demanda.tipo === 'social_media' && (
                                      <div style={styles.cardFooterInfo}>
                                        <span style={styles.footerLabel}>Copy: {responsavelCopy}</span>
                                        <span style={styles.footerLabel}>Design: {responsavelDesign}</span>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
        )}

        <AnimatePresence>
          {painelAberto && (
            <motion.div style={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPainelAberto(null)}>
              <motion.aside style={styles.drawer} initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} onClick={(e) => e.stopPropagation()}>
                <div style={styles.drawerHeader}>
                  <div>
                    <p style={styles.drawerEyebrow}>Detalhes da demanda</p>
                    <h3 style={styles.drawerTitle}>{painelAberto.titulo}</h3>
                  </div>
                  <button style={styles.closeBtn} onClick={() => setPainelAberto(null)}>?</button>
                </div>

                <form onSubmit={salvarPainel}>
                  <div style={styles.drawerGrid}>
                    <div style={styles.field}>
                      <label style={styles.label}>Título</label>
                      <input style={styles.input} value={painelAberto.titulo || ''} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, titulo: e.target.value } : prev)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Cliente</label>
                      <select style={styles.input} value={painelAberto.cliente_id || ''} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, cliente_id: e.target.value } : prev)}>
                        <option value="">Selecione</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Status</label>
                      <select style={styles.input} value={painelAberto.status || ''} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, status: e.target.value } : prev)}>
                        {(painelAberto.tipo === 'design' ? DESIGN_COLUMNS : SOCIAL_COLUMNS).map((coluna) => (
                          <option key={coluna.key} value={coluna.key}>{coluna.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Prioridade</label>
                      <select style={styles.input} value={painelAberto.prioridade || 'media'} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, prioridade: e.target.value } : prev)}>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Responsável do Design</label>
                      <select style={styles.input} value={painelAberto.responsavel_design_id || ''} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, responsavel_design_id: e.target.value } : prev)}>
                        <option value="">Selecione</option>
                        {equipe.map((membro) => (
                          <option key={membro.id} value={membro.id}>{membro.nome}</option>
                        ))}
                      </select>
                    </div>
                    {painelAberto.tipo === 'social_media' && (
                      <>
                        <div style={styles.field}>
                          <label style={styles.label}>Responsável da Copy</label>
                          <select style={styles.input} value={painelAberto.responsavel_copy_id || ''} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, responsavel_copy_id: e.target.value } : prev)}>
                            <option value="">Selecione</option>
                            {equipe.map((membro) => (
                              <option key={membro.id} value={membro.id}>{membro.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Tipo de Conteúdo</label>
                          <select style={styles.input} value={painelAberto.tipo_conteudo || 'feed'} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, tipo_conteudo: e.target.value } : prev)}>
                            <option value="feed">Feed</option>
                            <option value="carrossel">Carrossel</option>
                            <option value="story">Story</option>
                            <option value="reels">Reels</option>
                            <option value="campanha">Campanha</option>
                          </select>
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Data de Publicação</label>
                          <input style={styles.input} type="date" value={dataInput(painelAberto.data_publicacao)} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, data_publicacao: e.target.value } : prev)} />
                        </div>
                      </>
                    )}
                    {painelAberto.tipo === 'design' && (
                      <div style={styles.field}>
                        <label style={styles.label}>Categoria</label>
                        <select style={styles.input} value={painelAberto.categoria || 'branding'} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, categoria: e.target.value } : prev)}>
                          <option value="branding">Branding</option>
                          <option value="landing_page">Landing Page</option>
                          <option value="apresentacao">Apresentação</option>
                          <option value="site">Site</option>
                          <option value="impressos">Impressos</option>
                          <option value="criativos">Criativos</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                    )}
                    <div style={styles.field}>
                      <label style={styles.label}>Data Limite</label>
                      <input style={styles.input} type="date" value={dataInput(painelAberto.data_limite)} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, data_limite: e.target.value } : prev)} />
                    </div>
                    <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Descrição</label>
                      <textarea style={{ ...styles.input, minHeight: 96 }} value={painelAberto.descricao || ''} onChange={(e) => setPainelAberto((prev) => prev ? { ...prev, descricao: e.target.value } : prev)} />
                    </div>
                  </div>
                  <div style={styles.drawerFooter}>
                    <button type="submit" style={styles.saveDrawerBtn}>Salvar Alterações</button>
                  </div>
                </form>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalOpen && (
            <motion.div style={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}>
              <motion.div style={styles.modalCard} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Nova Demanda</h3>
                  <button style={styles.closeBtn} onClick={() => setModalOpen(false)}>?</button>
                </div>
                <form onSubmit={salvarNova}>
                  <div style={styles.modalGrid}>
                    <div style={styles.field}>
                      <label style={styles.label}>Título</label>
                      <input style={styles.input} value={form.titulo} onChange={(e) => setCampo('titulo', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Cliente</label>
                      <select style={styles.input} value={form.cliente_id} onChange={(e) => setCampo('cliente_id', e.target.value)}>
                        <option value="">Selecione</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Descrição</label>
                      <textarea style={{ ...styles.input, minHeight: 96 }} value={form.descricao} onChange={(e) => setCampo('descricao', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Tipo da Demanda</label>
                      <select style={styles.input} value={form.tipo} onChange={(e) => {
                        const nextTipo = e.target.value;
                        setCampo('tipo', nextTipo);
                        setCampo('status', nextTipo === 'design' ? 'a_fazer' : 'criar_copy');
                      }}>
                        <option value="design">Design</option>
                        <option value="social_media">Social Media</option>
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Prioridade</label>
                      <select style={styles.input} value={form.prioridade} onChange={(e) => setCampo('prioridade', e.target.value)}>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>
                    {form.tipo === 'social_media' ? (
                      <>
                        <div style={styles.field}>
                          <label style={styles.label}>Responsável da Copy</label>
                          <select style={styles.input} value={form.responsavel_copy_id} onChange={(e) => setCampo('responsavel_copy_id', e.target.value)}>
                            <option value="">Selecione</option>
                            {equipe.map((membro) => (
                              <option key={membro.id} value={membro.id}>{membro.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Responsável do Design</label>
                          <select style={styles.input} value={form.responsavel_design_id} onChange={(e) => setCampo('responsavel_design_id', e.target.value)}>
                            <option value="">Selecione</option>
                            {equipe.map((membro) => (
                              <option key={membro.id} value={membro.id}>{membro.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Data Limite</label>
                          <input style={styles.input} type="date" value={form.data_limite} onChange={(e) => setCampo('data_limite', e.target.value)} />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Data de Publicação</label>
                          <input style={styles.input} type="date" value={form.data_publicacao} onChange={(e) => setCampo('data_publicacao', e.target.value)} />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Tipo de Conteúdo</label>
                          <select style={styles.input} value={form.tipo_conteudo} onChange={(e) => setCampo('tipo_conteudo', e.target.value)}>
                            <option value="feed">Feed</option>
                            <option value="carrossel">Carrossel</option>
                            <option value="story">Story</option>
                            <option value="reels">Reels</option>
                            <option value="campanha">Campanha</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={styles.field}>
                          <label style={styles.label}>Responsável do Design</label>
                          <select style={styles.input} value={form.responsavel_design_id} onChange={(e) => setCampo('responsavel_design_id', e.target.value)}>
                            <option value="">Selecione</option>
                            {equipe.map((membro) => (
                              <option key={membro.id} value={membro.id}>{membro.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Data Limite</label>
                          <input style={styles.input} type="date" value={form.data_limite} onChange={(e) => setCampo('data_limite', e.target.value)} />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Categoria</label>
                          <select style={styles.input} value={form.categoria} onChange={(e) => setCampo('categoria', e.target.value)}>
                            <option value="branding">Branding</option>
                            <option value="landing_page">Landing Page</option>
                            <option value="apresentacao">Apresentação</option>
                            <option value="site">Site</option>
                            <option value="impressos">Impressos</option>
                            <option value="criativos">Criativos</option>
                            <option value="outros">Outros</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={styles.modalActions}>
                    <button type="button" style={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
                    <button type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Salvando...' : 'Criar Demanda'}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0A0A0C 0%, #050507 100%)',
    fontFamily: 'Arial, sans-serif',
    position: 'relative'
  },
  main: {
    marginLeft: 220,
    flex: 1,
    minWidth: 0,
    padding: '32px 36px 48px',
    position: 'relative',
    overflowX: 'hidden',
    background: 'linear-gradient(180deg, #0B0B0D 0%, #050507 100%)',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  backgroundGlow: { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', background: 'radial-gradient(circle at top, rgba(239,68,68,0.04), transparent 18%)' },
  glow1: { position: 'absolute', width: 240, height: 240, background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0) 70%)', top: 40, right: 120 },
  glow2: { position: 'absolute', width: 220, height: 220, background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0) 70%)', bottom: 60, left: 180 },
  glow3: { position: 'absolute', width: 180, height: 180, background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, rgba(245,158,11,0) 70%)', top: 200, left: 360 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18, position: 'relative', zIndex: 1 },
  eyebrow: { margin: 0, color: '#EF4444', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em' },
  title: { margin: '6px 0 0', color: '#FFFFFF', fontSize: 28, fontWeight: 800 },
  addBtn: { background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.22)' },
  tabs: { display: 'inline-flex', gap: 8, background: '#111113', border: '1px solid #27272A', borderRadius: 999, padding: 6, marginBottom: 18, position: 'relative', zIndex: 1 },
  tab: { background: 'transparent', border: 'none', color: '#A1A1AA', padding: '10px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  tabActive: { background: '#18181B', color: '#FFFFFF', boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.08)' },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12, position: 'relative', zIndex: 1, marginBottom: 18 },
  metricCard: { background: '#111113', border: '1px solid #27272A', borderRadius: 16, padding: '14px 16px', boxShadow: '0 10px 24px rgba(0, 0, 0, 0.22)' },
  metricValue: { display: 'block', color: '#FFFFFF', fontSize: 22, fontWeight: 800 },
  metricLabel: { display: 'block', color: '#A1A1AA', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 },
  toolbar: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18, position: 'relative', zIndex: 1 },
  searchInput: { flex: 1, minWidth: 220, background: '#111113', color: '#FFFFFF', border: '1px solid #27272A', borderRadius: 12, padding: '11px 14px', outline: 'none' },
  select: { background: '#111113', color: '#FFFFFF', border: '1px solid #27272A', borderRadius: 12, padding: '11px 14px', outline: 'none' },
  skeletonWrap: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, position: 'relative', zIndex: 1, width: '100%' },
  skeletonCol: { height: 420, background: 'linear-gradient(90deg, #111113 0%, #18181B 50%, #111113 100%)', borderRadius: 18, animation: 'pulse 1.6s infinite' },
  kanbanScroll: { width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden', position: 'relative', zIndex: 1 },
  kanbanBoard: { display: 'flex', gap: 14, width: 'max-content', minWidth: '100%', paddingBottom: 8 },
  column: { flex: '0 0 280px', width: 280, borderRadius: 18, border: '1px solid #27272A', padding: 12, minHeight: 420, background: '#0F0F11', boxSizing: 'border-box' },
  columnHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  columnTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: 700 },
  columnCount: { color: '#A1A1AA', fontSize: 12, fontWeight: 700, background: '#18181B', borderRadius: 999, padding: '4px 8px' },
  columnContent: { display: 'flex', flexDirection: 'column', gap: 10 },
  emptyColumn: { background: '#0D0D10', color: '#A1A1AA', borderRadius: 12, padding: '24px 12px', textAlign: 'center', fontSize: 13 },
  card: { background: '#16161A', borderRadius: 14, padding: 14, border: '1px solid #2A2A30', cursor: 'pointer', boxShadow: '0 10px 26px rgba(0, 0, 0, 0.22)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 8 },
  priorityBadge: { display: 'inline-flex', alignItems: 'center', padding: '5px 8px', fontSize: 10, fontWeight: 700, borderRadius: 999, textTransform: 'uppercase' },
  overdueBadge: { background: '#EF4444', color: '#FFFFFF', fontSize: 10, fontWeight: 700, padding: '4px 7px', borderRadius: 999 },
  cardTitle: { margin: 0, color: '#FFFFFF', fontSize: 13, fontWeight: 700, lineHeight: 1.3 },
  cardClient: { margin: '6px 0 10px', color: '#A1A1AA', fontSize: 11 },
  cardMetaRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardAvatar: { width: 24, height: 24, borderRadius: '50%', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 },
  cardPerson: { color: '#FFFFFF', fontSize: 11, fontWeight: 600 },
  cardDates: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  dateChip: { color: '#A1A1AA', fontSize: 10, fontWeight: 600 },
  cardFooterInfo: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 },
  footerLabel: { color: '#A1A1AA', fontSize: 10 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2, 2, 4, 0.88)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1200 },
  drawer: { background: '#0F0F11', width: 420, maxWidth: '92vw', height: '100vh', overflowY: 'auto', padding: 24, borderLeft: '1px solid #27272A', boxSizing: 'border-box' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  drawerEyebrow: { margin: 0, color: '#A1A1AA', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
  drawerTitle: { margin: '6px 0 0', color: '#FFFFFF', fontSize: 22, fontWeight: 800 },
  closeBtn: { width: 38, height: 38, borderRadius: 12, border: '1px solid #27272A', background: '#18181B', color: '#FFFFFF', cursor: 'pointer' },
  drawerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#A1A1AA', fontSize: 12, fontWeight: 700 },
  input: { width: '100%', background: '#18181B', color: '#FFFFFF', border: '1px solid #27272A', borderRadius: 10, padding: '10px 12px', outline: 'none', boxSizing: 'border-box' },
  drawerFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: 18 },
  saveDrawerBtn: { background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(2, 2, 4, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1300 },
  modalCard: { background: '#0F0F11', width: 760, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', borderRadius: 18, border: '1px solid #27272A', padding: 24, boxSizing: 'border-box' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 },
  modalTitle: { margin: 0, color: '#FFFFFF', fontSize: 22, fontWeight: 800 },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { background: '#18181B', color: '#FFFFFF', border: '1px solid #27272A', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontWeight: 700 },
  saveBtn: { background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 18px', cursor: 'pointer', fontWeight: 700 },
};