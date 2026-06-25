import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabase';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const INITIAL_FORM = {
  nome: '',
  tipo: 'social_media',
  segmento: '',
  cidade: '',
  estado: '',
  instagram: '',
  facebook: '',
  meta_page_id: '',
  contato_nome: '',
  contato_whatsapp: '',
  contato_email: '',
  instagram_login: '',
  instagram_senha: '',
  facebook_login: '',
  facebook_senha: '',
  email_login: '',
  email_senha: '',
  outros_acessos: '',
  identidade_link: '',
  identidade_cores: [],
  identidade_fontes: [],
  diretrizes: '',
  observacoes: '',
  avatarPreview: '',
};

export default function NovoCliente() {
  const navigate = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPasswords, setShowPasswords] = useState({
    instagram_senha: false,
    facebook_senha: false,
    email_senha: false,
  });
  const [arquivos, setArquivos] = useState([]);
  const [logos, setLogos] = useState([]);
  const [docs, setDocs] = useState([]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function setArray(campo, index, valor) {
    setForm((f) => {
      const arr = [...(f[campo] || [])];
      arr[index] = valor;
      return { ...f, [campo]: arr };
    });
  }

  function addArrayItem(campo) {
    setForm((f) => ({
      ...f,
      [campo]: [...(f[campo] || []), ''],
    }));
  }

  function removeArrayItem(campo, index) {
    setForm((f) => ({
      ...f,
      [campo]: (f[campo] || []).filter((_, i) => i !== index),
    }));
  }

  function toggleSenha(campo) {
    setShowPasswords((prev) => ({
      ...prev,
      [campo]: !prev[campo],
    }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, avatarPreview: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function handleUpload(target, files) {
    const lista = Array.from(files || []);
    if (target === 'arquivos') setArquivos((prev) => [...prev, ...lista]);
    if (target === 'logos') setLogos((prev) => [...prev, ...lista]);
    if (target === 'docs') setDocs((prev) => [...prev, ...lista]);
  }

  function removeUpload(target, index) {
    if (target === 'arquivos') setArquivos((prev) => prev.filter((_, i) => i !== index));
    if (target === 'logos') setLogos((prev) => prev.filter((_, i) => i !== index));
    if (target === 'docs') setDocs((prev) => prev.filter((_, i) => i !== index));
  }

  function formatFileSize(size) {
    if (size === 0) return '0 KB';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / 1024 ** i).toFixed(1)} ${['B', 'KB', 'MB', 'GB'][i]}`;
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);

    const payload = {
      nome: form.nome,
      tipo: form.tipo,
      segmento: form.segmento || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      meta_page_id: form.meta_page_id || null,
      contato_nome: form.contato_nome || null,
      contato_whatsapp: form.contato_whatsapp || null,
      contato_email: form.contato_email || null,
      observacoes: form.observacoes || null,
      identidade_link: form.identidade_link || null,
      identidade_cores: form.identidade_cores.filter(Boolean).join(', '),
      identidade_fontes: form.identidade_fontes.filter(Boolean).join(', '),
      identidade_links_extras: form.diretrizes || null,
    };

    const { error } = await supabase.from('clientes').insert([payload]);
    setSalvando(false);

    if (!error) {
      navigate('/');
    } else {
      alert('Erro ao salvar cliente.');
    }
  }

  const isSM = form.tipo === 'social_media';

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        <motion.div
          style={styles.topbar}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <button style={styles.back} onClick={() => navigate('/')}>
            ← Clientes
          </button>
          <div>
            <p style={styles.eyebrow}>CADASTRO</p>
            <h2 style={styles.title}>Novo cliente</h2>
          </div>
        </motion.div>

        <form onSubmit={salvar}>
          <div style={styles.grid}>
            <div>
              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                <p style={styles.sectionLabel}>Dados do Cliente</p>
                <div style={styles.avatarWrap}>
                  <label style={styles.avatarBox}>
                    {form.avatarPreview ? (
                      <img src={form.avatarPreview} alt="avatar" style={styles.avatarImage} />
                    ) : (
                      <div style={styles.avatarFallback}>
                        {form.nome ? form.nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() : 'CL'}
                      </div>
                    )}
                    <input type="file" accept="image/*" style={styles.hiddenInput} onChange={handleAvatarChange} />
                  </label>
                  <div style={styles.avatarText}>
                    <p style={styles.avatarTitle}>Foto / avatar</p>
                    <p style={styles.avatarHint}>PNG, JPG ou WEBP. Preview imediato.</p>
                  </div>
                </div>

                <div style={styles.typeRow}>
                  {[
                    { value: 'social_media', label: 'Social Media' },
                    { value: 'design', label: 'Design' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      style={{
                        ...styles.typeBtn,
                        ...(form.tipo === item.value ? styles.typeBtnActive : {}),
                      }}
                      onClick={() => set('tipo', item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nome do cliente *</label>
                    <input style={styles.input} required value={form.nome} onChange={(e) => set('nome', e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Segmento</label>
                    <input style={styles.input} value={form.segmento} onChange={(e) => set('segmento', e.target.value)} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Cidade</label>
                    <input style={styles.input} value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Estado</label>
                    <select style={styles.input} value={form.estado} onChange={(e) => set('estado', e.target.value)}>
                      <option value="">Selecione</option>
                      {UFS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.section>

              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.03 }}
              >
                <p style={styles.sectionLabel}>Contato Principal</p>
                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nome do responsável</label>
                    <input style={styles.input} value={form.contato_nome} onChange={(e) => set('contato_nome', e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>WhatsApp</label>
                    <input style={styles.input} value={form.contato_whatsapp} onChange={(e) => set('contato_whatsapp', e.target.value)} />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>E-mail</label>
                  <input style={styles.input} type="email" value={form.contato_email} onChange={(e) => set('contato_email', e.target.value)} />
                </div>
              </motion.section>
            </div>

            <div>
              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.06 }}
              >
                <p style={styles.sectionLabel}>Redes Sociais</p>
                {isSM ? (
                  <>
                    <div style={styles.field}>
                      <label style={styles.label}>@ Instagram</label>
                      <input style={styles.input} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>@ Facebook</label>
                      <input style={styles.input} value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>ID da página do Facebook</label>
                      <input style={styles.input} value={form.meta_page_id} onChange={(e) => set('meta_page_id', e.target.value)} />
                    </div>
                  </>
                ) : (
                  <div style={styles.noticeCard}>
                    <p style={styles.noticeText}>Para clientes de design, os campos de redes sociais ficam opcionais.</p>
                  </div>
                )}
              </motion.section>

              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.09 }}
              >
                <p style={styles.sectionLabel}>Acessos e Senhas</p>
                <div style={styles.field}>
                  <label style={styles.label}>Instagram (login)</label>
                  <input style={styles.input} value={form.instagram_login} onChange={(e) => set('instagram_login', e.target.value)} />
                </div>
                <div style={styles.passwordField}>
                  <label style={styles.label}>Instagram (senha)</label>
                  <div style={styles.passwordWrap}>
                    <input
                      style={styles.passwordInput}
                      value={form.instagram_senha}
                      onChange={(e) => set('instagram_senha', e.target.value)}
                      type={showPasswords.instagram_senha ? 'text' : 'password'}
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => toggleSenha('instagram_senha')}>
                      {showPasswords.instagram_senha ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Facebook (login)</label>
                  <input style={styles.input} value={form.facebook_login} onChange={(e) => set('facebook_login', e.target.value)} />
                </div>
                <div style={styles.passwordField}>
                  <label style={styles.label}>Facebook (senha)</label>
                  <div style={styles.passwordWrap}>
                    <input
                      style={styles.passwordInput}
                      value={form.facebook_senha}
                      onChange={(e) => set('facebook_senha', e.target.value)}
                      type={showPasswords.facebook_senha ? 'text' : 'password'}
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => toggleSenha('facebook_senha')}>
                      {showPasswords.facebook_senha ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>E-mail (login)</label>
                  <input style={styles.input} value={form.email_login} onChange={(e) => set('email_login', e.target.value)} />
                </div>
                <div style={styles.passwordField}>
                  <label style={styles.label}>E-mail (senha)</label>
                  <div style={styles.passwordWrap}>
                    <input
                      style={styles.passwordInput}
                      value={form.email_senha}
                      onChange={(e) => set('email_senha', e.target.value)}
                      type={showPasswords.email_senha ? 'text' : 'password'}
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => toggleSenha('email_senha')}>
                      {showPasswords.email_senha ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Outros acessos</label>
                  <textarea
                    style={{ ...styles.input, minHeight: 96, resize: 'vertical' }}
                    value={form.outros_acessos}
                    onChange={(e) => set('outros_acessos', e.target.value)}
                  />
                </div>
              </motion.section>

              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.12 }}
              >
                <p style={styles.sectionLabel}>Identidade Visual</p>
                <div style={styles.field}>
                  <label style={styles.label}>Link do Canva / Figma</label>
                  <input style={styles.input} value={form.identidade_link} onChange={(e) => set('identidade_link', e.target.value)} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Cores da marca</label>
                  <div style={styles.arrayList}>
                    {(form.identidade_cores || []).map((cor, index) => (
                      <div key={index} style={styles.colorItem}>
                        <input
                          type="color"
                          value={cor || '#CC1111'}
                          onChange={(e) => setArray('identidade_cores', index, e.target.value)}
                          style={styles.colorPicker}
                        />
                        <input
                          style={{ ...styles.input, flex: 1 }}
                          value={cor}
                          onChange={(e) => setArray('identidade_cores', index, e.target.value)}
                          placeholder="#CC1111"
                        />
                        <button type="button" style={styles.removeMini} onClick={() => removeArrayItem('identidade_cores', index)}>
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" style={styles.addMini} onClick={() => addArrayItem('identidade_cores')}>
                      + Adicionar cor
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Fontes utilizadas</label>
                  <div style={styles.arrayList}>
                    {(form.identidade_fontes || []).map((fonte, index) => (
                      <div key={index} style={styles.colorItem}>
                        <input
                          style={{ ...styles.input, flex: 1 }}
                          value={fonte}
                          onChange={(e) => setArray('identidade_fontes', index, e.target.value)}
                          placeholder="Inter, Sora, etc."
                        />
                        <button type="button" style={styles.removeMini} onClick={() => removeArrayItem('identidade_fontes', index)}>
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" style={styles.addMini} onClick={() => addArrayItem('identidade_fontes')}>
                      + Adicionar fonte
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Diretrizes da marca</label>
                  <textarea
                    style={{ ...styles.input, minHeight: 140, resize: 'vertical' }}
                    value={form.diretrizes}
                    onChange={(e) => set('diretrizes', e.target.value)}
                  />
                </div>
              </motion.section>

              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.15 }}
              >
                <p style={styles.sectionLabel}>Materiais e Arquivos</p>
                <div style={styles.uploadGrid}>
                  <div style={styles.uploadBlock}>
                    <label style={styles.uploadLabel}>Upload de arquivos</label>
                    <input type="file" multiple style={styles.input} onChange={(e) => handleUpload('arquivos', e.target.files)} />
                    <div style={styles.uploadList}>
                      {arquivos.map((file, index) => (
                        <div key={index} style={styles.uploadCard}>
                          <div>
                            <p style={styles.uploadName}>{file.name}</p>
                            <p style={styles.uploadMeta}>{formatFileSize(file.size)}</p>
                          </div>
                          <button type="button" style={styles.removeMini} onClick={() => removeUpload('arquivos', index)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={styles.uploadBlock}>
                    <label style={styles.uploadLabel}>Upload de logos</label>
                    <input type="file" multiple accept="image/*" style={styles.input} onChange={(e) => handleUpload('logos', e.target.files)} />
                    <div style={styles.uploadList}>
                      {logos.map((file, index) => (
                        <div key={index} style={styles.uploadCard}>
                          <div>
                            <p style={styles.uploadName}>{file.name}</p>
                            <p style={styles.uploadMeta}>{formatFileSize(file.size)}</p>
                          </div>
                          <button type="button" style={styles.removeMini} onClick={() => removeUpload('logos', index)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={styles.uploadBlock}>
                    <label style={styles.uploadLabel}>Upload de documentos</label>
                    <input type="file" multiple style={styles.input} onChange={(e) => handleUpload('docs', e.target.files)} />
                    <div style={styles.uploadList}>
                      {docs.map((file, index) => (
                        <div key={index} style={styles.uploadCard}>
                          <div>
                            <p style={styles.uploadName}>{file.name}</p>
                            <p style={styles.uploadMeta}>{formatFileSize(file.size)}</p>
                          </div>
                          <button type="button" style={styles.removeMini} onClick={() => removeUpload('docs', index)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                style={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.18 }}
              >
                <p style={styles.sectionLabel}>Observações Internas</p>
                <textarea
                  style={{ ...styles.input, minHeight: 140, resize: 'vertical' }}
                  value={form.observacoes}
                  onChange={(e) => set('observacoes', e.target.value)}
                />
              </motion.section>
            </div>
          </div>

          <div style={styles.footerActions}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/')}>
              Cancelar
            </button>
            <button type="submit" style={styles.saveBtn} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Cadastrar cliente'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F5F5F7',
    fontFamily: 'Arial, sans-serif',
  },
  main: {
    marginLeft: 220,
    padding: '40px 44px 56px',
    flex: 1,
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  eyebrow: {
    margin: '0 0 6px',
    color: '#CC1111',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.18em',
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: '#0D0D0D',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: 16,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #ECECEC',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
    padding: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    margin: '0 0 18px',
    fontSize: 11,
    fontWeight: 700,
    color: '#CC1111',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  avatarBox: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #ECECEC',
    background: '#F7F7F7',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#0D0D0D',
    background: 'linear-gradient(180deg, #F5F5F5 0%, #EDEDED 100%)',
  },
  avatarText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  avatarTitle: {
    margin: 0,
    color: '#0D0D0D',
    fontSize: 14,
    fontWeight: 700,
  },
  avatarHint: {
    margin: 0,
    color: '#777',
    fontSize: 12,
  },
  hiddenInput: {
    display: 'none',
  },
  typeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
    marginBottom: 18,
  },
  typeBtn: {
    border: '1px solid #ECECEC',
    background: '#FAFAFA',
    color: '#666',
    borderRadius: 12,
    padding: '12px 10px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  typeBtnActive: {
    background: '#0D0D0D',
    color: '#fff',
    borderColor: '#0D0D0D',
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#FAFAFA',
    border: '1px solid #ECECEC',
    borderRadius: 12,
    padding: '11px 12px',
    color: '#0D0D0D',
    fontSize: 13,
    outline: 'none',
  },
  passwordField: {
    marginBottom: 14,
  },
  passwordWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
    boxSizing: 'border-box',
    background: '#FAFAFA',
    border: '1px solid #ECECEC',
    borderRadius: 12,
    padding: '11px 12px',
    color: '#0D0D0D',
    fontSize: 13,
    outline: 'none',
  },
  eyeBtn: {
    border: '1px solid #ECECEC',
    background: '#fff',
    color: '#666',
    borderRadius: 12,
    padding: '11px 12px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  noticeCard: {
    background: '#FAFAFA',
    borderRadius: 12,
    padding: '12px 14px',
    border: '1px dashed #E4E4E4',
  },
  noticeText: {
    margin: 0,
    fontSize: 12,
    color: '#666',
  },
  arrayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  colorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  colorPicker: {
    width: 44,
    height: 44,
    border: '1px solid #ECECEC',
    borderRadius: 10,
    background: '#fff',
  },
  addMini: {
    alignSelf: 'flex-start',
    border: '1px solid #ECECEC',
    background: '#fff',
    color: '#CC1111',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  removeMini: {
    border: 'none',
    background: '#F7F7F7',
    color: '#666',
    width: 36,
    height: 36,
    borderRadius: 10,
    cursor: 'pointer',
  },
  uploadGrid: {
    display: 'grid',
    gap: 12,
  },
  uploadBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  uploadLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#555',
  },
  uploadList: {
    display: 'grid',
    gap: 8,
  },
  uploadCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    background: '#FAFAFA',
    border: '1px solid #ECECEC',
    borderRadius: 12,
    padding: '10px 12px',
  },
  uploadName: {
    margin: 0,
    color: '#0D0D0D',
    fontSize: 12,
    fontWeight: 600,
  },
  uploadMeta: {
    margin: '4px 0 0',
    color: '#777',
    fontSize: 11,
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    border: '1px solid #ECECEC',
    background: '#fff',
    color: '#555',
    borderRadius: 12,
    padding: '12px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  saveBtn: {
    border: 'none',
    background: '#CC1111',
    color: '#fff',
    borderRadius: 12,
    padding: '12px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(204, 17, 17, 0.22)',
  },
};