import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabase';

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      setClientes(data || []);
      setCarregando(false);
    }

    carregar();
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const tipoOk = filtro === 'todos' || c.tipo === filtro;
    const buscaOk = c.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    return tipoOk && buscaOk;
  });

  function iniciais(nome) {
    return nome
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  const totalSM = clientes.filter(
    (c) => c.tipo === 'social_media'
  ).length;

  const totalDesign = clientes.filter(
    (c) => c.tipo === 'design'
  ).length;

  return (
    <div style={styles.container}>
      <Sidebar />

      <motion.main
        style={styles.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={styles.backgroundGlow}>
          <motion.div
            style={styles.glow1}
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -50, 30, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            style={styles.glow2}
            animate={{
              x: [0, -60, 40, 0],
              y: [0, 30, -20, 0],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            style={styles.glow3}
            animate={{
              x: [0, 50, -70, 0],
              y: [0, -30, 40, 0],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <motion.div
          style={styles.topbar}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p style={styles.eyebrow}>VISÃO GERAL</p>

            <h2 style={styles.title}>Clientes</h2>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              style={styles.titleLine}
            />
          </div>

          <motion.button
            style={styles.addBtn}
            onClick={() => navigate('/clientes/novo')}
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            + NOVO CLIENTE
          </motion.button>
        </motion.div>

        <motion.div
          style={styles.statsRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            style={styles.statCard}
            whileHover={{
              y: -4,
              borderColor: '#CC1111',
              boxShadow:
                '0 10px 30px rgba(204,17,17,0.15)',
            }}
          >
            <p style={styles.statNum}>
              {clientes.length}
            </p>

            <p style={styles.statLabel}>
              TOTAL DE CLIENTES
            </p>
          </motion.div>

          <motion.div
            style={styles.statCard}
            whileHover={{
              y: -4,
              borderColor: '#CC1111',
              boxShadow:
                '0 10px 30px rgba(204,17,17,0.15)',
            }}
          >
            <p
              style={{
                ...styles.statNum,
                color: '#CC1111',
              }}
            >
              {totalSM}
            </p>

            <p style={styles.statLabel}>
              SOCIAL MEDIA
            </p>
          </motion.div>

          <motion.div
            style={styles.statCard}
            whileHover={{
              y: -4,
              borderColor: '#CC1111',
              boxShadow:
                '0 10px 30px rgba(204,17,17,0.15)',
            }}
          >
            <p
              style={{
                ...styles.statNum,
                color: '#888',
              }}
            >
              {totalDesign}
            </p>

            <p style={styles.statLabel}>
              DESIGN
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          style={styles.toolbar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <input
            style={styles.busca}
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
          />

          <div style={styles.filtros}>
            {[
              'todos',
              'social_media',
              'design',
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  ...styles.filtroBtn,
                  ...(filtro === f
                    ? styles.filtroBtnActive
                    : {}),
                }}
              >
                {f === 'todos'
                  ? 'TODOS'
                  : f === 'social_media'
                  ? 'SOCIAL MEDIA'
                  : 'DESIGN'}
              </button>
            ))}
          </div>
        </motion.div>

        {carregando ? (
          <p style={styles.empty}>
            Carregando...
          </p>
        ) : clientesFiltrados.length === 0 ? (
          <p style={styles.empty}>
            Nenhum cliente encontrado.
          </p>
        ) : (
          <motion.div
            style={styles.grid}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {clientesFiltrados.map((cliente) => (
              <motion.div
                key={cliente.id}
                style={styles.card}
                onClick={() =>
                  navigate(
                    `/clientes/${cliente.id}`
                  )
                }
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{
                  y: -6,
                  borderColor: '#CC1111',
                  boxShadow:
                    '0 12px 30px rgba(204,17,17,0.12)',
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                <div style={styles.cardAccent} />

                <div style={styles.cardTop}>
                  <div
                    style={{
                      ...styles.avatar,
                      background:
                        cliente.tipo ===
                        'social_media'
                          ? '#CC1111'
                          : '#222',
                    }}
                  >
                    {iniciais(cliente.nome)}
                  </div>

                  <div style={styles.cardInfo}>
                    <p style={styles.cardNome}>
                      {cliente.nome}
                    </p>

                    {cliente.instagram && (
                      <p style={styles.cardHandle}>
                        @{cliente.instagram}
                      </p>
                    )}

                    {cliente.segmento && (
                      <p style={styles.cardSeg}>
                        {cliente.segmento}
                      </p>
                    )}
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(cliente.tipo ===
                      'social_media'
                        ? styles.badgeSM
                        : styles.badgeDesign),
                    }}
                  >
                    {cliente.tipo ===
                    'social_media'
                      ? 'SOCIAL MEDIA'
                      : 'DESIGN'}
                  </span>

                  <span style={styles.cardArrow}>
                    →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0D0D0D',
    fontFamily: 'Arial, sans-serif',
  },

  main: {
    marginLeft: 220,
    padding: '40px 44px',
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },

  topbar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: '0.2em',
    color: '#444',
    margin: '0 0 6px',
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#FFF',
    margin: 0,
    letterSpacing: '0.02em',
  },

  titleLine: {
    height: 2,
    background: '#CC1111',
    marginTop: 12,
  },

  addBtn: {
    background: '#CC1111',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '10px 20px',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    cursor: 'pointer',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 32,
  },

  statCard: {
    background: '#141414',
    border: '1px solid #222',
    borderRadius: 4,
    padding: '20px 24px',
    transition: 'all .2s ease',
  },

  statNum: {
    fontSize: 32,
    fontWeight: 700,
    color: '#FFF',
    margin: '0 0 4px',
  },

  statLabel: {
    fontSize: 10,
    color: '#444',
    letterSpacing: '0.15em',
    margin: 0,
  },

  toolbar: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
    alignItems: 'center',
  },

  busca: {
    flex: 1,
    fontSize: 13,
    padding: '10px 14px',
    borderRadius: 4,
    border: '1px solid #222',
    background: '#141414',
    color: '#FFF',
    outline: 'none',
  },

  filtros: {
    display: 'flex',
    gap: 6,
  },

  filtroBtn: {
    padding: '8px 16px',
    borderRadius: 4,
    border: '1px solid #222',
    background: 'none',
    color: '#444',
    fontSize: 10,
    letterSpacing: '0.1em',
    cursor: 'pointer',
  },

  filtroBtnActive: {
    background: '#CC1111',
    color: '#fff',
    border: '1px solid #CC1111',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },

  card: {
    background: '#141414',
    borderRadius: 4,
    padding: 20,
    cursor: 'pointer',
    border: '1px solid #222',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },

  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    background: '#CC1111',
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },

  cardInfo: {
    flex: 1,
    minWidth: 0,
  },

  cardNome: {
    fontSize: 14,
    fontWeight: 700,
    color: '#FFF',
    margin: '0 0 2px',
  },

  cardHandle: {
    fontSize: 12,
    color: '#555',
    margin: '0 0 2px',
  },

  cardSeg: {
    fontSize: 11,
    color: '#444',
    margin: 0,
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
  },

  badge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 2,
    letterSpacing: '0.1em',
  },

  badgeSM: {
    background: '#CC111122',
    color: '#CC1111',
  },

  badgeDesign: {
    background: '#FFFFFF11',
    color: '#888',
  },

  cardArrow: {
    fontSize: 16,
    color: '#333',
  },

  empty: {
    fontSize: 13,
    color: '#444',
    marginTop: 60,
    textAlign: 'center',
  },

  backgroundGlow: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: -1,
  },

  glow1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: '#CC1111',
    filter: 'blur(180px)',
    opacity: 0.05,
    top: '5%',
    left: '10%',
  },

  glow2: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: '50%',
    background: '#CC1111',
    filter: 'blur(240px)',
    opacity: 0.04,
    bottom: '-10%',
    right: '5%',
  },

  glow3: {
    position: 'absolute',
    width: 450,
    height: 450,
    borderRadius: '50%',
    background: '#ffffff',
    filter: 'blur(200px)',
    opacity: 0.015,
    top: '40%',
    left: '50%',
  },
};