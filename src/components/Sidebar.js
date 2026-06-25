import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menu = [
  { label: 'CLIENTES', path: '/' },
  { label: 'CALENDÁRIO', path: '/calendario' },
  { label: 'DEMANDAS', path: '/demandas' },
  { label: 'EQUIPE', path: '/equipe' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={styles.sidebar}>
      <div>
        <div style={styles.logoBlock}>
          <p style={styles.eyebrow}>ESTÚDIO</p>
          <h1 style={styles.logo}>BASTIDØR</h1>
          <div style={styles.logoLine} />
        </div>
        <nav style={styles.nav}>
          {menu.map(item => {
            const ativo = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ ...styles.menuItem, ...(ativo ? styles.menuItemActive : {}) }}>
                {ativo && <div style={styles.activeBar} />}
                <span style={{ ...styles.menuLabel, ...(ativo ? styles.menuLabelActive : {}) }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div style={styles.bottom}>
        <div style={styles.bottomLine} />
        <p style={styles.bottomText}>BASTIDØR © 2026</p>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 220,
    minHeight: '100vh',
    background: '#0D0D0D',
    borderRight: '1px solid #1A1A1A',
    padding: '36px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 50,
  },
  logoBlock: {
    padding: '0 24px 32px',
    borderBottom: '1px solid #1A1A1A',
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: '0.25em',
    color: '#CC1111',
    margin: '0 0 4px',
    fontFamily: 'Arial, sans-serif',
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 16px',
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '0.1em',
  },
  logoLine: {
    width: 24,
    height: 2,
    background: '#CC1111',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 12px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '11px 12px',
    borderRadius: 2,
    border: 'none',
    background: 'none',
    color: '#444',
    fontSize: 10,
    letterSpacing: '0.15em',
    fontFamily: 'Arial, sans-serif',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
  },
  menuItemActive: {
    background: '#141414',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 2,
    height: 16,
    background: '#CC1111',
    borderRadius: 2,
  },
  menuLabel: {
    color: '#444',
  },
  menuLabelActive: {
    color: '#FFFFFF',
    fontWeight: 700,
  },
  bottom: {
    padding: '0 24px',
  },
  bottomLine: {
    width: '100%',
    height: 1,
    background: '#1A1A1A',
    marginBottom: 16,
  },
  bottomText: {
    fontSize: 9,
    color: '#2A2A2A',
    letterSpacing: '0.15em',
    margin: 0,
    fontFamily: 'Arial, sans-serif',
  },
};