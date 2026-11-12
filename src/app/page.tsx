"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronDown, ChevronLeft, CircleHelp, Copy, Dog, Download, Feather, Fish, Flower2, FolderPlus, ImageIcon, LayoutGrid, Leaf, LockKeyhole, LogOut, MoreHorizontal, Plus, RefreshCcw, RotateCcw, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, WandSparkles, X } from "lucide-react";
import JSZip from "jszip";
import { COLLECTIONS, SEED_PLATES, pad, type Collection, type Plate } from "@/lib/catalog";
import { getPlates, savePlate, deletePlate } from "@/lib/storage";
import { downloadPoster, renderPoster } from "@/lib/poster";

function CollectionGlyph({icon,size=21}:{icon:Collection["icon"],size?:number}){
 const props={size,strokeWidth:1.65};
 if(icon==="bird")return <Feather {...props}/>;
 if(icon==="dog")return <Dog {...props}/>;
 if(icon==="fish")return <Fish {...props}/>;
 if(icon==="flower")return <Flower2 {...props}/>;
 return <Sparkles {...props}/>;
}
type FormDetails={commonName:string;scientificName:string;origin:string;notes:string;appearance:string;imageScale:number;colorMode:"natural"|"monochrome"|"single"};
const EMPTY_FORM:FormDetails={commonName:"",scientificName:"",origin:"",notes:"",appearance:"",imageScale:68,colorMode:"natural"};
const customKey="atlas-custom-collections-v1",countKey="atlas-number-counters-v1";
function IconButton({onClick,title,children,disabled}:{onClick:()=>void,title:string,children:React.ReactNode,disabled?:boolean}){
 return <button aria-label={title} title={title} type="button" disabled={disabled} className="icon-btn" onClick={onClick}>{children}</button>;
}
function PlatePaper({plate,collection,scaleOverride}:{plate:Plate|null,collection:Collection,scaleOverride?:number}){
 const scale=scaleOverride??plate?.imageScale??68;
 return <div className="paper-sheet" aria-label="Poster preview">
    {plate?.image ? <div className="paper-art"><img alt={`${plate.commonName} engraving`} src={plate.image} style={{width:`${scale}%`}} /></div> : <div className="paper-art paper-art-empty"><div className="empty-art-icon"><CollectionGlyph icon={collection.icon} size={49}/></div><span>YOUR NEXT ENGRAVING</span><p>The illustrated specimen appears here</p></div>}
    <div className="paper-caption">
      <div className="paper-no" style={{color:collection.accent}}>{pad(plate?.number||collection.baseNumber+1)}</div>
      <div className="paper-title">{plate?.commonName || "Untitled specimen"}</div>
      {plate?.scientificName && <div className="paper-latin">{plate.scientificName}</div>}
      <div className="paper-native">{collection.originLabel}: {plate?.origin || "Add origin to complete the plate"}</div>
    </div>
 </div>;
}
export default function StudioPage(){
 const [customCollections,setCustomCollections]=useState<Collection[]>([]);
 const [collectionId,setCollectionId]=useState("birds");
 const collections=useMemo(()=>[...COLLECTIONS,...customCollections],[customCollections]);
 const collection=collections.find(c=>c.id===collectionId)||COLLECTIONS[0];
 const [plates,setPlates]=useState<Plate[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [selectedId,setSelectedId]=useState<string|null>("seed-bird");
 const [draft,setDraft]=useState(false);
 const [form,setForm]=useState<FormDetails>(EMPTY_FORM);
 const [generation,setGeneration]=useState(false);
 const [status,setStatus]=useState({configured:false,authenticated:false});
 const [loginOpen,setLoginOpen]=useState(false);
 const [accessCode,setAccessCode]=useState("");
 const [loginError,setLoginError]=useState("");
 const [toast,setToast]=useState("");
 const [showCustom,setShowCustom]=useState(false);
 const [newCollectionName,setNewCollectionName]=useState("");
 const [showLibrary,setShowLibrary]=useState(false);
 const [galleryQuery,setGalleryQuery]=useState("");
 const [busyExport,setBusyExport]=useState(false);
 const counterRef=useRef<Record<string,number>>({});
 const allPlates=useMemo(()=>[...plates,...SEED_PLATES],[plates]);
 const currentPlates=useMemo(()=>allPlates.filter(p=>p.collectionId===collection.id).sort((a,b)=>b.number-a.number||b.createdAt-a.createdAt),[allPlates,collection.id]);
 const filteredPlates=currentPlates.filter(p=>`${p.commonName} ${p.scientificName}`.toLowerCase().includes(galleryQuery.toLowerCase()));
 const selected=allPlates.find(p=>p.id===selectedId)||null;
 const counterFor = useCallback((id:string)=>{
  const c=collections.find(c=>c.id===id);
  return Math.max(c?.baseNumber||0,counterRef.current[id]||0,...[...plates,...SEED_PLATES].filter(p=>p.collectionId===id).map(p=>p.number));
 },[collections,plates]);
 const nextNumber=counterFor(collection.id)+1;
 const activePlate:Plate|null=selected && selected.collectionId===collection.id && !draft?{...selected,imageScale:form.imageScale}:{
  id:"draft",collectionId:collection.id,number:nextNumber,commonName:form.commonName||"Untitled specimen",scientificName:form.scientificName,
  origin:form.origin,notes:form.notes,image:"",imageScale:form.imageScale,createdAt:Date.now(),revision:1
 };
 const selectedForPreview=activePlate;
 function notify(msg:string){setToast(msg);setTimeout(()=>setToast(""),4000)}
 useEffect(()=>{
  try{setCustomCollections(JSON.parse(localStorage.getItem(customKey)||"[]"));counterRef.current=JSON.parse(localStorage.getItem(countKey)||"{}");}catch{}
  getPlates().then(p=>{setPlates(p);setLoaded(true)}).catch(()=>{setLoaded(true);notify("Browser storage is unavailable. Exports will still work.")});
  fetch("/api/auth/status").then(r=>r.json()).then(setStatus).catch(()=>{});
 },[]);
 useEffect(()=>{
  const belongs=allPlates.filter(p=>p.collectionId===collectionId).sort((a,b)=>b.number-a.number);
  setSelectedId(belongs[0]?.id||null);setDraft(belongs.length===0);setGalleryQuery("");
  const c=collections.find(c=>c.id===collectionId)||COLLECTIONS[0];
  const next=c.presets.find(x=>!belongs.some(p=>p.commonName===x.commonName))||c.presets[0];
  setForm(next?{...EMPTY_FORM,...next,imageScale:c.id==="fish"?61:c.id==="dogs"?67:68}:EMPTY_FORM);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[collectionId,loaded]);
 const update=(key:keyof FormDetails,value:string|number)=>setForm(s=>({...s,[key]:value}));
 function selectPreset(presetName:string){
  const preset=collection.presets.find(x=>x.commonName===presetName);
  if(!preset)return;
  setDraft(true);setSelectedId(null);setForm(s=>({...s,...preset}));
 }
 function newPlate(){
  const next=collection.presets.find(x=>!currentPlates.some(p=>p.commonName===x.commonName));
  setForm({ ...EMPTY_FORM,...(next||{}),imageScale:collection.id==="fish"?61:collection.id==="botanical"?68:64 });
  setDraft(true);setSelectedId(null);setShowLibrary(false);
 }
 function editPlate(p:Plate){setDraft(false);setSelectedId(p.id);setForm({commonName:p.commonName,scientificName:p.scientificName,origin:p.origin,notes:p.notes,appearance:"",imageScale:p.imageScale,colorMode:"natural"});setShowLibrary(false)}
 function makeVariant(){if(!selected){return}setForm({commonName:selected.commonName,scientificName:selected.scientificName,origin:selected.origin,notes:selected.notes,appearance:"",imageScale:selected.imageScale,colorMode:"natural"});setDraft(true);setSelectedId(null)}
 async function generate(){
  if(!status.configured){notify("Configure the API environment variables in .env.local or Vercel.");setLoginOpen(true);return}
  if(!status.authenticated){setLoginOpen(true);return}
  if(!form.commonName.trim()){notify("Enter a species or subject name first.");return}
  setGeneration(true);
  try{
    const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,collectionId:collection.id})});
    const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not generate the plate.");
    const editingExisting=Boolean(!draft&&selected&&!selected.id.startsWith("seed-"));
    const plate:Plate={id:editingExisting&&selected?selected.id:crypto.randomUUID(),collectionId:collection.id,number:editingExisting&&selected?selected.number:nextNumber,
      commonName:form.commonName.trim(),scientificName:form.scientificName.trim(),origin:form.origin.trim(),notes:form.notes.trim(),image:data.image,
      imageScale:form.imageScale,createdAt:Date.now(),revision:editingExisting&&selected?selected.revision+1:1};
    await savePlate(plate);
    if(!editingExisting){counterRef.current[collection.id]=plate.number;localStorage.setItem(countKey,JSON.stringify(counterRef.current))}
    setPlates(current=>[plate,...current.filter(p=>p.id!==plate.id)]);setSelectedId(plate.id);setDraft(false);
    notify(`${collection.singular} ${pad(plate.number)} created · saved to this browser`);
  }catch(e){notify(e instanceof Error?e.message:"Generation failed")}
  finally{setGeneration(false)}
 }
 async function login(){
  try{setLoginError("");const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:accessCode})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Could not unlock studio.");setStatus({configured:true,authenticated:true});setLoginOpen(false);setAccessCode("");notify("Studio unlocked. Image generation is ready.")}
  catch(e){setLoginError(e instanceof Error?e.message:"Incorrect access code.")}
 }
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});setStatus(s=>({...s,authenticated:false}));notify("Studio locked")}
 async function exportCurrent(){
  if(!selectedForPreview?.image){notify("Generate or select a plate to download.");return}
  try{await downloadPoster(selectedForPreview,collection)}catch(e){notify(e instanceof Error?e.message:"Export failed.")}
 }
 async function exportZip(){
  if(!currentPlates.length){notify("This collection has no plates yet.");return}
  setBusyExport(true);try{
    const zip=new JSZip();const manifest=currentPlates.map(({image,...fields})=>fields);
    zip.file("collection.json",JSON.stringify({name:`${collection.title} ${collection.version}`,plates:manifest},null,2));
    for(const p of currentPlates){const blob=await renderPoster(p,collection);zip.file(`${pad(p.number)}-${p.commonName.replace(/[^a-z0-9]+/gi,"-")}.png`,blob)}
    const file=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}});
    const url=URL.createObjectURL(file);const a=document.createElement("a");a.href=url;a.download=`${collection.title}-${collection.version}-plates.zip`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    notify(`Exported ${currentPlates.length} plates as PNGs`);
  }catch(e){notify(e instanceof Error?e.message:"Couldn't export collection.")}finally{setBusyExport(false)}
 }
 async function removeSelected(){
  if(!selected||selected.id.startsWith("seed-")){notify("Reference plates cannot be deleted.");return}
  if(!window.confirm(`Delete ${selected.commonName} from this browser?`))return;
  await deletePlate(selected.id);setPlates(p=>p.filter(x=>x.id!==selected.id));setSelectedId(null);setDraft(true);notify("Plate deleted")
 }
 function createCustom(){
  const title=newCollectionName.trim().slice(0,40);if(!title)return;
  const c:Collection={id:`custom-${crypto.randomUUID()}`,title,version:"1.0",singular:"Study",originLabel:"Native to",accent:"#A8414E",description:"Custom engraved natural history collection",baseNumber:0,icon:"sparkle",presets:[]};
  const list=[...customCollections,c];setCustomCollections(list);localStorage.setItem(customKey,JSON.stringify(list));setShowCustom(false);setNewCollectionName("");setCollectionId(c.id);setDraft(true);notify("Collection created")
 }
 const libraryCount=collections.reduce((sum,c)=>sum+allPlates.filter(p=>p.collectionId===c.id).length,0);
 return <div className="studio-shell">
  <aside className="sidebar">
   <div className="brand-lockup"><div className="brand-mark"><Feather size={24} strokeWidth={1.3}/></div><div><div className="brand-name">ATLAS<span> / </span>STUDIO</div><div className="brand-sub">AN ENGRAVING WORKSPACE</div></div></div>
   <div className="sidebar-divider"/>
   <div className="side-section-label">WORKSPACE</div>
   <button className={`side-primary ${!showLibrary?"active":""}`} onClick={()=>setShowLibrary(false)}><LayoutGrid size={17}/> Studio <span className="side-kbd">⌘1</span></button>
   <button className={`side-primary ${showLibrary?"active":""}`} onClick={()=>setShowLibrary(true)}><BookOpen size={17}/> Library <span className="side-count">{libraryCount}</span></button>
   <div className="side-section-top"><div className="side-section-label">COLLECTIONS</div><IconButton title="New collection" onClick={()=>setShowCustom(true)}><Plus size={17}/></IconButton></div>
   <nav className="collections-nav" aria-label="Collections">{collections.map(c=><button key={c.id} className={`collection-nav-item ${collectionId===c.id?"selected":""}`} onClick={()=>{setCollectionId(c.id);setShowLibrary(false)}}><span className="collection-icon"><CollectionGlyph icon={c.icon} size={18}/></span><span className="collection-label">{c.title} <small>{c.version}</small></span><span className="collection-count">{allPlates.filter(p=>p.collectionId===c.id).length.toString().padStart(2,"0")}</span></button>)}</nav>
   <div className="sidebar-bottom"><div className="sidebar-guide-icon"><BookOpen size={18}/></div><div className="sidebar-guide-title">The Engraving Standard</div><p>Every specimen, one consistent visual language.</p><div className="sidebar-guide-rule"/><div className="sidebar-guide-version"><span className="green-dot"/> V1.0 TEMPLATE ACTIVE</div></div>
   <div className="sidebar-footer"><div className="small-monogram">A</div><div><strong>Personal workspace</strong><span>Browser-saved collections</span></div><MoreHorizontal size={18}/></div>
  </aside>
  <div className="main-column">
   <header className="topbar"><div className="breadcrumb"><span>Workspace</span><ChevronLeft size={13} className="crumb-chevron"/><strong>{showLibrary?"Collection library":`${collection.title} ${collection.version}`}</strong></div><div className="top-actions"><span className="system-label"><span className="system-dot"/> ALL CHANGES SAVED LOCALLY</span><button className={`access-btn ${status.authenticated?"unlocked":""}`} onClick={()=>status.authenticated?logout():setLoginOpen(true)}>{status.authenticated?<ShieldCheck size={15}/>:<LockKeyhole size={15}/>} {status.authenticated?"Studio unlocked":"Unlock generation"}</button></div></header>
   {showLibrary?<section className="library-page"><div className="page-kicker">YOUR ARCHIVE / {String(libraryCount).padStart(2,"0")} STUDIES</div><div className="heading-row"><div><h1>The collection library<span className="period">.</span></h1><p>All your saved plates, organized by natural-history collection.</p></div><button className="solid-btn" onClick={newPlate}><Plus size={17}/> New plate</button></div><div className="library-overview">{collections.map(c=><button key={c.id} onClick={()=>{setCollectionId(c.id);setShowLibrary(false)}} className="library-collection"><span className="library-collection-mark" style={{color:c.accent}}><CollectionGlyph icon={c.icon} size={24}/></span><strong>{c.title} <span>{c.version}</span></strong><small>{allPlates.filter(x=>x.collectionId===c.id).length} plates</small><ArrowUpRight size={17}/></button>)}</div><div className="library-grid">{allPlates.sort((a,b)=>b.createdAt-a.createdAt).map(p=>{const c=collections.find(x=>x.id===p.collectionId)||COLLECTIONS[0];return <button className="library-tile" key={p.id} onClick={()=>{setCollectionId(p.collectionId);setShowLibrary(false);setSelectedId(p.id);setDraft(false)}}><div className="library-tile-img"><img src={p.image} alt={p.commonName}/></div><div className="library-tile-meta"><span className="library-number" style={{color:c.accent}}>{pad(p.number)}</span><div><strong>{p.commonName}</strong><em>{c.title} {c.version}</em></div><ArrowUpRight size={17}/></div></button>})}</div></section>:
   <main className="main-content"><div className="page-kicker">THE NATURAL HISTORY SERIES <span className="kicker-sep">/</span> COLLECTION {collection.version}</div><div className="heading-row"><div><h1>The art of the specimen<span className="period">.</span></h1><p>One subject. One precise engraving. An ever-growing collection.</p></div><button className="outline-btn" onClick={newPlate}><Plus size={17}/> New plate</button></div>
     <div className="workbench">
      <section className="config-panel"><div className="panel-header"><div><div className="panel-eyebrow">01 / CREATIVE BRIEF</div><h2>Compose a plate</h2></div><Settings2 size={19} strokeWidth={1.5}/></div>
       <div className="config-inner"><div className="form-group"><label>COLLECTION</label><div className="collection-display"><span className="form-collection-icon" style={{color:collection.accent}}><CollectionGlyph icon={collection.icon} size={20}/></span><span><strong>{collection.title} {collection.version}</strong><small>{collection.description}</small></span><ChevronDown size={15} color="#ADA9A0"/></div></div>
       <div className="form-group"><label htmlFor="preset">QUICK SPECIMEN <span>optional</span></label><div className="select-wrap"><select id="preset" value="" onChange={e=>selectPreset(e.target.value)}><option value="">Choose a suggested subject…</option>{collection.presets.map(p=><option key={p.commonName} value={p.commonName}>{p.commonName}</option>)}</select><ChevronDown size={16}/></div></div>
       <div className="form-group"><label htmlFor="name">SUBJECT NAME <b>*</b></label><input id="name" value={form.commonName} onChange={e=>update("commonName",e.target.value)} maxLength={100} placeholder="e.g. Indian Roller"/></div>
       <div className="form-group"><label htmlFor="scientific">SCIENTIFIC NAME <span>optional</span></label><input id="scientific" className="italic-input" value={form.scientificName} onChange={e=>update("scientificName",e.target.value)} maxLength={140} placeholder="e.g. Coracias benghalensis"/></div>
       <div className="form-group"><label htmlFor="origin">{collection.originLabel.toUpperCase()} <span>caption</span></label><input id="origin" value={form.origin} onChange={e=>update("origin",e.target.value)} maxLength={250} placeholder="e.g. South Asia"/></div>
       <div className="minor-divider"/>
       <div className="form-group"><div className="form-row-title"><label htmlFor="art-direction">ART DIRECTION</label><div className="small-help" title="Optional guidance to shape pose or environment"><CircleHelp size={14}/></div></div><textarea id="art-direction" value={form.notes} onChange={e=>update("notes",e.target.value)} rows={3} maxLength={1000} placeholder="Pose, habitat, specific markings, mood…"/><div className="field-hint">Engraving V1.0 rules are automatically applied.</div></div>
       <div className="form-group"><div className="label-row"><label htmlFor="size">ILLUSTRATION SCALE</label><strong>{form.imageScale}%</strong></div><input id="size" type="range" min="40" max="80" value={form.imageScale} onChange={e=>update("imageScale",Number(e.target.value))}/><div className="slider-labels"><span>Airy &amp; small</span><span>Detailed &amp; larger</span></div></div>
       <div className="form-group"><label htmlFor="ink">COLOUR TREATMENT</label><div className="select-wrap"><select id="ink" value={form.colorMode} onChange={e=>update("colorMode",e.target.value)}><option value="natural">Selective natural ink hatching</option><option value="monochrome">Monochrome black ink</option><option value="single">Single accent ink</option></select><ChevronDown size={16}/></div></div>
       <div className="generation-rules"><div><Check size={14}/> Full anatomy, no cropping</div><div><Check size={14}/> No sun or halo</div><div><Check size={14}/> Precise captions added separately</div></div></div>
       <div className="panel-bottom"><button disabled={generation||!form.commonName.trim()} onClick={generate} className="generate-btn"><WandSparkles size={18}/>{generation?"Engraving in progress…":!draft&&selected&&!selected.id.startsWith("seed-")?"Regenerate this plate":"Generate engraving"}<ArrowRight size={17}/></button><div className="generate-caption">{status.authenticated?"Connected to OpenAI Images API":"Unlock studio for AI generation"} · Each image uses API credits</div></div>
      </section>
      <section className="preview-panel"><div className="preview-toolbar"><div><div className="panel-eyebrow">02 / THE PRINT ROOM</div><h2>Plate preview <span>{pad(activePlate?.number||nextNumber)}</span></h2></div><div className="preview-action-buttons"><IconButton title="Download as PNG" onClick={exportCurrent}><Download size={18}/></IconButton><IconButton title="Regenerate as a new plate" onClick={makeVariant} disabled={!selected}><RotateCcw size={18}/></IconButton></div></div><div className="preview-area"><div className="paper-holder"><PlatePaper plate={selectedForPreview} collection={collection} scaleOverride={form.imageScale}/></div></div><div className="preview-bottom"><div><span className="preview-status-dot"/><strong>{selectedForPreview?.image?"PRINT-READY PREVIEW":"READY FOR GENERATION"}</strong><small>1600 × 2000 PNG export</small></div><button onClick={exportCurrent} disabled={!selectedForPreview?.image} className="export-preview-btn"><ArrowDownToLine size={16}/> Export PNG</button></div></section>
      <aside className="recent-panel"><div className="recent-header"><div><div className="panel-eyebrow">03 / THE ARCHIVE</div><h2>{collection.title} collection</h2><p>{currentPlates.length} completed {currentPlates.length===1?"plate":"plates"}</p></div><div className="archive-tag">V{collection.version}</div></div><div className="gallery-search"><Search size={15}/><input placeholder="Search plates…" value={galleryQuery} onChange={e=>setGalleryQuery(e.target.value)}/></div><div className="recent-scroll">{filteredPlates.length?filteredPlates.map(p=><button className={`recent-item ${selectedId===p.id&&!draft?"active":""}`} key={p.id} onClick={()=>editPlate(p)}><div className="recent-thumb"><img alt="" src={p.image}/></div><div className="recent-details"><span className="recent-number" style={{color:collection.accent}}>PLATE {pad(p.number)}</span><strong>{p.commonName}</strong><em>{p.scientificName||"Engraved study"}</em></div><ArrowUpRight size={15}/></button>):<div className="gallery-empty"><ImageIcon size={27}/><strong>No plates found</strong><span>Generate one to begin your collection.</span></div>}</div><div className="archive-bottom"><button onClick={exportZip} disabled={!currentPlates.length||busyExport}><ArrowDownToLine size={17}/>{busyExport?"Preparing archive…":"Export collection ZIP"}</button><p>Images are saved privately to this browser. Export regularly to back them up.</p></div></aside>
     </div>
     <div className="studio-footnote"><div><span className="footnote-star">✳</span> <strong>The Atlas Principle</strong><span> — Consistency in form. Character in every subject.</span></div><span>ANTIQUE EDITORIAL ENGRAVING / EST. 2026</span></div>
   </main>}
  </div>
  {toast&&<div className="toast"><CheckCheck size={17}/>{toast}<button onClick={()=>setToast("")}><X size={15}/></button></div>}
  {loginOpen&&<div className="modal-backdrop" onClick={()=>setLoginOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-icon"><LockKeyhole size={24}/></div><button className="modal-close" onClick={()=>setLoginOpen(false)}><X size={19}/></button><h2>Unlock the print room</h2><p>Enter your private studio access code. API credentials never reach the browser.</p><form onSubmit={e=>{e.preventDefault();login()}}><label htmlFor="access-code">STUDIO ACCESS CODE</label><input id="access-code" autoFocus type="password" value={accessCode} onChange={e=>setAccessCode(e.target.value)} placeholder="Enter access code"/><button className="solid-btn" type="submit">Unlock studio <ArrowRight size={16}/></button></form>{loginError&&<div className="error-message">{loginError}</div>}{!status.configured&&<div className="setup-hint">Not configured yet? Add <code>OPENAI_API_KEY</code>, <code>STUDIO_ACCESS_CODE</code>, and <code>SESSION_SECRET</code> in your environment settings. See README.</div>}</div></div>}
  {showCustom&&<div className="modal-backdrop" onClick={()=>setShowCustom(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-icon"><FolderPlus size={24}/></div><button className="modal-close" onClick={()=>setShowCustom(false)}><X size={19}/></button><h2>Start a new collection</h2><p>Build your own numbered series using the Antique Editorial V1.0 engraving standard.</p><form onSubmit={e=>{e.preventDefault();createCustom()}}><label htmlFor="new-collection">COLLECTION NAME</label><input id="new-collection" autoFocus value={newCollectionName} onChange={e=>setNewCollectionName(e.target.value)} maxLength={40} placeholder="e.g. Butterflies"/><button className="solid-btn" type="submit">Create collection <ArrowRight size={16}/></button></form></div></div>}
 </div>;
}
