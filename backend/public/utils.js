function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
function fmtDate(d){ try{ return new Date(d).toLocaleString(); } catch(e){ return d; } }
function waLink(phone, text) {
  const p = String(phone || '').replace(/\D/g,'') || (window.APP_CONFIG?.whatsappFallback || '');
  const t = encodeURIComponent(text || '');
  return `https://wa.me/${p}?text=${t}`;
}
