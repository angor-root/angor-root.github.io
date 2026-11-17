// Instalador (APK): Himnarios.apk al lado de sitio.js (en la raíz del sitio, para las páginas en español y en inglés).
const APK = new URL("Himnarios.apk", document.currentScript.src).href;

document.documentElement.classList.add("js");

if (APK) {
  document.querySelectorAll("[data-apk]").forEach(a => { a.href = APK; a.hidden = false; });
  document.querySelectorAll("[data-pronto]").forEach(p => { p.hidden = true; });
}

// Aparición suave de cada sección, una sola vez.
const io = "IntersectionObserver" in window && new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } });
}, { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".aparece").forEach(el => io ? io.observe(el) : el.classList.add("visto"));


// Registro en Supabase (solo inserta; la clave publicable es pública). Sirve a los dos formularios; true solo si res.ok.
const SB = "https://vxussjdcoxxyfwgokymx.supabase.co", KEY = "sb_publishable_AguKdXeAnjw2v4qSYFjxBg_VXJftrBc";
async function enviar(f) {
  const d = new FormData(f), tipo = f.dataset.tipo;
  const respuestas = tipo == "ios" ? { contribuir: d.get("contribuir"), facilitar: d.getAll("facilitar"), comentario: d.get("comentario").trim() } : null;
  try {
    const res = await fetch(SB + "/rest/v1/web_registros", {
      method: "POST",
      headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ tipo, nombre: d.get("nombre").trim(), correo: d.get("correo").trim(), idioma: document.documentElement.lang, respuestas })
    });
    return res.ok;
  } catch { return false; }
}

// Descarga: aviso y registro antes del APK, una sola vez por navegador.
const dlg = document.getElementById("aviso"), MARCA = "himnarios-registrado";
let yaRegistrado = false;
try { yaRegistrado = !!localStorage.getItem(MARCA); } catch {}
document.querySelectorAll("[data-apk]").forEach(a => a.addEventListener("click", e => {
  if (yaRegistrado || !dlg || !dlg.showModal) return;
  e.preventDefault();
  dlg.showModal();
}));
document.querySelectorAll("[data-cerrar]").forEach(b => b.addEventListener("click", () => dlg.close()));

document.querySelectorAll("form[data-tipo]").forEach(f => f.addEventListener("submit", async e => {
  e.preventDefault();
  const boton = f.querySelector("[type=submit]");
  boton.disabled = true;
  const ok = await enviar(f);
  if (f.dataset.tipo == "descarga") {
    if (ok) try { localStorage.setItem(MARCA, "1"); yaRegistrado = true; } catch {}
    dlg.close();
    location.href = APK; // no se bloquea al usuario aunque falle la red
  } else if (ok) {
    f.replaceChildren(f.querySelector("[data-ok]"));
    f.querySelector("[data-ok]").hidden = false;
  } else {
    const d = new FormData(f);
    const cuerpo = [d.get("contribuir"), d.getAll("facilitar").join(", "), d.get("comentario"), d.get("nombre"), d.get("correo")].filter(Boolean).join("\n");
    f.querySelector("[data-mailto]").href = "mailto:calebchurata@gmail.com?subject=" + encodeURIComponent(f.dataset.asunto) + "&body=" + encodeURIComponent(cuerpo);
    f.querySelector("[data-fallo]").hidden = false;
    boton.disabled = false;
  }
}));

// Formulario de iOS por pasos (sin JS se ve completo). Cada paso nuevo compacta los anteriores.
const ios = document.querySelector("form[data-tipo=ios]");
if (ios) {
  const paso = n => ios.querySelector(`[data-paso="${n}"]`);
  const ver = n => { const p = paso(n); if (p.classList.contains("ver")) return; p.classList.add("ver"); if (n > 1) paso(n - 1).classList.add("hecho"); };
  const empezar = ios.querySelector(".empezar");
  empezar.hidden = false;
  empezar.addEventListener("click", () => { empezar.hidden = true; ver(1); paso(1).querySelector("input").focus(); });
  ios.classList.add("pasos-js");
  paso(1).addEventListener("change", () => ver(2));
  ios.querySelector(".sigue").addEventListener("click", () => { ver(3); paso(3).querySelector("textarea").focus(); });
}

// Si la URL llega con #faq-ios, abrir esa pregunta.
function abrirFaq() { if (location.hash == "#faq-ios") document.getElementById("faq-ios").open = true; }
if (document.getElementById("faq-ios")) { addEventListener("hashchange", abrirFaq); abrirFaq(); }
