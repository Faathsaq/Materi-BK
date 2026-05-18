import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import imgBg1998 from "./assets/bg1998.jpg";
import imgBgKomnas from "./assets/bgng1998.jpg";
import splash1 from "./assets/splash1.jpeg";
import splash2 from "./assets/splash2.jpg";
import splash3 from "./assets/splash3.jpg";
import hero from "./assets/hero.jpeg";
import bgMusic from "./assets/music.mp3";
import vinylImg from "./assets/World_Records_Vinyl-10.jpg";

gsap.registerPlugin(ScrollTrigger);

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@400;500;700&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; overflow-x:hidden; }
  body { background:#0D0B09; overflow-x:hidden; }

  @media (max-width:640px) { .nav-links-desktop{display:none!important} .hamburger-btn{display:flex!important} }
  @media (min-width:641px) { .hamburger-btn{display:none!important} }
  @media (max-width:768px) {
    .img-grid{grid-template-columns:1fr!important}
  }
  @media (max-width:480px) {
    .data-grid{grid-template-columns:1fr 1fr!important}
    .anggota-flex{flex-direction:column!important;align-items:stretch!important}
  }

  .mobile-menu-overlay {
    position:fixed;inset:0;z-index:200;background:rgba(13,11,9,.98);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;
  }
  .mobile-menu-overlay a {
    font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,8vw,2.8rem);
    letter-spacing:3px;color:#EDE0C4;text-decoration:none;transition:color .2s;
  }
  .mobile-menu-overlay a:hover { color:#C8972A; }

  .anggota-card {
    display:flex; align-items:center; gap:10px;
    background:#1F1A14; border:1px solid rgba(200,151,42,.2);
    border-radius:50px; padding:8px 20px 8px 10px;
    cursor:default; transition:background .3s,border-color .3s;
    flex:1 1 200px; max-width:320px;
  }

  @keyframes shimmer {
    0%   { transform:translateX(-100%) skewX(-15deg); }
    100% { transform:translateX(300%) skewX(-15deg); }
  }
  @keyframes glowPulse {
    0%,100% { text-shadow:none; }
    50%     { text-shadow:0 0 20px rgba(200,151,42,.6),0 0 40px rgba(200,151,42,.3); }
  }
  .glow-done { animation:glowPulse 1.2s ease-in-out 2; }
`;
document.head.appendChild(globalStyle);

const IMAGES = { splash1, splash2, splash3, hero, bg1998: imgBg1998, bgkomnas: imgBgKomnas };

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}


function MusicPlayer() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const rotRef = useRef(0);
  const lastTRef = useRef(null);
  const imgRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/src/assets/World_Records_Vinyl-10.jpg"; 
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
  }, []);

function drawVinyl(angle, prog) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 240, H = 240;
    ctx.clearRect(0, 0, W, H);

    const vx = 85, vy = 115, vr = 68;
    ctx.save();
    ctx.translate(vx, vy);
    ctx.rotate(angle);

    ctx.beginPath(); ctx.arc(0, 0, vr, 0, Math.PI * 2); ctx.clip();

    if (imgRef.current) {
      const img = imgRef.current;
      const iw = img.width, ih = img.height;
      const cropSize = Math.min(iw, ih) * 0.68;
      const cx = iw * 0.5 - cropSize / 2;
      const cy = ih * 0.52 - cropSize / 2;
      ctx.drawImage(img, cx, cy, cropSize, cropSize, -vr, -vr, vr * 2, vr * 2);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, vr, 0, Math.PI * 2);
      ctx.fillStyle = "#111009"; ctx.fill();
      for (let i = 0; i < 30; i++) {
        const gr = 12 + i * 1.5;
        ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? "#1f1a12" : "#2a2218";
        ctx.lineWidth = 0.9; ctx.stroke();
      }
    }

    ctx.restore();

    ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200,151,42,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();

    const arcR = vr + 8;
    const startA = -Math.PI / 2;
    const endA = startA + (prog / 100) * Math.PI * 2;

    ctx.beginPath(); ctx.arc(vx, vy, arcR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200,151,42,0.15)"; ctx.lineWidth = 3; ctx.stroke();

    if (prog > 0) {
      ctx.beginPath(); ctx.arc(vx, vy, arcR, startA, endA);
      ctx.strokeStyle = "#C8972A"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
    }

    const dotX = vx + arcR * Math.cos(endA);
    const dotY = vy + arcR * Math.sin(endA);
    ctx.beginPath(); ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#C8972A"; ctx.fill();
    ctx.beginPath(); ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#EDE0C4"; ctx.fill();

    const px = 195, py = 35;
    const toneAngle = playing ? 0.52 : -0.15;
    const armLen = 95;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(toneAngle);

    ctx.beginPath();
    ctx.rect(-6, -22, 12, 18);
    ctx.fillStyle = "#4a4540"; ctx.fill();
    ctx.strokeStyle = "rgba(200,151,42,0.3)"; ctx.lineWidth = 0.8; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(0, armLen);
    ctx.strokeStyle = "#8a8078"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-0.8, -8); ctx.lineTo(-0.8, armLen);
    ctx.strokeStyle = "rgba(255,240,200,0.2)"; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, armLen); ctx.lineTo(-8, armLen + 14); ctx.lineTo(-10, armLen + 22);
    ctx.strokeStyle = "#6a6058"; ctx.lineWidth = 3; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, armLen + 22); ctx.lineTo(-10, armLen + 28);
    ctx.strokeStyle = "#C8972A"; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#3a3530"; ctx.fill();
    ctx.strokeStyle = "rgba(200,151,42,0.5)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#C8972A"; ctx.fill();

    ctx.restore();
  }

  useEffect(() => {
    const tick = (t) => {
      if (!lastTRef.current) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      if (playing) rotRef.current += dt * (Math.PI * 2 / 3.5);
      const audio = audioRef.current;
      const prog = audio?.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      drawVinyl(rotRef.current, prog);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, imgLoaded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    audio.loop = true;
    audio.play().then(() => setPlaying(true)).catch(() => {});
    return () => audio.pause();
  }, []);

  const togglePlay = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 200 / rect.width;
    const scaleY = 200 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const dx = mx - 72, dy = my - 100;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const audio = audioRef.current;

    if (dist > 68 && dist < 82) {
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (audio?.duration) audio.currentTime = (norm / (Math.PI * 2)) * audio.duration;
      return;
    }

    if (dist <= 68) {
      if (playing) { audio.pause(); setPlaying(false); }
      else { audio.play(); setPlaying(true); }
    }
  };
  const [started, setStarted] = useState(false);

if (!started) return (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ delay: 1.5 }}
    onClick={() => {
      setStarted(true);
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    }}
    style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 150,
      width: "160px", height: "160px", borderRadius: "50%",
      background: "rgba(22,19,16,0.85)", border: "1px solid rgba(200,151,42,.4)",
      display: "flex", flexDirection: "column", alignItems: "center", 
      justifyContent: "center", cursor: "pointer",
      WebkitTapHighlightColor: "transparent" }}>
    <audio ref={audioRef} src={bgMusic} loop preload="auto" />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#C8972A"><polygon points="5,3 19,12 5,21"/></svg>
    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", 
      color: "#C8972A", letterSpacing: "2px", marginTop: "6px" }}>TAP TO PLAY</span>
  </motion.div>
);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 150 }}
    >
      <audio ref={audioRef} src={bgMusic} loop preload="auto" />
      <div
        onClick={togglePlay}
        style={{ position: "relative", width: "140px", height: "140px", cursor: "pointer",  WebkitTapHighlightColor: "transparent" }}
      >
<canvas
  ref={canvasRef}
  width={240} height={240}
  style={{ width: "160px", height: "160px", display: "block" }}
/>
      </div>
    </motion.div>
  );
}

/* ════════════ SPLASH ════════════ */
function SplashScreen({ onComplete }) {
  const splashRef = useRef(null), slide1 = useRef(null), slide2 = useRef(null), slide3 = useRef(null);
  const textRef = useRef(null), yearRef = useRef(null), barRef = useRef(null);
  useEffect(() => {
    const tl = gsap.timeline({ onComplete });
    tl.fromTo(slide1.current, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power2.out" })
      .to(slide1.current, { scale: 1.06, duration: 1.8, ease: "power1.inOut" }, "<")
      .to(barRef.current, { width: "33%", duration: 1.5, ease: "power2.inOut" }, "<0.3")
      .to(slide1.current, { opacity: 0, duration: 0.5 })
      .fromTo(slide2.current, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" })
      .to(slide2.current, { scale: 1.06, duration: 1.6, ease: "power1.inOut" }, "<")
      .to(barRef.current, { width: "66%", duration: 1.5, ease: "power2.inOut" }, "<0.3")
      .to(slide2.current, { opacity: 0, duration: 0.5 })
      .fromTo(slide3.current, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" })
      .to(slide3.current, { scale: 1.06, duration: 1.5, ease: "power1.inOut" }, "<")
      .to(barRef.current, { width: "100%", duration: 1.5, ease: "power2.inOut" }, "<0.3")
      .fromTo(textRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=1.8")
      .fromTo(yearRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.5")
      .to(splashRef.current, { yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.8 });
  }, []);
  return (
    <div ref={splashRef} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#0D0B09", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[{ ref: slide1, src: IMAGES.splash1 }, { ref: slide2, src: IMAGES.splash2 }, { ref: slide3, src: IMAGES.splash3 }].map(({ ref, src }, i) => (
        <div key={i} ref={ref} style={{ position: "absolute", inset: 0, opacity: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(13,11,9,0.72)" }} />
        </div>
      ))}
      <div ref={textRef} style={{ position: "relative", textAlign: "center", padding: "0 1.5rem", opacity: 0, maxWidth: "90vw" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(8px,2vw,11px)", letterSpacing: "clamp(3px,1vw,6px)", textTransform: "uppercase", color: "#C8972A", marginBottom: "1.5rem", opacity: 0.8, fontWeight: 700 }}>28 Tahun Menunggu Keadilan</p>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2rem,8vw,6rem)", fontWeight: 400, color: "#F5EDD8", lineHeight: 1.0, marginBottom: "1rem", letterSpacing: "clamp(2px,1vw,4px)" }}>Suara Yang Tak Terdengar</h1>
        <p ref={yearRef} style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.8rem,2vw,1rem)", fontWeight: 500, color: "#9A8A72", opacity: 0 }}>Kekerasan Seksual di Era Reformasi Indonesia</p>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(200,151,42,0.15)" }}>
        <div ref={barRef} style={{ height: "100%", width: "0%", background: "linear-gradient(90deg,#C8972A,#8B2E2E)" }} />
      </div>
    </div>
  );
}

/* ════════════ NAV ════════════ */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [["#latar", "Latar"], ["#data", "Data"], ["#timeline", "Timeline"], ["#tantangan", "Tantangan"], ["#refleksi", "Refleksi"]];
  return (
    <>
      <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "clamp(.6rem,2vw,.85rem) clamp(1rem,4vw,2rem)", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrolled ? "rgba(13,11,9,0.97)" : "transparent", borderBottom: scrolled ? "1px solid rgba(200,151,42,.2)" : "none", backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all .4s" }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#C8972A", fontSize: "clamp(.8rem,2vw,1.1rem)", letterSpacing: "2px" }}>Suara Yang Tak Terdengar</span>
        <ul className="nav-links-desktop" style={{ display: "flex", gap: "1.5rem", listStyle: "none" }}>
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".65rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, color: "#5C5040", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = "#C8972A"} onMouseLeave={e => e.target.style.color = "#5C5040"}>{label}</a>
            </li>
          ))}
        </ul>
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "4px" }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: "22px", height: "2px", background: "#C8972A", borderRadius: "2px" }} />)}
        </button>
      </motion.nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "#C8972A", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
            {links.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════════ HERO ════════════ */
function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(".hero-eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
      .fromTo(".hero-h1 .line", { opacity: 0, y: 60, skewY: 4 }, { opacity: 1, y: 0, skewY: 0, duration: 1, stagger: 0.18, ease: "power4.out" }, "-=0.3")
      .fromTo(".hero-sub", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.4")
      .fromTo(".hero-note", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3")
      .fromTo(".hero-scroll-cue", { opacity: 0 }, { opacity: 0.45, duration: 0.8 }, "-=0.2");
  }, []);
  return (
    <section ref={heroRef} id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", width: "100%", maxWidth: "100vw" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <motion.div style={{ position: "absolute", top: "-20%", left: "-5%", right: "-5%", bottom: "-20%", y }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${IMAGES.hero})`, backgroundSize: "cover", backgroundPosition: "center 30%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(13,11,9,.55) 0%,rgba(13,11,9,.85) 60%,#0D0B09 100%)" }} />
        </motion.div>
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,151,42,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(200,151,42,.035) 1px,transparent 1px)", backgroundSize: "80px 80px", zIndex: 1 }} />
      <div style={{ position: "absolute", top: "25%", left: "10%", width: "min(500px,55vw)", height: "min(500px,55vw)", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,46,46,.35) 0%,transparent 70%)", filter: "blur(60px)", zIndex: 1, pointerEvents: "none" }} />
      <motion.div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "min(860px,90vw)", padding: "clamp(5rem,10vh,7rem) clamp(1rem,4vw,2rem) clamp(4rem,8vh,6rem)", opacity }}>
        <p className="hero-eyebrow" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(7px,1.5vw,9px)", letterSpacing: "clamp(3px,1vw,5px)", textTransform: "uppercase", color: "#C8972A", marginBottom: "clamp(1rem,3vw,2rem)", opacity: 0, fontWeight: 700 }}>Dokumentasi · Edukasi · Keadilan</p>
        <h1 className="hero-h1" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.2rem,7vw,6.5rem)", fontWeight: 400, lineHeight: 1.0, color: "#F5EDD8", marginBottom: "clamp(1rem,3vw,1.5rem)", letterSpacing: "clamp(1px,1vw,3px)", overflow: "hidden" }}>
          <span className="line" style={{ display: "block", opacity: 0 }}>Suara Yang Tak Terdengar:</span>
          <span className="line" style={{ display: "block", color: "#E2B860", opacity: 0 }}>Kekerasan Seksual</span>
          <span className="line" style={{ display: "block", opacity: 0 }}>di Era Reformasi</span>
        </h1>
        <p className="hero-sub" style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.85rem,2vw,1.05rem)", fontWeight: 500, color: "#9A8A72", lineHeight: 1.85, maxWidth: "min(580px,85vw)", margin: "0 auto clamp(.8rem,2vw,1.3rem)", opacity: 0 }}>Menelusuri jejak kekerasan seksual dari tragedi Mei 1998, temuan TGPF, peran Komnas Perempuan, perjuangan 24 tahun advokasi, hingga lahirnya UU TPKS dan tantangan implementasinya.</p>
        <p className="hero-note" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(.62rem,1.5vw,.72rem)", color: "#C8972A", opacity: 0, letterSpacing: ".5px", fontWeight: 500 }}>Disusun dalam rangka memperingati 28 tahun tragedi Mei 1998 — agar sejarah tidak dilupakan.</p>
      </motion.div>
      <div className="hero-scroll-cue" style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase", color: "#C8972A", fontWeight: 700 }}>Gulir</span>
        <div style={{ position: "relative", width: "1px", height: "36px", overflow: "hidden" }}>
          <motion.div animate={{ scaleY: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ width: "1px", height: "100%", background: "linear-gradient(to bottom,#C8972A,transparent)", transformOrigin: "top" }} />
        </div>
      </div>
    </section>
  );
}

/* ════════════ ANGGOTA CARD ════════════ */
function AnggotaCard({ name, num, index }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const move = e => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
      y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
    };
    const reset = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", reset); };
  }, []);
  return (
    <motion.div ref={ref} style={{ x, y }}
      className="anggota-card"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }} viewport={{ once: true }}
      whileHover={{ borderColor: "rgba(200,151,42,.5)", background: "#261E14" }}>
      <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}
        style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#C8972A,#8B2E2E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D0B09" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </motion.div>
      <div>
        <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.82rem,2vw,.9rem)", fontWeight: 500, color: "#EDE0C4" }}>{name} </span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", color: "#C8972A", fontWeight: 700 }}>{num}</span>
      </div>
    </motion.div>
  );
}

function Anggota() {
  const members = [["Annisa Rahmawati", "— 07"], ["Najwa Niswatul Umma", "— 24"], ["Reina Faizah Salsabilla", "— 29"]];
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }}
      style={{ padding: "clamp(2rem,5vw,3.5rem) clamp(1rem,4vw,1.5rem)", background: "#161310", borderTop: "1px solid rgba(200,151,42,.2)", borderBottom: "1px solid rgba(200,151,42,.2)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#5C5040", marginBottom: "1.2rem", fontWeight: 700 }}>Anggota Kelompok</p>
        <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.2rem" }}>
          {members.map(([name, num], i) => <AnggotaCard key={i} name={name} num={num} index={i} />)}
        </div>
      </div>
    </motion.section>
  );
}

/* ════════════ IMAGE SECTION ════════════ */
function ImageSection({ id, title, imgSrc, imgAlt, children, reverse = false, bg = "#0D0B09" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.12 });
  const w = useWindowWidth();
  const isMobile = w <= 768;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section id={id} ref={ref} style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)", background: bg, borderBottom: "1px solid rgba(200,151,42,.15)" }}>
      <div className="img-grid" style={{ maxWidth: "960px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "1.5rem" : "3rem", alignItems: "center" }}>
        <motion.div
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
          animate={isInView ? { clipPath: "inset(0 0% 0 0)", opacity: 1 } : {}}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
          style={{ order: (!isMobile && reverse) ? 2 : 1, position: "relative", borderRadius: "12px", overflow: "hidden", aspectRatio: isMobile ? "16/9" : "4/3" }}>
          <motion.div style={{ position: "absolute", inset: "-10%", y: imgY }}>
            <img src={imgSrc} alt={imgAlt} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(30%) contrast(1.1)" }} />
          </motion.div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(139,46,46,.25),rgba(13,11,9,.35))", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(200,151,42,.25)", borderRadius: "12px", pointerEvents: "none" }} />
          {isInView && (
            <motion.div initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.8 }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 40%,rgba(200,151,42,.15) 50%,transparent 60%)", pointerEvents: "none" }} />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : (reverse ? -60 : 60), y: isMobile ? 20 : 0 }}
          animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: isMobile ? 0.05 : 0.35 }}
          style={{ order: (!isMobile && reverse) ? 1 : 2 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.5rem,3.5vw,2.5rem)", fontWeight: 400, color: "#E2B860", marginBottom: "1.25rem", lineHeight: 1.1, letterSpacing: "2px" }}>{title}</h2>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function Expand({ preview, more }) {
  const [open, setOpen] = useState(false);
  const ps = { fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.88rem,2vw,1rem)", fontWeight: 400, color: "#9A8A72", lineHeight: 1.85, marginBottom: ".8rem" };
  return (
    <>
      <p style={ps}>{preview}</p>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .5 }} style={{ overflow: "hidden" }}>
            {more.map((t, i) => <p key={i} style={ps}>{t}</p>)}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", color: "#C8972A", fontFamily: "'DM Sans',sans-serif", fontSize: ".75rem", fontWeight: 700, cursor: "pointer", padding: ".35rem 0", letterSpacing: "1px", textTransform: "uppercase" }}>
        {open ? "Tutup ↑" : "Baca selengkapnya ↓"}
      </button>
    </>
  );
}

function PullQuote({ children }) {
  return (
    <blockquote style={{ borderLeft: "3px solid #C8972A", padding: ".9rem 1.2rem", margin: "1.25rem 0", background: "rgba(200,151,42,.06)", borderRadius: "0 8px 8px 0" }}>
      <p style={{ fontFamily: "'Barlow',sans-serif", fontStyle: "italic", fontSize: "clamp(.9rem,2vw,1.05rem)", fontWeight: 600, color: "#F5EDD8", lineHeight: 1.7 }}>{children}</p>
    </blockquote>
  );
}

/* ════════════ DATA CARD ════════════ */
function DataCard({ target, suffix, desc, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [val, setVal] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!isInView) return;
    const step = target / (1800 / 16); let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); setDone(true); }
      setVal(Math.round(cur));
    }, 16);
    return () => clearInterval(t);
  }, [isInView, target]);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: .2 }}
      transition={{ duration: .7, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ scale: 1.04, borderColor: "rgba(200,151,42,.5)" }}
      style={{ background: "#2A2218", border: "1px solid rgba(200,151,42,.2)", borderRadius: "12px", padding: "clamp(1rem,3vw,1.6rem) clamp(.8rem,2.5vw,1.3rem)", position: "relative", overflow: "hidden", transition: "border-color .3s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#C8972A,#8B2E2E)" }} />
      {isInView && (
        <motion.div initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ duration: 0.7, ease: "easeOut", delay: delay + 0.3 }}
          style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 35%,rgba(200,151,42,.12) 50%,transparent 65%)", pointerEvents: "none" }} />
      )}
      <div className={done ? "glow-done" : ""} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 400, color: "#F5EDD8", lineHeight: 1, marginBottom: ".4rem", letterSpacing: "2px" }}>
        {target > 1000 ? val.toLocaleString("id-ID") : val}{suffix}
      </div>
      <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.72rem,1.5vw,.82rem)", fontWeight: 500, color: "#9A8A72", lineHeight: 1.6 }}>{desc}</div>
    </motion.div>
  );
}

/* ════════════ TIMELINE ════════════ */
const TL_DATA = [
  { year: "Mei 1998", label: "Tragedi Kekerasan Seksual & Pembentukan TGPF", open: true, paras: ["Pada 13–15 Mei 1998, di tengah kerusuhan massal yang mengiringi jatuhnya rezim Soeharto, terjadi kekerasan seksual sistematis terhadap perempuan keturunan Tionghoa di Jakarta (Glodok, Pantai Indah Kapuk, Kelapa Gading), Solo, Medan, Palembang, dan Surabaya.", "Pemerintah B.J. Habibie membentuk Tim Gabungan Pencari Fakta (TGPF) melalui Keppres No. 181/1998. TGPF bekerja 5 bulan dan memverifikasi 85 korban perkosaan (termasuk 24 yang meninggal) serta ratusan kasus lainnya.", "Laporan TGPF merekomendasikan pengadilan HAM ad hoc dan rehabilitasi korban. Namun rekomendasi ini tidak pernah ditindaklanjuti. Hingga 2026, tidak satu pun pelaku yang diadili."] },
  { year: "Oktober 1998 – 2000", label: "Lahirnya Komnas Perempuan & CATAHU", paras: ["Komnas Perempuan dibentuk melalui Keppres No. 181 Tahun 1998 sebagai respons langsung terhadap tragedi Mei 1998, menjadi lembaga negara pertama yang menangani kekerasan berbasis gender.", "Sejak 2001, Komnas Perempuan menerbitkan CATAHU sebagai alat advokasi dan dokumentasi komprehensif kasus kekerasan terhadap perempuan di Indonesia."] },
  { year: "2000 – 2016", label: "Advokasi Panjang & Inisiasi RUU", paras: ["Selama lebih dari satu dekade, organisasi perempuan dan aktivis HAM terus mendorong pengakuan hukum atas kekerasan seksual. KUHP dinilai tidak memadai melindungi korban.", "Pada 2012, Komnas Perempuan mulai menyusun draf RUU PKS yang mencakup 15 bentuk kekerasan seksual yang sebelumnya tidak diakui secara hukum."] },
  { year: "2016 – 2022", label: "Pertarungan Legislasi RUU PKS", paras: ["RUU PKS masuk Prolegnas 2016, namun menghadapi penolakan keras. Pada 2020, DPR mengeluarkannya dari Prolegnas prioritas — kemunduran besar bagi gerakan perempuan.", "Kampanye #GerakMelawan memaksa DPR memasukkan kembali sebagai RUU TPKS. Pada 12 April 2022, UU TPKS akhirnya disahkan setelah perjuangan hampir satu dekade."] },
  { year: "2022 – 2026", label: "Implementasi UU TPKS & Tantangan Saat Ini", paras: ["Meski UU TPKS disahkan, implementasinya masih menghadapi hambatan. PP turunan belum sepenuhnya diterbitkan dan aparat penegak hukum masih perlu pelatihan khusus.", "CATAHU 2024 mencatat lebih dari 400.000 kasus kekerasan terhadap perempuan. Hingga 2026, para penyintas tragedi Mei 1998 masih menunggu keadilan."] },
];

function TimelineItem({ item, index }) {
  const [open, setOpen] = useState(item.open || false);
  return (
    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .1 }}
      transition={{ delay: index * .08, duration: .6, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", paddingLeft: "clamp(34px,5vw,46px)", marginBottom: ".85rem" }}>
      <motion.div animate={{ background: open ? "#C04040" : "#C8972A", boxShadow: open ? "0 0 0 1px #C04040,0 0 16px rgba(192,64,64,.45)" : "0 0 0 1px #C8972A" }}
        style={{ position: "absolute", left: "6px", top: "17px", width: "14px", height: "14px", borderRadius: "50%", border: "3px solid #0D0B09", zIndex: 1 }} />
      <motion.div whileHover={{ borderColor: "rgba(200,151,42,.4)" }} onClick={() => setOpen(o => !o)}
        style={{ background: open ? "#2A2218" : "#1F1A14", border: `1px solid ${open ? "rgba(200,151,42,.5)" : "rgba(200,151,42,.2)"}`, borderRadius: "10px", padding: "clamp(.65rem,2vw,.9rem) clamp(.85rem,2vw,1.1rem)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .25s", gap: ".5rem" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(.58rem,1.5vw,.65rem)", color: "#C8972A", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px", fontWeight: 700 }}>{item.year}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(.88rem,2vw,1.1rem)", color: "#EDE0C4", letterSpacing: "1px", lineHeight: 1.2 }}>{item.label}</div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: .35 }} style={{ color: "#C8972A", fontSize: ".85rem", flexShrink: 0 }}>▼</motion.span>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .55, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "clamp(1rem,3vw,1.3rem) clamp(.85rem,2vw,1.1rem)", border: "1px solid rgba(200,151,42,.2)", borderTop: "none", borderRadius: "0 0 10px 10px", background: "#161310" }}>
              {item.paras.map((p, i) => (
                <p key={i} style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.83rem,2vw,.95rem)", fontWeight: 400, color: "#9A8A72", lineHeight: 1.85, marginBottom: i < item.paras.length - 1 ? ".8rem" : 0 }}>{p}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CHALLENGES = [
  { num: "01", title: "Budaya Patriarki yang Mengakar", desc: "Norma sosial yang menuntut perempuan 'menjaga kehormatan', victim-blaming, dan menganggap kekerasan domestik sebagai urusan privat membuat banyak korban memilih diam." },
  { num: "02", title: "Impunitas & Lemahnya Penegakan Hukum", desc: "Tidak satu pun pelaku tragedi Mei 1998 yang diadili hingga kini. Aparat sering kurang terlatih dan proses hukum kerap memperburuk trauma korban melalui secondary victimization." },
  { num: "03", title: "Minimnya Layanan Pendampingan Korban", desc: "Banyak daerah tidak memiliki rumah aman, konselor terlatih, atau unit khusus di kepolisian. Korban di daerah terpencil hampir tidak memiliki akses terhadap keadilan." },
  { num: "04", title: "Hambatan Regulasi & Politik", desc: "PP turunan UU TPKS belum sepenuhnya diterbitkan. Kelompok konservatif terus berupaya melemahkan substansi UU melalui jalur legislasi dan opini publik." },
];

/* ════════════ APP ════════════ */
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => { if (splashDone) ScrollTrigger.refresh(); }, [splashDone]);
  return (
    <div style={{ background: "#0D0B09", minHeight: "100vh" }}>
      <AnimatePresence>
        {!splashDone && <SplashScreen key="splash" onComplete={() => setSplashDone(true)} />}
      </AnimatePresence>
      {splashDone && (
        <>
          <Nav />
          <Hero />
          <Anggota />
          <ImageSection id="latar" title="Latar Belakang" imgSrc={IMAGES.bg1998} imgAlt="Kerusuhan Mei 1998" bg="#0D0B09">
            <Expand
              preview="Kekerasan seksual merupakan salah satu kejahatan kemanusiaan yang menjadi bagian kelam sejarah reformasi Indonesia. Peristiwa Mei 1998 menjadi titik balik yang memaksa negara mengakui adanya kekerasan seksual sistematis terhadap perempuan keturunan Tionghoa, di tengah kerusuhan politik mengiringi jatuhnya rezim Orde Baru setelah 32 tahun berkuasa."
              more={["Sejak saat itu, berbagai upaya advokasi dilakukan oleh organisasi masyarakat sipil, lembaga HAM, dan gerakan perempuan. Namun perjalanan menuju keadilan bagi korban masih panjang dan berliku.", "Artikel ini menyajikan kronologi lengkap peristiwa, konteks politik di baliknya, data penting, serta analisis tantangan yang masih dihadapi hingga 2026."]}
            />
          </ImageSection>
          <ImageSection id="konteks" title="Konteks Politik & Sosial" imgSrc={IMAGES.bgkomnas} imgAlt="Aksi gerakan perempuan" bg="#161310" reverse>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.88rem,2vw,1rem)", fontWeight: 400, color: "#9A8A72", lineHeight: 1.85, marginBottom: ".8rem" }}>
              Krisis ekonomi Asia 1997 menghantam Indonesia dengan keras — rupiah jatuh dari Rp2.400 menjadi Rp16.000 per dolar AS, inflasi melonjak 77%, dan pengangguran meningkat drastis.
            </p>
            <PullQuote>"Penembakan empat mahasiswa Trisakti pada 12 Mei 1998 menjadi pemicu kerusuhan massal yang meluas ke Jakarta, Solo, Medan, Palembang, dan Surabaya."</PullQuote>
            <Expand
              preview="Di tengah kekacauan ini, terjadi kekerasan seksual yang terorganisir terhadap perempuan etnis Tionghoa. Stigma ganda membuat mereka rentan secara struktural."
              more={["Aparat keamanan yang seharusnya melindungi justru absen atau terlibat. Kerusuhan menewaskan lebih dari 1.000 orang dan membakar ratusan bangunan."]}
            />
          </ImageSection>
          <section id="data" style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)", background: "#0D0B09", borderBottom: "1px solid rgba(200,151,42,.15)" }}>
            <div style={{ maxWidth: "960px", margin: "0 auto" }}>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}
                style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 400, color: "#E2B860", marginBottom: "clamp(1.2rem,3vw,2rem)", letterSpacing: "2px" }}>
                Data &amp; Fakta Penting
              </motion.h2>
              <div className="data-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(190px,45%),1fr))", gap: "clamp(.6rem,2vw,1rem)" }}>
                <DataCard target={85} suffix="+" desc="Korban perkosaan yang terverifikasi TGPF dalam tragedi Mei 1998 (termasuk 24 yang meninggal)" delay={0} />
                <DataCard target={400000} suffix="+" desc="Kasus kekerasan terhadap perempuan dilaporkan CATAHU 2024 oleh Komnas Perempuan" delay={0.1} />
                <DataCard target={24} suffix=" Thn" desc="Waktu yang dibutuhkan dari tragedi 1998 hingga lahirnya UU TPKS pada April 2022" delay={0.2} />
                <DataCard target={0} suffix="" desc="Pelaku tragedi Mei 1998 yang berhasil diadili hingga 2026. Impunitas masih berlangsung." delay={0.3} />
              </div>
            </div>
          </section>
          <section id="timeline" style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)", background: "#161310", borderBottom: "1px solid rgba(200,151,42,.15)" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "clamp(1.5rem,4vw,2.5rem)" }}>
                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 400, color: "#E2B860", marginBottom: ".5rem", letterSpacing: "2px" }}>Lini Masa Peristiwa</h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(.65rem,1.5vw,.78rem)", fontWeight: 500, color: "#5C5040", letterSpacing: "1.5px", textTransform: "uppercase" }}>Klik setiap peristiwa untuk membaca detail</p>
              </motion.div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "13px", top: 0, bottom: 0, width: "1px", background: "linear-gradient(to bottom,#C8972A,transparent)" }} />
                {TL_DATA.map((item, i) => <TimelineItem key={i} item={item} index={i} />)}
              </div>
            </div>
          </section>
          <section id="tantangan" style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)", background: "#0D0B09", borderBottom: "1px solid rgba(200,151,42,.15)" }}>
            <div style={{ maxWidth: "960px", margin: "0 auto" }}>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}
                style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.6rem,3.5vw,2.6rem)", fontWeight: 400, color: "#E2B860", marginBottom: "clamp(1.2rem,3vw,2rem)", letterSpacing: "2px" }}>
                Tantangan Struktural yang Tersisa
              </motion.h2>
              <div style={{ display: "grid", gap: ".85rem" }}>
                {CHALLENGES.map((c, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -40, scale: 0.97 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, amount: .12 }}
                    transition={{ delay: i * .12, duration: .65, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: 8, borderColor: "rgba(200,151,42,.45)", background: "#261E14" }}
                    style={{ background: "#1F1A14", border: "1px solid rgba(200,151,42,.2)", borderRadius: "10px", padding: "clamp(1rem,3vw,1.4rem)", transition: "background .3s,border-color .3s" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 400, color: "rgba(200,151,42,.12)", lineHeight: 1, marginBottom: ".3rem", letterSpacing: "3px" }}>{c.num}</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(.95rem,2.5vw,1.25rem)", color: "#E2B860", marginBottom: ".5rem", letterSpacing: "1.5px" }}>{c.title}</div>
                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.83rem,2vw,.95rem)", fontWeight: 400, color: "#9A8A72", lineHeight: 1.85, margin: 0 }}>{c.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          <section id="refleksi" style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)", background: "linear-gradient(180deg,#0D0B09 0%,#180d0d 100%)" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: "linear-gradient(135deg,rgba(139,46,46,.15),rgba(200,151,42,.08))", border: "1px solid rgba(139,46,46,.4)", borderRadius: "14px", padding: "clamp(1.5rem,4vw,2.5rem)" }}>
                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(1.5rem,3.5vw,2rem)", color: "#F5EDD8", marginBottom: "1.2rem", letterSpacing: "2px" }}>Refleksi &amp; Seruan</h2>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.88rem,2vw,1rem)", fontWeight: 400, color: "#EDE0C4", lineHeight: 1.9, marginBottom: "1rem" }}>
                  Kekerasan seksual bukan sekadar persoalan hukum pidana — ia adalah cerminan budaya patriarki, ketimpangan relasi kuasa, dan kegagalan negara melindungi warganya yang paling rentan. Dari temuan TGPF yang diabaikan selama 28 tahun, hingga perjuangan hampir seperempat abad melahirkan UU TPKS, perjalanan ini menunjukkan betapa sulitnya melawan sistem yang melanggengkan kekerasan terhadap perempuan.
                </p>
                <ul style={{ listStyle: "none", marginTop: "1.25rem", display: "grid", gap: ".6rem" }}>
                  {["Tuntut pertanggungjawaban negara atas tragedi Mei 1998 dan adili para pelaku", "Dorong implementasi penuh UU TPKS di seluruh daerah Indonesia", "Dukung lembaga dan organisasi yang mendampingi korban kekerasan seksual", "Lawan budaya victim-blaming dan normalisasi kekerasan di lingkungan sekitar", "Pastikan sejarah kelam ini diajarkan kepada generasi mendatang agar tidak terulang"].map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .08, duration: .5 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.85rem,2vw,.95rem)", fontWeight: 500, color: "#9A8A72", lineHeight: 1.75 }}>
                      <span style={{ color: "#C8972A", flexShrink: 0, marginTop: "3px", fontWeight: 700 }}>→</span>{item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>
          <footer style={{ background: "#161310", borderTop: "1px solid rgba(200,151,42,.2)", padding: "clamp(1.5rem,3vw,2rem) clamp(1rem,4vw,1.5rem)", textAlign: "center" }}>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: "clamp(.68rem,1.5vw,.78rem)", fontWeight: 500, color: "#5C5040", lineHeight: 1.8 }}>
              2026 — Dibuat untuk keperluan edukasi.<br />
              <span style={{ color: "#C8972A" }}>Semua data bersumber dari laporan resmi Komnas Perempuan, TGPF, dan dokumen DPR RI.</span>
            </p>
          </footer>
          {/* Music player floating */}
          <MusicPlayer />
        </>
      )}
    </div>
  );
}