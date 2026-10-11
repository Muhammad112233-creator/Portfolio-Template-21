/* i18n.js — EN/ES dictionary + live switch (all copy written for this project) */
(function () {
  "use strict";
  const AM = window.AM;

  const DICT = {
    en: {
      "skip": "Skip to main content",
      "boot.loading": "LOADING MODULES",
      "boot.skip": "[·skip·]",
      "nav.about": "ABOUT", "nav.work": "WORK", "nav.photo": "PHOTO",
      "nav.illo": "ILLUSTRATION", "nav.contact": "CONTACT",
      "top.sound": "SOUND",
      "hero.role": "CREATIVE DEVELOPER & DESIGNER",
      "hero.kicker": "·SYSTEM ONLINE · PORTFOLIO TRANSMISSION ·",
      "hero.cta1": "[·OpenToWork·]",
      "hero.cta2": "[·see·my·work·]",
      "hero.howto": "[ · HOW TO NAVIGATE · ]",
      "hero.howto1": "TOP MENU", "hero.howto1b": "jump to any section",
      "hero.howto2": "SCROLL", "hero.howto2b": "explore in sequence",
      "hero.howto3": "see my work →", "hero.howto3b": "curated entry point",
      "hero.howto4": "SOUND", "hero.howto4b": "mute / unmute top right",
      "hero.howto5": "LANGUAGE", "hero.howto5b": "switch EN / ES top right",
      "hero.howtoFoot": "choose your path ·",
      "hero.scroll": "[ · Scroll to explore · ]",
      "about.tag": "[ · w h o · ]",
      "about.title": "·Hello!  I'm  Alex  Marlowe·",
      "about.p1": "Creative developer & designer, based in Oslo, Norway. I build expressive websites, brand systems and moving images — always starting from the same question: what should this make people feel?",
      "about.p2": "My practice sits where design systems meet storytelling: from information architecture and UX flows to typography, motion and full front-end builds. One idea, translated coherently across every medium it touches.",
      "about.avail": "Available for freelance — 2026",
      "about.p3": "Right now I take a small number of independent projects, helping teams ship interfaces that are clear, fast and a little strange — in the good way.",
      "about.quote": "\"Styles come and go. Good design is a language, not a style.\"",
      "about.quoteBy": "— Massimo Vignelli",
      "about.stats": "10+ years · 60+ projects · Oslo → Worldwide",
      "about.p4": "Work should age like good code: readable, honest and easy to refactor. I test everything on real screens, real thumbs and real bad connections — delight that only works on a demo laptop is not delight.",
      "about.p5": "This entire site is hand-built with HTML · CSS · JS. Every image in the archive is generated from a seed — the whole archive is code.",
      "about.mastering": "Your Brand's Signal",
      "about.dnaTitle": "·Let's find  what sets  your brand  apart·",
      "about.dna1": "Every project starts with listening. Before grids and gradients there is a conversation — what you make, who it serves, and why anyone should care. That answer becomes the signal; everything else is amplification.",
      "about.dna2": "From there I design the language your signal speaks: identity, interface, photography, motion. Coherent on a billboard, on a phone, or inside a terminal window.",
      "about.dnaCta": "Let's work together",
      "about.dna3": "Evidence below: the courses that sharpened the tools, followed by the work that puts them to use.",
      "certs.hint": "· click to enlarge ·",
      "certs.prev": "Prev", "certs.next": "Next",
      "work.p1": "A selection of commissioned and self-initiated projects, sorted by discipline. Pick a channel below — each row opens a preview inside the viewing frame.",
      "work.identity": "Identity", "work.editorial": "Editorial", "work.web": "Web",
      "work.thProject": "Project", "work.thScope": "Scope", "work.thTools": "Tools", "work.thYear": "Year",
      "work.idle": "[ · Select a discipline to begin · ]",
      "work.idleHint": "click any row to render its preview",
      "work.voidTitle": "THE FILE WAS EATEN BY A BLACK HOLE",
      "work.voidSub": "· SIGNAL LOST · ERR 404 ·",
      "work.voidNote": "Some archives never made it back from the migration. The robot is looking.",
      "photo.p1": "Photography keeps my composition honest. This archive travels from Nordic backyards to anywhere with a boarding pass — every frame filed with its camera metadata.",
      "photo.p1b": "Open a chapter, then select a title to preview the frame.",
      "photo.idle": "[ · awaiting selection · ]",
      "photo.mLoc": "LOC", "photo.mCam": "CAM", "photo.mLens": "LENS", "photo.mYear": "YEAR",
      "photo.frames": "frames",
      "pol.note": "A growing stack of travel polaroids pulled from the archive. When the stack reaches 100 prints, it becomes a small photobook.",
      "pol.hint": "use the arrows [<<<] [>>>] to navigate the photos · click the one you like to full view",
      "reveal.label": "[ · H O V E R  T O  R E V E A L  T H E  P H O T O · ]",
      "illo.title": "·Illustration Archive·",
      "illo.p1": "Personal work and commissions: digital painting, ink, cut paper and gold that never shipped as a commission. Twelve pieces — contact sheet first, holo-cube after.",
      "illo.click": "[·click|to|enter·the|cube·]",
      "cube.sub": "of twelve unruly drawings",
      "cube.howto": "[ · HOW TO EXPLORE · ]",
      "cube.h1": "navigate illustrations",
      "cube.h2": "click ENTER", "cube.h2b": "to start the journey",
      "cube.h3": "click -BACK/NEXT", "cube.h3b": "to rotate the cube",
      "cube.h4": "click THE IMAGE", "cube.h4b": "to expanded view",
      "cube.enter": "Enter", "cube.back": "Back", "cube.next": "Next",
      "contact.title": "·Let's get in touch!·",
      "ct.route": "OSLO ▸ WORLDWIDE",
      "ct.hold": "HOLD TO VERIFY HUMAN",
      "ct.unverified": "UNVERIFIED",
      "ct.verified": "✓ HUMAN",
      "ct.send": "send",
      "ct.demo": "· form runs in demo mode — plug your endpoint into js/contact.js ·",
      "ct.sent": "MESSAGE SENT",
      "ct.sentSub": "Thanks — I'll get back to you within 48h.",
      "ct.again": "send another",
      "ct.reply": "avg. reply — 24h",
      "foot.scroll": "scroll", "foot.here": "here",
      "foot.made": "built by hand with HTML · CSS · JS",
      "foot.noai": "every pixel generated, no photographs were harmed"
    },
    es: {
      "skip": "Saltar al contenido principal",
      "boot.loading": "CARGANDO MÓDULOS",
      "boot.skip": "[·saltar·]",
      "nav.about": "SOBRE MÍ", "nav.work": "TRABAJO", "nav.photo": "FOTO",
      "nav.illo": "ILUSTRACIÓN", "nav.contact": "CONTACTO",
      "top.sound": "SONIDO",
      "hero.role": "DESARROLLADOR CREATIVO & DISEÑADOR",
      "hero.kicker": "·SISTEMA EN LÍNEA · TRANSMISIÓN DE PORTAFOLIO ·",
      "hero.cta1": "[·Disponible·]",
      "hero.cta2": "[·ver·mi·trabajo·]",
      "hero.howto": "[ · CÓMO NAVEGAR · ]",
      "hero.howto1": "MENÚ SUPERIOR", "hero.howto1b": "salta a cualquier sección",
      "hero.howto2": "SCROLL", "hero.howto2b": "explora las secciones en secuencia",
      "hero.howto3": "ver mi trabajo →", "hero.howto3b": "punto de entrada",
      "hero.howto4": "SONIDO", "hero.howto4b": "silenciar / activar arriba",
      "hero.howto5": "IDIOMA", "hero.howto5b": "cambia EN / ES arriba",
      "hero.howtoFoot": "elige tu camino ·",
      "hero.scroll": "[ · Desplázate para explorar · ]",
      "about.tag": "[ · q u i é n · ]",
      "about.title": "·Hola!  Soy  Alex  Marlowe·",
      "about.p1": "Desarrollador creativo y diseñador, con base en Oslo, Noruega. Construyo sitios web expresivos, sistemas de marca e imágenes en movimiento — siempre partiendo de la misma pregunta: ¿qué debería hacer sentir esto?",
      "about.p2": "Mi práctica vive donde los sistemas de diseño se encuentran con el relato: desde arquitectura de información y flujos UX hasta tipografía, motion y desarrollo front-end completo. Una idea, traducida con coherencia a cada medio que toca.",
      "about.avail": "Disponible para freelance — 2026",
      "about.p3": "Ahora mismo acepto pocos proyectos independientes, ayudando a equipos a lanzar interfaces claras, rápidas y un poco extrañas — en el buen sentido.",
      "about.quote": "\"Los estilos van y vienen. El buen diseño es un lenguaje, no un estilo.\"",
      "about.quoteBy": "— Massimo Vignelli",
      "about.stats": "10+ años · 60+ proyectos · Oslo → Todo el mundo",
      "about.p4": "El trabajo debería envejecer como el buen código: legible, honesto y fácil de refactorizar. Pruebo todo en pantallas reales, pulgares reales y conexiones malas de verdad — el deleite que solo funciona en un portátil de demo no es deleite.",
      "about.p5": "Todo este sitio está hecho a mano con HTML · CSS · JS. Cada imagen del archivo se genera desde una semilla — el archivo entero es código.",
      "about.mastering": "La Señal de tu Marca",
      "about.dnaTitle": "·Descubramos  lo que hace  única  a tu marca·",
      "about.dna1": "Todo proyecto empieza escuchando. Antes de las retículas y los degradados hay una conversación — qué haces, a quién sirve y por qué debería importarle a alguien. Esa respuesta es la señal; todo lo demás es amplificación.",
      "about.dna2": "A partir de ahí diseño el lenguaje que habla tu señal: identidad, interfaz, fotografía, motion. Coherente en una valla, en un móvil o dentro de una terminal.",
      "about.dnaCta": "Trabajemos juntos",
      "about.dna3": "La evidencia está abajo: los cursos que afilaron las herramientas, seguidos del trabajo que las pone en uso.",
      "certs.hint": "· clic para ampliar ·",
      "certs.prev": "Ant.", "certs.next": "Sig.",
      "work.p1": "Una selección de proyectos por encargo y autoiniciados, ordenados por disciplina. Elige un canal abajo — cada fila abre una vista previa en el marco de visualización.",
      "work.identity": "Identidad", "work.editorial": "Editorial", "work.web": "Web",
      "work.thProject": "Proyecto", "work.thScope": "Alcance", "work.thTools": "Herram.", "work.thYear": "Año",
      "work.idle": "[ · Selecciona una disciplina para empezar · ]",
      "work.idleHint": "clic en cualquier fila para ver su vista previa",
      "work.voidTitle": "EL ARCHIVO SE LO TRAGÓ UN AGUJERO NEGRO",
      "work.voidSub": "· SEÑAL PERDIDA · ERR 404 ·",
      "work.voidNote": "Algunos archivos nunca volvieron de la migración. El robot está buscando.",
      "photo.p1": "La fotografía mantiene honesta mi composición. Este archivo viaja desde patios nórdicos hasta cualquier lugar con tarjeta de embarque — cada fotograma archivado con sus metadatos de cámara.",
      "photo.p1b": "Abre un capítulo y selecciona un título para ver el fotograma.",
      "photo.idle": "[ · esperando selección · ]",
      "photo.mLoc": "LUG", "photo.mCam": "CÁM", "photo.mLens": "OBJ", "photo.mYear": "AÑO",
      "photo.frames": "fotogramas",
      "pol.note": "Una pila creciente de polaroids de viaje sacadas del archivo. Cuando la pila llegue a 100 copias, se convertirá en un pequeño fotolibro.",
      "pol.hint": "usa las flechas [<<<] [>>>] para navegar · clic en la que te guste para verla completa",
      "reveal.label": "[ · P A S A  E L  C U R S O R  P A R A  R E V E L A R · ]",
      "illo.title": "·Archivo de Ilustración·",
      "illo.p1": "Obra personal y encargos: pintura digital, tinta, papel recortado y oro que nunca salió como encargo. Doce piezas — primero la hoja de contactos, después el holo-cubo.",
      "illo.click": "[·clic|para|entrar·al|cubo·]",
      "cube.sub": "de doce dibujos indisciplinados",
      "cube.howto": "[ · CÓMO EXPLORAR · ]",
      "cube.h1": "navega las ilustraciones",
      "cube.h2": "clic ENTER", "cube.h2b": "para iniciar el viaje",
      "cube.h3": "clic -ATRÁS/SIGUIENTE", "cube.h3b": "para girar el cubo",
      "cube.h4": "clic LA IMAGEN", "cube.h4b": "para vista ampliada",
      "cube.enter": "Entrar", "cube.back": "Atrás", "cube.next": "Siguiente",
      "contact.title": "·Hablemos!",
      "ct.route": "OSLO ▸ TODO EL MUNDO",
      "ct.hold": "MANTÉN PARA VERIFICAR HUMANO",
      "ct.unverified": "SIN VERIFICAR",
      "ct.verified": "✓ HUMANO",
      "ct.send": "enviar",
      "ct.demo": "· el formulario funciona en modo demo — conecta tu endpoint en js/contact.js ·",
      "ct.sent": "MENSAJE ENVIADO",
      "ct.sentSub": "Gracias — respondo en menos de 48h.",
      "ct.again": "enviar otro",
      "ct.reply": "respuesta media — 24h",
      "foot.scroll": "subir", "foot.here": "aquí",
      "foot.made": "hecho a mano con HTML · CSS · JS",
      "foot.noai": "cada píxel generado, ninguna fotografía sufrió daños"
    }
  };

  let lang = localStorage.getItem("am-lang") || "en";

  function apply(l) {
    lang = DICT[l] ? l : "en";
    localStorage.setItem("am-lang", lang);
    document.documentElement.lang = lang;
    const d = DICT[lang];
    AM.qsa("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (d[k] != null) { el.textContent = d[k]; el.dataset.origText = d[k]; }
    });
    AM.qsa("[data-i18n-scramble]").forEach((el) => {
      const k = el.getAttribute("data-i18n-scramble");
      if (d[k] == null) return;
      const target = el.classList.contains("glitch-stack") ? el.querySelector("[data-scramble-in]") || el : el;
      target.textContent = d[k];
      target.dataset.scrambled = "done";
      if (el.classList.contains("glitch-stack")) el.setAttribute("data-text", d[k]);
    });
    AM.qsa(".lang-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
    /* refresh special copy */
    const vs = AM.qs("#verify-state");
    if (vs && AM.qs("#ct-verify").classList.contains("is-verified")) vs.textContent = d["ct.verified"];
    document.dispatchEvent(new CustomEvent("am:lang", { detail: { lang } }));
  }

  AM.i18n = {
    get lang() { return lang; },
    t: (k) => (DICT[lang] && DICT[lang][k]) || DICT.en[k] || k,
    set: apply
  };

  document.addEventListener("DOMContentLoaded", () => apply(lang));
})();
