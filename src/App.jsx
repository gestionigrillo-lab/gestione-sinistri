import { useState, useEffect, useCallback } from "react";
import { AlertCircle, CheckCircle, Clock, FileText, Mail, Plus, Settings, Upload, Users, Home, Shield, Send, Eye, X, Edit2, Building2, Phone, MapPin, Trash2, File, Image, Paperclip, DollarSign, TrendingUp, AlertTriangle, Search, ChevronRight, Activity, XCircle, CheckCircle2, Info, BarChart3, UserCog, Inbox, ArrowRight, RefreshCw } from "lucide-react";

/* ── helpers ── */
const nxId = a => Math.max(0, ...a.map(x => x.id)) + 1;
const d2s = d => d ? new Date(d).toLocaleDateString("it-IT") : "";
const TIPI = ["Fenomeno Elettrico","Evento Atmosferico","Ricerca Guasti","Danni Acqua Condotta","RC Terzi","Atti Vandalici","Incendio"];
const STATI = ["Aperto","In Lavorazione","Liquidato","Chiuso","Rifiutato"];
const TFORN = ["Idraulico","Elettricista","Muratore","Fabbro","Vetraio","Serramentista","Impresa Pulizie","Perito","Altro"];
const stC = {Aperto:"orange","In Lavorazione":"blue",Liquidato:"purple",Chiuso:"green",Rifiutato:"red"};
const stD = {Aperto:"bg-orange-400","In Lavorazione":"bg-blue-400",Liquidato:"bg-purple-400",Chiuso:"bg-green-400",Rifiutato:"bg-red-400"};

/* ── tiny components ── */
const Badge = ({children, color="blue"}) => {
  const m = {blue:"bg-blue-100 text-blue-800",green:"bg-green-100 text-green-800",orange:"bg-orange-100 text-orange-800",red:"bg-red-100 text-red-800",purple:"bg-purple-100 text-purple-800",gray:"bg-gray-100 text-gray-800",indigo:"bg-indigo-100 text-indigo-800",pink:"bg-pink-100 text-pink-800",yellow:"bg-yellow-100 text-yellow-800"};
  return <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${m[color]||m.gray}`}>{children}</span>;
};
const CkIco = ({s}) => s==="ok"?<CheckCircle2 className="w-4 h-4 text-green-600 shrink-0"/>:s==="ko"?<XCircle className="w-4 h-4 text-red-600 shrink-0"/>:s==="warning"?<AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0"/>:<Info className="w-4 h-4 text-blue-500 shrink-0"/>;
const Inp = ({label,value,onChange,type="text",required,placeholder,rows,disabled}) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required&&<span className="text-red-500"> *</span>}</label>
  {rows ? <textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={rows} disabled={disabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder={placeholder}/> : <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder={placeholder}/>}
  </div>
);
const Sel = ({label,value,onChange,options,required,placeholder="Seleziona..."}) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required&&<span className="text-red-500"> *</span>}</label>
  <select value={value||""} onChange={e=>onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white">
    <option value="">{placeholder}</option>
    {options.map(o => typeof o==="string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select></div>
);

/* ── toast ── */
function useToast(){
  const [ts,setTs]=useState([]);
  const add=useCallback((m,t="success")=>{const id=Date.now();setTs(p=>[...p,{id,message:m,type:t}]);setTimeout(()=>setTs(p=>p.filter(x=>x.id!==id)),4500);},[]);
  const rm=useCallback(id=>setTs(p=>p.filter(x=>x.id!==id)),[]);
  return {toasts:ts,addToast:add,removeToast:rm};
}
const Toasts = ({toasts,remove}) => (
  <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2" style={{maxWidth:400}}>
    {toasts.map(t=>(
      <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm ${t.type==="success"?"bg-green-50 border-green-200 text-green-800":t.type==="error"?"bg-red-50 border-red-200 text-red-800":t.type==="warning"?"bg-yellow-50 border-yellow-200 text-yellow-800":"bg-blue-50 border-blue-200 text-blue-800"}`}>
        {t.type==="success"?<CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0"/>:t.type==="error"?<XCircle className="w-5 h-5 mt-0.5 shrink-0"/>:t.type==="warning"?<AlertTriangle className="w-5 h-5 mt-0.5 shrink-0"/>:<Info className="w-5 h-5 mt-0.5 shrink-0"/>}
        <span className="flex-1">{t.message}</span>
        <button onClick={()=>remove(t.id)}><X className="w-4 h-4"/></button>
      </div>
    ))}
  </div>
);

/* ── modal shell ── */
const ModalShell = ({open,title,children,onSave,saveLabel="Salva",wide,onClose}) => {
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.5)"}}>
      <div className={`bg-white rounded-2xl shadow-2xl ${wide?"max-w-3xl":"max-w-lg"} w-full max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b"><h3 className="text-lg font-bold text-gray-800">{title}</h3><button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500"/></button></div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {onSave && <div className="flex justify-end gap-3 px-6 py-4 border-t"><button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annulla</button><button onClick={onSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">{saveLabel}</button></div>}
      </div>
    </div>
  );
};

/* ── verifica copertura ── */
function verificaCop(sin, pol) {
  const checks = []; let ok = true;
  if (pol.tipoRischi && pol.tipoRischi.length) {
    if (pol.tipoRischi.includes(sin.tipoDanno)) checks.push({label:"Tipo danno coperto",stato:"ok",det:`"${sin.tipoDanno}" incluso nei rischi`});
    else { checks.push({label:"Tipo danno NON coperto",stato:"ko",det:`"${sin.tipoDanno}" non in: ${pol.tipoRischi.join(", ")}`}); ok=false; }
  }
  const ds=new Date(sin.dataSinistro),di=new Date(pol.dataInizio),df=new Date(pol.dataScad);
  if(ds>=di&&ds<=df) checks.push({label:"Polizza attiva",stato:"ok",det:`${d2s(sin.dataSinistro)} entro ${d2s(pol.dataInizio)} - ${d2s(pol.dataScad)}`});
  else { checks.push({label:"Polizza NON attiva",stato:"ko",det:`Data sinistro fuori validità`}); ok=false; }
  const imp = +sin.importoStimato || 0;
  if(imp <= +pol.massimale) checks.push({label:"Entro massimale",stato:"ok",det:`€${imp.toLocaleString()} ≤ €${(+pol.massimale).toLocaleString()}`});
  else checks.push({label:"Supera massimale",stato:"warning",det:`€${imp.toLocaleString()} > €${(+pol.massimale).toLocaleString()}`});
  checks.push({label:"Franchigia",stato:"info",det:`€${(+pol.franchigia).toLocaleString()} — netto stimato: €${Math.max(0,imp-(+pol.franchigia)).toLocaleString()}`});
  const gg = Math.floor((new Date()-ds)/86400000);
  if(gg<=5) checks.push({label:"Termini denuncia OK",stato:"ok",det:`${gg} giorni`});
  else checks.push({label:"Termini denuncia scaduti",stato:"warning",det:`${gg} giorni — possibile decadenza`});
  return {checks, coperto:ok, sommario: ok ? "Sinistro IN COPERTURA" : "Sinistro NON in copertura"};
}

/* ── verifica liquidazione ── */
function verificaLiq(sin, liq, pol) {
  const checks=[];
  const totF=(sin.documenti||[]).filter(d=>d.tipo==="fattura").reduce((s,d)=>s+(+d.importo||0),0);
  const la=+liq.importoLiquidato, fr=+liq.franchigiaTrattenuta||0, net=la-fr;
  if(pol && Math.abs(fr-(+pol.franchigia))<=50) checks.push({label:"Franchigia corretta",stato:"ok",det:`€${fr.toLocaleString()} ≈ polizza €${(+pol.franchigia).toLocaleString()}`});
  else if(pol) checks.push({label:"Franchigia non corrispondente",stato:"warning",det:`€${fr.toLocaleString()} vs polizza €${(+pol.franchigia).toLocaleString()}`});
  if(totF>0){const df=Math.abs(net-totF);if(df<=100)checks.push({label:"Conforme a fatture",stato:"ok",det:`Netto €${net.toLocaleString()} ≈ fatture €${totF.toLocaleString()}`});else if(df<=500)checks.push({label:"Lieve scostamento",stato:"warning",det:`Netto €${net.toLocaleString()} vs fatture €${totF.toLocaleString()} (diff €${df.toLocaleString()})`});else checks.push({label:"Forte scostamento",stato:"ko",det:`Netto €${net.toLocaleString()} vs fatture €${totF.toLocaleString()} (diff €${df.toLocaleString()})`});}
  else checks.push({label:"Nessuna fattura",stato:"warning",det:"Caricare fatture per verifica"});
  if(pol && la<=+pol.massimale) checks.push({label:"Entro massimale",stato:"ok",det:`€${la.toLocaleString()} ≤ €${(+pol.massimale).toLocaleString()}`});
  else if(pol) checks.push({label:"Supera massimale",stato:"ko",det:`€${la.toLocaleString()} > €${(+pol.massimale).toLocaleString()}`});
  const ds=Math.abs(net-(+sin.importoStimato));
  if(ds<=500)checks.push({label:"Coerente con stima",stato:"ok",det:`Netto €${net.toLocaleString()} ≈ stima €${(+sin.importoStimato).toLocaleString()}`});
  else checks.push({label:"Scostamento dalla stima",stato:"warning",det:`Netto €${net.toLocaleString()} vs stima €${(+sin.importoStimato).toLocaleString()}`});
  const hasKo=checks.some(c=>c.stato==="ko"), hasW=checks.some(c=>c.stato==="warning");
  return {checks, congruita: hasKo?"Non Conforme":hasW?"Verificare":"Conforme", totF, net};
}

/* ══════════ MAIN APP ══════════ */
function App() {
  const [curUser,setCurUser] = useState(null);
  const [view,setView] = useState("dashboard");
  const [sinistri,setSinistri] = useState([]);
  const [condomini,setCondomini] = useState([]);
  const [polizze,setPolizze] = useState([]);
  const [fornitori,setFornitori] = useState([]);
  const [studio,setStudio] = useState({nome:"Studio Amministrazione Condomini",indirizzo:"Via Milano 100, Milano",telefono:"02-12345678",email:"info@studiocond.it",piva:"12345678901"});
  const [emails,setEmails] = useState([
    {id:1,address:"sinistri1@studio.it",active:true,smtp:"smtp.studio.it",port:"587",username:"",password:""},
    {id:2,address:"sinistri2@studio.it",active:true,smtp:"smtp.studio.it",port:"587",username:"",password:""}
  ]);
  const [tmpls,setTmpls] = useState({
    "Denuncia Generica":{oggetto:"Denuncia Sinistro - {numero_sinistro}",corpo:"Spettabile {compagnia},\n\nsi denuncia sinistro in data {data_sinistro} presso {nome_condominio}, {indirizzo_condominio}.\n\nTipo: {tipo_danno}\nPolizza: {numero_polizza}\n\nDescrizione:\n{descrizione}\n\nImporto stimato: € {importo_stimato}\n\nCordiali saluti,\n{nome_studio}"},
    "Sollecito":{oggetto:"Sollecito Pratica - {numero_sinistro}",corpo:"Spettabile {compagnia},\n\nriferendoci al sinistro {numero_sinistro} del {data_sinistro}, polizza {numero_polizza}, si sollecita riscontro.\n\nCordiali saluti,\n{nome_studio}"},
    "Integrazione":{oggetto:"Integrazione Documentazione - {numero_sinistro}",corpo:"Spettabile {compagnia},\n\nriferendoci al sinistro {numero_sinistro}, si trasmette documentazione integrativa.\n\nCordiali saluti,\n{nome_studio}"}
  });
  const [usersList,setUsersList] = useState([
    {id:1,username:"admin",password:"admin123",nome:"Amministratore",ruolo:"Admin"},
    {id:2,username:"operatore1",password:"op123",nome:"Mario Rossi",ruolo:"Operatore"},
    {id:3,username:"operatore2",password:"op456",nome:"Laura Bianchi",ruolo:"Operatore"}
  ]);
  const [inbox,setInbox] = useState([]);
  const [modal,setModal] = useState({open:false,type:"",item:null});
  const [form,setForm] = useState({});
  const [detSin,setDetSin] = useState(null);
  const [detTab,setDetTab] = useState("info");
  const [fStato,setFStato] = useState("");
  const [fTipo,setFTipo] = useState("");
  const [sTxt,setSTxt] = useState("");
  const [loginData,setLoginData] = useState({username:"",password:""});
  const {toasts,addToast,removeToast} = useToast();

  const handleLogin = () => {
    const u = usersList.find(x=>x.username===loginData.username&&x.password===loginData.password);
    if(u){setCurUser(u);setView("dashboard");setLoginData({username:"",password:""});}
    else addToast("Credenziali non valide","error");
  };

  useEffect(()=>{
    if(!curUser) return;
    setCondomini([
      {id:1,nome:"Condominio Via Roma 15",indirizzo:"Via Roma 15, Milano",telefono:"02-1234567",email:"viaroma15@email.it",iban:"IT60X0542811101000000123456",numUnita:12,cf:"80012345678"},
      {id:2,nome:"Condominio Piazza Duomo 8",indirizzo:"Piazza Duomo 8, Milano",telefono:"02-7654321",email:"duomo8@email.it",iban:"IT60X0542811101000000654321",numUnita:8,cf:"80087654321"},
      {id:3,nome:"Residenza Parco Verde",indirizzo:"Viale Monza 42, Milano",telefono:"02-9876543",email:"parcoverde@email.it",iban:"IT60X0542811101000000987654",numUnita:20,cf:"80098765432"}
    ]);
    setPolizze([
      {id:1,condominioId:1,compagnia:"Generali",emailComp:"sinistri@generali.it",numPol:"POL-2024-001",dataInizio:"2024-01-01",dataScad:"2025-12-31",massimale:500000,franchigia:500,tipoRischi:["Fenomeno Elettrico","Evento Atmosferico","Ricerca Guasti"],premio:2500,condizioni:"Globale fabbricati. Franchigia €500. Massimale singolo €100.000. Denuncia entro 3gg.",documenti:[{id:1,nome:"polizza_generali.pdf",tipo:"contratto",size:"1.2 MB"}]},
      {id:2,condominioId:2,compagnia:"Allianz",emailComp:"claims@allianz.it",numPol:"POL-2024-002",dataInizio:"2024-01-01",dataScad:"2025-11-30",massimale:750000,franchigia:1000,tipoRischi:["Evento Atmosferico","Ricerca Guasti","Danni Acqua Condotta"],premio:3200,condizioni:"Globale + danni acqua. Franchigia €1.000. Perizia obbligatoria oltre €5.000.",documenti:[]},
      {id:3,condominioId:3,compagnia:"UnipolSai",emailComp:"denunce@unipolsai.it",numPol:"POL-2024-003",dataInizio:"2024-06-01",dataScad:"2026-05-31",massimale:1000000,franchigia:750,tipoRischi:["Fenomeno Elettrico","Evento Atmosferico","Ricerca Guasti","RC Terzi","Incendio"],premio:4100,condizioni:"All risks. Franchigia €750. Foto obbligatorie.",documenti:[]}
    ]);
    setFornitori([
      {id:1,nome:"Idraulica Moderna SRL",tipo:"Idraulico",telefono:"333-1234567",email:"info@idraulicamoderna.it",piva:"11111111111",indirizzo:"Via Acqua 5, Milano"},
      {id:2,nome:"ElettroService",tipo:"Elettricista",telefono:"333-7654321",email:"elettroservice@email.it",piva:"22222222222",indirizzo:"Via Volt 10, Milano"},
      {id:3,nome:"Edil Costruzioni",tipo:"Muratore",telefono:"333-1112233",email:"info@edilcostruzioni.it",piva:"33333333333",indirizzo:"Via Mattoni 3, Milano"}
    ]);
    setSinistri([
      {id:1,numero:"SIN-2025-001",condominioId:1,polizzaId:1,dataSinistro:"2025-01-10",tipoDanno:"Evento Atmosferico",descrizione:"Infiltrazione acqua dal tetto, danni 4° piano.",stato:"Liquidato",importoStimato:3500,fornitoreId:1,documenti:[{id:1,nome:"foto_danno.jpg",tipo:"foto",size:"2.3 MB",importo:0},{id:2,nome:"fattura_riparazione.pdf",tipo:"fattura",importo:3200,size:"156 KB"}],emailInv:[{data:"2025-01-12",dest:"sinistri@generali.it",ogg:"Denuncia SIN-2025-001",tipo:"Denuncia",stato:"Inviata"}],emailRic:[{id:"ER1",data:"2025-01-14",mitt:"sinistri@generali.it",ogg:"Apertura Pratica",cont:"Pratica GEN-2025-5678 aperta."}],liquidazione:{importoLiquidato:3000,dataLiq:"2025-02-01",franchigia:500,note:"Al netto franchigia",verifiche:[{label:"Franchigia corretta",stato:"ok",det:"€500 = polizza"},{label:"Conforme a fatture",stato:"ok",det:"Netto €2.500 vs fatture €3.200"},{label:"Entro massimale",stato:"ok",det:"€3.000 ≤ €500.000"}],congruita:"Conforme",totFatt:3200,diff:-200},timeline:[{data:"2025-01-11",ev:"Sinistro aperto",ut:"Mario Rossi"},{data:"2025-01-12",ev:"Denuncia inviata",ut:"Mario Rossi"},{data:"2025-02-01",ev:"Liquidazione €3.000",ut:"Mario Rossi"}],note:"Pratica conclusa"},
      {id:2,numero:"SIN-2025-002",condominioId:2,polizzaId:2,dataSinistro:"2025-01-20",tipoDanno:"Ricerca Guasti",descrizione:"Perdita acqua tubature condominiali.",stato:"In Lavorazione",importoStimato:1800,fornitoreId:1,documenti:[{id:1,nome:"preventivo.pdf",tipo:"preventivo",importo:1800,size:"98 KB"}],emailInv:[{data:"2025-01-22",dest:"claims@allianz.it",ogg:"Denuncia SIN-2025-002",tipo:"Denuncia",stato:"Inviata"}],emailRic:[],liquidazione:null,timeline:[{data:"2025-01-21",ev:"Sinistro aperto",ut:"Mario Rossi"},{data:"2025-01-22",ev:"Denuncia inviata",ut:"Mario Rossi"}],note:"In attesa"},
      {id:3,numero:"SIN-2025-003",condominioId:1,polizzaId:1,dataSinistro:"2025-02-05",tipoDanno:"Fenomeno Elettrico",descrizione:"Sovratensione: danni centralina ascensore e citofono.",stato:"Aperto",importoStimato:4200,fornitoreId:2,documenti:[],emailInv:[],emailRic:[],liquidazione:null,timeline:[{data:"2025-02-05",ev:"Sinistro aperto",ut:"Laura Bianchi"}],note:"Urgente"},
      {id:4,numero:"SIN-2025-004",condominioId:3,polizzaId:3,dataSinistro:"2025-02-10",tipoDanno:"Danni Acqua Condotta",descrizione:"Rottura tubatura, allagamento box.",stato:"Aperto",importoStimato:8500,fornitoreId:1,documenti:[],emailInv:[],emailRic:[],liquidazione:null,timeline:[{data:"2025-02-10",ev:"Sinistro aperto",ut:"Amministratore"}],note:""}
    ]);
    setInbox([
      {id:"IN1",data:"2025-02-11",mitt:"sinistri@generali.it",ogg:"Richiesta docs SIN-2025-003",cont:"Fornire foto e preventivi per fenomeno elettrico Via Roma 15.",letta:false},
      {id:"IN2",data:"2025-02-12",mitt:"claims@allianz.it",ogg:"Aggiornamento ricerca guasti Piazza Duomo",cont:"Perito incaricato Dott. Bianchi. Appuntamento 20/02.",letta:false},
      {id:"IN3",data:"2025-02-13",mitt:"denunce@unipolsai.it",ogg:"Conferma denuncia danni acqua",cont:"Denuncia ricevuta per danni acqua condotta Viale Monza 42. Pratica UNI-2025-1234.",letta:false}
    ]);
  },[curUser]);

  /* state updaters */
  const upSin = (id, u) => setSinistri(p=>p.map(s=>s.id===id?{...s,...u}:s));
  useEffect(()=>{if(detSin){const f=sinistri.find(s=>s.id===detSin.id);if(f)setDetSin(f);}},[sinistri]);
  const mkTL = (sin, ev) => [...(sin.timeline||[]),{data:new Date().toISOString().split("T")[0],ev,ut:curUser.nome}];
  const openM = (type,item=null) => { setModal({open:true,type,item}); return type; };
  const closeM = () => { setModal({open:false,type:"",item:null}); setForm({}); };

  /* template replace */
  const tplReplace = (str, sin) => {
    const c = condomini.find(x=>x.id===sin.condominioId);
    const p = polizze.find(x=>x.id===sin.polizzaId);
    return (str||"").replace(/{compagnia}/g,p?.compagnia||"").replace(/{data_sinistro}/g,d2s(sin.dataSinistro)).replace(/{nome_condominio}/g,c?.nome||"").replace(/{indirizzo_condominio}/g,c?.indirizzo||"").replace(/{numero_polizza}/g,p?.numPol||"").replace(/{descrizione}/g,sin.descrizione||"").replace(/{importo_stimato}/g,(+sin.importoStimato||0).toLocaleString()).replace(/{numero_sinistro}/g,sin.numero||"").replace(/{nome_studio}/g,studio.nome).replace(/{tipo_danno}/g,sin.tipoDanno||"");
  };

  /* auto-match inbox */
  const autoMatch = (em) => {
    const txt = (em.ogg+" "+em.cont+(em.mitt||"")).toLowerCase();
    for(const s of sinistri){
      if(txt.includes(s.numero.toLowerCase())) return s.id;
      const c = condomini.find(x=>x.id===s.condominioId);
      if(c){
        const addr = (c.indirizzo||"").toLowerCase().split(",")[0];
        if(addr.length>5 && txt.includes(addr)) return s.id;
      }
    }
    return null;
  };

  const abbinaEmail = (emId, sinId) => {
    const em = inbox.find(e=>e.id===emId);
    const sin = sinistri.find(s=>s.id===+sinId);
    if(!em||!sin) return;
    upSin(sin.id, {emailRic:[...(sin.emailRic||[]),{id:emId,data:em.data,mitt:em.mitt,ogg:em.ogg,cont:em.cont}], timeline:mkTL(sin,`Email abbinata: "${em.ogg}"`)});
    setInbox(p=>p.filter(e=>e.id!==emId));
    addToast(`Email abbinata a ${sin.numero}`);
  };

  /* ── computed ── */
  const stats = {tot:sinistri.length, aperti:sinistri.filter(s=>s.stato==="Aperto").length, inLav:sinistri.filter(s=>s.stato==="In Lavorazione").length, liq:sinistri.filter(s=>s.stato==="Liquidato").length, chiusi:sinistri.filter(s=>s.stato==="Chiuso").length};
  const totStim = sinistri.reduce((a,x)=>a+(+x.importoStimato||0),0);
  const totLiq = sinistri.filter(s=>s.liquidazione).reduce((a,x)=>a+(+x.liquidazione?.importoLiquidato||0),0);
  const fSin = sinistri.filter(s=>{if(fStato&&s.stato!==fStato)return false;if(fTipo&&s.tipoDanno!==fTipo)return false;if(sTxt){const t=sTxt.toLowerCase();const c=condomini.find(x=>x.id===s.condominioId);return s.numero.toLowerCase().includes(t)||s.descrizione.toLowerCase().includes(t)||(c?.nome||"").toLowerCase().includes(t);}return true;});
  const unread = inbox.length;

  /* ── coverage preview helper ── */
  const CovPreview = ({polId, tipoDanno, dataSinistro, importo}) => {
    const pol = polizze.find(p=>p.id===+polId);
    if(!pol || !tipoDanno) return null;
    const vc = verificaCop({tipoDanno, dataSinistro, importoStimato:+importo||0}, pol);
    return (
      <div className={`p-3 rounded-lg border ${vc.coperto?"bg-green-50 border-green-200":"bg-red-50 border-red-200"}`}>
        <p className={`text-sm font-medium ${vc.coperto?"text-green-700":"text-red-700"}`}>{vc.coperto?"✅":"⚠️"} {vc.sommario}</p>
        {vc.checks.filter(c=>c.stato==="ko"||c.stato==="warning").map((c,i)=><p key={i} className="text-xs text-gray-600 mt-0.5">• {c.label}</p>)}
      </div>
    );
  };

  /* ═══ LOGIN ═══ */
  if(!curUser) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toasts toasts={toasts} remove={removeToast}/>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8"><div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4"><Shield className="w-8 h-8 text-white"/></div><h1 className="text-2xl font-bold text-gray-900">Gestione Sinistri</h1><p className="text-gray-500 mt-1 text-sm">v3.0 Professionale</p></div>
        <div className="space-y-4">
          <Inp label="Username" value={loginData.username} onChange={v=>setLoginData({...loginData,username:v})}/>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Password"/></div>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">Accedi</button>
        </div>
        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600"><p className="font-medium mb-1">Credenziali test:</p><p>admin / admin123 · operatore1 / op123 · operatore2 / op456</p></div>
      </div>
    </div>
  );

  /* ═══ DETAIL SINISTRO ═══ */
  if(detSin) {
    const s=detSin, co=condomini.find(c=>c.id===s.condominioId), po=polizze.find(p=>p.id===s.polizzaId), fo=fornitori.find(f=>f.id===s.fornitoreId);
    const totF=(s.documenti||[]).filter(d=>d.tipo==="fattura").reduce((a,d)=>a+(+d.importo||0),0);
    const vc = po ? verificaCop(s,po) : null;

    return (
      <div className="min-h-screen bg-gray-50">
        <Toasts toasts={toasts} remove={removeToast}/>
        <div className="bg-white border-b px-4 py-3"><div className="max-w-6xl mx-auto flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={()=>{setDetSin(null);setDetTab("info");}} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-400 rotate-180"/></button><div><h1 className="text-lg font-bold">{s.numero}</h1><p className="text-sm text-gray-500">{co?.nome}</p></div></div><div className="flex items-center gap-2"><Badge color={stC[s.stato]||"gray"}>{s.stato}</Badge><button onClick={()=>{openM("cambiaStato",s);setForm({stato:s.stato,nota:""});}} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cambia Stato</button></div></div></div>
        <div className="bg-white border-b"><div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[["info","Info",FileText],["copertura","Copertura",Shield],["documenti","Documenti",Paperclip],["email","Email",Mail],["liquidazione","Liquidazione",DollarSign],["timeline","Timeline",Activity]].map(([id,lb,Ic])=>(
            <button key={id} onClick={()=>setDetTab(id)} className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${detTab===id?"border-blue-600 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700"}`}><Ic className="w-4 h-4"/>{lb}</button>
          ))}
        </div></div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {detTab==="info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-4">Dati Sinistro</h3><div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Numero</span><span className="font-medium">{s.numero}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Data</span><span className="font-medium">{d2s(s.dataSinistro)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tipo</span><Badge color="indigo">{s.tipoDanno}</Badge></div>
                <div className="flex justify-between"><span className="text-gray-500">Stimato</span><span className="font-bold">€{(+s.importoStimato).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fatture</span><span className="font-bold text-green-700">€{totF.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Descrizione</span><p className="mt-1">{s.descrizione}</p></div>
                {s.note && <div><span className="text-gray-500">Note</span><p className="mt-1 whitespace-pre-wrap">{s.note}</p></div>}
              </div></div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-2">Condominio</h3><p className="font-medium">{co?.nome}</p><p className="text-sm text-gray-500">{co?.indirizzo} · {co?.telefono}</p></div>
                <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-2">Polizza</h3><p className="font-medium">{po?.compagnia}</p><p className="text-sm text-gray-500">N. {po?.numPol} · Max €{po?.massimale?.toLocaleString()} · Fr. €{po?.franchigia?.toLocaleString()}</p></div>
                {fo && <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-2">Fornitore</h3><p className="font-medium">{fo.nome}</p><p className="text-sm text-gray-500">{fo.tipo} · {fo.telefono}</p></div>}
              </div>
            </div>
          )}
          {detTab==="copertura" && (
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Verifica Copertura</h3>{vc && <Badge color={vc.coperto?"green":"red"}>{vc.sommario}</Badge>}</div>
              {!po ? <p className="text-gray-400">Nessuna polizza</p> : vc ? <div className="space-y-3">
                {vc.checks.map((c,i)=><div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><CkIco s={c.stato}/><div><p className="text-sm font-medium">{c.label}</p><p className="text-xs text-gray-500">{c.det}</p></div></div>)}
                {po.condizioni && <div className="mt-4 p-3 bg-blue-50 rounded-lg"><p className="text-xs font-medium text-blue-700 mb-1">Condizioni Polizza:</p><p className="text-xs text-blue-600 whitespace-pre-wrap">{po.condizioni}</p></div>}
              </div> : null}
            </div>
          )}
          {detTab==="documenti" && (
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Documenti ({(s.documenti||[]).length})</h3><button onClick={()=>{openM("uploadDoc",s);setForm({tipoDoc:"fattura",nome:"",importo:""});}} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><Upload className="w-4 h-4"/>Carica</button></div>
              {!(s.documenti||[]).length ? <p className="text-gray-400 text-sm py-8 text-center">Nessun documento</p> :
              <div className="space-y-2">{s.documenti.map(d=>(
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">{d.tipo==="foto"?<Image className="w-5 h-5 text-blue-500"/>:<File className="w-5 h-5 text-orange-500"/>}<div><p className="text-sm font-medium">{d.nome}</p><p className="text-xs text-gray-500">{d.tipo}{d.importo?` · €${(+d.importo).toLocaleString()}`:""}</p></div></div>
                  <button onClick={()=>{upSin(s.id,{documenti:s.documenti.filter(x=>x.id!==d.id)});addToast("Rimosso");}} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}</div>}
            </div>
          )}
          {detTab==="email" && (
            <div className="space-y-6">
              <div className="flex justify-end gap-2">
                <button onClick={()=>{openM("sendComm",s);const p=polizze.find(x=>x.id===s.polizzaId);setForm({dest:p?.emailComp||"",ogg:"",corpo:"",tipoComm:"Sollecito"});}} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg font-medium"><Mail className="w-4 h-4"/>Comunicazione</button>
                <button onClick={()=>{openM("genDen",s);const p=polizze.find(x=>x.id===s.polizzaId);const t=tmpls["Denuncia Generica"];setForm({dest:p?.emailComp||"",ogg:tplReplace(t?.oggetto,s),corpo:tplReplace(t?.corpo,s)});}} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"><Send className="w-4 h-4"/>Genera Denuncia</button>
              </div>
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-3">Inviate ({(s.emailInv||[]).length})</h3>
                {!(s.emailInv||[]).length ? <p className="text-gray-400 text-sm">Nessuna</p> : s.emailInv.map((e,i)=><div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2"><div><p className="text-sm font-medium">{e.ogg}</p><p className="text-xs text-gray-500">A: {e.dest} · {d2s(e.data)}{e.tipo?` · ${e.tipo}`:""}</p></div><Badge color="green">{e.stato}</Badge></div>)}
              </div>
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-3">Ricevute ({(s.emailRic||[]).length})</h3>
                {!(s.emailRic||[]).length ? <p className="text-gray-400 text-sm">Nessuna</p> : s.emailRic.map((e,i)=><div key={i} className="p-3 bg-green-50 rounded-lg mb-2"><p className="text-sm font-medium">{e.ogg}</p><p className="text-xs text-gray-500">Da: {e.mitt} · {d2s(e.data)}</p>{e.cont && <p className="text-sm mt-2 p-2 bg-white rounded">{e.cont}</p>}</div>)}
              </div>
            </div>
          )}
          {detTab==="liquidazione" && (
            <div className="bg-white rounded-xl border p-5">
              {!s.liquidazione ? (
                <div className="text-center py-8"><DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500 mb-4">Nessuna liquidazione</p><button onClick={()=>{openM("addLiq",s);setForm({importoLiquidato:"",dataLiq:new Date().toISOString().split("T")[0],franchigia:"",note:""});}} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">Registra Liquidazione</button></div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Liquidazione</h3><Badge color={s.liquidazione.congruita==="Conforme"?"green":s.liquidazione.congruita==="Verificare"?"yellow":"red"}>{s.liquidazione.congruita}</Badge></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Liquidato</p><p className="text-lg font-bold">€{(+s.liquidazione.importoLiquidato).toLocaleString()}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Franchigia</p><p className="text-lg font-bold text-orange-600">€{(+s.liquidazione.franchigia||0).toLocaleString()}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Netto</p><p className="text-lg font-bold text-green-700">€{((+s.liquidazione.importoLiquidato)-(+s.liquidazione.franchigia||0)).toLocaleString()}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Data</p><p className="font-medium">{d2s(s.liquidazione.dataLiq)}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Tot. Fatture</p><p className="font-medium">€{(+s.liquidazione.totFatt||0).toLocaleString()}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Differenza</p><p className={`font-medium ${(+s.liquidazione.diff||0)>=0?"text-green-600":"text-red-600"}`}>€{(+s.liquidazione.diff||0).toLocaleString()}</p></div>
                  </div>
                  {(s.liquidazione.verifiche||[]).length > 0 && <div className="space-y-2 mb-4"><p className="text-sm font-medium text-gray-700 mb-2">Verifiche automatiche:</p>{s.liquidazione.verifiche.map((c,i)=><div key={i} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg"><CkIco s={c.stato}/><div><p className="text-sm font-medium">{c.label}</p><p className="text-xs text-gray-500">{c.det}</p></div></div>)}</div>}
                  {s.liquidazione.note && <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">Note: {s.liquidazione.note}</p>}
                </div>
              )}
            </div>
          )}
          {detTab==="timeline" && (
            <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-4">Cronologia</h3>
              {(s.timeline||[]).slice().reverse().map((t,i)=>(
                <div key={i} className="flex gap-3 pb-4"><div className="flex flex-col items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5"/>{i<(s.timeline.length-1)&&<div className="w-0.5 flex-1 bg-gray-200 mt-1"/>}</div><div><p className="text-sm">{t.ev}</p><p className="text-xs text-gray-400">{d2s(t.data)} · {t.ut}</p></div></div>
              ))}
            </div>
          )}
        </div>
        {/* Detail modals */}
        <ModalShell open={modal.open&&modal.type==="uploadDoc"} title="Carica Documento" onSave={()=>{if(!form.nome){addToast("Nome richiesto","warning");return;}const ss=sinistri.find(x=>x.id===detSin.id);const doc={id:((ss.documenti||[]).length||0)+1,nome:form.nome,tipo:form.tipoDoc,size:"256 KB",importo:(form.tipoDoc==="fattura"||form.tipoDoc==="preventivo")?+form.importo||0:0};upSin(ss.id,{documenti:[...(ss.documenti||[]),doc],timeline:mkTL(ss,`Doc: ${doc.nome}`)});closeM();addToast("Caricato");}} saveLabel="Carica" onClose={closeM}>
          <div className="space-y-4"><Sel label="Tipo" value={form.tipoDoc} onChange={v=>setForm({...form,tipoDoc:v})} options={["foto","fattura","preventivo","perizia","altro"]}/><Inp label="Nome File" value={form.nome} onChange={v=>setForm({...form,nome:v})} required placeholder="es. fattura.pdf"/>{(form.tipoDoc==="fattura"||form.tipoDoc==="preventivo")&&<Inp label="Importo €" value={form.importo} onChange={v=>setForm({...form,importo:v})} type="number"/>}</div>
        </ModalShell>
        <ModalShell open={modal.open&&modal.type==="genDen"} title="Genera Denuncia" wide onSave={()=>{if(!form.dest){addToast("Destinatario","warning");return;}const ss=sinistri.find(x=>x.id===detSin.id);const em={data:new Date().toISOString().split("T")[0],dest:form.dest,ogg:form.ogg,tipo:"Denuncia",stato:"Inviata"};const ns=ss.stato==="Aperto"?"In Lavorazione":ss.stato;const vcc=po?verificaCop(ss,po):null;upSin(ss.id,{emailInv:[...(ss.emailInv||[]),em],stato:ns,timeline:mkTL(ss,`Denuncia inviata${vcc?" — "+vcc.sommario:""}`)});closeM();if(vcc&&!vcc.coperto)addToast("Inviata — "+vcc.sommario,"warning");else addToast("Denuncia inviata");}} saveLabel="Invia" onClose={closeM}>
          <div className="space-y-4">
            {vc && <div className={`p-3 rounded-lg border ${vc.coperto?"bg-green-50 border-green-200":"bg-red-50 border-red-200"}`}><p className={`text-sm font-medium ${vc.coperto?"text-green-700":"text-red-700"}`}>{vc.coperto?"✅":"⚠️"} {vc.sommario}</p>{vc.checks.filter(c=>c.stato==="ko").map((c,i)=><p key={i} className="text-xs mt-0.5">• {c.label}</p>)}</div>}
            <Inp label="Destinatario" value={form.dest} onChange={v=>setForm({...form,dest:v})} required/><Inp label="Oggetto" value={form.ogg} onChange={v=>setForm({...form,ogg:v})}/><Inp label="Corpo" value={form.corpo} onChange={v=>setForm({...form,corpo:v})} rows={12}/>
          </div>
        </ModalShell>
        <ModalShell open={modal.open&&modal.type==="sendComm"} title="Comunicazione" wide onSave={()=>{if(!form.dest||!form.ogg){addToast("Compila dest/ogg","warning");return;}const ss=sinistri.find(x=>x.id===detSin.id);const em={data:new Date().toISOString().split("T")[0],dest:form.dest,ogg:form.ogg,tipo:form.tipoComm,stato:"Inviata"};upSin(ss.id,{emailInv:[...(ss.emailInv||[]),em],timeline:mkTL(ss,`${form.tipoComm} inviato`)});closeM();addToast("Inviato");}} saveLabel="Invia" onClose={closeM}>
          <div className="space-y-4">
            <Sel label="Tipo" value={form.tipoComm} onChange={v=>{const t=tmpls[v];setForm({...form,tipoComm:v,ogg:t?tplReplace(t.oggetto,s):form.ogg});}} options={Object.keys(tmpls)}/>
            <Inp label="Destinatario" value={form.dest} onChange={v=>setForm({...form,dest:v})} required/><Inp label="Oggetto" value={form.ogg} onChange={v=>setForm({...form,ogg:v})} required/><Inp label="Corpo" value={form.corpo} onChange={v=>setForm({...form,corpo:v})} rows={8}/>
          </div>
        </ModalShell>
        <ModalShell open={modal.open&&modal.type==="cambiaStato"} title="Cambia Stato" onSave={()=>{const ss=sinistri.find(x=>x.id===detSin.id);const ch={stato:form.stato,timeline:mkTL(ss,`Stato: ${form.stato}${form.nota?" — "+form.nota:""}`)};if(form.nota)ch.note=(ss.note?ss.note+"\n":"")+form.nota;upSin(ss.id,ch);closeM();addToast("Stato: "+form.stato);}} onClose={closeM}>
          <div className="space-y-4"><Sel label="Stato" value={form.stato} onChange={v=>setForm({...form,stato:v})} options={STATI} required/><Inp label="Nota" value={form.nota} onChange={v=>setForm({...form,nota:v})} rows={3}/></div>
        </ModalShell>
        <ModalShell open={modal.open&&modal.type==="addLiq"} title="Registra Liquidazione" onSave={()=>{if(!form.importoLiquidato){addToast("Importo richiesto","warning");return;}const ss=sinistri.find(x=>x.id===detSin.id);const liq={importoLiquidato:+form.importoLiquidato,franchigia:+form.franchigia||0,dataLiq:form.dataLiq,note:form.note};const vl=verificaLiq(ss,{importoLiquidato:liq.importoLiquidato,franchigiaTrattenuta:liq.franchigia},po);const full={...liq,verifiche:vl.checks,congruita:vl.congruita,totFatt:vl.totF,diff:vl.net-vl.totF};upSin(ss.id,{liquidazione:full,stato:"Liquidato",timeline:mkTL(ss,`Liquidazione €${liq.importoLiquidato.toLocaleString()} — ${vl.congruita}`)});closeM();addToast(`Liquidazione — ${vl.congruita}`,vl.congruita==="Conforme"?"success":vl.congruita==="Verificare"?"warning":"error");}} onClose={closeM}>
          <div className="space-y-4"><Inp label="Importo Liquidato €" value={form.importoLiquidato} onChange={v=>setForm({...form,importoLiquidato:v})} type="number" required/><Inp label="Data" value={form.dataLiq} onChange={v=>setForm({...form,dataLiq:v})} type="date" required/><Inp label="Franchigia €" value={form.franchigia} onChange={v=>setForm({...form,franchigia:v})} type="number"/><Inp label="Note" value={form.note} onChange={v=>setForm({...form,note:v})} rows={3}/><div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700"><p className="font-medium">Verifica automatica al salvataggio:</p><p>• Franchigia vs polizza • Fatture • Massimale • Stima</p></div></div>
        </ModalShell>
        <ModalShell open={modal.open&&modal.type==="abbina"} title="Abbina Email" onSave={()=>{if(!form.sinId){addToast("Seleziona","warning");return;}abbinaEmail(modal.item?.id,form.sinId);closeM();}} onClose={closeM}>
          <div className="space-y-4"><Sel label="Sinistro" value={form.sinId} onChange={v=>setForm({...form,sinId:v})} options={sinistri.map(x=>({value:x.id,label:`${x.numero} - ${condomini.find(c=>c.id===x.condominioId)?.nome||""}`}))} required/></div>
        </ModalShell>
      </div>
    );
  }

  /* ═══ MAIN LAYOUT ═══ */
  return (
    <div className="min-h-screen bg-gray-50">
      <Toasts toasts={toasts} remove={removeToast}/>
      <header className="bg-white border-b"><div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-blue-600 rounded-xl"><Shield className="w-6 h-6 text-white"/></div><div><h1 className="text-lg font-bold">Gestione Sinistri Pro</h1><p className="text-xs text-gray-500">v3.0</p></div></div><div className="flex items-center gap-4"><span className="text-sm text-gray-600">{curUser.nome} ({curUser.ruolo})</span><button onClick={()=>setCurUser(null)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Esci</button></div></div></header>
      <nav className="bg-white border-b"><div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
        {[["dashboard","Dashboard",Home],["sinistri","Sinistri",AlertCircle],["condomini","Condomini",Building2],["polizze","Polizze",Shield],["fornitori","Fornitori",Users],["inbox","Inbox",Inbox],["impostazioni","Impostazioni",Settings]].map(([id,lb,Ic])=>(
          <button key={id} onClick={()=>setView(id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${view===id?"border-blue-600 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700"}`}><Ic className="w-4 h-4"/>{lb}{id==="inbox"&&unread>0&&<span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{unread}</span>}</button>
        ))}
      </div></nav>
      <main className="max-w-7xl mx-auto px-4 py-6">

        {view==="dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[["Totale",stats.tot,FileText,"text-gray-900"],["Aperti",stats.aperti,AlertCircle,"text-orange-600"],["In Lavorazione",stats.inLav,Clock,"text-blue-600"],["Liquidati",stats.liq,DollarSign,"text-purple-600"],["Chiusi",stats.chiusi,CheckCircle,"text-green-600"]].map(([l,v,Ic,c],i)=>(
                <div key={i} className="bg-white rounded-xl border p-4"><Ic className="w-5 h-5 text-gray-400 mb-2"/><p className={`text-3xl font-bold ${c}`}>{v}</p><p className="text-xs text-gray-500 mt-1">{l}</p></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600"/>Importi</h3><div className="space-y-3"><div className="flex justify-between"><span className="text-sm text-gray-500">Stimato</span><span className="font-bold">€{totStim.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Liquidato</span><span className="font-bold text-purple-700">€{totLiq.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Da incassare</span><span className="font-bold text-orange-600">€{(totStim-totLiq).toLocaleString()}</span></div></div></div>
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-600"/>Per Tipo</h3><div className="space-y-2">{[...new Set(sinistri.map(s=>s.tipoDanno))].map(t=>{const n=sinistri.filter(s=>s.tipoDanno===t).length;return <div key={t}><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t}</span><span className="font-medium">{n}</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 rounded-full h-2" style={{width:`${Math.round(n/sinistri.length*100)}%`}}/></div></div>;})}</div></div>
            </div>
            {unread>0 && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><Inbox className="w-5 h-5 text-yellow-600"/><p className="text-sm text-yellow-800"><b>{unread} email</b> da abbinare</p></div><button onClick={()=>setView("inbox")} className="px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-sm rounded-lg font-medium">Vai</button></div>}
            <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-4">Ultimi Sinistri</h3><div className="space-y-2">{sinistri.slice(-5).reverse().map(s=>{const c=condomini.find(x=>x.id===s.condominioId);return <div key={s.id} onClick={()=>{setDetSin(s);setDetTab("info");}} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer"><div className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full ${stD[s.stato]||"bg-gray-400"}`}/><div><p className="text-sm font-medium">{s.numero}</p><p className="text-xs text-gray-500">{c?.nome} · {s.tipoDanno}</p></div></div><div className="text-right"><p className="text-sm font-bold">€{(+s.importoStimato).toLocaleString()}</p><p className="text-xs text-gray-400">{d2s(s.dataSinistro)}</p></div></div>;})}</div></div>
          </div>
        )}

        {view==="sinistri" && (
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-bold">Sinistri</h2><button onClick={()=>{openM("newSin");setForm({condominioId:"",polizzaId:"",dataSinistro:new Date().toISOString().split("T")[0],tipoDanno:"",descrizione:"",importoStimato:"",fornitoreId:"",note:""});}} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"><Plus className="w-4 h-4"/>Nuovo</button></div>
            <div className="flex flex-wrap gap-3 mb-4"><div className="flex-1 min-w-48 relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/><input value={sTxt} onChange={e=>setSTxt(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Cerca..."/></div><select value={fStato} onChange={e=>setFStato(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="">Tutti stati</option>{STATI.map(s=><option key={s}>{s}</option>)}</select><select value={fTipo} onChange={e=>setFTipo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="">Tutti tipi</option>{TIPI.map(t=><option key={t}>{t}</option>)}</select>{(fStato||fTipo||sTxt)&&<button onClick={()=>{setFStato("");setFTipo("");setSTxt("");}} className="px-3 py-2 text-sm text-red-600">Reset</button>}</div>
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50 border-b"><tr>{["Numero","Condominio","Data","Tipo","Importo","Stato",""].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr></thead><tbody className="divide-y">{!fSin.length?<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Nessuno</td></tr>:fSin.map(s=>{const c=condomini.find(x=>x.id===s.condominioId);return <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>{setDetSin(s);setDetTab("info");}}><td className="px-4 py-3 text-sm font-semibold">{s.numero}</td><td className="px-4 py-3 text-sm text-gray-600">{c?.nome}</td><td className="px-4 py-3 text-sm text-gray-600">{d2s(s.dataSinistro)}</td><td className="px-4 py-3"><Badge color="indigo">{s.tipoDanno}</Badge></td><td className="px-4 py-3 text-sm font-bold">€{(+s.importoStimato).toLocaleString()}</td><td className="px-4 py-3"><Badge color={stC[s.stato]||"gray"}>{s.stato}</Badge></td><td className="px-4 py-3"><Eye className="w-4 h-4 text-gray-400"/></td></tr>;})}</tbody></table><div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">{fSin.length}/{sinistri.length}</div></div>
          </div>
        )}

        {view==="condomini" && (
          <div>
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Condomini</h2><button onClick={()=>{openM("newCond");setForm({nome:"",indirizzo:"",telefono:"",email:"",iban:"",numUnita:"",cf:""});}} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"><Plus className="w-4 h-4"/>Nuovo</button></div>
            <div className="grid gap-4">{condomini.map(c=><div key={c.id} className="bg-white rounded-xl border p-5"><div className="flex items-start justify-between mb-3"><div className="flex items-start gap-3"><div className="p-2.5 bg-blue-50 rounded-xl"><Building2 className="w-5 h-5 text-blue-600"/></div><div><h3 className="font-bold">{c.nome}</h3><p className="text-sm text-gray-500"><MapPin className="w-3.5 h-3.5 inline mr-1"/>{c.indirizzo}</p></div></div><div className="flex gap-1"><button onClick={()=>{openM("editCond",c);setForm({...c});}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4"/></button><button onClick={()=>{setCondomini(p=>p.filter(x=>x.id!==c.id));addToast("Eliminato");}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"><div><p className="text-gray-500 text-xs">Tel</p><p className="font-medium">{c.telefono}</p></div><div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{c.email}</p></div><div><p className="text-gray-500 text-xs">Unità</p><p className="font-medium">{c.numUnita}</p></div><div><p className="text-gray-500 text-xs">IBAN</p><p className="font-medium text-xs">{c.iban}</p></div></div></div>)}</div>
          </div>
        )}

        {view==="polizze" && (
          <div>
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Polizze</h2><button onClick={()=>{openM("newPol");setForm({condominioId:"",compagnia:"",emailComp:"",numPol:"",dataInizio:"",dataScad:"",massimale:"",franchigia:"",tipoRischi:[],premio:"",condizioni:"",documenti:[]});}} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"><Plus className="w-4 h-4"/>Nuova</button></div>
            <div className="grid gap-4">{polizze.map(p=>{const c=condomini.find(x=>x.id===p.condominioId);const exp=p.dataScad&&new Date(p.dataScad)<new Date(Date.now()+90*86400000);return <div key={p.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between mb-3"><div className="flex items-start gap-3"><div className="p-2.5 bg-purple-50 rounded-xl"><Shield className="w-5 h-5 text-purple-600"/></div><div><h3 className="font-bold">{p.compagnia}</h3><p className="text-sm text-gray-500">{c?.nome} · {p.numPol}</p></div></div><div className="flex items-center gap-2">{exp&&<Badge color="red">Scadenza</Badge>}<button onClick={()=>{openM("editPol",p);setForm({...p});}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4"/></button><button onClick={()=>{setPolizze(pr=>pr.filter(x=>x.id!==p.id));addToast("Eliminata");}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button></div></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3"><div><p className="text-xs text-gray-500">Scadenza</p><p className={`font-medium ${exp?"text-red-600":""}`}>{d2s(p.dataScad)}</p></div><div><p className="text-xs text-gray-500">Massimale</p><p className="font-medium text-green-700">€{(+p.massimale).toLocaleString()}</p></div><div><p className="text-xs text-gray-500">Franchigia</p><p className="font-medium text-orange-600">€{(+p.franchigia).toLocaleString()}</p></div><div><p className="text-xs text-gray-500">Premio</p><p className="font-medium">€{(+p.premio).toLocaleString()}</p></div></div>
              <div className="flex flex-wrap gap-1.5 mb-3">{(p.tipoRischi||[]).map((r,i)=><Badge key={i} color="purple">{r}</Badge>)}</div>
              <div className="border-t pt-3 mt-2"><div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-gray-500 uppercase">Documenti ({(p.documenti||[]).length})</p><button onClick={()=>{openM("upPolDoc",p);setForm({nome:"",tipoDoc:"contratto",polId:p.id});}} className="flex items-center gap-1 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-lg"><Upload className="w-3 h-3"/>Carica</button></div>{(p.documenti||[]).map(d=><div key={d.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs mb-1"><div className="flex items-center gap-2"><File className="w-3.5 h-3.5 text-purple-500"/><span>{d.nome}</span></div><button onClick={()=>{setPolizze(pr=>pr.map(x=>x.id===p.id?{...x,documenti:x.documenti.filter(dd=>dd.id!==d.id)}:x));addToast("Rimosso");}} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3"/></button></div>)}</div>
              {p.condizioni&&<div className="border-t pt-3 mt-2"><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Condizioni</p><p className="text-xs text-gray-600">{p.condizioni}</p></div>}
            </div>;})}</div>
          </div>
        )}

        {view==="fornitori" && (
          <div>
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Fornitori</h2><button onClick={()=>{openM("newForn");setForm({nome:"",tipo:"",telefono:"",email:"",piva:"",indirizzo:""});}} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"><Plus className="w-4 h-4"/>Nuovo</button></div>
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50 border-b"><tr>{["Nome","Tipo","Tel","Email","P.IVA",""].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr></thead><tbody className="divide-y">{fornitori.map(f=><tr key={f.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-semibold">{f.nome}</td><td className="px-4 py-3"><Badge color="pink">{f.tipo}</Badge></td><td className="px-4 py-3 text-sm text-gray-600">{f.telefono}</td><td className="px-4 py-3 text-sm text-gray-600">{f.email}</td><td className="px-4 py-3 text-sm text-gray-600">{f.piva}</td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>{openM("editForn",f);setForm({...f});}} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4"/></button><button onClick={()=>{setFornitori(p=>p.filter(x=>x.id!==f.id));addToast("Eliminato");}} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button></div></td></tr>)}</tbody></table></div>
          </div>
        )}

        {view==="inbox" && (
          <div>
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Inbox Email</h2>
              <button onClick={()=>{let n=0;const pairs=[];inbox.forEach(em=>{const sid=autoMatch(em);if(sid)pairs.push({eid:em.id,sid});});pairs.forEach(({eid,sid})=>{abbinaEmail(eid,sid);n++;});if(n)addToast(`${n} email abbinate`);else addToast("Nessuna abbinabile","info");}} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"><RefreshCw className="w-4 h-4"/>Auto-Abbina</button>
            </div>
            {!inbox.length ? <div className="bg-white rounded-xl border p-12 text-center"><Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">Inbox vuota</p></div> :
            <div className="space-y-3">{inbox.map(em=>{const sug=autoMatch(em);const sugS=sug?sinistri.find(s=>s.id===sug):null;return <div key={em.id} className="bg-white rounded-xl border p-5"><p className="font-semibold">{em.ogg}</p><p className="text-xs text-gray-500 mb-2">Da: {em.mitt} · {d2s(em.data)}</p><p className="text-sm text-gray-700 mb-3">{em.cont}</p><div className="flex items-center gap-2 flex-wrap">{sugS&&<button onClick={()=>abbinaEmail(em.id,sugS.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-lg font-medium"><CheckCircle2 className="w-4 h-4"/>Abbina a {sugS.numero}</button>}<button onClick={()=>{openM("abbina",em);setForm({sinId:""});}} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-lg font-medium"><ArrowRight className="w-4 h-4"/>Manuale</button><button onClick={()=>setInbox(p=>p.filter(x=>x.id!==em.id))} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Elimina</button></div></div>;})}</div>}
          </div>
        )}

        {view==="impostazioni" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Impostazioni</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border p-5"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600"/>Studio</h3><button onClick={()=>{openM("editStudio");setForm({...studio});}} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Modifica</button></div><div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">{Object.entries({Nome:studio.nome,Indirizzo:studio.indirizzo,Tel:studio.telefono,Email:studio.email,"P.IVA":studio.piva}).map(([l,v])=><div key={l}><p className="text-xs text-gray-500">{l}</p><p className="font-medium">{v}</p></div>)}</div></div>
              <div className="bg-white rounded-xl border p-5"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><UserCog className="w-5 h-5 text-indigo-600"/>Utenti</h3><button onClick={()=>{openM("newUser");setForm({username:"",password:"",nome:"",ruolo:"Operatore"});}} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg"><Plus className="w-4 h-4"/>Nuovo</button></div><div className="space-y-2">{usersList.map(u=><div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-indigo-600">{u.nome[0]}</span></div><div><p className="text-sm font-medium">{u.nome}</p><p className="text-xs text-gray-500">@{u.username} · {u.ruolo}</p></div></div><div className="flex gap-1"><button onClick={()=>{openM("editUser",u);setForm({...u});}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4"/></button>{u.id!==curUser.id&&<button onClick={()=>{setUsersList(p=>p.filter(x=>x.id!==u.id));addToast("Rimosso");}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>}</div></div>)}</div></div>
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-green-600"/>Email</h3><div className="space-y-2">{emails.map(e=><div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full ${e.active?"bg-green-500":"bg-gray-300"}`}/><p className="text-sm font-medium">{e.address}</p></div><button onClick={()=>{openM("cfgEmail",e);setForm({...e});}} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg">Configura</button></div>)}</div></div>
              <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-600"/>Template</h3><div className="space-y-2">{Object.keys(tmpls).map(t=><div key={t} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm font-medium">{t}</span><button onClick={()=>{openM("editTpl",t);setForm({...tmpls[t],_key:t});}} className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-lg">Modifica</button></div>)}</div></div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ GLOBAL MODALS ═══ */}
      <ModalShell open={modal.open&&modal.type==="newSin"} title="Nuovo Sinistro" onSave={()=>{const{condominioId:ci,polizzaId:pi,dataSinistro:ds,tipoDanno:td,descrizione:de,importoStimato:im}=form;if(!ci||!pi||!ds||!td||!de||!im){addToast("Campi obbligatori","warning");return;}const pol=polizze.find(p=>p.id===+pi);const vc=pol?verificaCop({tipoDanno:td,dataSinistro:ds,importoStimato:+im},pol):null;const n={...form,id:nxId(sinistri),numero:`SIN-2025-${String(sinistri.length+1).padStart(3,"0")}`,condominioId:+ci,polizzaId:+pi,importoStimato:+im,fornitoreId:form.fornitoreId?+form.fornitoreId:null,stato:"Aperto",documenti:[],emailInv:[],emailRic:[],liquidazione:null,timeline:[{data:new Date().toISOString().split("T")[0],ev:`Aperto${vc?" — "+vc.sommario:""}`,ut:curUser.nome}]};setSinistri(p=>[...p,n]);closeM();if(vc&&!vc.coperto)addToast("Creato — "+vc.sommario,"warning");else addToast("Sinistro "+n.numero);}} saveLabel="Crea" onClose={closeM}>
        <div className="space-y-4">
          <Sel label="Condominio" value={form.condominioId} onChange={v=>setForm({...form,condominioId:v,polizzaId:""})} options={condomini.map(c=>({value:c.id,label:c.nome}))} required/>
          <Sel label="Polizza" value={form.polizzaId} onChange={v=>setForm({...form,polizzaId:v})} options={polizze.filter(p=>+p.condominioId===+form.condominioId).map(p=>({value:p.id,label:`${p.compagnia} - ${p.numPol}`}))} required/>
          <Inp label="Data" value={form.dataSinistro} onChange={v=>setForm({...form,dataSinistro:v})} type="date" required/>
          <Sel label="Tipo Danno" value={form.tipoDanno} onChange={v=>setForm({...form,tipoDanno:v})} options={TIPI} required/>
          <CovPreview polId={form.polizzaId} tipoDanno={form.tipoDanno} dataSinistro={form.dataSinistro} importo={form.importoStimato}/>
          <Inp label="Descrizione" value={form.descrizione} onChange={v=>setForm({...form,descrizione:v})} rows={4} required/>
          <Inp label="Importo Stimato €" value={form.importoStimato} onChange={v=>setForm({...form,importoStimato:v})} type="number" required/>
          <Sel label="Fornitore" value={form.fornitoreId} onChange={v=>setForm({...form,fornitoreId:v})} options={fornitori.map(f=>({value:f.id,label:`${f.nome} (${f.tipo})`}))}/>
          <Inp label="Note" value={form.note} onChange={v=>setForm({...form,note:v})} rows={2}/>
        </div>
      </ModalShell>
      <ModalShell open={modal.open&&(modal.type==="newCond"||modal.type==="editCond")} title={modal.type==="editCond"?"Modifica Condominio":"Nuovo Condominio"} onSave={()=>{if(!form.nome||!form.indirizzo){addToast("Obbligatori","warning");return;}if(modal.item){setCondomini(p=>p.map(c=>c.id===modal.item.id?{...form,id:modal.item.id}:c));addToast("Aggiornato");}else{setCondomini(p=>[...p,{...form,id:nxId(p),numUnita:+form.numUnita||0}]);addToast("Creato");}closeM();}} onClose={closeM}>
        <div className="space-y-4"><Inp label="Nome" value={form.nome} onChange={v=>setForm({...form,nome:v})} required/><Inp label="Indirizzo" value={form.indirizzo} onChange={v=>setForm({...form,indirizzo:v})} required/><div className="grid grid-cols-2 gap-4"><Inp label="Tel" value={form.telefono} onChange={v=>setForm({...form,telefono:v})}/><Inp label="Email" value={form.email} onChange={v=>setForm({...form,email:v})}/></div><Inp label="IBAN" value={form.iban} onChange={v=>setForm({...form,iban:v})}/><div className="grid grid-cols-2 gap-4"><Inp label="CF" value={form.cf} onChange={v=>setForm({...form,cf:v})}/><Inp label="Unità" value={form.numUnita} onChange={v=>setForm({...form,numUnita:v})} type="number"/></div></div>
      </ModalShell>
      <ModalShell open={modal.open&&(modal.type==="newPol"||modal.type==="editPol")} title={modal.type==="editPol"?"Modifica Polizza":"Nuova Polizza"} wide onSave={()=>{if(!form.condominioId||!form.compagnia||!form.numPol){addToast("Obbligatori","warning");return;}const d={...form,condominioId:+form.condominioId,massimale:+form.massimale||0,franchigia:+form.franchigia||0,premio:+form.premio||0,tipoRischi:form.tipoRischi||[],documenti:form.documenti||[]};if(modal.item){setPolizze(p=>p.map(x=>x.id===modal.item.id?{...d,id:modal.item.id}:x));addToast("Aggiornata");}else{setPolizze(p=>[...p,{...d,id:nxId(p)}]);addToast("Creata");}closeM();}} onClose={closeM}>
        <div className="space-y-4">
          <Sel label="Condominio" value={form.condominioId} onChange={v=>setForm({...form,condominioId:v})} options={condomini.map(c=>({value:c.id,label:c.nome}))} required/>
          <div className="grid grid-cols-2 gap-4"><Inp label="Compagnia" value={form.compagnia} onChange={v=>setForm({...form,compagnia:v})} required/><Inp label="Email Comp." value={form.emailComp} onChange={v=>setForm({...form,emailComp:v})}/></div>
          <Inp label="N. Polizza" value={form.numPol} onChange={v=>setForm({...form,numPol:v})} required/>
          <div className="grid grid-cols-2 gap-4"><Inp label="Inizio" value={form.dataInizio} onChange={v=>setForm({...form,dataInizio:v})} type="date"/><Inp label="Scadenza" value={form.dataScad} onChange={v=>setForm({...form,dataScad:v})} type="date"/></div>
          <div className="grid grid-cols-3 gap-4"><Inp label="Massimale €" value={form.massimale} onChange={v=>setForm({...form,massimale:v})} type="number"/><Inp label="Franchigia €" value={form.franchigia} onChange={v=>setForm({...form,franchigia:v})} type="number"/><Inp label="Premio €" value={form.premio} onChange={v=>setForm({...form,premio:v})} type="number"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Rischi Coperti</label><div className="flex flex-wrap gap-2">{TIPI.map(r=><button key={r} type="button" onClick={()=>{const a=form.tipoRischi||[];setForm({...form,tipoRischi:a.includes(r)?a.filter(x=>x!==r):[...a,r]});}} className={`px-3 py-1.5 text-xs rounded-full border ${(form.tipoRischi||[]).includes(r)?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-300"}`}>{r}</button>)}</div></div>
          <Inp label="Condizioni" value={form.condizioni} onChange={v=>setForm({...form,condizioni:v})} rows={4}/>
        </div>
      </ModalShell>
      <ModalShell open={modal.open&&modal.type==="upPolDoc"} title="Documento Polizza" onSave={()=>{if(!form.nome){addToast("Nome","warning");return;}const p=polizze.find(x=>x.id===form.polId);if(!p)return;const doc={id:((p.documenti||[]).length)+1,nome:form.nome,tipo:form.tipoDoc,size:"256 KB"};setPolizze(pr=>pr.map(x=>x.id===p.id?{...x,documenti:[...(x.documenti||[]),doc]}:x));closeM();addToast("Caricato");}} saveLabel="Carica" onClose={closeM}>
        <div className="space-y-4"><Sel label="Tipo" value={form.tipoDoc} onChange={v=>setForm({...form,tipoDoc:v})} options={["contratto","appendice","quietanza","condizioni","altro"]}/><Inp label="Nome File" value={form.nome} onChange={v=>setForm({...form,nome:v})} required/></div>
      </ModalShell>
      <ModalShell open={modal.open&&(modal.type==="newForn"||modal.type==="editForn")} title={modal.type==="editForn"?"Modifica":"Nuovo Fornitore"} onSave={()=>{if(!form.nome||!form.tipo){addToast("Obbligatori","warning");return;}if(modal.item){setFornitori(p=>p.map(f=>f.id===modal.item.id?{...form,id:modal.item.id}:f));addToast("Aggiornato");}else{setFornitori(p=>[...p,{...form,id:nxId(p)}]);addToast("Creato");}closeM();}} onClose={closeM}>
        <div className="space-y-4"><Inp label="Nome" value={form.nome} onChange={v=>setForm({...form,nome:v})} required/><Sel label="Tipo" value={form.tipo} onChange={v=>setForm({...form,tipo:v})} options={TFORN} required/><div className="grid grid-cols-2 gap-4"><Inp label="Tel" value={form.telefono} onChange={v=>setForm({...form,telefono:v})}/><Inp label="Email" value={form.email} onChange={v=>setForm({...form,email:v})}/></div><Inp label="P.IVA" value={form.piva} onChange={v=>setForm({...form,piva:v})}/><Inp label="Indirizzo" value={form.indirizzo} onChange={v=>setForm({...form,indirizzo:v})}/></div>
      </ModalShell>
      <ModalShell open={modal.open&&modal.type==="editStudio"} title="Dati Studio" onSave={()=>{setStudio(form);closeM();addToast("Salvato");}} onClose={closeM}>
        <div className="space-y-4"><Inp label="Nome" value={form.nome} onChange={v=>setForm({...form,nome:v})}/><Inp label="Indirizzo" value={form.indirizzo} onChange={v=>setForm({...form,indirizzo:v})}/><div className="grid grid-cols-2 gap-4"><Inp label="Tel" value={form.telefono} onChange={v=>setForm({...form,telefono:v})}/><Inp label="Email" value={form.email} onChange={v=>setForm({...form,email:v})}/></div><Inp label="P.IVA" value={form.piva} onChange={v=>setForm({...form,piva:v})}/></div>
      </ModalShell>
      <ModalShell open={modal.open&&(modal.type==="newUser"||modal.type==="editUser")} title={modal.type==="editUser"?"Modifica Utente":"Nuovo Utente"} onSave={()=>{if(!form.username||!form.password||!form.nome){addToast("Compila tutto","warning");return;}if(modal.item){setUsersList(p=>p.map(u=>u.id===modal.item.id?{...form,id:modal.item.id}:u));if(curUser.id===modal.item.id)setCurUser({...form,id:modal.item.id});addToast("Aggiornato");}else{if(usersList.find(u=>u.username===form.username)){addToast("Username in uso","error");return;}setUsersList(p=>[...p,{...form,id:nxId(p)}]);addToast("Creato");}closeM();}} onClose={closeM}>
        <div className="space-y-4"><Inp label="Nome" value={form.nome} onChange={v=>setForm({...form,nome:v})} required/><Inp label="Username" value={form.username} onChange={v=>setForm({...form,username:v})} required/><Inp label="Password" value={form.password} onChange={v=>setForm({...form,password:v})} type="password" required/><Sel label="Ruolo" value={form.ruolo} onChange={v=>setForm({...form,ruolo:v})} options={["Admin","Operatore"]} required/></div>
      </ModalShell>
      <ModalShell open={modal.open&&modal.type==="cfgEmail"} title="Configura Email" onSave={()=>{setEmails(p=>p.map(e=>e.id===modal.item.id?{...form,id:modal.item.id}:e));closeM();addToast("Salvato");}} onClose={closeM}>
        <div className="space-y-4"><Inp label="Email" value={form.address} onChange={v=>setForm({...form,address:v})}/><div className="grid grid-cols-2 gap-4"><Inp label="SMTP" value={form.smtp} onChange={v=>setForm({...form,smtp:v})}/><Inp label="Porta" value={form.port} onChange={v=>setForm({...form,port:v})}/></div><Inp label="Username" value={form.username} onChange={v=>setForm({...form,username:v})}/><Inp label="Password" value={form.password} onChange={v=>setForm({...form,password:v})} type="password"/><div className="flex items-center gap-2"><button type="button" onClick={()=>setForm({...form,active:!form.active})} className={`w-10 h-6 rounded-full ${form.active?"bg-green-500":"bg-gray-300"}`}><div className={`w-4 h-4 bg-white rounded-full shadow mx-1 ${form.active?"translate-x-4":""}`}/></button><span className="text-sm">Attivo</span></div></div>
      </ModalShell>
      <ModalShell open={modal.open&&modal.type==="editTpl"} title={`Template: ${form._key||""}`} wide onSave={()=>{const k=form._key;setTmpls(p=>({...p,[k]:{oggetto:form.oggetto,corpo:form.corpo}}));closeM();addToast("Salvato");}} onClose={closeM}>
        <div className="space-y-4"><Inp label="Oggetto" value={form.oggetto} onChange={v=>setForm({...form,oggetto:v})}/><Inp label="Corpo" value={form.corpo} onChange={v=>setForm({...form,corpo:v})} rows={12}/><div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700"><p className="font-medium mb-1">Variabili:</p><p>{"{compagnia} {data_sinistro} {nome_condominio} {indirizzo_condominio} {numero_polizza} {descrizione} {importo_stimato} {numero_sinistro} {nome_studio} {tipo_danno}"}</p></div></div>
      </ModalShell>
      <ModalShell open={modal.open&&modal.type==="abbina"} title="Abbina Email" onSave={()=>{if(!form.sinId){addToast("Seleziona","warning");return;}abbinaEmail(modal.item?.id,form.sinId);closeM();}} onClose={closeM}>
        <div className="space-y-4"><Sel label="Sinistro" value={form.sinId} onChange={v=>setForm({...form,sinId:v})} options={sinistri.map(x=>({value:x.id,label:`${x.numero} - ${condomini.find(c=>c.id===x.condominioId)?.nome||""}`}))} required/></div>
      </ModalShell>
    </div>
  );
}

export default App;