import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oygwnucmkgqmchpznwda.supabase.co";
const SUPABASE_KEY = "sb_publishable_rnveUXY27y5m7moTiJ41GQ_vgZ7EN32";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── SMART SEARCH ────────────────────────────────────────────────────────────
function normalize(s) {
  return s.toLowerCase()
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/[^a-z0-9 ]/g," ").trim();
}

const DEVICES = [
  { id: "airfryer",     label: "Air Fryer",    icon: "💨", desc: "Ninja 9.5L Dual Zone" },
  { id: "backofen",    label: "Backofen",     icon: "🔥", desc: "Klassisch" },
  { id: "topf",        label: "Topf / Herd",  icon: "🫕", desc: "Kochen & Schmoren" },
  { id: "gasgrill",    label: "Gas Grill",    icon: "🍖", desc: "Direktes Grillen" },
  { id: "raeucherofen",label: "Räucherofen",  icon: "💨", desc: "BBQ & Smoken" },
];
const CATEGORIES = [
  { id: "griechisch", label: "Griechische Rezepte", icon: "🇬🇷" },
  { id: "allgemein",  label: "Allgemeine Gerichte",  icon: "🌍" },
];
const SUGG = {
  griechisch: ["Gyros","Souvlaki","Moussaka","Feta mit Peperoni","Kleftiko","Stifado","Tiropita","Tzatziki"],
  allgemein:  ["Schnitzel","Lachs","Hähnchen","Burger","Pommes","Pasta","Suppe","Risotto"],
};

const BLUE = "#1a3a5c", GOLD = "#c8a84b", CREAM = "#faf6ee", W = "#ffffff";

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("rezepte"); // rezepte | favoriten | eigene

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:CREAM, fontSize:32 }}>🍳</div>;

  return (
    <div style={{ minHeight:"100vh", background:CREAM, fontFamily:"'Playfair Display',Georgia,serif" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(circle at 10% 20%,rgba(200,168,75,.08) 0%,transparent 50%),radial-gradient(circle at 90% 80%,rgba(26,58,92,.08) 0%,transparent 50%)", pointerEvents:"none", zIndex:0 }} />
      
      {/* Header */}
      <header style={{ background:BLUE, borderBottom:`3px solid ${GOLD}`, position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:36 }}>🏺</span>
            <div>
              <div style={{ fontSize:24, color:GOLD, fontWeight:"bold", letterSpacing:2 }}>Kouzína</div>
              <div style={{ color:"rgba(255,255,255,.5)", fontSize:11, letterSpacing:1 }}>Griechischer Koch-Assistent</div>
            </div>
          </div>
          {session ? (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:"rgba(255,255,255,.7)", fontSize:12 }}>{session.user.email}</span>
              <button onClick={() => supabase.auth.signOut()} style={{ padding:"6px 14px", background:"transparent", border:`1px solid ${GOLD}`, borderRadius:6, color:GOLD, cursor:"pointer", fontSize:12 }}>Abmelden</button>
            </div>
          ) : null}
        </div>
        {/* Tabs */}
        {session && (
          <div style={{ maxWidth:900, margin:"0 auto", padding:"0 20px", display:"flex", gap:4 }}>
            {[
              { id:"rezepte", label:"🔍 Rezepte" },
              { id:"favoriten", label:"⭐ Favoriten" },
              { id:"eigene", label:"📝 Eigene Rezepte" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:"10px 18px", background:tab===t.id?"rgba(200,168,75,.2)":"transparent", border:"none", borderBottom:tab===t.id?`3px solid ${GOLD}`:"3px solid transparent", color:tab===t.id?GOLD:"rgba(255,255,255,.6)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px 80px", position:"relative", zIndex:1 }}>
        {!session ? (
          <AuthScreen />
        ) : tab === "rezepte" ? (
          <RezepteTab session={session} />
        ) : tab === "favoriten" ? (
          <FavoritenTab session={session} />
        ) : (
          <EigeneTab session={session} />
        )}
      </main>
    </div>
  );
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit() {
    setLoading(true); setMsg(null);
    const fn = mode === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email, password: pw });
    if (error) setMsg({ type:"error", text: error.message });
    else if (mode === "register") setMsg({ type:"ok", text:"Bestätigungs-Email gesendet! Bitte E-Mail prüfen." });
    setLoading(false);
  }

  return (
    <div style={{ maxWidth:400, margin:"60px auto" }}>
      <div style={{ background:W, borderRadius:14, border:"1px solid rgba(200,168,75,.3)", boxShadow:"0 8px 40px rgba(26,58,92,.1)", overflow:"hidden" }}>
        <div style={{ background:BLUE, padding:"28px", textAlign:"center", borderBottom:`3px solid ${GOLD}` }}>
          <div style={{ fontSize:40 }}>🏺</div>
          <div style={{ color:GOLD, fontSize:22, fontWeight:"bold", marginTop:8 }}>Kouzína</div>
          <div style={{ color:"rgba(255,255,255,.6)", fontSize:12, marginTop:4 }}>Bitte anmelden um fortzufahren</div>
        </div>
        <div style={{ padding:28 }}>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex:1, padding:"8px", border:`2px solid ${BLUE}`, borderRadius:6, background:mode===m?BLUE:W, color:mode===m?W:BLUE, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                {m === "login" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail"
            style={{ width:"100%", padding:"12px", border:"1px solid #ddd", borderRadius:8, marginBottom:10, fontSize:14, fontFamily:"inherit", boxSizing:"border-box" }} />
          <input value={pw} onChange={e => setPw(e.target.value)} placeholder="Passwort" type="password"
            onKeyDown={e => e.key==="Enter" && submit()}
            style={{ width:"100%", padding:"12px", border:"1px solid #ddd", borderRadius:8, marginBottom:16, fontSize:14, fontFamily:"inherit", boxSizing:"border-box" }} />
          {msg && <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:12, fontSize:13, background:msg.type==="error"?"#fff3f3":"#f0fff4", color:msg.type==="error"?"#c62828":"#2e7d32", border:`1px solid ${msg.type==="error"?"#e57373":"#81c784"}` }}>{msg.text}</div>}
          <button onClick={submit} disabled={loading}
            style={{ width:"100%", padding:"13px", background:BLUE, color:GOLD, border:"none", borderRadius:8, fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" }}>
            {loading ? "..." : mode === "login" ? "Anmelden" : "Registrieren"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REZEPTE TAB ─────────────────────────────────────────────────────────────
function RezepteTab({ session }) {
  const [device, setDevice] = useState("airfryer");
  const [category, setCategory] = useState("griechisch");
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function search(dish) {
    if (!dish.trim()) return;
    setLoading(true); setError(null); setRecipe(null); setSaved(false);
    try {
      const res = await fetch("/api/rezept", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ dish: dish.trim(), device, category }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Fehler");
      setRecipe(data);
    } catch(e) { setError("Fehler: " + e.message); }
    finally { setLoading(false); }
  }

  async function saveToFavorites() {
    const { error } = await supabase.from("favorites").insert({
      user_id: session.user.id,
      name: recipe.name,
      emoji: recipe.emoji || "🍽️",
      portionen: recipe.portionen,
      zutaten: recipe.zutaten,
      schritte: Array.isArray(recipe.schritte) ? recipe.schritte : (recipe.schritte?.[device] || []),
      temperatur: recipe.temperatur || recipe[device]?.temp || "",
      kochzeit: recipe.kochzeit || {},
      tipp: recipe.tipp || "",
    });
    if (!error) setSaved(true);
  }

  return (
    <div>
      <div style={S.cg}>
        <div style={S.lbl}>Kategorie</div>
        <div style={S.row}>
          {CATEGORIES.map(c => (
            <button key={c.id} style={{ ...S.catBtn, ...(category===c.id?S.catOn:{}) }}
              onClick={() => { setCategory(c.id); setRecipe(null); }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>
      <div style={S.cg}>
        <div style={S.lbl}>Kochgerät</div>
        <div style={S.row}>
          {DEVICES.map(d => (
            <button key={d.id} style={{ ...S.devBtn, ...(device===d.id?S.devOn:{}) }}
              onClick={() => setDevice(d.id)}>
              <div style={{ fontSize:20 }}>{d.icon}</div>
              <div style={S.devName}>{d.label}</div>
              <div style={S.devDesc}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={S.sw}>
        <input style={S.inp} placeholder={`z.B. "${SUGG[category][0]}"`}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && search(input)} />
        <button style={S.sbtn} onClick={() => search(input)}>→</button>
      </div>
      <div style={S.pills}>
        {SUGG[category].map(s => (
          <button key={s} style={S.pill} onClick={() => { setInput(s); search(s); }}>{s}</button>
        ))}
      </div>
      {loading && <div style={{ textAlign:"center", padding:"50px" }}><div style={{ fontSize:48 }}>🍳</div><div style={{ color:BLUE, opacity:.7, marginTop:12 }}>Rezept wird zubereitet…</div></div>}
      {error && <div style={{ background:"#fff3f3", border:"1px solid #e57373", borderRadius:8, padding:"14px", color:"#c62828", fontSize:14 }}>⚠️ {error}</div>}
      {recipe && !loading && (
        <>
          <RecipeCard recipe={recipe} device={device} />
          <div style={{ display:"flex", justifyContent:"center", marginTop:12 }}>
            <button onClick={saveToFavorites} disabled={saved}
              style={{ padding:"12px 28px", background:saved?"#e8f5e9":BLUE, color:saved?"#2e7d32":GOLD, border:saved?"2px solid #81c784":`2px solid ${BLUE}`, borderRadius:8, cursor:saved?"default":"pointer", fontSize:14, fontFamily:"inherit", fontWeight:"bold" }}>
              {saved ? "✓ Gespeichert!" : "⭐ Zu Favoriten hinzufügen"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FAVORITEN TAB ───────────────────────────────────────────────────────────
function FavoritenTab({ session }) {
  const [folders, setFolders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: f }, { data: fav }] = await Promise.all([
      supabase.from("folders").select("*").eq("user_id", session.user.id).order("created_at"),
      supabase.from("favorites").select("*").eq("user_id", session.user.id).order("created_at"),
    ]);
    setFolders(f || []);
    setFavorites(fav || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createFolder() {
    if (!newFolderName.trim()) return;
    await supabase.from("folders").insert({ user_id: session.user.id, name: newFolderName.trim() });
    setNewFolderName(""); setShowNewFolder(false); load();
  }

  async function deleteFolder(id) {
    await supabase.from("folders").delete().eq("id", id);
    if (activeFolder === id) setActiveFolder(null);
    load(); setDeleteConfirm(null);
  }

  async function deleteFavorite(id) {
    await supabase.from("favorites").delete().eq("id", id);
    load(); setDeleteConfirm(null);
  }

  async function moveFavorite(favId, folderId) {
    await supabase.from("favorites").update({ folder_id: folderId }).eq("id", favId);
    load();
  }

  const shownFavs = activeFolder === "none"
    ? favorites.filter(f => !f.folder_id)
    : activeFolder
    ? favorites.filter(f => f.folder_id === activeFolder)
    : favorites;

  if (loading) return <div style={{ textAlign:"center", padding:60, fontSize:32 }}>🍳</div>;

  return (
    <div>
      {/* Edit Modal */}
      {editingRecipe && (
        <EditModal
          recipe={editingRecipe}
          folders={folders}
          onSave={async (updated) => {
            await supabase.from("favorites").update({ ...updated, updated_at: new Date().toISOString() }).eq("id", editingRecipe.id);
            setEditingRecipe(null); load();
          }}
          onClose={() => setEditingRecipe(null)}
          table="favorites"
        />
      )}
      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          text={deleteConfirm.text}
          onConfirm={deleteConfirm.fn}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Ordner */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={S.lbl}>Ordner</div>
          <button onClick={() => setShowNewFolder(true)}
            style={{ padding:"6px 14px", background:BLUE, color:GOLD, border:"none", borderRadius:6, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
            + Neuer Ordner
          </button>
        </div>
        {showNewFolder && (
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key==="Enter" && createFolder()}
              placeholder="Ordnername…"
              style={{ flex:1, padding:"10px 14px", border:`2px solid ${BLUE}`, borderRadius:8, fontSize:14, fontFamily:"inherit", outline:"none" }} />
            <button onClick={createFolder} style={{ padding:"10px 18px", background:BLUE, color:GOLD, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit" }}>Erstellen</button>
            <button onClick={() => setShowNewFolder(false)} style={{ padding:"10px 14px", background:"#eee", border:"none", borderRadius:8, cursor:"pointer" }}>✕</button>
          </div>
        )}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <button onClick={() => setActiveFolder(null)}
            style={{ padding:"7px 16px", border:`2px solid ${activeFolder===null?BLUE:"rgba(26,58,92,.2)"}`, borderRadius:20, background:activeFolder===null?BLUE:W, color:activeFolder===null?W:BLUE, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
            Alle ({favorites.length})
          </button>
          <button onClick={() => setActiveFolder("none")}
            style={{ padding:"7px 16px", border:`2px solid ${activeFolder==="none"?BLUE:"rgba(26,58,92,.2)"}`, borderRadius:20, background:activeFolder==="none"?BLUE:W, color:activeFolder==="none"?W:BLUE, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
            📂 Ohne Ordner ({favorites.filter(f=>!f.folder_id).length})
          </button>
          {folders.map(f => (
            <div key={f.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <button onClick={() => setActiveFolder(f.id)}
                style={{ padding:"7px 16px", border:`2px solid ${activeFolder===f.id?GOLD:"rgba(26,58,92,.2)"}`, borderRadius:20, background:activeFolder===f.id?"rgba(200,168,75,.15)":W, color:BLUE, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                📁 {f.name} ({favorites.filter(fav=>fav.folder_id===f.id).length})
              </button>
              <button onClick={() => setDeleteConfirm({ text:`Ordner "${f.name}" wirklich löschen?`, fn:()=>deleteFolder(f.id) })}
                style={{ padding:"4px 8px", background:"#ffebee", border:"1px solid #ef9a9a", borderRadius:6, cursor:"pointer", fontSize:11, color:"#c62828" }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Favoriten Liste */}
      {shownFavs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#888", fontSize:15 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
          Noch keine Favoriten {activeFolder ? "in diesem Ordner" : "gespeichert"}.
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {shownFavs.map(fav => (
            <FavCard key={fav.id} fav={fav} folders={folders}
              onEdit={() => setEditingRecipe(fav)}
              onDelete={() => setDeleteConfirm({ text:`"${fav.name}" wirklich löschen?`, fn:()=>deleteFavorite(fav.id) })}
              onMove={(folderId) => moveFavorite(fav.id, folderId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FavCard({ fav, folders, onEdit, onDelete, onMove }) {
  const [open, setOpen] = useState(false);
  const [showMove, setShowMove] = useState(false);
  return (
    <div style={{ background:W, borderRadius:12, border:"1px solid rgba(200,168,75,.3)", overflow:"hidden", boxShadow:"0 2px 12px rgba(26,58,92,.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", cursor:"pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:28 }}>{fav.emoji}</span>
          <div>
            <div style={{ fontWeight:"bold", color:BLUE, fontSize:15 }}>{fav.name}</div>
            <div style={{ fontSize:12, color:"#888" }}>{fav.portionen}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={e => { e.stopPropagation(); setShowMove(!showMove); }}
            style={{ padding:"5px 10px", background:"rgba(200,168,75,.1)", border:`1px solid ${GOLD}`, borderRadius:6, cursor:"pointer", fontSize:11, color:BLUE }}>📁</button>
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{ padding:"5px 10px", background:"rgba(26,58,92,.08)", border:"1px solid rgba(26,58,92,.2)", borderRadius:6, cursor:"pointer", fontSize:11, color:BLUE }}>✏️ Bearbeiten</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ padding:"5px 10px", background:"#ffebee", border:"1px solid #ef9a9a", borderRadius:6, cursor:"pointer", fontSize:11, color:"#c62828" }}>🗑️ Löschen</button>
          <span style={{ fontSize:18, color:GOLD, marginLeft:4 }}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {showMove && (
        <div style={{ padding:"10px 18px", background:"rgba(200,168,75,.05)", borderTop:"1px solid rgba(200,168,75,.2)", display:"flex", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:12, color:"#666", alignSelf:"center" }}>Verschieben nach:</span>
          <button onClick={() => { onMove(null); setShowMove(false); }}
            style={{ padding:"4px 12px", border:"1px solid #ddd", borderRadius:12, background:W, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>📂 Ohne Ordner</button>
          {folders.map(f => (
            <button key={f.id} onClick={() => { onMove(f.id); setShowMove(false); }}
              style={{ padding:"4px 12px", border:`1px solid ${GOLD}`, borderRadius:12, background:W, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>📁 {f.name}</button>
          ))}
        </div>
      )}
      {open && (
        <div style={{ padding:"0 18px 18px" }}>
          {fav.notiz && <div style={{ background:"rgba(200,168,75,.1)", border:`1px solid ${GOLD}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:"#555", marginBottom:12 }}>📝 {fav.notiz}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <div style={S.colt}>🫒 Zutaten</div>
              {(fav.zutaten||[]).map((z,i) => <div key={i} style={S.zutat}><span style={{ color:GOLD, fontWeight:"bold" }}>·</span>{z}</div>)}
            </div>
            <div>
              <div style={S.colt}>📋 Zubereitung</div>
              {(fav.schritte||[]).map((s,i) => <div key={i} style={S.step}><span style={S.snum}>{i+1}</span><span>{s}</span></div>)}
            </div>
          </div>
          {fav.tipp && <div style={S.tipp}>💡 <strong>Tipp:</strong> {fav.tipp}</div>}
        </div>
      )}
    </div>
  );
}

// ─── EIGENE REZEPTE TAB ──────────────────────────────────────────────────────
function EigeneTab({ session }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function load() {
    const { data } = await supabase.from("own_recipes").select("*").eq("user_id", session.user.id).order("created_at");
    setRecipes(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteRecipe(id) {
    await supabase.from("own_recipes").delete().eq("id", id);
    load(); setDeleteConfirm(null);
  }

  if (loading) return <div style={{ textAlign:"center", padding:60, fontSize:32 }}>🍳</div>;

  return (
    <div>
      {editingRecipe && (
        <EditModal
          recipe={editingRecipe}
          onSave={async (updated) => {
            await supabase.from("own_recipes").update({ ...updated, updated_at: new Date().toISOString() }).eq("id", editingRecipe.id);
            setEditingRecipe(null); load();
          }}
          onClose={() => setEditingRecipe(null)}
          table="own_recipes"
        />
      )}
      {deleteConfirm && (
        <ConfirmModal text={deleteConfirm.text} onConfirm={deleteConfirm.fn} onCancel={() => setDeleteConfirm(null)} />
      )}
      {showForm && (
        <EditModal
          recipe={{ name:"", emoji:"🍽️", portionen:"", zutaten:[], schritte:[], temperatur:"", kochzeit:{}, tipp:"" }}
          isNew
          onSave={async (data) => {
            await supabase.from("own_recipes").insert({ ...data, user_id: session.user.id });
            setShowForm(false); load();
          }}
          onClose={() => setShowForm(false)}
          table="own_recipes"
        />
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:18, fontWeight:"bold", color:BLUE }}>📝 Meine Rezepte</div>
        <button onClick={() => setShowForm(true)}
          style={{ padding:"10px 20px", background:BLUE, color:GOLD, border:"none", borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:"inherit", fontWeight:"bold" }}>
          + Neues Rezept
        </button>
      </div>

      {recipes.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#888" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
          Noch keine eigenen Rezepte. Erstelle dein erstes!
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {recipes.map(r => (
            <FavCard key={r.id} fav={r} folders={[]}
              onEdit={() => setEditingRecipe(r)}
              onDelete={() => setDeleteConfirm({ text:`"${r.name}" wirklich löschen?`, fn:()=>deleteRecipe(r.id) })}
              onMove={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EDIT MODAL ──────────────────────────────────────────────────────────────
function EditModal({ recipe, onSave, onClose, isNew, folders }) {
  const [form, setForm] = useState({
    name: recipe.name || "",
    emoji: recipe.emoji || "🍽️",
    portionen: recipe.portionen || "",
    zutaten: (recipe.zutaten || []).join("\n"),
    schritte: (recipe.schritte || []).join("\n"),
    temperatur: recipe.temperatur || "",
    tipp: recipe.tipp || "",
    notiz: recipe.notiz || "",
    folder_id: recipe.folder_id || "",
  });

  function save() {
    onSave({
      name: form.name,
      emoji: form.emoji,
      portionen: form.portionen,
      zutaten: form.zutaten.split("\n").filter(z => z.trim()),
      schritte: form.schritte.split("\n").filter(s => s.trim()),
      temperatur: form.temperatur,
      tipp: form.tipp,
      notiz: form.notiz,
      folder_id: form.folder_id || null,
    });
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:W, borderRadius:14, width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ background:BLUE, padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`3px solid ${GOLD}` }}>
          <div style={{ color:GOLD, fontWeight:"bold", fontSize:16 }}>{isNew ? "Neues Rezept erstellen" : "Rezept bearbeiten"}</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:W, fontSize:20, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", gap:10 }}>
            <input value={form.emoji} onChange={e => setForm({...form, emoji:e.target.value})}
              style={{ width:60, padding:"10px", border:"1px solid #ddd", borderRadius:8, fontSize:20, textAlign:"center" }} />
            <input value={form.name} onChange={e => setForm({...form, name:e.target.value})}
              placeholder="Rezeptname *" style={{ flex:1, padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit" }} />
          </div>
          <input value={form.portionen} onChange={e => setForm({...form, portionen:e.target.value})}
            placeholder="Portionen (z.B. 2-3 Portionen)" style={{ padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit" }} />
          <input value={form.temperatur} onChange={e => setForm({...form, temperatur:e.target.value})}
            placeholder="Temperatur (z.B. 180°C)" style={{ padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit" }} />
          <div>
            <div style={{ fontSize:12, color:"#666", marginBottom:4 }}>Zutaten (eine pro Zeile)</div>
            <textarea value={form.zutaten} onChange={e => setForm({...form, zutaten:e.target.value})}
              placeholder="200g Feta&#10;2 EL Olivenöl&#10;..."
              rows={5} style={{ width:"100%", padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }} />
          </div>
          <div>
            <div style={{ fontSize:12, color:"#666", marginBottom:4 }}>Zubereitungsschritte (einer pro Zeile)</div>
            <textarea value={form.schritte} onChange={e => setForm({...form, schritte:e.target.value})}
              placeholder="Ofen vorheizen auf 180°C&#10;Zutaten mischen&#10;..."
              rows={5} style={{ width:"100%", padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }} />
          </div>
          <input value={form.tipp} onChange={e => setForm({...form, tipp:e.target.value})}
            placeholder="Koch-Tipp (optional)" style={{ padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit" }} />
          <textarea value={form.notiz} onChange={e => setForm({...form, notiz:e.target.value})}
            placeholder="Persönliche Notiz (z.B. nächstes Mal mehr Salz)" rows={2}
            style={{ width:"100%", padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }} />
          {folders && folders.length > 0 && (
            <select value={form.folder_id} onChange={e => setForm({...form, folder_id:e.target.value})}
              style={{ padding:"10px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit" }}>
              <option value="">Kein Ordner</option>
              {folders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
            </select>
          )}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button onClick={onClose} style={{ flex:1, padding:"12px", background:"#eee", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit" }}>Abbrechen</button>
            <button onClick={save} style={{ flex:2, padding:"12px", background:BLUE, color:GOLD, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontWeight:"bold", fontSize:15 }}>
              {isNew ? "Rezept erstellen" : "Änderungen speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIRM MODAL ───────────────────────────────────────────────────────────
function ConfirmModal({ text, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:W, borderRadius:14, padding:28, maxWidth:380, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,.3)", textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <div style={{ fontSize:16, color:BLUE, fontWeight:"bold", marginBottom:8 }}>Bist du sicher?</div>
        <div style={{ fontSize:14, color:"#555", marginBottom:24 }}>{text}</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"12px", background:"#eee", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>Abbrechen</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"12px", background:"#c62828", color:W, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:"bold" }}>Ja, löschen</button>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE CARD ─────────────────────────────────────────────────────────────
function RecipeCard({ recipe, device }) {
  const d = recipe[device] || recipe;
  const steps = Array.isArray(recipe.schritte) ? recipe.schritte : (recipe.schritte?.[device] || []);
  const stats = [
    { icon:"⏱", label:"Vorbereitung", val: d.vor || recipe.kochzeit?.vorbereitung },
    { icon:"🔥", label:"Kochen",       val: d.koch || recipe.kochzeit?.kochen },
    { icon:"⌛", label:"Gesamt",       val: d.gesamt || recipe.kochzeit?.gesamt, hi:true },
    ((d.temp||recipe.temperatur) && (d.temp||recipe.temperatur)!=="null" && (d.temp||recipe.temperatur)!=="–")
      ? { icon:"🌡", label:"Temperatur", val: d.temp||recipe.temperatur, hi:true } : null,
  ].filter(Boolean);
  const hinweis = d.ninja || d.hinweis || recipe.ninja_hinweis || recipe.geraet_hinweis;
  const hinweisLabel = device==="airfryer"?"Ninja Dual Zone Tipp":device==="gasgrill"?"Gas Grill Tipp":device==="raeucherofen"?"Räucherofen Tipp":"Tipp";

  return (
    <div style={S.card}>
      <div style={S.ch}>
        <span style={{ fontSize:44 }}>{recipe.emoji}</span>
        <div>
          <div style={S.cn}>{recipe.name}</div>
          <div style={S.cp}>{recipe.portionen}</div>
        </div>
      </div>
      <div style={S.sr}>
        {stats.map((s,i) => (
          <div key={i} style={{ ...S.stat, ...(s.hi?S.shi:{}) }}>
            <div>{s.icon}</div>
            <div style={S.sv}>{s.val||"–"}</div>
            <div style={S.sl}>{s.label}</div>
          </div>
        ))}
      </div>
      {hinweis && hinweis!=="null" && (
        <div style={S.hbox}>
          <span style={{ fontSize:20, flexShrink:0 }}>💡</span>
          <div>
            <div style={{ fontWeight:"bold", color:BLUE, fontSize:13, marginBottom:3 }}>{hinweisLabel}</div>
            <div style={S.ht}>{hinweis}</div>
          </div>
        </div>
      )}
      <div style={S.tc}>
        <div style={S.col}>
          <div style={S.colt}>🫒 Zutaten</div>
          {recipe.zutaten?.map((z,i) => <div key={i} style={S.zutat}><span style={{ color:GOLD, fontWeight:"bold", flexShrink:0 }}>·</span>{z}</div>)}
        </div>
        <div style={{ ...S.col, borderRight:"none" }}>
          <div style={S.colt}>📋 Zubereitung</div>
          {steps.map((s,i) => <div key={i} style={S.step}><span style={S.snum}>{i+1}</span><span>{s}</span></div>)}
        </div>
      </div>
      {recipe.tipp && <div style={S.tipp}>💡 <strong>Tipp:</strong> {recipe.tipp}</div>}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  cg: { marginBottom:20 },
  lbl: { fontSize:11, textTransform:"uppercase", letterSpacing:2, color:BLUE, fontWeight:"bold", opacity:.6, marginBottom:8 },
  row: { display:"flex", flexWrap:"wrap", gap:8 },
  catBtn: { padding:"8px 18px", border:`2px solid ${BLUE}`, borderRadius:6, background:W, color:BLUE, cursor:"pointer", fontSize:13, fontFamily:"inherit" },
  catOn: { background:BLUE, color:W },
  devBtn: { padding:"10px 14px", border:"2px solid rgba(26,58,92,.2)", borderRadius:8, background:W, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, minWidth:90 },
  devOn: { border:`2px solid ${GOLD}`, background:"rgba(200,168,75,.08)", boxShadow:"0 2px 12px rgba(200,168,75,.2)" },
  devName: { fontSize:12, fontWeight:"bold", color:BLUE },
  devDesc: { fontSize:9, color:"#888" },
  sw: { display:"flex", border:`2px solid ${BLUE}`, borderRadius:10, overflow:"hidden", boxShadow:"0 4px 20px rgba(26,58,92,.1)", background:W, marginBottom:12 },
  inp: { flex:1, padding:"15px 20px", border:"none", outline:"none", fontSize:16, fontFamily:"inherit", color:BLUE, background:"transparent" },
  sbtn: { padding:"0 26px", background:BLUE, color:GOLD, border:"none", fontSize:22, cursor:"pointer", fontWeight:"bold" },
  pills: { display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 },
  pill: { padding:"5px 14px", border:`1px solid ${GOLD}`, borderRadius:20, background:"rgba(200,168,75,.08)", color:BLUE, fontSize:13, cursor:"pointer", fontFamily:"inherit" },
  card: { background:W, borderRadius:14, border:"1px solid rgba(200,168,75,.35)", boxShadow:"0 8px 40px rgba(26,58,92,.1)", overflow:"hidden", marginTop:8 },
  ch: { background:BLUE, padding:"22px 28px", display:"flex", alignItems:"center", gap:16, borderBottom:`3px solid ${GOLD}` },
  cn: { fontSize:22, color:W, fontWeight:"bold" },
  cp: { color:GOLD, fontSize:13, marginTop:4 },
  sr: { display:"flex", flexWrap:"wrap", borderBottom:"1px solid rgba(200,168,75,.2)" },
  stat: { flex:"1 1 80px", padding:14, textAlign:"center", borderRight:"1px solid rgba(200,168,75,.2)", fontSize:16 },
  shi: { background:"rgba(200,168,75,.07)" },
  sv: { fontSize:14, fontWeight:"bold", color:BLUE, marginTop:3 },
  sl: { fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:1, marginTop:2 },
  hbox: { display:"flex", gap:12, alignItems:"flex-start", background:"rgba(200,168,75,.08)", border:"1px solid rgba(200,168,75,.3)", borderRadius:8, padding:"12px 16px", margin:"16px 20px 0" },
  ht: { color:"#444", fontSize:13, lineHeight:1.5 },
  tc: { display:"grid", gridTemplateColumns:"1fr 1fr", padding:"20px 0" },
  col: { padding:"0 24px", borderRight:"1px solid rgba(200,168,75,.2)" },
  colt: { fontSize:13, fontWeight:"bold", color:BLUE, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14, paddingBottom:8, borderBottom:`2px solid ${GOLD}` },
  zutat: { display:"flex", gap:8, padding:"5px 0", fontSize:14, color:"#333", lineHeight:1.4 },
  step: { display:"flex", gap:10, fontSize:14, color:"#333", lineHeight:1.5, marginBottom:10 },
  snum: { background:BLUE, color:GOLD, borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:"bold", flexShrink:0, marginTop:1 },
  tipp: { margin:"0 20px 20px", background:"rgba(200,168,75,.1)", border:"1px solid rgba(200,168,75,.3)", borderRadius:8, padding:"12px 16px", fontSize:13, color:"#555", lineHeight:1.5 },
};
