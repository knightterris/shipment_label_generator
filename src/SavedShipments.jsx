import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Save, FolderOpen, X, LoaderCircle, ArrowUpRight, RefreshCw } from 'lucide-react';
import { listBatches, saveBatch, databaseReady, watchAccount, login, logout } from './database';

export default function SavedShipments({ shipments, logo, onOpen, notify }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  useEffect(() => watchAccount(user => { setAccount(user); setRecords([]); }), []);
  async function signIn(event) {
    event.preventDefault(); setSigningIn(true); setError('');
    try { await login(email, password); setPassword(''); }
    catch { setError('Sign-in failed. Check your email, password, and Firebase setup.'); }
    finally { setSigningIn(false); }
  }
  async function refresh() {
    if (!databaseReady() || !account) return;
    setLoading(true);
    setError('');
    try { setRecords(await listBatches()); }
    catch (err) { setError(err.message || 'Could not load saved shipments.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (open) refresh(); }, [open, account]);
  async function save() {
    if (!databaseReady() || !account) { setOpen(true); return; }
    setSaving(true);
    try {
      await saveBatch({ shipments, logo });
      notify('Shipment batch saved to your database.');
      setOpen(true);
      await refresh();
    } catch (err) { notify(err.message || 'Save failed. Your edits are still here.'); }
    finally { setSaving(false); }
  }
  return <>
    <div className="save-actions">
      <button className="button small" onClick={() => setOpen(true)}><FolderOpen size={15}/>Saved shipments</button>
      <button className="button small dark" onClick={save} disabled={saving}>
        {saving ? <LoaderCircle className="spin" size={15}/> : <Save size={15}/>}{saving ? 'Saving…' : 'Save'}
      </button>
    </div>
    <AnimatePresence>{open && <div className="saved-overlay" onClick={() => setOpen(false)}>
      <motion.section initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} exit={{x:30,opacity:0}}
        role="dialog" aria-modal="true" aria-label="Saved shipments" className="saved-panel"
        onClick={e => e.stopPropagation()} onKeyDown={e => { if(e.key==='Escape') setOpen(false); }}>
        <header><div><div className="overline">YOUR SHIPMENT LIBRARY</div><h2>Saved shipments</h2></div><button autoFocus className="icon-button" aria-label="Close saved shipments" onClick={() => setOpen(false)}><X size={20}/></button></header>
        <p className="saved-description">Each save keeps all the labels in your current batch together.</p>
        {!databaseReady() ? <div className="saved-empty"><FolderOpen size={28}/><h3>Connect your database</h3><p>Follow FIREBASE_SETUP.md in the source package, then restart the app. Your current labels are still available in the editor.</p></div> : !account ? <form className="login-form" onSubmit={signIn}>
          <h3>Sign in to your shipment library</h3><p>Use the account you created in Firebase Authentication.</p>
          <label className="field"><span>Email</span><input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
          <label className="field"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
          {error&&<p role="alert" className="saved-error">{error}</p>}
          <button className="button dark small" disabled={signingIn}>{signingIn?'Signing in…':'Sign in'}</button>
          <p>After signing in, close this panel and click Save to store your batch.</p>
        </form> : <>
          <div className="account-row"><span>{account.email}</span><button className="button small" onClick={async()=>{try{await logout()}catch{setError('Could not sign out. Please try again.')}}}>Sign out</button></div>
          <button className="button small refresh-button" onClick={refresh} disabled={loading}><RefreshCw size={14}/>{loading ? 'Loading…' : 'Refresh list'}</button>
          {error && <p role="alert" className="saved-error">{error}</p>}
          {!loading && !error && records.length===0 && <div className="saved-empty"><FolderOpen size={28}/><h3>No saved shipments yet</h3><p>Use Save to keep your first batch here.</p></div>}
          <div className="saved-records">{records.map(record => <article key={record.id}>
            <div><h3>{record.shipments?.[0]?.receiverName || 'Shipment batch'}</h3><p>{record.shipments.length} label{record.shipments.length===1?'':'s'} · {new Date(record.createdAt).toLocaleString()}</p><span>{record.shipments.filter(s=>s.platform!=='NONE'&&s.order).map(s=>s.order).join(' · ') || 'No order numbers'}</span></div>
            <button className="button small" onClick={() => { onOpen(record); setOpen(false); }} aria-label={`Open ${record.shipments?.[0]?.receiverName || 'shipment batch'}`}>Open<ArrowUpRight size={14}/></button>
          </article>)}</div>
        </>}
      </motion.section>
    </div>}</AnimatePresence>
  </>;
}
