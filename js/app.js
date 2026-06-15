// =====================================================
// AZRA-2026 v6.0 — TAM UYGULAMA
// =====================================================
import { db } from './firebase-config.js';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, setDoc, getDoc, updateDoc, Timestamp, deleteDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const USERS = {
  ferhat:  { sifre:'ferhat2026',  ad:'Ferhat Özdal',    rol:'admin' },
  mehmet:  { sifre:'mehmet2026',  ad:'Mehmet',           rol:'izleyici' },
  kalgay:  { sifre:'kalgay2026',  ad:'Kalgay Büyükkaya', rol:'izleyici' },
  mustafa: { sifre:'mustafa2026', ad:'Mustafa',          rol:'izleyici' },
  cetin:   { sifre:'cetin2026',   ad:'Çetin',            rol:'izleyici' },
  aylin:   { sifre:'aylin2026',   ad:'Aylin',            rol:'izleyici' }
};

const AYLAR = ['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
const AIDAT = 1400, DIGER_BORC = 1600, YILLIK_AIDAT = 8400;
const BUGUN_AY = AYLAR[new Date().getMonth()];

const GIDER_KATEGORILER = [
  { grup:'PERSONEL GİDERLERİ', renk:'#c0392b', kalemler:[
    'Maaş / Avans / İkramiye vs.',
    'Diğer Muhtelif İşçilik Giderleri',
    'Ek Hizmetler (Havuz Bakım vs.)'
  ]},
  { grup:'ORTAK ALAN GİDERLERİ', renk:'#e67e22', kalemler:[
    'Elektrik (Enerjisa)',
    'Su (Meski)',
    'İnternet',
    'Diğer Ortak Alan Giderleri (Havuz İlaçlama vs.)'
  ]},
  { grup:'YÖNETİM GİDERLERİ', renk:'#8e44ad', kalemler:[
    'Muhasebe Giderleri',
    'Avukatlık Giderleri',
    'Aylık Vergiler (SGK, Muhtasar, Damga Vergisi vs.)',
    'Diğer Yönetim Giderleri (Noter, Banka Masrafı, Kırtasiye vs.)'
  ]},
  { grup:'TEKNİK HİZMET GİDERLERİ', renk:'#2980b9', kalemler:[
    'Jeneratör Tamir, Bakım Giderleri',
    'Asansör Tamir, Bakım Giderleri',
    'Diğer Çeşitli Hizmet Giderleri'
  ]}
];

const PUANTAJ_KODLAR = {
  'X':{label:'Çalıştı',renk:'#e4f5ec',yazi:'#0d5c3a'},
  'P':{label:'Pazar',renk:'#e3f0ff',yazi:'#1565c0'},
  'RT':{label:'Res.Tatil',renk:'#f3e8ff',yazi:'#7b1fa2'},
  'Yİ':{label:'Yıl.İzin',renk:'#fff8e1',yazi:'#b8860b'},
  'İZ':{label:'İzin',renk:'#fde8e8',yazi:'#c0392b'},
  'RP':{label:'Rapor',renk:'#fde8e8',yazi:'#c0392b'},
  '-':{label:'Tatil',renk:'#f0f0f0',yazi:'#999'}
};

const DAIRELER = [
  {no:1,kat:1,malik:'CEMRE BAKER',maliktl:'05453959512',sakin:'CEMRE BAKER',sakintl:'05453959512',durum:'EV SAHİBİ'},
  {no:2,kat:1,malik:'KALGAY BÜYÜKKAYA',maliktl:'05536085956',sakin:'KALGAY BÜYÜKKAYA',sakintl:'05536085956',durum:'EV SAHİBİ'},
  {no:3,kat:1,malik:'HAFİYE BULUT',maliktl:'43676420 9502',sakin:'HAFİYE BULUT',sakintl:'43676420 9502',durum:'EV SAHİBİ'},
  {no:4,kat:1,malik:'CİRAN AY',maliktl:'05422344733',sakin:'CİRAN AY',sakintl:'05422344733',durum:'EV SAHİBİ'},
  {no:5,kat:2,malik:'İBRAHİM ÜNAL',maliktl:'',sakin:'İBRAHİM ÜNAL',sakintl:'',durum:'EV SAHİBİ'},
  {no:6,kat:2,malik:'ALEKSANDRA RİV',maliktl:'',sakin:'ALEKSANDRA RİV',sakintl:'',durum:'EV SAHİBİ'},
  {no:7,kat:2,malik:'ÖMÜR DENİZ MAMUK',maliktl:'',sakin:'ÖMÜR DENİZ MAMUK',sakintl:'',durum:'EV SAHİBİ'},
  {no:8,kat:2,malik:'ZHANETTA KADYSHEVA',maliktl:'79174471164',sakin:'ZHANETTA KADYSHEVA',sakintl:'79174471164',durum:'EV SAHİBİ'},
  {no:9,kat:3,malik:'DENİZ AYLİN ERGÜN',maliktl:'05367475794',sakin:'DENİZ AYLİN ERGÜN',sakintl:'05367475794',durum:'EV SAHİBİ'},
  {no:10,kat:3,malik:'MUSTAFA ARGÜN',maliktl:'05358961389',sakin:'MUSTAFA ARGÜN',sakintl:'05358961389',durum:'EV SAHİBİ'},
  {no:11,kat:3,malik:'MEHMET ANIL PARLAK',maliktl:'05366770393',sakin:'MEHMET ANIL PARLAK',sakintl:'05366770393',durum:'EV SAHİBİ'},
  {no:12,kat:3,malik:'DEVRAN ODUN',maliktl:'',sakin:'DEVRAN ODUN',sakintl:'',durum:'EV SAHİBİ'},
  {no:13,kat:4,malik:'BARIŞ İLDENİZ',maliktl:'',sakin:'BARIŞ İLDENİZ',sakintl:'',durum:'EV SAHİBİ'},
  {no:14,kat:4,malik:'SELMA ARICI',maliktl:'05458958585',sakin:'SELMA ARICI',sakintl:'05458958585',durum:'EV SAHİBİ'},
  {no:15,kat:4,malik:'GÜLTEKİN ÇETECİ',maliktl:'',sakin:'GÜLTEKİN ÇETECİ',sakintl:'',durum:'EV SAHİBİ'},
  {no:16,kat:4,malik:'',maliktl:'',sakin:'SAFFET ATLI',sakintl:'05325450572',durum:'KİRACI'},
  {no:17,kat:5,malik:'',maliktl:'',sakin:'MÜRVET GÖKBULUT',sakintl:'05304996595',durum:'KİRACI'},
  {no:18,kat:5,malik:'SERDAR TÜRKMENDAĞ',maliktl:'05304802753',sakin:'SERDAR TÜRKMENDAĞ',sakintl:'05304802753',durum:'EV SAHİBİ'},
  {no:19,kat:5,malik:'NECMETTİN DURAN',maliktl:'',sakin:'NECMETTİN DURAN',sakintl:'',durum:'EV SAHİBİ'},
  {no:20,kat:5,malik:'MUZAFFER ÇAPAN',maliktl:'',sakin:'MUZAFFER ÇAPAN',sakintl:'',durum:'EV SAHİBİ'},
  {no:21,kat:6,malik:'GULNAR SHALABEKOVA',maliktl:'05527925603',sakin:'GULNAR SHALABEKOVA',sakintl:'05527925603',durum:'EV SAHİBİ'},
  {no:22,kat:6,malik:'İLAYDANUR HACIOĞLU',maliktl:'05421397654',sakin:'İLAYDANUR HACIOĞLU',sakintl:'05421397654',durum:'EV SAHİBİ'},
  {no:23,kat:6,malik:'AZİZ ÜNEK',maliktl:'',sakin:'AZİZ ÜNEK',sakintl:'',durum:'EV SAHİBİ'},
  {no:24,kat:6,malik:'NADİR ÇETİNKAYA',maliktl:'05550855433',sakin:'NADİR ÇETİNKAYA',sakintl:'05550855433',durum:'EV SAHİBİ'},
  {no:25,kat:7,malik:'KADİR ÖZDEN',maliktl:'',sakin:'KADİR ÖZDEN',sakintl:'',durum:'EV SAHİBİ'},
  {no:26,kat:7,malik:'ARZU ANGIN',maliktl:'05521823048',sakin:'ARZU ANGIN',sakintl:'05521823048',durum:'EV SAHİBİ'},
  {no:27,kat:7,malik:'AZİZ ÜNEK',maliktl:'',sakin:'AZİZ ÜNEK',sakintl:'',durum:'EV SAHİBİ'},
  {no:28,kat:7,malik:'ALEKSEI GNSHENKO',maliktl:'',sakin:'ALEKSEI GNSHENKO',sakintl:'',durum:'EV SAHİBİ'},
  {no:29,kat:8,malik:'ALFİİA LAPPAROVA',maliktl:'',sakin:'ALFİİA LAPPAROVA',sakintl:'',durum:'EV SAHİBİ'},
  {no:30,kat:8,malik:'HABİBE GÜNEŞ',maliktl:'05320601701',sakin:'HABİBE GÜNEŞ',sakintl:'05320601701',durum:'EV SAHİBİ'},
  {no:31,kat:8,malik:'MİKHAİL POZDEEV',maliktl:'79693478156',sakin:'MİKHAİL POZDEEV',sakintl:'79693478156',durum:'EV SAHİBİ'},
  {no:32,kat:8,malik:'HUSEYN ASGAROV',maliktl:'05357362470',sakin:'HUSEYN ASGAROV',sakintl:'05357362470',durum:'EV SAHİBİ'},
  {no:33,kat:9,malik:'ARTEM DANİLENKO',maliktl:'',sakin:'ARTEM DANİLENKO',sakintl:'',durum:'EV SAHİBİ'},
  {no:34,kat:9,malik:'MEHMET ATAŞBAŞ',maliktl:'05070413521',sakin:'MEHMET ATAŞBAŞ',sakintl:'05070413521',durum:'EV SAHİBİ'},
  {no:35,kat:9,malik:'ALİ KEMAL AŞKIN',maliktl:'05326374796',sakin:'ALİ KEMAL AŞKIN',sakintl:'05326374796',durum:'EV SAHİBİ'},
  {no:36,kat:9,malik:'ZAURE SEİTOVA',maliktl:'77011797335',sakin:'ZAURE SEİTOVA',sakintl:'77011797335',durum:'EV SAHİBİ'},
  {no:37,kat:10,malik:'ÖZGÜR BULUT',maliktl:'05532100862',sakin:'ÖZGÜR BULUT',sakintl:'05532100862',durum:'EV SAHİBİ'},
  {no:38,kat:10,malik:'ÇETİN DEMİRHAN',maliktl:'05423030070',sakin:'ÇETİN DEMİRHAN',sakintl:'05423030070',durum:'EV SAHİBİ'},
  {no:39,kat:10,malik:'MEHMET KADAYİFÇİ',maliktl:'05433827997',sakin:'MEHMET KADAYİFÇİ',sakintl:'05433827997',durum:'EV SAHİBİ'},
  {no:40,kat:10,malik:'İSMAİL ŞAHİN',maliktl:'05055245695',sakin:'İSMAİL ŞAHİN',sakintl:'05055245695',durum:'EV SAHİBİ'},
  {no:41,kat:11,malik:'HAKAN NESLİ KÖSELİOĞLU',maliktl:'',sakin:'HAKAN NESLİ KÖSELİOĞLU',sakintl:'',durum:'EV SAHİBİ'},
  {no:42,kat:11,malik:'AHMET YILDIZ',maliktl:'05443770163',sakin:'AHMET YILDIZ',sakintl:'05443770163',durum:'EV SAHİBİ'},
  {no:43,kat:11,malik:'MEHMET BALDİŞ',maliktl:'',sakin:'MEHMET BALDİŞ',sakintl:'',durum:'EV SAHİBİ'},
  {no:44,kat:11,malik:'YUSUF GEÇGEL',maliktl:'05317912763',sakin:'YUSUF GEÇGEL',sakintl:'05317912763',durum:'EV SAHİBİ'},
  {no:45,kat:12,malik:'MEHMET BOZALAN',maliktl:'05055277076',sakin:'MEHMET BOZALAN',sakintl:'05055277076',durum:'EV SAHİBİ'},
  {no:46,kat:12,malik:'AYŞE ÇAM',maliktl:'',sakin:'AYŞE ÇAM',sakintl:'',durum:'EV SAHİBİ'},
  {no:47,kat:12,malik:'VİTALY TATARİNOV',maliktl:'',sakin:'VİTALY TATARİNOV',sakintl:'',durum:'EV SAHİBİ'},
  {no:48,kat:12,malik:'YEŞİM TAŞINMA',maliktl:'05355165569',sakin:'YEŞİM TAŞINMA',sakintl:'05355165569',durum:'EV SAHİBİ'},
  {no:49,kat:13,malik:'LİUDMİLA BAHDANAVA',maliktl:'05510558211',sakin:'LİUDMİLA BAHDANAVA',sakintl:'05510558211',durum:'EV SAHİBİ'},
  {no:50,kat:13,malik:'NATALİE TİMOFEEVA',maliktl:'79032773352',sakin:'NATALİE TİMOFEEVA',sakintl:'79032773352',durum:'EV SAHİBİ'},
  {no:51,kat:13,malik:'AZİZ ÖZDEMİR',maliktl:'05056805342',sakin:'AZİZ ÖZDEMİR',sakintl:'05056805342',durum:'EV SAHİBİ'},
  {no:52,kat:13,malik:'EMİNE METİN',maliktl:'05378953409',sakin:'EMİNE METİN',sakintl:'05378953409',durum:'EV SAHİBİ'},
  {no:53,kat:14,malik:'FERHAT ÖZDAL',maliktl:'05522491309',sakin:'FERHAT ÖZDAL',sakintl:'05522491309',durum:'EV SAHİBİ'},
  {no:54,kat:14,malik:'',maliktl:'',sakin:'BURAK DOĞAN',sakintl:'05070218987',durum:'KİRACI'},
  {no:55,kat:14,malik:'ETEM YAVUZ',maliktl:'05357953383',sakin:'ETEM YAVUZ',sakintl:'05357953383',durum:'EV SAHİBİ'},
  {no:56,kat:14,malik:'MUHAMMET MEHMET GÖRMEZ',maliktl:'05333897117',sakin:'MUHAMMET MEHMET GÖRMEZ',sakintl:'05333897117',durum:'EV SAHİBİ'},
  {no:57,kat:15,malik:'ALEKSEİ UCHUVATOV',maliktl:'79266016967',sakin:'ALEKSEİ UCHUVATOV',sakintl:'79266016967',durum:'EV SAHİBİ'},
  {no:58,kat:15,malik:'HÜLYA YÜCELER GÜVEN',maliktl:'05327713444',sakin:'HÜLYA YÜCELER GÜVEN',sakintl:'05327713444',durum:'EV SAHİBİ'}
];

let daireOverrides={}, hizmetSaglayicilar=[], ekBorclar=[];
let state={
  user:null,gelirler:[],giderler:[],puantaj:{},
  kasaOnceki:[
    {ay:'OCAK',acilis:0,gelir:81200,gider:81200,devreden:0},
    {ay:'ŞUBAT',acilis:0,gelir:79800,gider:79800,devreden:0},
    {ay:'MART',acilis:0,gelir:79800,gider:79800,devreden:0},
    {ay:'NİSAN',acilis:0,gelir:79800,gider:78400,devreden:1400},
    {ay:'MAYIS',acilis:1400,gelir:68600,gider:58410.21,devreden:11589.79},
  ],
  unsubGelir:null,unsubGider:null,unsubPuantaj:null,
  puantajAy:BUGUN_AY,puantajYil:2026,
  gelirFiltre:'hepsi',giderFiltre:'hepsi',
};
let personelOzluk={adsoyad:'',tc:'',dogum:'',tel:'',adres:'',eposta:'',unvan:'Kapı Görevlisi',giris:'',saat:'',maas:'',maasbrut:'',banka:'',iban:'',sgk:'',sigorta:'4/a (SSK)',saglik:'',acil:'',aciltel:'',notlar:''};

// =====================================================
// FORMAT
// =====================================================
const fmt=n=>{const abs=Math.abs(n);return(n<0?'-':'')+abs.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';};
const today=()=>new Date().toISOString().slice(0,10);
const fmtTarih=v=>v?v.split('-').reverse().join('.'):'—';
const fmtPara=v=>v?parseFloat(v).toLocaleString('tr-TR',{minimumFractionDigits:2})+' ₺':'—';

// =====================================================
// HESAPLAMALAR
// =====================================================
const getDaire=no=>{const base=DAIRELER.find(x=>x.no===no);return{...base,...(daireOverrides[no]||{})};};
const getDaireTahsilat=no=>state.gelirler.filter(g=>g.daireNo===no).reduce((a,b)=>a+b.tutar,0);
const getDaireEkBorc=no=>{
  return ekBorclar.filter(b=>b.daireNo===no||b.tumDaireler).reduce((a,b)=>a+b.tutar,0);
};
const getDaireBakiyeBorc=no=>(YILLIK_AIDAT+DIGER_BORC+getDaireEkBorc(no))-getDaireTahsilat(no);
const getAyTahsilat=ay=>state.gelirler.filter(g=>g.donem===ay).reduce((a,b)=>a+b.tutar,0);
const getAyGider=ay=>state.giderler.filter(g=>g.donem===ay).reduce((a,b)=>a+b.tutar,0);
const getKasaBakiye=()=>{
  // Mayıs sonu devreden + Haziran gelir - Haziran gider
  const mayisDevreden=11589.79;
  return mayisDevreden+getAyTahsilat('HAZİRAN')-getAyGider('HAZİRAN');
};
const getTotalBorc=()=>{
  return DAIRELER.reduce((acc,d)=>{
    const b=getDaireBakiyeBorc(d.no);
    return acc+(b>0?b:0);
  },0);
};
const getDaireName=no=>{const d=getDaire(no);return d?(d.sakin||d.malik||'Daire '+no):'Daire '+no;};
const getPuantajStat=ay=>{const gun=state.puantaj[ay]||{};const v=Object.values(gun);return{calisma:v.filter(x=>x==='X').length,pazar:v.filter(x=>x==='P').length,rt:v.filter(x=>x==='RT').length,yi:v.filter(x=>x==='Yİ').length,iz:v.filter(x=>x==='İZ').length,rp:v.filter(x=>x==='RP').length};};
const getAyOdemeOrani=()=>{const odendi=DAIRELER.filter(d=>state.gelirler.some(g=>g.daireNo===d.no&&g.donem===BUGUN_AY&&g.aciklama==='Aidat Tahsilatı')).length;return{odendi,bekleyen:58-odendi,pct:Math.round((odendi/58)*100)};};

// Admin kontrolü
const isAdmin=()=>state.user?.rol==='admin';

// =====================================================
// GİRİŞ / ÇIKIŞ
// =====================================================
window.togglePass=()=>{const i=document.getElementById('inp-pass');const ic=document.getElementById('eye-icon');i.type=i.type==='password'?'text':'password';ic.className=i.type==='password'?'ti ti-eye':'ti ti-eye-off';};

window.doLogin=()=>{
  const u=document.getElementById('inp-user').value.trim().toLowerCase();
  const p=document.getElementById('inp-pass').value;
  const e=document.getElementById('login-error');
  if(USERS[u]&&USERS[u].sifre===p){
    state.user={...USERS[u],username:u};
    e.style.display='none';
    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-main').classList.add('active');
    document.getElementById('topbar-badge').textContent=isAdmin()?'Yönetici':'İzleyici';
    document.getElementById('fab').style.display=isAdmin()?'flex':'none';
    initDaireSelect();setDefaultDates();startFirebaseListeners();loadOzluk();
  }else{e.style.display='block';}
};
window.doLogout=()=>{
  [state.unsubGelir,state.unsubGider,state.unsubPuantaj].forEach(u=>u&&u());
  state.user=null;state.gelirler=[];state.giderler=[];state.puantaj={};
  document.getElementById('screen-main').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('inp-user').value='';document.getElementById('inp-pass').value='';
};
document.getElementById('inp-pass').addEventListener('keydown',e=>{if(e.key==='Enter')window.doLogin();});

// =====================================================
// FİREBASE
// =====================================================
function startFirebaseListeners(){
  try{
    // Gelirler - gerçek zamanlı dinle
    state.unsubGelir=onSnapshot(
      query(collection(db,'gelirler'),orderBy('createdAt','asc')),
      s=>{
        state.gelirler=s.docs.map(d=>({id:d.id,...d.data()}));
        // Cache'e kaydet
        try{localStorage.setItem('azra_gelirler',JSON.stringify(state.gelirler));}catch(e){}
        renderAll();
      },
      err=>{
        console.warn('Firebase gelir hatası:',err);
        // Cache'den yükle
        try{const c=localStorage.getItem('azra_gelirler');if(c)state.gelirler=JSON.parse(c);}catch(e){}
        renderAll();
      }
    );
    // Giderler - gerçek zamanlı dinle
    state.unsubGider=onSnapshot(
      query(collection(db,'giderler'),orderBy('createdAt','asc')),
      s=>{
        state.giderler=s.docs.map(d=>({id:d.id,...d.data()}));
        try{localStorage.setItem('azra_giderler',JSON.stringify(state.giderler));}catch(e){}
        renderAll();
      },
      err=>{
        console.warn('Firebase gider hatası:',err);
        try{const c=localStorage.getItem('azra_giderler');if(c)state.giderler=JSON.parse(c);}catch(e){}
        renderAll();
      }
    );
    state.unsubPuantaj=onSnapshot(doc(db,'puantaj','2026'),s=>{state.puantaj=s.exists()?s.data():{};renderPuantaj();},()=>{renderPuantaj();});
    onSnapshot(doc(db,'daireler','overrides'),s=>{if(s.exists())daireOverrides=s.data();renderDaireler();},()=>{});
    onSnapshot(doc(db,'hizmet','saglayicilar'),s=>{if(s.exists())hizmetSaglayicilar=s.data().liste||[];renderHizmetSaglayicilar();},()=>{});
    onSnapshot(doc(db,'ekborclar','liste'),s=>{if(s.exists())ekBorclar=s.data().liste||[];renderAll();},()=>{});
  }catch(e){
    console.warn('Firebase başlatma hatası:',e);
    // Cache'den yükle
    try{
      const cg=localStorage.getItem('azra_gelirler');if(cg)state.gelirler=JSON.parse(cg);
      const cd=localStorage.getItem('azra_giderler');if(cd)state.giderler=JSON.parse(cd);
    }catch(ce){}
    renderAll();
  }
}

// =====================================================
// GELİR KAYDET (tek)
// =====================================================
window.gTurChange=()=>{document.getElementById('g-tutar-group').style.display=document.getElementById('g-tur').value==='ozel'?'block':'none';};

window.kaydetGelir=async()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici veri girebilir.');
  const tarih=document.getElementById('g-tarih').value;
  const donem=document.getElementById('g-donem').value;
  const daireNo=parseInt(document.getElementById('g-daire').value);
  const tur=document.getElementById('g-tur').value;
  const not=document.getElementById('g-not').value;
  if(!tarih||!daireNo)return showToast('Tarih ve daire seçin.');
  let tutar,aciklama;
  if(tur==='aidat'){tutar=AIDAT;aciklama='Aidat Tahsilatı';}
  else if(tur==='diger'){tutar=DIGER_BORC;aciklama='Diğer Tahsilatlar';}
  else{tutar=parseFloat(document.getElementById('g-tutar').value);aciklama=not||'Özel Tahsilat';if(!tutar||isNaN(tutar))return showToast('Tutar girin.');}
  const gelir={tarih:tarih.split('-').reverse().join('.'),donem,daireNo,muhatap:getDaireName(daireNo),tutar,aciklama,not:not||'',createdAt:Timestamp.now()};
  try{await addDoc(collection(db,'gelirler'),gelir);}
  catch(e){state.gelirler.push({id:'L'+Date.now(),...gelir});renderAll();}
  closeModal('modal-gelir');resetGelirForm();showToast('✓ Gelir kaydedildi');
};

// =====================================================
// TOPLU GELİR KAYDET
// =====================================================
window.topluGelirAyDegistir=()=>{
  // Seçili aylara göre daire listesini yenile
  renderTopluDaireList();
};

window.topluHepsiniSec=()=>{
  document.querySelectorAll('.toplu-daire-cb').forEach(cb=>{cb.checked=true;});
  updateTopluSecimSayisi();
};
window.topluHepsiniKaldir=()=>{
  document.querySelectorAll('.toplu-daire-cb').forEach(cb=>{cb.checked=false;});
  updateTopluSecimSayisi();
};
window.updateTopluSecimSayisi=()=>{
  const secili=document.querySelectorAll('.toplu-daire-cb:checked').length;
  const el=document.getElementById('toplu-secim-sayisi');
  if(el){
    el.textContent=secili+' daire seçili';
    el.style.color=secili>0?'#0d5c3a':'#888';
  }
};

function renderTopluDaireList(){
  const el=document.getElementById('toplu-daire-list');
  if(!el)return;
  let html='';
  DAIRELER.forEach(d=>{
    const dd=getDaire(d.no);
    const name=dd.sakin||dd.malik||'—';
    html+='<label style="display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid #f0f4f1;cursor:pointer;user-select:none">'
      +'<input type="checkbox" class="toplu-daire-cb" value="'+d.no+'" onchange="updateTopluSecimSayisi()" style="width:22px;height:22px;accent-color:#0d5c3a;cursor:pointer;flex-shrink:0">'
      +'<span style="width:34px;height:34px;border-radius:8px;background:#e4f5ec;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#0d5c3a;flex-shrink:0">'+d.no+'</span>'
      +'<span style="font-size:13px;color:#1a1a1a;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+name+'</span>'
      +'</label>';
  });
  el.innerHTML=html;
  updateTopluSecimSayisi();
}

window.kaydetTopluGelir=async()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici veri girebilir.');
  const tarih=document.getElementById('tg-tarih').value;
  const tur=document.getElementById('tg-tur').value;
  const seciliAylar=[...document.querySelectorAll('.toplu-ay-cb:checked')].map(cb=>cb.value);
  const seciliDaireler=[...document.querySelectorAll('.toplu-daire-cb:checked')].map(cb=>parseInt(cb.value));
  if(!tarih)return showToast('Tarih seçin.');
  if(!seciliAylar.length)return showToast('En az bir ay seçin.');
  if(!seciliDaireler.length)return showToast('En az bir daire seçin.');
  let tutar,aciklama;
  if(tur==='aidat'){tutar=AIDAT;aciklama='Aidat Tahsilatı';}
  else if(tur==='diger'){tutar=DIGER_BORC;aciklama='Diğer Tahsilatlar';}
  else{tutar=parseFloat(document.getElementById('tg-tutar').value)||AIDAT;aciklama='Aidat Tahsilatı';}
  showToast('Kaydediliyor...');
  let sayac=0;
  const kayitlar=[];
  for(const daireNo of seciliDaireler){
    for(const donem of seciliAylar){
      kayitlar.push({tarih:tarih.split('-').reverse().join('.'),donem,daireNo,muhatap:getDaireName(daireNo),tutar,aciklama,not:'Toplu giriş',createdAt:Timestamp.now()});
    }
  }
  // Tek tek kaydet (daha güvenilir)
  for(const gelir of kayitlar){
    try{
      await addDoc(collection(db,'gelirler'),gelir);
      sayac++;
    }catch(e){
      // Firebase yoksa local'e ekle
      state.gelirler.push({id:'L'+Date.now()+sayac,...gelir});
      sayac++;
    }
  }
  renderAll();
  closeModal('modal-toplu-gelir');
  // Ay checkbox'larını temizle
  document.querySelectorAll('.toplu-ay-cb').forEach(cb=>cb.checked=false);
  document.querySelectorAll('.toplu-daire-cb').forEach(cb=>cb.checked=false);
  updateTopluSecimSayisi();
  showToast('✓ '+sayac+' kayıt eklendi ('+seciliDaireler.length+' daire × '+seciliAylar.length+' ay)');
};

// =====================================================
// GİDER KAYDET
// =====================================================
window.kaydetGider=async()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici veri girebilir.');
  const tarih=document.getElementById('gid-tarih').value;
  const donem=document.getElementById('gid-donem').value;
  const muhatap=document.getElementById('gid-muhatap').value.trim();
  const tutar=parseFloat(document.getElementById('gid-tutar').value);
  const kategori=document.getElementById('gid-kategori').value;
  const aciklama=document.getElementById('gid-aciklama').value.trim();
  if(!tarih||!muhatap||!tutar||isNaN(tutar))return showToast('Tüm alanları doldurun.');
  const gider={tarih:tarih.split('-').reverse().join('.'),donem,muhatap,tutar,kategori,aciklama:aciklama||kategori,createdAt:Timestamp.now()};
  try{await addDoc(collection(db,'giderler'),gider);}
  catch(e){state.giderler.push({id:'L'+Date.now(),...gider});renderAll();}
  closeModal('modal-gider');resetGiderForm();showToast('✓ Gider kaydedildi');
};

function resetGelirForm(){document.getElementById('g-daire').value='';document.getElementById('g-tur').value='aidat';document.getElementById('g-tutar').value='';document.getElementById('g-not').value='';document.getElementById('g-tutar-group').style.display='none';document.getElementById('g-tarih').value=today();document.getElementById('modal-gelir-title').textContent='Gelir Ekle';document.getElementById('gelir-kaydet-btn').onclick=kaydetGelir;}
function resetGiderForm(){document.getElementById('gid-muhatap').value='';document.getElementById('gid-tutar').value='';document.getElementById('gid-aciklama').value='';document.getElementById('gid-tarih').value=today();document.getElementById('modal-gider-title').textContent='Gider Ekle';document.getElementById('gider-kaydet-btn').onclick=kaydetGider;}

// =====================================================
// SİL / DÜZENLE
// =====================================================
window.silGelir=async id=>{if(!confirm('Bu gelir kaydını silmek istediğinizden emin misiniz?'))return;try{await deleteDoc(doc(db,'gelirler',id));showToast('✓ Gelir silindi');}catch(e){state.gelirler=state.gelirler.filter(g=>g.id!==id);renderAll();}};
window.silGider=async id=>{if(!confirm('Bu gider kaydını silmek istediğinizden emin misiniz?'))return;try{await deleteDoc(doc(db,'giderler',id));showToast('✓ Gider silindi');}catch(e){state.giderler=state.giderler.filter(g=>g.id!==id);renderAll();}};

window.duzenleGelir=id=>{
  const g=state.gelirler.find(x=>x.id===id);if(!g)return;
  document.getElementById('g-tarih').value=g.tarih.split('.').reverse().join('-');
  document.getElementById('g-donem').value=g.donem;
  document.getElementById('g-daire').value=g.daireNo;
  document.getElementById('g-tur').value=g.aciklama==='Aidat Tahsilatı'?'aidat':g.aciklama==='Diğer Tahsilatlar'?'diger':'ozel';
  document.getElementById('g-tutar').value=g.tutar;
  document.getElementById('g-tutar-group').style.display='block';
  document.getElementById('g-not').value=g.not||'';
  document.getElementById('modal-gelir-title').textContent='Gelir Düzenle';
  document.getElementById('gelir-kaydet-btn').onclick=async()=>{
    if(!confirm('Güncellemek istiyor musunuz?'))return;
    const gn={tarih:document.getElementById('g-tarih').value.split('-').reverse().join('.'),donem:document.getElementById('g-donem').value,daireNo:parseInt(document.getElementById('g-daire').value),tutar:parseFloat(document.getElementById('g-tutar').value)||g.tutar,aciklama:document.getElementById('g-tur').value==='aidat'?'Aidat Tahsilatı':document.getElementById('g-tur').value==='diger'?'Diğer Tahsilatlar':'Özel Tahsilat',not:document.getElementById('g-not').value};
    try{await updateDoc(doc(db,'gelirler',id),gn);}catch(e){const i=state.gelirler.findIndex(x=>x.id===id);if(i>=0)state.gelirler[i]={...state.gelirler[i],...gn};renderAll();}
    closeModal('modal-gelir');resetGelirForm();showToast('✓ Güncellendi');
  };
  openModal('modal-gelir');
};

window.duzenleGider=id=>{
  const g=state.giderler.find(x=>x.id===id);if(!g)return;
  document.getElementById('gid-tarih').value=g.tarih.split('.').reverse().join('-');
  document.getElementById('gid-donem').value=g.donem;
  document.getElementById('gid-muhatap').value=g.muhatap;
  document.getElementById('gid-tutar').value=g.tutar;
  document.getElementById('gid-kategori').value=g.kategori||'Diğer Çeşitli Hizmet Giderleri';
  document.getElementById('gid-aciklama').value=g.aciklama||'';
  document.getElementById('modal-gider-title').textContent='Gider Düzenle';
  document.getElementById('gider-kaydet-btn').onclick=async()=>{
    if(!confirm('Güncellemek istiyor musunuz?'))return;
    const gn={tarih:document.getElementById('gid-tarih').value.split('-').reverse().join('.'),donem:document.getElementById('gid-donem').value,muhatap:document.getElementById('gid-muhatap').value.trim(),tutar:parseFloat(document.getElementById('gid-tutar').value)||g.tutar,kategori:document.getElementById('gid-kategori').value,aciklama:document.getElementById('gid-aciklama').value||document.getElementById('gid-kategori').value};
    try{await updateDoc(doc(db,'giderler',id),gn);}catch(e){const i=state.giderler.findIndex(x=>x.id===id);if(i>=0)state.giderler[i]={...state.giderler[i],...gn};renderAll();}
    closeModal('modal-gider');resetGiderForm();showToast('✓ Güncellendi');
  };
  openModal('modal-gider');
};

// =====================================================
// DAİRE GÜNCELLE
// =====================================================
window.daireGuncelle=async no=>{
  if(!isAdmin())return;
  const gn={sakin:document.getElementById('du-sakin').value.trim(),sakintl:document.getElementById('du-sakintl').value.trim(),malik:document.getElementById('du-malik').value.trim(),maliktl:document.getElementById('du-maliktl').value.trim(),durum:document.getElementById('du-durum').value};
  daireOverrides[no]={...(daireOverrides[no]||{}),...gn};
  try{const cur=(await getDoc(doc(db,'daireler','overrides'))).data()||{};await setDoc(doc(db,'daireler','overrides'),{...cur,[no]:gn});}catch(e){}
  closeModal('modal-daire-duzenle');renderDaireler();showToast('✓ Daire güncellendi');openDaireModal(no);
};
window.openDaireDuzenle=no=>{
  const d=getDaire(no);
  document.getElementById('du-no').textContent='Daire '+no;
  ['sakin','sakintl','malik','maliktl'].forEach(k=>document.getElementById('du-'+k).value=d[k]||'');
  document.getElementById('du-durum').value=d.durum||'';
  document.getElementById('du-kaydet-btn').onclick=()=>daireGuncelle(no);
  openModal('modal-daire-duzenle');
};

// =====================================================
// HİZMET SAĞLAYICI
// =====================================================
window.hizmetSaglayiciEkle=async()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici ekleyebilir.');
  const ad=document.getElementById('hs-ad').value.trim();
  if(!ad)return showToast('Firma/kişi adı girin.');
  const yeni={id:'hs'+Date.now(),ad,kategori:document.getElementById('hs-kategori').value,tel:document.getElementById('hs-tel').value.trim(),iban:document.getElementById('hs-iban').value.trim(),aylikTutar:parseFloat(document.getElementById('hs-tutar').value)||0,not:document.getElementById('hs-not').value.trim(),odemeler:[]};
  hizmetSaglayicilar.push(yeni);
  try{await setDoc(doc(db,'hizmet','saglayicilar'),{liste:hizmetSaglayicilar});}catch(e){}
  closeModal('modal-hs-ekle');
  ['hs-ad','hs-tel','hs-iban','hs-not','hs-tutar'].forEach(id=>document.getElementById(id).value='');
  renderHizmetSaglayicilar();showToast('✓ Hizmet sağlayıcı eklendi');
};
window.hizmetSaglayiciSil=async id=>{
  if(!confirm('Silmek istediğinizden emin misiniz?'))return;
  hizmetSaglayicilar=hizmetSaglayicilar.filter(h=>h.id!==id);
  try{await setDoc(doc(db,'hizmet','saglayicilar'),{liste:hizmetSaglayicilar});}catch(e){}
  renderHizmetSaglayicilar();showToast('✓ Silindi');
};
window.hizmetOdemeYap=async id=>{
  if(!isAdmin())return showToast('Yalnızca yönetici ödeme yapabilir.');
  const hs=hizmetSaglayicilar.find(h=>h.id===id);if(!hs)return;
  const tutar=parseFloat(prompt(`${hs.ad} ödeme tutarı (₺):`,hs.aylikTutar||''))||0;
  if(!tutar)return;
  if(!hs.odemeler)hs.odemeler=[];
  hs.odemeler.push({tarih:today(),tutar,donem:BUGUN_AY});
  const gider={tarih:today().split('-').reverse().join('.'),donem:BUGUN_AY,muhatap:hs.ad,tutar,kategori:hs.kategori,aciklama:hs.ad+' ödemesi',createdAt:Timestamp.now()};
  try{await addDoc(collection(db,'giderler'),gider);await setDoc(doc(db,'hizmet','saglayicilar'),{liste:hizmetSaglayicilar});}
  catch(e){state.giderler.push({id:'L'+Date.now(),...gider});renderAll();}
  renderHizmetSaglayicilar();showToast('✓ Ödeme yapıldı ve gidere eklendi');
};
window.hizmetEkstre=id=>{
  const hs=hizmetSaglayicilar.find(h=>h.id===id);if(!hs)return;
  const odemeler=hs.odemeler||[];
  const toplam=odemeler.reduce((a,b)=>a+b.tutar,0);
  let html=`<div class="sheet-handle"></div><div class="ekstre-header"><div style="font-size:16px;font-weight:700">${hs.ad}</div><div style="font-size:12px;opacity:0.8">${hs.kategori}</div></div>${hs.tel?`<div style="font-size:13px;color:#555;margin-bottom:8px"><i class="ti ti-phone"></i> ${hs.tel}</div>`:''}${hs.iban?`<div style="font-size:12px;color:#888;margin-bottom:12px;word-break:break-all"><i class="ti ti-credit-card"></i> ${hs.iban}</div>`:''}`;
  html+=`<div style="font-size:12px;font-weight:600;color:#666;text-transform:uppercase;margin-bottom:8px">Ödeme Geçmişi</div>`;
  html+=odemeler.length?odemeler.map(o=>`<div class="ekstre-row"><div class="ekstre-label">${o.tarih} · ${o.donem}</div><div class="ekstre-value green">${fmt(o.tutar)}</div></div>`).join(''):'<div class="empty-state" style="padding:12px"><p>Ödeme yok</p></div>';
  html+=`<div class="ekstre-row" style="margin-top:8px;font-weight:700"><div class="ekstre-label">Toplam</div><div class="ekstre-value green">${fmt(toplam)}</div></div>`;
  html+=`<button class="btn" onclick="closeModal('modal-hs-ekstre')" style="margin-top:12px">Kapat</button>`;
  document.getElementById('modal-hs-ekstre-inner').innerHTML=html;
  openModal('modal-hs-ekstre');
};
function renderHizmetSaglayicilar(){
  const el=document.getElementById('hs-list');if(!el)return;
  if(!hizmetSaglayicilar.length){el.innerHTML='<div class="empty-state"><i class="ti ti-tools"></i><p>Henüz hizmet sağlayıcı eklenmemiş</p></div>';return;}
  el.innerHTML=hizmetSaglayicilar.map(hs=>{
    const toplam=(hs.odemeler||[]).reduce((a,b)=>a+b.tutar,0);
    return `<div class="daire-item" style="flex-direction:column;align-items:stretch;gap:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:40px;height:40px;border-radius:10px;background:#e4f5ec;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="ti ti-tools" style="color:#0d5c3a;font-size:20px"></i></div>
        <div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;color:#1a1a1a">${hs.ad}</div><div style="font-size:12px;color:#888">${hs.kategori}${hs.tel?' · '+hs.tel:''}</div></div>
        <div style="text-align:right">${hs.aylikTutar?`<div style="font-size:13px;font-weight:700;color:#0d5c3a">${fmt(hs.aylikTutar)}/ay</div>`:''}
        <div style="font-size:11px;color:#888">Toplam: ${fmt(toplam)}</div></div>
      </div>
      ${isAdmin()?`<div style="display:flex;gap:6px">
        <button onclick="hizmetOdemeYap('${hs.id}')" class="btn green" style="flex:1;padding:8px;font-size:12px"><i class="ti ti-cash"></i> Ödeme Yap</button>
        <button onclick="hizmetEkstre('${hs.id}')" class="btn" style="flex:1;padding:8px;font-size:12px"><i class="ti ti-file-text"></i> Ekstre</button>
        <button onclick="hizmetSaglayiciSil('${hs.id}')" style="background:#fdecea;border:none;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><i class="ti ti-trash" style="color:#c0392b;font-size:15px"></i></button>
      </div>`:`<button onclick="hizmetEkstre('${hs.id}')" class="btn" style="width:100%;padding:8px;font-size:12px"><i class="ti ti-file-text"></i> Ekstre Gör</button>`}
    </div>`;
  }).join('');
}

// =====================================================
// RENDER ANA
// =====================================================
function renderAll(){renderStats();renderSonIslemler();renderDaireler();renderGelirler();renderGiderler();renderKasaOzet();renderRapor();renderPuantaj();renderHizmetSaglayicilar();renderEkBorclar();}

function renderStats(){
  const{odendi,bekleyen,pct}=getAyOdemeOrani();
  // Haziran tahsilatı (sadece bu ay)
  const hazTahsilat=getAyTahsilat('HAZİRAN');
  document.getElementById('s-tahsilat').textContent=fmt(hazTahsilat);
  document.getElementById('s-ay-label').textContent='HAZİRAN Tahsilat';
  // Haziran için eksik aidat borcu (58x1400 - haziran aidat tahsilatı)
  const hazAidatTahsilat=state.gelirler.filter(g=>g.donem==='HAZİRAN'&&g.aciklama==='Aidat Tahsilatı').reduce((a,b)=>a+b.tutar,0);
  const hazBorc=Math.max(0,(58*AIDAT)-hazAidatTahsilat);
  document.getElementById('s-borc').textContent=fmt(hazBorc);
  document.getElementById('s-borc-label').textContent='HAZİRAN Aidat Borcu';
  // Kasa bakiyesi: Mayıs devredeni + Haziran net
  document.getElementById('s-kasa').textContent=fmt(getKasaBakiye());
  document.getElementById('odeme-progress').style.width=pct+'%';
  document.getElementById('odeme-oran').textContent=pct+'%';
  document.getElementById('odeme-ay-label').textContent='HAZİRAN AİDAT';
  document.getElementById('pr-odendi').textContent=odendi+' ödedi';
  document.getElementById('pr-bekleyen').textContent=bekleyen+' bekliyor';
}

function renderSonIslemler(){
  const el=document.getElementById('son-islemler');
  const son=[...state.gelirler].slice(-5).reverse();
  if(!son.length){el.innerHTML='<div class="empty-state"><i class="ti ti-inbox"></i><p>Henüz işlem yok</p></div>';return;}
  el.innerHTML=son.map(g=>`<div class="tx-row"><div class="tx-icon in"><i class="ti ti-arrow-down-right"></i></div><div class="tx-info"><div class="tx-name">No ${g.daireNo} — ${g.muhatap}</div><div class="tx-sub">${g.tarih} · ${g.donem} · ${g.aciklama}</div></div><div class="tx-amount in">+${fmt(g.tutar)}</div></div>`).join('');
}

// DAİRELER
let daireFilter='hepsi';
window.setFilter=(f,el)=>{daireFilter=f;document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderDaireler();};
window.clearSearch=()=>{document.getElementById('daire-search').value='';renderDaireler();};
window.filterDaireler=renderDaireler;

function renderDaireler(){
  const q=(document.getElementById('daire-search')?.value||'').trim().toLowerCase();
  const el=document.getElementById('daire-list');
  const list=DAIRELER.filter(base=>{
    const d=getDaire(base.no);
    if(q){const n=(d.sakin||d.malik||'').toLowerCase();if(!String(d.no).includes(q)&&!n.includes(q))return false;}
    const b=getDaireBakiyeBorc(d.no);
    if(daireFilter==='borclu')return b>0;
    if(daireFilter==='odendi')return b<=0;
    if(daireFilter==='kiraci')return d.durum==='KİRACI';
    if(daireFilter==='evsahibi')return d.durum==='EV SAHİBİ';
    return true;
  });
  if(!list.length){el.innerHTML='<div class="empty-state"><i class="ti ti-search-off"></i><p>Daire bulunamadı</p></div>';return;}
  el.innerHTML=list.map(base=>{
    const d=getDaire(base.no);
    const borc=getDaireBakiyeBorc(d.no);
    const tahsilat=getDaireTahsilat(d.no);
    const borclu=borc>0;
    const name=d.sakin||d.malik||'—';
    const durumBadge=d.durum==='KİRACI'?'<span class="badge yellow-badge" style="margin-left:6px">Kiracı</span>':d.durum==='EV SAHİBİ'?'<span class="badge green-badge" style="margin-left:6px">Ev Sahibi</span>':'';
    return `<div class="daire-item" onclick="openDaireModal(${d.no})">
      <div class="daire-no-badge ${borclu?'borclu':'odendi'}">${d.no}</div>
      <div class="daire-info"><div class="daire-name">${name}${durumBadge}</div><div class="daire-sub">Kat ${d.kat} · Tahsilat: ${fmt(tahsilat)}</div></div>
      <div class="daire-amount ${borclu?'borclu':'odendi'}">${borclu?fmt(borc):'✓ Tamam'}</div>
      <i class="ti ti-chevron-right" style="color:#ccc;font-size:16px"></i>
    </div>`;
  }).join('');
}

// DAİRE MODAL
window.openDaireModal=no=>{
  const d=getDaire(no);if(!d)return;
  const tahsilat=getDaireTahsilat(no);
  const borc=getDaireBakiyeBorc(no);
  const odenenAylar=state.gelirler.filter(g=>g.daireNo===no&&g.aciklama==='Aidat Tahsilatı').map(g=>g.donem);
  const ayHtml=AYLAR.map(ay=>{const paid=odenenAylar.includes(ay);return `<div class="month-chip ${paid?'paid':''}">${ay.slice(0,3)}<span class="chip-label">${paid?'✓':'—'}</span></div>`;}).join('');
  let kisiBlok='';
  if(d.durum==='KİRACI'){
    kisiBlok=`<div style="margin-bottom:14px"><div style="font-size:20px;font-weight:800;color:#1a1a1a;margin-bottom:4px">${d.sakin||'—'}</div><span class="badge yellow-badge">Kiracı</span>${d.sakintl?`<div style="font-size:13px;color:#555;margin-top:4px"><i class="ti ti-phone"></i> ${d.sakintl}</div>`:''}</div>${d.malik?`<div style="padding:10px;background:#f8f8f8;border-radius:10px;margin-bottom:14px"><div style="font-size:11px;color:#aaa;margin-bottom:2px">EV SAHİBİ</div><div style="font-size:14px;color:#999;font-weight:500">${d.malik}</div>${d.maliktl?`<div style="font-size:12px;color:#bbb">${d.maliktl}</div>`:''}</div>`:''}`;
  }else{
    kisiBlok=`<div style="margin-bottom:14px"><div style="font-size:20px;font-weight:800;color:#1a1a1a;margin-bottom:4px">${d.sakin||d.malik||'—'}</div>${d.durum?`<span class="badge green-badge">${d.durum}</span>`:''} ${d.sakintl||d.maliktl?`<div style="font-size:13px;color:#555;margin-top:4px"><i class="ti ti-phone"></i> ${d.sakintl||d.maliktl}</div>`:''}</div>`;
  }
  const tel=(d.sakintl||d.maliktl||'').replace(/\s/g,'');
  const contactHtml=tel?`<div class="detail-contact-row"><a href="tel:${tel}" class="btn"><i class="ti ti-phone"></i> Ara</a><a href="https://wa.me/90${tel.replace(/^0/,'')}" target="_blank" class="btn wa"><i class="ti ti-brand-whatsapp"></i> WhatsApp</a></div>`:'<div style="font-size:13px;color:#aaa;margin-bottom:12px;text-align:center">İletişim bilgisi girilmemiş</div>';
  const prevNo=no>1?no-1:null;const nextNo=no<58?no+1:null;
  document.getElementById('modal-daire-inner').innerHTML=`
    <div class="sheet-handle"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <button onclick="closeModal('modal-daire');openDaireModal(${prevNo})" ${!prevNo?'disabled':''} style="background:${prevNo?'#f0f4f1':'#f8f8f8'};border:none;border-radius:8px;padding:8px 12px;cursor:${prevNo?'pointer':'default'}"><i class="ti ti-chevron-left" style="color:${prevNo?'#0d5c3a':'#ccc'};font-size:20px"></i></button>
      <div style="text-align:center"><div style="font-size:22px;font-weight:800;color:#0d5c3a">Daire ${no}</div><div style="font-size:12px;color:#888">Kat ${d.kat}</div></div>
      <button onclick="closeModal('modal-daire');openDaireModal(${nextNo})" ${!nextNo?'disabled':''} style="background:${nextNo?'#f0f4f1':'#f8f8f8'};border:none;border-radius:8px;padding:8px 12px;cursor:${nextNo?'pointer':'default'}"><i class="ti ti-chevron-right" style="color:${nextNo?'#0d5c3a':'#ccc'};font-size:20px"></i></button>
    </div>
    ${kisiBlok}${contactHtml}
    <div class="stat-grid" style="margin-bottom:14px">
      <div class="stat-card"><div class="stat-label">Aidat+Diğer Borç</div><div class="stat-value" style="font-size:16px">${fmt(YILLIK_AIDAT+DIGER_BORC)}</div></div>
      <div class="stat-card"><div class="stat-label">Ek Borç</div><div class="stat-value" style="font-size:16px;color:#b8860b">${fmt(getDaireEkBorc(no))}</div></div>
      <div class="stat-card"><div class="stat-label">Tahsilat</div><div class="stat-value green" style="font-size:16px">${fmt(tahsilat)}</div></div>
      <div class="stat-card"><div class="stat-label">Bakiye Borç</div><div class="stat-value ${borc>0?'red':'green'}" style="font-size:16px">${borc>0?fmt(borc):'✓ Yok'}</div></div>
    </div>
    <div style="font-size:12px;font-weight:600;color:#666;text-transform:uppercase;margin-bottom:10px">2026 Aidat Durumu</div>
    <div class="month-chip-grid">${ayHtml}</div>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      ${isAdmin()?`<button class="btn green" style="flex:1" onclick="closeModal('modal-daire');setDaireNo(${no});openModal('modal-gelir')"><i class="ti ti-trending-up"></i> Tahsilat</button>`:''}
      <button class="btn" style="flex:1" onclick="closeModal('modal-daire');openEkstre(${no})"><i class="ti ti-file-text"></i> Ekstre</button>
      ${isAdmin()?`<button class="btn" style="flex:1" onclick="openDaireDuzenle(${no})"><i class="ti ti-pencil"></i> Düzenle</button>`:''}
    </div>
    <button class="btn" onclick="closeModal('modal-daire')" style="margin-top:8px">Kapat</button>`;
  openModal('modal-daire');
};
window.setDaireNo=no=>{document.getElementById('g-daire').value=no;};

// EKSTRE
window.openEkstre=no=>{
  closeModal('modal-daire');
  const d=getDaire(no);
  const name=d?(d.sakin||d.malik||'—'):'—';
  const tahsilat=getDaireTahsilat(no);
  const borc=getDaireBakiyeBorc(no);
  const tel=d?(d.sakintl||d.maliktl||'').replace(/\s/g,''):'';
  const islemler=state.gelirler.filter(g=>g.daireNo===no);
  let txRows=islemler.length?islemler.map(g=>`<div class="ekstre-row"><div><div class="ekstre-label">${g.tarih} · ${g.donem}</div><div style="font-size:13px;color:#1a1a1a;margin-top:2px">${g.aciklama}</div></div><div class="ekstre-value green">+${fmt(g.tutar)}</div></div>`).join(''):'<div class="empty-state" style="padding:16px"><p>İşlem yok</p></div>';
  const ekstreMetin=encodeURIComponent(`📋 AZRA SAHİL SİTESİ — DAİRE ${no}\n👤 ${name}\n\n📌 Toplam Borç: ${fmt(YILLIK_AIDAT+DIGER_BORC)}\n✅ Tahsilat: ${fmt(tahsilat)}\n⚠️ Bakiye: ${fmt(borc)}`);
  document.getElementById('modal-ekstre-inner').innerHTML=`
    <div class="sheet-handle"></div>
    <div class="ekstre-header"><div style="font-size:16px;font-weight:700">Daire ${no} — Ekstre</div><div style="font-size:12px;opacity:0.8">${name} · Kat ${d?.kat||'—'}</div></div>
    <div class="ekstre-row"><div class="ekstre-label">Yıllık Aidat</div><div class="ekstre-value">${fmt(YILLIK_AIDAT)}</div></div>
    <div class="ekstre-row"><div class="ekstre-label">Diğer Borç</div><div class="ekstre-value">${fmt(DIGER_BORC)}</div></div>
    <div class="ekstre-row"><div class="ekstre-label">Toplam Borç</div><div class="ekstre-value red">${fmt(YILLIK_AIDAT+DIGER_BORC)}</div></div>
    <div class="ekstre-row"><div class="ekstre-label">Tahsilat</div><div class="ekstre-value green">${fmt(tahsilat)}</div></div>
    <div class="ekstre-row" style="margin-bottom:14px"><div class="ekstre-label" style="font-weight:700">Bakiye Borç</div><div class="ekstre-value ${borc>0?'red':'green'}" style="font-size:18px">${borc>0?fmt(borc):'✓ Borç Yok'}</div></div>
    <div style="font-size:12px;font-weight:600;color:#666;text-transform:uppercase;margin-bottom:8px">İşlem Hareketleri</div>
    ${txRows}<div style="height:14px"></div>
    ${tel?`<button class="btn wa" onclick="window.open('https://wa.me/90${tel.replace(/^0/,'')}?text=${ekstreMetin}','_blank')" style="margin-bottom:8px"><i class="ti ti-brand-whatsapp"></i> WhatsApp ile Gönder</button>`:''}
    <button class="btn green" onclick="indirEkstre(${no})" style="margin-bottom:8px"><i class="ti ti-download"></i> PDF / JPG İndir</button>
    <button class="btn" onclick="closeModal('modal-ekstre')">Kapat</button>`;
  openModal('modal-ekstre');
};

// =====================================================
// PDF / JPG İNDİRME (html2canvas + jsPDF)
// =====================================================
window.indirEkstre=async(no)=>{
  showToast('Ekstre hazırlanıyor...');
  const d=getDaire(no);
  const name=d?(d.sakin||d.malik||'—'):'—';
  const tahsilat=getDaireTahsilat(no);
  const borc=getDaireBakiyeBorc(no);
  const islemler=state.gelirler.filter(g=>g.daireNo===no);
  const html=`<div style="font-family:Arial,sans-serif;padding:20px;max-width:400px;background:#fff">
    <div style="text-align:center;background:#0d5c3a;color:#fff;padding:12px;border-radius:8px;margin-bottom:16px">
      <div style="font-size:18px;font-weight:700">AZRA SAHİL SİTESİ</div>
      <div style="font-size:13px;opacity:0.85">DAİRE ${no} — EKSTRESİ</div>
    </div>
    <div style="font-size:15px;font-weight:700;margin-bottom:4px">${name}</div>
    <div style="font-size:12px;color:#666;margin-bottom:16px">Kat ${d?.kat||'—'} · ${d?.durum||'—'}</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px">
      <tr style="background:#f5f5f5"><td style="padding:8px">Yıllık Aidat Borcu</td><td style="padding:8px;text-align:right;font-weight:600">${fmt(YILLIK_AIDAT)}</td></tr>
      <tr><td style="padding:8px">Diğer Borç</td><td style="padding:8px;text-align:right">${fmt(DIGER_BORC)}</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px">Toplam Borç</td><td style="padding:8px;text-align:right;font-weight:700;color:#c0392b">${fmt(YILLIK_AIDAT+DIGER_BORC)}</td></tr>
      <tr><td style="padding:8px">Yapılan Tahsilat</td><td style="padding:8px;text-align:right;font-weight:700;color:#0d5c3a">${fmt(tahsilat)}</td></tr>
      <tr style="background:${borc>0?'#fdecea':'#e4f5ec'}"><td style="padding:8px;font-weight:700">BAKİYE BORÇ</td><td style="padding:8px;text-align:right;font-weight:700;font-size:16px;color:${borc>0?'#c0392b':'#0d5c3a'}">${borc>0?fmt(borc):'✓ Borç Yok'}</td></tr>
    </table>
    <div style="font-size:12px;font-weight:700;color:#666;text-transform:uppercase;margin-bottom:8px">İşlem Hareketleri</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      ${islemler.map(g=>`<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:6px">${g.tarih} · ${g.donem}</td><td style="padding:6px">${g.aciklama}</td><td style="padding:6px;text-align:right;color:#0d5c3a;font-weight:600">+${fmt(g.tutar)}</td></tr>`).join('')}
    </table>
    <div style="text-align:center;font-size:11px;color:#aaa;margin-top:16px">${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.</div>
  </div>`;
  indir_html(html, `daire-${no}-ekstre`);
};

window.indirRapor=async(tip)=>{
  showToast(`${raporAy} raporu hazırlanıyor...`);
  const topGelir=state.gelirler.filter(g=>g.donem===raporAy).reduce((a,b)=>a+b.tutar,0);
  const topGider=state.giderler.filter(g=>g.donem===raporAy).reduce((a,b)=>a+b.tutar,0);
  const oncekiDevreden=state.kasaOnceki.find(k=>k.ay===AYLAR[AYLAR.indexOf(raporAy)-1])?.devreden||0;
  const bakiye=oncekiDevreden+topGelir-topGider;
  const odeyenDaire=DAIRELER.filter(d=>state.gelirler.some(g=>g.daireNo===d.no&&g.donem===raporAy)).length;
  let giderRows='';
  GIDER_KATEGORILER.forEach(grup=>{
    giderRows+=`<tr style="background:${grup.renk}22"><td colspan="2" style="padding:6px 10px;font-size:11px;font-weight:700;color:${grup.renk};text-transform:uppercase">${grup.grup}</td></tr>`;
    grup.kalemler.forEach(kalem=>{
      const t=state.giderler.filter(g=>g.donem===raporAy&&g.kategori===kalem).reduce((a,b)=>a+b.tutar,0);
      giderRows+=`<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:6px 16px;font-size:12px">${kalem}</td><td style="padding:6px;text-align:right;font-size:12px;${t>0?'font-weight:700;color:#c0392b':'color:#ccc'}">${t>0?fmt(t):'—'}</td></tr>`;
    });
  });
  const html=`<div style="font-family:Arial,sans-serif;padding:20px;max-width:500px;background:#fff">
    <div style="text-align:center;border:2px solid #0d5c3a;padding:10px;margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;color:#0d5c3a">${raporAy} AYI — GELİR / GİDER TABLOSU</div>
    </div>
    <div style="background:#1a5c3a;color:#fff;padding:6px 10px;font-size:12px;font-weight:700;margin-bottom:4px">GELİRLER</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
      <tr style="border-bottom:1px solid #e0e0e0"><td style="padding:8px;font-size:12px">Mevcut (58) Daireden (${odeyenDaire}) Dairenin Yaptığı Toplam Aidat vs. Ödemeler</td><td style="padding:8px;text-align:right;font-weight:700;font-size:14px;color:#0d5c3a">${fmt(topGelir)}</td></tr>
    </table>
    <div style="background:#c0392b;color:#fff;padding:6px 10px;font-size:12px;font-weight:700;margin-bottom:4px">GİDERLER</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px">${giderRows}</table>
    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      <tr style="border-top:2px solid #e0e0e0"><td style="padding:8px;font-size:12px">Önceki Aydan Devrolan Kasa Bakiyesi</td><td style="padding:8px;text-align:right;font-weight:600">${fmt(oncekiDevreden)}</td></tr>
      <tr><td style="padding:8px;font-size:12px">${raporAy} Ayı İçerisindeki Gelirler Toplamı</td><td style="padding:8px;text-align:right;font-weight:600;color:#0d5c3a">${fmt(topGelir)}</td></tr>
      <tr><td style="padding:8px;font-size:12px">${raporAy} Ayı İçerisindeki Giderler Toplamı</td><td style="padding:8px;text-align:right;font-weight:600;color:#c0392b">${fmt(topGider)}</td></tr>
      <tr style="background:#e8f4ee"><td style="padding:10px;font-size:13px;font-weight:700">Sonraki Aya Devreden MEVCUT KASA BAKİYESİ</td><td style="padding:10px;text-align:right;font-size:16px;font-weight:800;color:#0d5c3a">${fmt(bakiye)}</td></tr>
    </table>
    <div style="text-align:center;background:#c0392b;color:#fff;padding:8px;margin-top:12px;font-size:11px;font-weight:700">Aidat Ödemelerini Düzenli Yapan Daire Sakinlerine Çok Teşekkür Ederiz.</div>
  </div>`;
  indir_html(html, `${raporAy}-raporu`);
};

// Ortak indirme fonksiyonu - gerçek dosya oluşturur
function indir_html(html, dosyaAdi){
  const blob=new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=dosyaAdi+'.html';a.click();
  URL.revokeObjectURL(url);
  showToast('✓ '+dosyaAdi+' indirildi (HTML → tarayıcıda aç → Yazdır → PDF kaydet)');
}

// GELİRLER LİSTESİ
function renderGelirler(){
  const el=document.getElementById('gelir-list');
  let list=[...state.gelirler];
  if(state.gelirFiltre!=='hepsi'){
    // Ay filtrelenince: daire no sırasına göre
    list=list.filter(g=>g.donem===state.gelirFiltre).sort((a,b)=>a.daireNo-b.daireNo);
  } else {
    // Hepsi: önce dönem (ay sırası), sonra daire no
    list=list.sort((a,b)=>{
      const ayFark=AYLAR.indexOf(a.donem)-AYLAR.indexOf(b.donem);
      if(ayFark!==0)return ayFark;
      return a.daireNo-b.daireNo;
    });
  }
  if(!list.length){el.innerHTML='<div class="empty-state"><i class="ti ti-trending-up"></i><p>Kayıt bulunamadı</p></div>';return;}
  el.innerHTML=`<div id="gelir-top"></div>`+list.map(g=>`
    <div class="tx-row">
      <div class="tx-icon in"><i class="ti ti-arrow-down-right"></i></div>
      <div class="tx-info"><div class="tx-name">No ${g.daireNo} — ${g.muhatap}</div><div class="tx-sub">${g.tarih} · ${g.donem} · ${g.aciklama}</div></div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="tx-amount in">+${fmt(g.tutar)}</div>
        ${isAdmin()?`<button onclick="duzenleGelir('${g.id}')" style="background:#e3f0ff;border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><i class="ti ti-pencil" style="color:#1565c0;font-size:14px"></i></button>
        <button onclick="silGelir('${g.id}')" style="background:#fdecea;border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><i class="ti ti-trash" style="color:#c0392b;font-size:14px"></i></button>`:''}
      </div>
    </div>`).join('')+`<div id="gelir-bottom"></div>`;
}

// GİDERLER LİSTESİ
function renderGiderler(){
  const el=document.getElementById('gider-list');
  let list=[...state.giderler];
  if(state.giderFiltre!=='hepsi'){
    list=list.filter(g=>g.donem===state.giderFiltre).sort((a,b)=>AYLAR.indexOf(a.donem)-AYLAR.indexOf(b.donem));
  } else {
    list=list.sort((a,b)=>{
      const ayFark=AYLAR.indexOf(a.donem)-AYLAR.indexOf(b.donem);
      if(ayFark!==0)return ayFark;
      return (a.tarih||'').localeCompare(b.tarih||'');
    });
  }
  if(!list.length){el.innerHTML='<div class="empty-state"><i class="ti ti-trending-down"></i><p>Kayıt bulunamadı</p></div>';return;}
  el.innerHTML=`<div id="gider-top"></div>`+list.map(g=>`
    <div class="tx-row">
      <div class="tx-icon out"><i class="ti ti-arrow-up-right"></i></div>
      <div class="tx-info"><div class="tx-name">${g.muhatap}</div><div class="tx-sub">${g.tarih} · ${g.donem} · ${g.kategori||g.aciklama||''}</div></div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="tx-amount out">-${fmt(g.tutar)}</div>
        ${isAdmin()?`<button onclick="duzenleGider('${g.id}')" style="background:#e3f0ff;border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><i class="ti ti-pencil" style="color:#1565c0;font-size:14px"></i></button>
        <button onclick="silGider('${g.id}')" style="background:#fdecea;border:none;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><i class="ti ti-trash" style="color:#c0392b;font-size:14px"></i></button>`:''}
      </div>
    </div>`).join('')+`<div id="gider-bottom"></div>`;
}

window.gelirAyFiltre=(ay,el)=>{state.gelirFiltre=ay;document.querySelectorAll('.gelir-filtre-chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderGelirler();};
window.giderAyFiltre=(ay,el)=>{state.giderFiltre=ay;document.querySelectorAll('.gider-filtre-chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderGiderler();};
window.scrollToTop=p=>document.getElementById(p+'-top')?.scrollIntoView({behavior:'smooth'});
window.scrollToBottom=p=>document.getElementById(p+'-bottom')?.scrollIntoView({behavior:'smooth'});

// KASA
function renderKasaOzet(){
  const el=document.getElementById('kasa-ozet');
  let h=`<table class="kasa-table"><thead><tr><th>Ay</th><th style="text-align:right">Gelir</th><th style="text-align:right">Gider</th><th style="text-align:right;color:#00bcd4">Kalan</th></tr></thead><tbody>`;
  state.kasaOnceki.forEach(k=>{
    const kalanRenk=k.devreden>0?'#00bcd4':k.devreden<0?'#c0392b':'#aaa';
    h+=`<tr><td>${k.ay}</td><td class="gelir" style="text-align:right">${fmt(k.gelir)}</td><td class="gider" style="text-align:right">${fmt(k.gider)}</td><td style="text-align:right;font-weight:700;color:${kalanRenk}">${k.devreden!==0?fmt(k.devreden):'—'}</td></tr>`;
  });
  // Haziran: Firebase'den gelen gelir/gider + Mayıs devredeni
  const hazGelir=getAyTahsilat('HAZİRAN');
  const hazGider=getAyGider('HAZİRAN');
  const mayisDevreden=11589.79; // Mayıs sonu kasa bakiyesi
  const hazKalan=mayisDevreden+hazGelir-hazGider;
  h+=`<tr class="aktif"><td>HAZİRAN ★</td><td class="gelir" style="text-align:right">${fmt(hazGelir)}</td><td class="gider" style="text-align:right">${fmt(hazGider)}</td><td style="text-align:right;font-weight:800;color:#00bcd4;font-size:14px">${fmt(hazKalan)}</td></tr>`;
  h+='</tbody></table>';
  // Alt özet - tüm yıl toplamı
  const tumGelir=state.gelirler.reduce((a,b)=>a+b.tutar,0);
  const tumGider=state.giderler.reduce((a,b)=>a+b.tutar,0);
  const sabitGelir=state.kasaOnceki.reduce((a,b)=>a+b.gelir,0);
  const sabitGider=state.kasaOnceki.reduce((a,b)=>a+b.gider,0);
  h+=`<div style="margin-top:14px;border-top:2px solid #e0e0e0;padding-top:12px">
    <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">2026 YILI GENEL ÖZET</div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f4f1;font-size:13px">
      <span style="color:#666">Ocak-Mayıs Toplam Gelir</span>
      <span style="font-weight:700;color:#0d5c3a">${fmt(sabitGelir)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f4f1;font-size:13px">
      <span style="color:#666">Ocak-Mayıs Toplam Gider</span>
      <span style="font-weight:700;color:#c0392b">${fmt(sabitGider)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f4f1;font-size:13px">
      <span style="color:#666">HAZİRAN Toplam Gelir</span>
      <span style="font-weight:700;color:#0d5c3a">${fmt(tumGelir)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f4f1;font-size:13px">
      <span style="color:#666">HAZİRAN Toplam Gider</span>
      <span style="font-weight:700;color:#c0392b">${fmt(tumGider)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:10px;background:#e8f4ee;border-radius:8px;margin-top:8px">
      <span style="font-size:13px;font-weight:700">Güncel Kasa Bakiyesi</span>
      <span style="font-size:16px;font-weight:800;color:#00bcd4">${fmt(getKasaBakiye())}</span>
    </div>
  </div>`;
  el.innerHTML=h;
}

// PUANTAJ
function renderPuantaj(){
  const ay=state.puantajAy,yil=state.puantajYil;
  const gunSayisi=new Date(yil,AYLAR.indexOf(ay)+1,0).getDate();
  const gun=state.puantaj[ay]||{};
  const stat=getPuantajStat(ay);
  const el=document.getElementById('puantaj-ay-baslik');
  if(el)el.textContent=`${ay} ${yil}`;
  document.getElementById('personel-ad-label').textContent=personelOzluk.adsoyad||'Personel Adı Girilmemiş';
  document.getElementById('personel-unvan-label').textContent=personelOzluk.unvan||'Görev Girilmemiş';
  ['calisma','pazar','rt','yi','iz','rp'].forEach(k=>{const e=document.getElementById('p-stat-'+k);if(e)e.textContent=stat[k]||0;});
  const grid=document.getElementById('puantaj-grid');if(!grid)return;
  let h='';
  for(let g=1;g<=gunSayisi;g++){
    const kod=gun[g]||'';
    const s=kod&&PUANTAJ_KODLAR[kod]?`background:${PUANTAJ_KODLAR[kod].renk};color:${PUANTAJ_KODLAR[kod].yazi};`:'background:#f8f8f8;color:#aaa;';
    h+=`<div class="puantaj-gun" style="${s}${isAdmin()?'cursor:pointer;':''}" onclick="${isAdmin()?`puantajHucreTikla(${g},'${kod||''}')`:''}"><span class="p-gun-no">${g}</span><span class="p-gun-kod">${kod||'+'}</span></div>`;
  }
  grid.innerHTML=h;
}
window.puantajHucreTikla=async(gun,mevcutKod)=>{
  if(!isAdmin())return;
  const kodlar=Object.keys(PUANTAJ_KODLAR);
  const yeniKod=kodlar[(kodlar.indexOf(mevcutKod)+1)%kodlar.length];
  const ay=state.puantajAy;
  if(!state.puantaj[ay])state.puantaj[ay]={};
  state.puantaj[ay][gun]=yeniKod;
  renderPuantaj();
  try{await setDoc(doc(db,'puantaj','2026'),state.puantaj);}catch(e){}
};
window.puantajAyDegistir=yon=>{state.puantajAy=AYLAR[(AYLAR.indexOf(state.puantajAy)+yon+12)%12];renderPuantaj();};

// RAPOR
let raporAy=BUGUN_AY;
window.raporAySecimi=(ay,el)=>{raporAy=ay;document.querySelectorAll('.rapor-ay-chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderRapor();};

function renderRapor(){
  const now=new Date();
  document.getElementById('rapor-tarih').textContent=now.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})+' tarihli rapor';
  let kh=`<table class="kasa-table"><thead><tr><th>Ay</th><th style="text-align:right">Gelir</th><th style="text-align:right">Gider</th><th style="text-align:right">Kalan</th></tr></thead><tbody>`;
  state.kasaOnceki.forEach(k=>{
    const kr=k.devreden>0?'#00bcd4':k.devreden<0?'#c0392b':'#aaa';
    kh+=`<tr><td>${k.ay}</td><td class="gelir" style="text-align:right">${fmt(k.gelir)}</td><td class="gider" style="text-align:right">${fmt(k.gider)}</td><td style="text-align:right;font-weight:700;color:${kr}">${k.devreden!==0?fmt(k.devreden):'—'}</td></tr>`;
  });
  const hazGelirR=getAyTahsilat('HAZİRAN');
  const hazGiderR=getAyGider('HAZİRAN');
  const hazKalanR=11589.79+hazGelirR-hazGiderR;
  kh+=`<tr class="aktif"><td>HAZİRAN ★</td><td class="gelir" style="text-align:right">${fmt(hazGelirR)}</td><td class="gider" style="text-align:right">${fmt(hazGiderR)}</td><td style="text-align:right;font-weight:800;color:#00bcd4;font-size:14px">${fmt(hazKalanR)}</td></tr>`;
  kh+='</tbody></table>';
  document.getElementById('rapor-kasa-table').innerHTML=kh;
  const borcluList=DAIRELER.filter(d=>getDaireBakiyeBorc(d.no)>0);
  let bh=`<table class="kasa-table"><thead><tr><th>No</th><th>Sakin</th><th style="text-align:right">Bakiye</th></tr></thead><tbody>`;
  borcluList.forEach(d=>{const b=getDaireBakiyeBorc(d.no);const dd=getDaire(d.no);bh+=`<tr><td style="font-weight:700">${d.no}</td><td style="color:#666;font-size:11px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${dd.sakin||dd.malik||'—'}</td><td style="text-align:right;color:#c0392b;font-weight:700">${fmt(b)}</td></tr>`;});
  if(!borcluList.length)bh+='<tr><td colspan="3" style="text-align:center;color:#0d5c3a;padding:12px">Tüm daireler ödenmiş ✓</td></tr>';
  bh+='</tbody></table>';
  document.getElementById('rapor-borc-table').innerHTML=bh;
  const ayGelirler=state.gelirler.filter(g=>g.donem===raporAy);
  const ayGiderler=state.giderler.filter(g=>g.donem===raporAy);
  const topGelir=ayGelirler.reduce((a,b)=>a+b.tutar,0);
  const topGider=ayGiderler.reduce((a,b)=>a+b.tutar,0);
  const oncekiDevreden=state.kasaOnceki.find(k=>k.ay===AYLAR[AYLAR.indexOf(raporAy)-1])?.devreden||0;
  const odeyenDaire=DAIRELER.filter(d=>state.gelirler.some(g=>g.daireNo===d.no&&g.donem===raporAy)).length;
  let ah=`<div style="background:#1a5c3a;color:#fff;padding:10px;border-radius:8px;text-align:center;font-size:13px;font-weight:700;margin-bottom:10px">${raporAy} AYI — GELİR / GİDER TABLOSU</div>`;
  ah+=`<div style="background:#2d7a4f;color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;margin-bottom:6px">GELİRLER</div>`;
  ah+=`<div style="display:flex;justify-content:space-between;padding:8px 4px;border-bottom:1px solid #f0f4f1;font-size:12px"><span>Mevcut (58) Daireden (${odeyenDaire}) Dairenin Yaptığı Toplam Aidat vs. Ödemeler</span><span style="font-weight:700;color:#0d5c3a">${fmt(topGelir)}</span></div>`;
  ah+=`<div style="background:#c0392b;color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;margin:10px 0 6px">GİDERLER</div>`;
  GIDER_KATEGORILER.forEach(grup=>{
    ah+=`<div style="background:${grup.renk}22;padding:5px 8px;font-size:10px;font-weight:700;color:${grup.renk};text-transform:uppercase;margin-top:6px">${grup.grup}</div>`;
    grup.kalemler.forEach(kalem=>{
      const t=ayGiderler.filter(g=>g.kategori===kalem).reduce((a,b)=>a+b.tutar,0);
      ah+=`<div style="display:flex;justify-content:space-between;padding:5px 12px;border-bottom:1px solid #f8f8f8;font-size:11px"><span>${kalem}</span><span style="${t>0?'font-weight:700;color:#c0392b':'color:#ccc'}">${t>0?fmt(t):'—'}</span></div>`;
    });
  });
  ah+=`<div style="margin-top:12px;border-top:2px solid #e0e0e0;padding-top:10px">
    <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span>Önceki Aydan Devrolan Kasa Bakiyesi</span><span style="font-weight:600">${fmt(oncekiDevreden)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span>${raporAy} Ayı Gelirler Toplamı</span><span style="font-weight:600;color:#0d5c3a">${fmt(topGelir)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span>${raporAy} Ayı Giderler Toplamı</span><span style="font-weight:600;color:#c0392b">${fmt(topGider)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:10px;background:#e8f4ee;border-radius:8px;margin-top:8px"><span style="font-size:12px;font-weight:700">Sonraki Aya Devreden MEVCUT KASA BAKİYESİ</span><span style="font-size:14px;font-weight:800;color:#0d5c3a">${fmt(oncekiDevreden+topGelir-topGider)}</span></div>
    <div style="text-align:center;font-size:10px;color:#888;margin-top:8px;font-style:italic">Aidat Ödemelerini Düzenli Yapan Daire Sakinlerine Çok Teşekkür Ederiz.</div>
  </div>`;
  document.getElementById('rapor-ay-detay').innerHTML=ah;
}

window.raporPaylas=()=>{
  const topGelir=state.gelirler.filter(g=>g.donem===raporAy).reduce((a,b)=>a+b.tutar,0);
  const topGider=state.giderler.filter(g=>g.donem===raporAy).reduce((a,b)=>a+b.tutar,0);
  const oncekiDevreden=state.kasaOnceki.find(k=>k.ay===AYLAR[AYLAR.indexOf(raporAy)-1])?.devreden||0;
  const bakiye=oncekiDevreden+topGelir-topGider;
  const odeyenDaire=DAIRELER.filter(d=>state.gelirler.some(g=>g.daireNo===d.no&&g.donem===raporAy)).length;
  let giderDetay='';
  GIDER_KATEGORILER.forEach(grup=>{
    grup.kalemler.forEach(kalem=>{
      const t=state.giderler.filter(g=>g.donem===raporAy&&g.kategori===kalem).reduce((a,b)=>a+b.tutar,0);
      if(t>0)giderDetay+=`  • ${kalem}: ${fmt(t)}\n`;
    });
  });
  const text=encodeURIComponent(`🏢 AZRA SAHİL SİTESİ\n${raporAy} AYI GELİR/GİDER RAPORU\n${'─'.repeat(28)}\n\n💰 GELİRLER\n${odeyenDaire} daireden tahsilat: ${fmt(topGelir)}\n\n📊 GİDERLER (${fmt(topGider)})\n${giderDetay||'  Henüz gider kaydı yok\n'}\n${'─'.repeat(28)}\n📌 Önceki Ay: ${fmt(oncekiDevreden)}\n📌 Gelir: ${fmt(topGelir)}\n📌 Gider: ${fmt(topGider)}\n✅ KASA BAKİYESİ: ${fmt(bakiye)}\n\n🙏 Aidat ödemelerini düzenli yapan daire sakinlerine çok teşekkür ederiz.`);
  window.open('https://wa.me/?text='+text,'_blank');
};
window.raporYayinla=()=>showToast('Siteye yayınlama yakında gelecek!');

// NAVİGASYON
let activeTab='home',activeSubTab='gelirler';
window.switchTab=tab=>{
  activeTab=tab;
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  document.getElementById('nav-'+tab).classList.add('active');
  document.getElementById('fab').style.display=isAdmin()&&tab!=='raporlar'?'flex':'none';
};
window.switchSubTab=(tab,el)=>{
  activeSubTab=tab;
  document.querySelectorAll('#tab-islemler .sub-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  ['gelirler','giderler','kasa','hizmet','borclar'].forEach(p=>{
    const el=document.getElementById('panel-'+p);
    if(el)el.style.display=p===tab?'block':'none';
  });
};
window.switchPuantajTab=(tab,el)=>{
  document.querySelectorAll('#tab-puantaj .sub-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('panel-ozluk').style.display=tab==='ozluk'?'block':'none';
  document.getElementById('panel-puantaj').style.display=tab==='puantaj'?'block':'none';
};
window.openFabMenu=()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici veri girebilir.');
  if(activeTab==='islemler'){
    if(activeSubTab==='gelirler'){openModal('modal-gelir');return;}
    if(activeSubTab==='giderler'){openModal('modal-gider');return;}
    if(activeSubTab==='hizmet'){openModal('modal-hs-ekle');return;}
    if(activeSubTab==='borclar'){openEkBorc();return;}
  }
  openModal('modal-fab');
};

// ÖZLÜK
window.ozlukDuzenle=()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici düzenleyebilir.');
  const f=personelOzluk;
  ['adsoyad','tc','tel','adres','eposta','unvan','saat','banka','iban','sgk','saglik','acil','aciltel','notlar'].forEach(k=>{const e=document.getElementById('oz-'+k);if(e)e.value=f[k]||'';});
  ['dogum','giris'].forEach(k=>{const e=document.getElementById('oz-'+k);if(e)e.value=f[k]||'';});
  ['maas','maas-brut'].forEach(k=>{const e=document.getElementById('oz-'+k);if(e)e.value=f[k.replace('-','')]||'';});
  const s=document.getElementById('oz-sigorta');if(s)s.value=f.sigorta||'4/a (SSK)';
  openModal('modal-ozluk');
};
window.ozlukKaydet=async()=>{
  personelOzluk={adsoyad:document.getElementById('oz-adsoyad')?.value.trim()||'',tc:document.getElementById('oz-tc')?.value.trim()||'',dogum:document.getElementById('oz-dogum')?.value||'',tel:document.getElementById('oz-tel')?.value.trim()||'',adres:document.getElementById('oz-adres')?.value.trim()||'',eposta:document.getElementById('oz-eposta')?.value.trim()||'',unvan:document.getElementById('oz-unvan')?.value.trim()||'Personel',giris:document.getElementById('oz-giris')?.value||'',saat:document.getElementById('oz-saat')?.value.trim()||'',maas:document.getElementById('oz-maas')?.value||'',maasbrut:document.getElementById('oz-maas-brut')?.value||'',banka:document.getElementById('oz-banka')?.value.trim()||'',iban:document.getElementById('oz-iban')?.value.trim()||'',sgk:document.getElementById('oz-sgk')?.value.trim()||'',sigorta:document.getElementById('oz-sigorta')?.value||'4/a (SSK)',saglik:document.getElementById('oz-saglik')?.value.trim()||'',acil:document.getElementById('oz-acil')?.value.trim()||'',aciltel:document.getElementById('oz-acil-tel')?.value.trim()||'',notlar:document.getElementById('oz-notlar')?.value.trim()||''};
  try{await setDoc(doc(db,'personel','ozluk'),personelOzluk);}catch(e){}
  closeModal('modal-ozluk');renderOzluk();showToast('✓ Özlük bilgileri kaydedildi');
};
function renderOzluk(){
  const f=personelOzluk;const v=x=>x||'—';
  document.getElementById('personel-ad-label').textContent=f.adsoyad||'Personel Adı Girilmemiş';
  document.getElementById('personel-unvan-label').textContent=f.unvan||'Görev Girilmemiş';
  const fields={'ov-adsoyad':v(f.adsoyad),'ov-tc':v(f.tc),'ov-dogum':fmtTarih(f.dogum),'ov-tel':v(f.tel),'ov-adres':v(f.adres),'ov-eposta':v(f.eposta),'ov-unvan':v(f.unvan),'ov-giris':fmtTarih(f.giris),'ov-saat':v(f.saat),'ov-maas':fmtPara(f.maas),'ov-maas-brut':fmtPara(f.maasbrut),'ov-banka':v(f.banka),'ov-iban':v(f.iban),'ov-sgk':v(f.sgk),'ov-sigorta':v(f.sigorta),'ov-saglik':v(f.saglik),'ov-acil':v(f.acil),'ov-acil-tel':v(f.aciltel),'ov-notlar':v(f.notlar)};
  Object.entries(fields).forEach(([id,val])=>{const e=document.getElementById(id);if(e)e.textContent=val;});
  const btn=document.getElementById('ozluk-duzenle-btn');if(btn)btn.style.display=isAdmin()?'block':'none';
}
async function loadOzluk(){
  try{const s=await getDoc(doc(db,'personel','ozluk'));if(s.exists())personelOzluk={...personelOzluk,...s.data()};}catch(e){}
  renderOzluk();
}

// =====================================================
// EK BORÇLANDIRMA
// =====================================================
window.kaydetEkBorc=async()=>{
  if(!isAdmin())return showToast('Yalnızca yönetici ekleyebilir.');
  const aciklama=document.getElementById('eb-aciklama').value.trim();
  const tutar=parseFloat(document.getElementById('eb-tutar').value);
  const aylar=[...document.querySelectorAll('.eb-ay-cb:checked')].map(cb=>cb.value);
  const tumDaireler=document.getElementById('eb-tum').checked;
  const seciliDaireler=tumDaireler?[]:[...document.querySelectorAll('.eb-daire-cb:checked')].map(cb=>parseInt(cb.value));
  if(!aciklama)return showToast('Açıklama girin.');
  if(!tutar||isNaN(tutar))return showToast('Tutar girin.');
  if(!aylar.length)return showToast('En az bir ay seçin.');
  if(!tumDaireler&&!seciliDaireler.length)return showToast('Daire seçin veya Tüm Daireler seçeneğini işaretleyin.');
  const yeniBorclar=[];
  aylar.forEach(ay=>{
    if(tumDaireler){
      yeniBorclar.push({id:'eb'+Date.now()+Math.random(),aciklama,tutar,ay,tumDaireler:true,daireNo:null});
    } else {
      seciliDaireler.forEach(no=>{
        yeniBorclar.push({id:'eb'+Date.now()+Math.random(),aciklama,tutar,ay,tumDaireler:false,daireNo:no});
      });
    }
  });
  ekBorclar=[...ekBorclar,...yeniBorclar];
  try{await setDoc(doc(db,'ekborclar','liste'),{liste:ekBorclar});}
  catch(e){}
  closeModal('modal-eb');
  renderAll();
  renderEkBorclar();
  showToast('✓ Ek borç eklendi — '+yeniBorclar.length+' kayıt');
};

window.silEkBorc=async(id)=>{
  if(!confirm('Bu ek borcu silmek istediğinizden emin misiniz?'))return;
  ekBorclar=ekBorclar.filter(b=>b.id!==id);
  try{await setDoc(doc(db,'ekborclar','liste'),{liste:ekBorclar});}catch(e){}
  renderEkBorclar();
  renderAll();
  showToast('✓ Ek borç silindi');
};

window.ebTumDegistir=()=>{
  const tum=document.getElementById('eb-tum').checked;
  document.getElementById('eb-daire-secim').style.display=tum?'none':'block';
};

window.ebDaireTumSec=()=>document.querySelectorAll('.eb-daire-cb').forEach(cb=>cb.checked=true);
window.ebDaireTemizle=()=>document.querySelectorAll('.eb-daire-cb').forEach(cb=>cb.checked=false);

function renderEkBorclar(){
  const el=document.getElementById('eb-list');if(!el)return;
  if(!ekBorclar.length){
    el.innerHTML='<div class="empty-state"><i class="ti ti-receipt-off"></i><p>Henüz ek borç eklenmemiş</p></div>';
    return;
  }
  // Grupla: açıklama + ay'a göre
  const gruplar={};
  ekBorclar.forEach(b=>{
    const key=b.aciklama+'|'+b.ay;
    if(!gruplar[key])gruplar[key]={aciklama:b.aciklama,ay:b.ay,tutar:b.tutar,tumDaireler:b.tumDaireler,daireler:[],idler:[]};
    if(b.daireNo)gruplar[key].daireler.push(b.daireNo);
    gruplar[key].idler.push(b.id);
  });
  el.innerHTML=Object.values(gruplar).map(g=>`
    <div class="daire-item" style="flex-direction:column;align-items:stretch;gap:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:40px;height:40px;border-radius:10px;background:#fff3cd;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="ti ti-file-invoice" style="color:#b8860b;font-size:20px"></i>
        </div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:#1a1a1a">${g.aciklama}</div>
          <div style="font-size:12px;color:#888">${g.ay} · ${g.tumDaireler?'Tüm Daireler':g.daireler.length+' daire'} · ${fmt(g.tutar)}</div>
        </div>
        ${isAdmin()?`<button onclick="g.idler.forEach(id=>silEkBorc(id))" style="background:#fdecea;border:none;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer">
          <i class="ti ti-trash" style="color:#c0392b;font-size:15px"></i>
        </button>`:''}
      </div>
    </div>`).join('');
}

function renderEbDaireList(){
  const el=document.getElementById('eb-daire-list');if(!el)return;
  el.innerHTML=DAIRELER.map(d=>{
    const name=getDaire(d.no).sakin||getDaire(d.no).malik||'—';
    return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f4f1;cursor:pointer">'
      +'<input type="checkbox" class="eb-daire-cb" value="'+d.no+'" style="width:18px;height:18px;accent-color:#0d5c3a">'
      +'<span style="font-size:12px;font-weight:700;color:#0d5c3a;width:28px">'+d.no+'</span>'
      +'<span style="font-size:13px;color:#1a1a1a;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+name+'</span>'
      +'</label>';
  }).join('');
}

window.openEkBorc=()=>{
  renderEbDaireList();
  openModal('modal-eb');
};

// MODAL / TOAST
window.openModal=id=>document.getElementById(id)?.classList.add('open');
window.closeModal=id=>document.getElementById(id)?.classList.remove('open');
document.querySelectorAll('.modal-overlay').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});});
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

function initDaireSelect(){
  const sel=document.getElementById('g-daire');sel.innerHTML='<option value="">Seçiniz...</option>';
  DAIRELER.forEach(d=>{const dd=getDaire(d.no);const o=document.createElement('option');o.value=d.no;o.textContent=`${d.no} — ${dd.sakin||dd.malik||'Daire '+d.no}`;sel.appendChild(o);});
}
function setDefaultDates(){
  const t=today();
  ['g-tarih','gid-tarih','tg-tarih'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=t;});
  const ay=new Date().getMonth();
  ['g-donem','gid-donem'].forEach(id=>{const e=document.getElementById(id);if(e)e.selectedIndex=ay;});
}

// TOPLU GELİR MODAL AÇ
window.openTopluGelir=()=>{
  renderTopluDaireList();
  openModal('modal-toplu-gelir');
};

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}
