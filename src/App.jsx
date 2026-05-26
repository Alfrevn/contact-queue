import { useState, useEffect, useRef } from "react";

const COLORS = ['#D85A30','#185FA5','#3B6D11','#7F77DD','#0F6E56','#D4537E','#BA7517','#A32D2D'];
const DARK_BG = {
  '#D85A30':'#3d1f14','#185FA5':'#0f2a45','#3B6D11':'#1a3008','#7F77DD':'#1e1c45',
  '#0F6E56':'#0a2e25','#D4537E':'#3d1228','#BA7517':'#3d2a06','#A32D2D':'#3d0f0f'
};

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getDays(lastContact) {
  return Math.floor((Date.now() - lastContact) / 86400000);
}
function getStatus(cat, days) {
  if (!cat) return 'ok';
  if (days >= cat.alarm) return 'alarm';
  if (days >= cat.warn) return 'warn';
  return 'ok';
}
function urgency(person, cats) {
  const cat = cats.find(c => c.id === person.catId);
  if (!cat) return 0;
  return getDays(person.lastContact) / cat.alarm;
}

function Avatar({ person, cats, size = 42 }) {
  const cat = cats.find(c => c.id === person.catId);
  const bg = cat ? (DARK_BG[cat.color] || '#1e293b') : '#1e293b';
  const fg = cat ? cat.color : '#94a3b8';
  const style = {
    width: size, height: size, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: size * 0.32, flexShrink: 0, overflow: 'hidden',
    background: bg, color: fg, border: `2px solid ${fg}33`
  };
  if (person.photo) {
    return <div style={style}><img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>;
  }
  return <div style={style}>{initials(person.name)}</div>;
}

function defaultData() {
  const now = Date.now();
  const cats = [
    { id: 1, name: 'familia', color: '#D85A30', target: 7, warn: 5, alarm: 9 },
    { id: 2, name: 'amigo 1ª línea', color: '#185FA5', target: 15, warn: 13, alarm: 20 },
    { id: 3, name: 'amigo 2ª línea', color: '#3B6D11', target: 22, warn: 20, alarm: 27 },
  ];
  const people = [
    { id: 1, name: 'Papá', catId: 1, lastContact: now - 6 * 86400000, photo: null },
    { id: 2, name: 'Bucca', catId: 2, lastContact: now - 18 * 86400000, photo: null },
    { id: 3, name: 'Fede R', catId: 2, lastContact: now - 12 * 86400000, photo: null },
    { id: 4, name: 'Fede P', catId: 2, lastContact: now - 7 * 86400000, photo: null },
    { id: 5, name: 'Seba', catId: 2, lastContact: now - 21 * 86400000, photo: null },
    { id: 6, name: 'Martín M', catId: 2, lastContact: now - 3 * 86400000, photo: null },
    { id: 7, name: 'Andrés', catId: 2, lastContact: now - 15 * 86400000, photo: null },
    { id: 8, name: 'Mark', catId: 3, lastContact: now - 10 * 86400000, photo: null },
    { id: 9, name: 'Pampa', catId: 3, lastContact: now - 25 * 86400000, photo: null },
    { id: 10, name: 'Ema', catId: 3, lastContact: now - 5 * 86400000, photo: null },
    { id: 11, name: 'Negro', catId: 3, lastContact: now - 30 * 86400000, photo: null },
  ];
  return { cats, people };
}

function loadData() {
  try {
    const rc = localStorage.getItem('pq_cats');
    const rp = localStorage.getItem('pq_people');
    if (rc && rp) return { cats: JSON.parse(rc), people: JSON.parse(rp) };
  } catch (e) {}
  return defaultData();
}

function saveData(cats, people) {
  try {
    localStorage.setItem('pq_cats', JSON.stringify(cats));
    localStorage.setItem('pq_people', JSON.stringify(people));
  } catch (e) {}
}

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  topbar: '#0f172a',
  nav: '#0f172a',
  navBorder: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#3b82f6',
  alarm: '#ef4444',
  warn: '#f59e0b',
  ok: '#22c55e',
  alarmBg: '#450a0a',
  warnBg: '#431407',
  okBg: '#052e16',
  input: '#0f172a',
  inputBorder: '#334155',
  modal: '#1e293b',
};

const S = {
  app: { fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 480, margin: '0 auto', padding: '0 0 80px 0', background: C.bg, minHeight: '100vh' },
  topbar: { position: 'sticky', top: 0, zIndex: 50, background: C.topbar, borderBottom: `1px solid ${C.navBorder}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  dateChip: { background: '#1e293b', borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: '0.02em' },
  appTitle: { fontSize: 13, fontWeight: 500, color: C.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: C.nav, borderTop: `1px solid ${C.navBorder}`, display: 'flex', zIndex: 50 },
  navBtn: (active) => ({ flex: 1, padding: '12px 4px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 400, color: active ? C.accent : C.textSecondary, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }),
  section: { padding: '12px 16px' },
  card: { background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '10px 16px', fontSize: 14, cursor: 'pointer', color: C.accent, marginBottom: 14, fontWeight: 500 },
  pill: (status) => ({
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    background: status === 'alarm' ? C.alarmBg : status === 'warn' ? C.warnBg : C.okBg,
    color: status === 'alarm' ? C.alarm : status === 'warn' ? C.warn : C.ok,
    border: `1px solid ${status === 'alarm' ? C.alarm : status === 'warn' ? C.warn : C.ok}44`,
  }),
  modalBg: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modal: { background: C.modal, borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${C.cardBorder}` },
  input: { width: '100%', border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 15, background: C.input, color: C.textPrimary, boxSizing: 'border-box' },
  label: { fontSize: 12, color: C.textSecondary, display: 'block', marginBottom: 5, fontWeight: 500 },
  field: { marginBottom: 16 },
  btnPrimary: { flex: 1, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 15, cursor: 'pointer', fontWeight: 600 },
  btnCancel: { flex: 1, background: 'none', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 12, fontSize: 15, cursor: 'pointer', color: C.textSecondary },
  sectionHead: { fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '16px 0 8px', borderBottom: `1px solid ${C.cardBorder}`, paddingBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: C.textPrimary },
};

// ─── Queue Section ──────────────────────────────────────────
function QueueSection({ cats, people, setPeople, saveAll, onEdit }) {
  const sorted = [...people].sort((a, b) => urgency(b, cats) - urgency(a, cats));
  const alarm = sorted.filter(p => getStatus(cats.find(c => c.id === p.catId), getDays(p.lastContact)) === 'alarm');
  const warn  = sorted.filter(p => getStatus(cats.find(c => c.id === p.catId), getDays(p.lastContact)) === 'warn');
  const ok    = sorted.filter(p => getStatus(cats.find(c => c.id === p.catId), getDays(p.lastContact)) === 'ok');

  function touch(id) {
    const next = people.map(p => p.id === id ? { ...p, lastContact: Date.now() } : p);
    setPeople(next);
    saveAll(cats, next);
  }

  function renderGroup(group, label) {
    if (!group.length) return null;
    let rank = sorted.indexOf(group[0]) + 1;
    return (
      <div key={label}>
        <div style={S.sectionHead}>{label}</div>
        {group.map(p => {
          const cat = cats.find(c => c.id === p.catId);
          const days = getDays(p.lastContact);
          const status = getStatus(cat, days);
          const pct = cat ? Math.min(100, Math.round(days / cat.alarm * 100)) : 0;
          const daysLeft = cat ? cat.alarm - days : 0;
          const meta = status === 'ok'
            ? `faltan ${daysLeft}d`
            : status === 'warn'
            ? `alarma en ${daysLeft}d`
            : `${Math.abs(daysLeft)}d pasado el límite`;
          const rankColor = status === 'alarm' ? C.alarm : status === 'warn' ? C.warn : C.textSecondary;
          const barColor = status === 'alarm' ? C.alarm : status === 'warn' ? C.warn : C.ok;
          const cardBorderColor = status === 'alarm' ? `${C.alarm}55` : status === 'warn' ? `${C.warn}44` : C.cardBorder;
          const r = rank++;
          return (
            <div key={p.id}
              style={{ ...S.card, borderColor: cardBorderColor, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'opacity 0.1s' }}
              onClick={() => touch(p.id)}>
              <div style={{ fontSize: 22, fontWeight: 800, minWidth: 28, textAlign: 'center', color: rankColor }}>{r}</div>
              <Avatar person={p} cats={cats} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>hace {days}d · {meta}</div>
                <div style={{ height: 6, background: '#0f172a', borderRadius: 3, marginTop: 7, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>
              <span style={S.pill(status)}>{status === 'alarm' ? '🔴' : status === 'warn' ? '🟡' : '🟢'}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 18, padding: '0 4px' }}
                onClick={e => { e.stopPropagation(); onEdit(p.id); }}>✎</button>
            </div>
          );
        })}
      </div>
    );
  }

  if (!people.length) return <div style={{ textAlign: 'center', padding: '3rem', color: C.textSecondary }}>no hay personas aún</div>;
  return (
    <div style={S.section}>
      {renderGroup(alarm, '🔴 urgentes')}
      {renderGroup(warn, '🟡 avisos')}
      {renderGroup(ok, '🟢 al día')}
    </div>
  );
}

// ─── People Section ─────────────────────────────────────────
function PeopleSection({ cats, people, setPeople, saveAll, onAdd, onEdit }) {
  function del(id) {
    const next = people.filter(p => p.id !== id);
    setPeople(next);
    saveAll(cats, next);
  }
  return (
    <div style={S.section}>
      <button style={S.addBtn} onClick={onAdd}>＋ agregar persona</button>
      {!people.length && <div style={{ color: C.textSecondary, fontSize: 14 }}>no hay personas aún</div>}
      {people.map(p => {
        const cat = cats.find(c => c.id === p.catId);
        return (
          <div key={p.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar person={p} cats={cats} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{cat?.name || 'sin categoría'}</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 18 }} onClick={() => onEdit(p.id)}>✎</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.alarm, fontSize: 18, opacity: 0.7 }} onClick={() => del(p.id)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Categories Section ─────────────────────────────────────
function CatsSection({ cats, setCats, people, saveAll, onAdd, onEditCat }) {
  function del(id) {
    if (people.some(p => p.catId === id)) { alert('hay personas en esta categoría, movelas primero'); return; }
    const next = cats.filter(c => c.id !== id);
    setCats(next);
    saveAll(next, people);
  }
  return (
    <div style={S.section}>
      <button style={S.addBtn} onClick={onAdd}>＋ nueva categoría</button>
      {cats.map(c => (
        <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
          <div style={{ flex: 1, fontWeight: 700, fontSize: 15, color: C.textPrimary }}>{c.name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ ...S.pill('ok') }}>obj: {c.target}d</span>
            <span style={{ ...S.pill('warn') }}>{c.warn}d</span>
            <span style={{ ...S.pill('alarm') }}>{c.alarm}d</span>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 18 }} onClick={() => onEditCat(c.id)}>✎</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.alarm, fontSize: 18, opacity: 0.7 }} onClick={() => del(c.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Person Modal ───────────────────────────────────────────
function PersonModal({ cats, person, onSave, onClose }) {
  const [name, setName] = useState(person?.name || '');
  const [catId, setCatId] = useState(person?.catId || cats[0]?.id || '');
  const [daysAgo, setDaysAgo] = useState(person ? getDays(person.lastContact) : 0);
  const [photo, setPhoto] = useState(person?.photo || null);
  const fileRef = useRef();

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), catId: parseInt(catId), lastContact: Date.now() - daysAgo * 86400000, photo });
  }

  return (
    <div style={S.modalBg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <h3 style={S.modalTitle}>{person ? 'editar persona' : 'agregar persona'}</h3>
        <div style={S.field}>
          <label style={S.label}>foto (opcional)</label>
          <div style={{ border: `1px dashed ${C.inputBorder}`, borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            {photo
              ? <img src={photo} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} alt="preview" />
              : <div style={{ color: C.textSecondary, fontSize: 13 }}>📷 tocar para cargar foto</div>}
          </div>
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
        <div style={S.field}>
          <label style={S.label}>nombre</label>
          <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="ej: Papá" />
        </div>
        <div style={S.field}>
          <label style={S.label}>categoría</label>
          <select style={S.input} value={catId} onChange={e => setCatId(e.target.value)}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={S.field}>
          <label style={S.label}>días desde último contacto</label>
          <input style={S.input} type="number" min="0" value={daysAgo} onChange={e => setDaysAgo(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button style={S.btnCancel} onClick={onClose}>cancelar</button>
          <button style={S.btnPrimary} onClick={submit}>guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cat Modal ──────────────────────────────────────────────
function CatModal({ cat, onSave, onClose }) {
  const [name, setName] = useState(cat?.name || '');
  const [color, setColor] = useState(cat?.color || COLORS[0]);
  const [target, setTarget] = useState(cat?.target || 7);
  const [warn, setWarn] = useState(cat?.warn || 5);
  const [alarm, setAlarm] = useState(cat?.alarm || 9);

  function submit() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, target: parseInt(target), warn: parseInt(warn), alarm: parseInt(alarm) });
  }

  return (
    <div style={S.modalBg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <h3 style={S.modalTitle}>{cat ? 'editar categoría' : 'nueva categoría'}</h3>
        <div style={S.field}>
          <label style={S.label}>nombre</label>
          <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="ej: familia" />
        </div>
        <div style={S.field}>
          <label style={S.label}>color</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer', border: c === color ? `3px solid #fff` : '3px solid transparent', transition: 'border 0.15s' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={S.field}><label style={S.label}>objetivo (d)</label><input style={S.input} type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} /></div>
          <div style={S.field}><label style={S.label}>aviso (d)</label><input style={S.input} type="number" min="1" value={warn} onChange={e => setWarn(e.target.value)} /></div>
          <div style={S.field}><label style={S.label}>alarma (d)</label><input style={S.input} type="number" min="1" value={alarm} onChange={e => setAlarm(e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button style={S.btnCancel} onClick={onClose}>cancelar</button>
          <button style={S.btnPrimary} onClick={submit}>guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('queue');
  const [cats, setCats] = useState([]);
  const [people, setPeople] = useState([]);
  const [personModal, setPersonModal] = useState(null);
  const [catModal, setCatModal] = useState(null);

  useEffect(() => {
    const d = loadData();
    setCats(d.cats);
    setPeople(d.people);
  }, []);

  function saveAll(c, p) { saveData(c, p); }

  const d = new Date();
  const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const dateStr = `${DAYS[d.getDay()]} ${d.getDate()}/${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

  function savePerson(data) {
    const next = personModal === 'new'
      ? [...people, { id: Date.now(), ...data }]
      : people.map(p => p.id === personModal ? { ...p, ...data } : p);
    setPeople(next);
    saveAll(cats, next);
    setPersonModal(null);
  }

  function saveCat(data) {
    const next = catModal === 'new'
      ? [...cats, { id: Date.now(), ...data }]
      : cats.map(c => c.id === catModal ? { ...c, ...data } : c);
    setCats(next);
    saveAll(next, people);
    setCatModal(null);
  }

  const tabs = [
    { id: 'queue', label: 'cola', icon: '↕' },
    { id: 'people', label: 'personas', icon: '👤' },
    { id: 'cats', label: 'categorías', icon: '🏷' },
  ];

  return (
    <div style={S.app}>
      <div style={S.topbar}>
        <span style={S.dateChip}>{dateStr}</span>
        <span style={S.appTitle}>contactos</span>
      </div>

      {tab === 'queue' && <QueueSection cats={cats} people={people} setPeople={setPeople} saveAll={saveAll} onEdit={id => setPersonModal(id)} />}
      {tab === 'people' && <PeopleSection cats={cats} people={people} setPeople={setPeople} saveAll={saveAll} onAdd={() => setPersonModal('new')} onEdit={id => setPersonModal(id)} />}
      {tab === 'cats' && <CatsSection cats={cats} setCats={setCats} people={people} saveAll={saveAll} onAdd={() => setCatModal('new')} onEditCat={id => setCatModal(id)} />}

      <nav style={S.nav}>
        {tabs.map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {personModal !== null && (
        <PersonModal
          cats={cats}
          person={personModal !== 'new' ? people.find(p => p.id === personModal) : null}
          onSave={savePerson}
          onClose={() => setPersonModal(null)}
        />
      )}

      {catModal !== null && (
        <CatModal
          cat={catModal !== 'new' ? cats.find(c => c.id === catModal) : null}
          onSave={saveCat}
          onClose={() => setCatModal(null)}
        />
      )}
    </div>
  );
}
