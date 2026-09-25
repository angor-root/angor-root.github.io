// Pase de página por gesto facial (cejas arriba / guiño), on-device con MediaPipe Face Landmarker.
// Uso: const g = await GestureTurner.create({ onGesture: (accion) => ... }); g.start(videoEl);
// Si existe window.pageTurner = { next(), prev() }, lo llama directamente.
// Script clásico (no módulo): así también carga desde file:///android_asset dentro de la WebView de la app,
// donde fetch() y los módulos ES no sirven. MediaPipe, su wasm y el modelo se leen con XHR y se pasan como blob.
(function () {
const BASE = document.currentScript.src.replace(/[^/]*$/, '');
const xhr = (url, type) => new Promise((ok, ko) => { const r = new XMLHttpRequest(); r.open('GET', url); r.responseType = type;
  r.onload = () => (r.status === 200 || r.status === 0) && r.response ? ok(r.response) : ko(new Error('XHR ' + url + ' ' + r.status));
  r.onerror = () => ko(new Error('XHR ' + url)); r.send(); });
const blobUrl = async (url, mime) => URL.createObjectURL(new Blob([await xhr(url, 'arraybuffer')], { type: mime }));
const KEY = 'gestos.calibracion.v1';

// Señales derivadas de los blendshapes. El guiño es asimétrico (L - R), así un parpadeo normal
// con ambos ojos se cancela y no dispara nada.
const SENALES = {
  cejas: b => (b.browInnerUp + b.browOuterUpLeft + b.browOuterUpRight) / 3,
  guinoIzq: b => b.eyeBlinkLeft - b.eyeBlinkRight,
  guinoDer: b => b.eyeBlinkRight - b.eyeBlinkLeft,
  ceno: b => (b.browDownLeft + b.browDownRight) / 2,     // fruncir el ceño (opuesto de levantar cejas)
};

const DEFAULTS = {
  fps: 15,                 // basta para gestos; ahorra batería
  holdMs: { cejas: 350, guinoIzq: 250, guinoDer: 250, ceno: 350 },
  refractoryMs: 1500,      // pausa tras cada pase
  mapa: { cejas: 'next', ceno: 'prev' },   // gesto -> acción (el guiño no le sale al usuario: desactivado)
  doble: false,            // acción de la doble levantada rápida de cejas: 'next' | 'prev' | false
  dobleVentanaMs: 1200,
  umbral: { cejas: 0.6, guinoIzq: 0.5, guinoDer: 0.5, ceno: 0.5 },   // conservadores hasta calibrar
};

const quantile = (xs, q) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : 0; };

class GestureTurner {
  static async create(opts = {}) {
    const V = BASE + 'vendor/package/';
    const { FaceLandmarker } = await import(await blobUrl(V + 'vision_bundle.mjs', 'text/javascript'));
    const fileset = { wasmLoaderPath: await blobUrl(V + 'wasm/vision_wasm_internal.js', 'text/javascript'),
                      wasmBinaryPath: await blobUrl(V + 'wasm/vision_wasm_internal.wasm', 'application/wasm') };
    const model = new Uint8Array(await xhr(BASE + 'vendor/face_landmarker.task', 'arraybuffer'));
    const lm = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetBuffer: model, delegate: 'GPU' },
      runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true,
    });
    return new GestureTurner(lm, opts);
  }

  constructor(lm, opts) {
    this.lm = lm;
    const g = GestureTurner.cargar();
    this.cfg = { ...DEFAULTS, ...opts, umbral: { ...DEFAULTS.umbral, ...(g.umbral || {}) }, holdMs: { ...DEFAULTS.holdMs, ...(g.holdMs || {}) },
                 mapa: { ...DEFAULTS.mapa, ...(g.mapa || {}) } };
    this.onGesture = opts.onGesture || (() => {});
    this.onFrame = opts.onFrame || (() => {});
    this.activoDesde = {}; this.ultimoPase = 0; this.grabando = null; this.corriendo = false;
    this.log = [];         // eventos para ajustar umbrales después (correcciones del usuario)
  }

  static cargar() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  guardar() { try { localStorage.setItem(KEY, JSON.stringify({ umbral: this.cfg.umbral, mapa: this.cfg.mapa, holdMs: this.cfg.holdMs })); } catch {} }

  async start(video) {
    this.video = video;
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 }, audio: false });
    await video.play();
    this.corriendo = true; this._loop();
  }
  stop() { this.corriendo = false; this.video?.srcObject?.getTracks().forEach(t => t.stop()); }

  _loop() {
    if (!this.corriendo) return;
    const t = performance.now();
    if (!this._t || t - this._t >= 1000 / this.cfg.fps) {
      this._t = t;
      const r = this.lm.detectForVideo(this.video, t);
      const cats = r.faceBlendshapes?.[0]?.categories;
      if (cats) {
        const b = Object.fromEntries(cats.map(c => [c.categoryName, c.score]));
        const s = Object.fromEntries(Object.entries(SENALES).map(([k, f]) => [k, f(b)]));
        if (this.grabando) this.grabando.push(s);
        this._decidir(s, t);
        this.onFrame(s, true);
      } else { this.activoDesde = {}; this.onFrame(null, false); }
    }
    setTimeout(() => this._loop(), 1000 / this.cfg.fps / 2);
  }

  _disparar(gesto, accion, valor, t) {
    this.ultimoPase = t; this.activoDesde = {}; this.blips = [];
    this.log.push({ t: Date.now(), gesto, accion, valor: +valor.toFixed(3) });
    window.pageTurner?.[accion]?.();
    this.onGesture(accion, gesto);
  }

  _decidir(s, t) {
    if (this.grabando) return;
    // Doble levantada: dos subidas cortas de cejas (más breves que el sostén que da 'siguiente') dentro de la ventana.
    if (this.cfg.doble) {
      const arriba = s.cejas > this.cfg.umbral.cejas;
      if (arriba && this._blipDesde == null) this._blipDesde = t;
      if (!arriba && this._blipDesde != null) {
        const dur = t - this._blipDesde; this._blipDesde = null;
        if (dur >= 60 && dur < this.cfg.holdMs.cejas) {
          this.blips = (this.blips || []).filter(b => t - b < this.cfg.dobleVentanaMs); this.blips.push(t);
          if (this.blips.length >= 2 && t - this.ultimoPase >= this.cfg.refractoryMs) return this._disparar('doble', this.cfg.doble, s.cejas, t);
        }
      }
    }
    if (t - this.ultimoPase < this.cfg.refractoryMs) return;
    for (const [gesto, accion] of Object.entries(this.cfg.mapa)) {
      if (!accion) continue;
      if (s[gesto] > this.cfg.umbral[gesto]) {
        this.activoDesde[gesto] ??= t;
        if (t - this.activoDesde[gesto] >= this.cfg.holdMs[gesto]) return this._disparar(gesto, accion, s[gesto], t);
      } else delete this.activoDesde[gesto];
    }
  }

  // Calibración en dos fases: (1) tocar normal, (2) hacer el gesto varias veces.
  // Umbral = punto medio entre el p99 del reposo y la mediana de los picos del gesto.
  async grabar(ms) { this.grabando = []; await new Promise(r => setTimeout(r, ms)); const g = this.grabando; this.grabando = null; return g; }

  calibrar(reposo, gesto, nombre) {
    const base = quantile(reposo.map(s => s[nombre]), 0.99);
    // picos: máximos locales del gesto por encima de la mitad del rango
    const xs = gesto.map(s => s[nombre]); const top = quantile(xs, 0.9);
    const picos = xs.filter((x, i) => x >= Math.max(xs[i - 1] ?? 0, xs[i + 1] ?? 0) && x > (base + top) / 2);
    const pico = quantile(picos.length ? picos : xs, 0.5);
    const umbral = (base + pico) / 2;
    this.cfg.umbral[nombre] = umbral; this.guardar();
    return { base, pico, umbral, margen: pico - base, separable: pico - base > 0.15 };
  }
}
window.GestureTurner = GestureTurner; window.SENALES = SENALES;
})();
