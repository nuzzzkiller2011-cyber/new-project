/* ============================================================
   TEAM DANJER KILLER — SITE LOGIC
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.TDK_CONFIG;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (max-width: 860px)").matches;

  function safeLink(url) {
    if (!url || url.indexOf("YOUR_") === 0) return "#";
    return url;
  }

  /* ---------------------------------------------------------
     TEXT / CONTENT INJECTION FROM CONFIG
     --------------------------------------------------------- */
  function applyTextContent() {
    $$("[data-team-name]").forEach(el => el.textContent = cfg.team.name);
    $$("[data-tagline]").forEach(el => el.textContent = cfg.team.tagline);
    $$("[data-subtagline]").forEach(el => el.textContent = cfg.team.subTagline);
    $$("[data-developer]").forEach(el => el.textContent = cfg.team.developer);
    $$("[data-creator]").forEach(el => el.textContent = cfg.team.creator);
    $$("[data-year]").forEach(el => el.textContent = cfg.team.year);

    const tiktokLinks = $$("[data-tiktok-link]");
    tiktokLinks.forEach(el => { el.href = safeLink(cfg.social.tiktok); });

    $$("[data-stat]").forEach(el => {
      const key = el.dataset.stat;
      if (key === "rank") { el.textContent = cfg.stats.rank; return; }
      el.dataset.count = cfg.stats[key];
    });
  }

  /* ---------------------------------------------------------
     LOADING SCREEN
     --------------------------------------------------------- */
  function runLoader() {
    const loader = $("#loader");
    const fill = $("#loader .loader-bar-fill");
    let pct = 0;
    const tick = () => {
      pct += Math.random() * 18 + 8;
      if (pct >= 100) {
        pct = 100;
        fill.style.width = pct + "%";
        setTimeout(() => {
          loader.classList.add("hidden");
          document.body.style.overflow = "";
          startRevealObserver();
        }, 280);
        return;
      }
      fill.style.width = pct + "%";
      setTimeout(tick, 140);
    };
    document.body.style.overflow = "hidden";
    setTimeout(tick, 200);
  }

  /* ---------------------------------------------------------
     CUSTOM CURSOR
     --------------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    $$("a, button, .player-card, .btn").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
    });
  }

  /* ---------------------------------------------------------
     PARTICLE BACKGROUND
     --------------------------------------------------------- */
  function initParticles() {
    const canvas = $("#particle-canvas");
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const COUNT = reducedMotion ? 0 : (isTouch ? 34 : 70);
    let mouseX = null, mouseY = null;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = ["255,23,68", "0,229,255", "160,32,255"];

    function makeParticles() {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.6,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          c: colors[i % colors.length],
          a: Math.random() * 0.5 + 0.15
        });
      }
    }
    makeParticles();

    window.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        if (mouseX !== null) {
          const dx = p.x - mouseX, dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const force = (140 - dist) / 140;
            p.x += (dx / (dist || 1)) * force * 0.6;
            p.y += (dy / (dist || 1)) * force * 0.6;
          }
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.shadowColor = `rgba(${p.c},0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  /* ---------------------------------------------------------
     NAVIGATION
     --------------------------------------------------------- */
  function initNav() {
    const nav = $("#site-nav");
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });

    const toggle = $(".nav-toggle");
    const mobileMenu = $(".mobile-menu");
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });
    $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
      toggle.classList.remove("open");
      mobileMenu.classList.remove("open");
    }));
  }

  /* ---------------------------------------------------------
     SCENE REVEAL (cinematic scroll)
     --------------------------------------------------------- */
  function startRevealObserver() {
    const scenes = $$(".scene");
    if (!("IntersectionObserver" in window)) {
      scenes.forEach(s => s.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          entry.target.classList.add("in-view");
          if (entry.target.id === "scene-battle") animateStats();
        }
      });
    }, { threshold: [0.2, 0.4] });
    scenes.forEach(s => io.observe(s));
  }

  /* ---------------------------------------------------------
     PLAYERS
     --------------------------------------------------------- */
  function renderPlayers() {
    const grid = $("#players-grid");
    if (!grid) return;
    grid.innerHTML = cfg.players.map((p, i) => `
      <div class="player-card" data-player-index="${i}" tabindex="0" role="button" aria-label="Open profile for ${p.gamerTag}">
        <div class="player-card-inner">
          <div class="player-avatar">
            ${p.image ? `<img src="${p.image}" alt="${p.gamerTag}" loading="lazy">` : `<span class="avatar-fallback">${p.gamerTag.slice(0,2)}</span>`}
            <span class="player-role-tag">${p.role}</span>
          </div>
          <div class="player-name">${p.gamerTag}</div>
          <div class="player-real">${p.realName}</div>
          <div class="player-stats-mini">
            <span><b>${p.matches}</b>Matches</span>
            <span><b>${p.wins}</b>Wins</span>
            <span><b>${p.kills}</b>Kills</span>
          </div>
        </div>
      </div>
    `).join("");

    $$(".player-card", grid).forEach(card => {
      card.addEventListener("click", () => openProfile(cfg.players[+card.dataset.playerIndex]));
      card.addEventListener("keypress", e => {
        if (e.key === "Enter") openProfile(cfg.players[+card.dataset.playerIndex]);
      });
      if (!isTouch) initCardTilt(card);
    });
  }

  function initCardTilt(card) {
    const inner = $(".player-card-inner", card);
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(10px)`;
    });
    card.addEventListener("mouseleave", () => {
      inner.style.transform = "rotateY(0) rotateX(0) translateZ(0)";
    });
  }

  /* ---------------------------------------------------------
     PROFILE OVERLAY
     --------------------------------------------------------- */
  function openProfile(p) {
    const overlay = $("#profile-overlay");
    $("#profile-avatar-wrap").innerHTML = p.image
      ? `<img src="${p.image}" alt="${p.gamerTag}">`
      : `<span class="avatar-fallback">${p.gamerTag.slice(0,2)}</span>`;
    $("#profile-name").textContent = p.gamerTag;
    $("#profile-meta").textContent = `${p.realName} — ${p.role}`;
    $("#profile-bio").textContent = p.bio;
    $("#profile-favgame").textContent = p.favoriteGame;
    $("#profile-matches").textContent = p.matches;
    $("#profile-wins").textContent = p.wins;
    $("#profile-kills").textContent = p.kills;
    $("#profile-achievements").innerHTML = p.achievements.map(a => `<li>${a}</li>`).join("");
    const links = $("#profile-links");
    links.innerHTML = "";
    if (p.tiktok) links.innerHTML += `<a href="${safeLink(p.tiktok)}" target="_blank" rel="noopener">TikTok</a>`;
    if (p.instagram) links.innerHTML += `<a href="${safeLink(p.instagram)}" target="_blank" rel="noopener">Instagram</a>`;
    if (p.youtube) links.innerHTML += `<a href="${safeLink(p.youtube)}" target="_blank" rel="noopener">YouTube</a>`;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeProfile() {
    $("#profile-overlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---------------------------------------------------------
     STATS COUNTERS
     --------------------------------------------------------- */
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    $$("[data-count]").forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (reducedMotion) { el.textContent = target + (el.dataset.suffix || ""); return; }
      const duration = 1400;
      const start = performance.now();
      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + (el.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------------------------------------------------------
     GALLERY
     --------------------------------------------------------- */
  function renderGallery() {
    const grid = $("#gallery-grid");
    if (!grid) return;
    if (!cfg.gallery || !cfg.gallery.length) {
      grid.innerHTML = cfg.achievements.map(a => `<div class="gallery-item"><span>${a}</span></div>`).join("");
      return;
    }
    grid.innerHTML = cfg.gallery.map(g => `
      <div class="gallery-item">
        <img src="${g.image}" alt="${g.caption || ''}" loading="lazy">
      </div>
    `).join("");
  }

  /* ---------------------------------------------------------
     SOCIAL RAIL + SOUND
     --------------------------------------------------------- */
  function initSocialRail() {
    $$(".social-rail a[data-tiktok-link]").forEach(a => a.href = safeLink(cfg.social.tiktok));

    const likeBtn = $("#like-btn");
    likeBtn.addEventListener("click", () => likeBtn.classList.toggle("liked"));

    $("#team-btn").addEventListener("click", () => {
      $("#scene-players").scrollIntoView({ behavior: "smooth" });
    });

    $("#share-btn").addEventListener("click", async () => {
      const shareData = { title: cfg.team.name, text: cfg.team.tagline, url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (e) { /* cancelled */ }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        flashToast("Link copied");
      }
    });
  }

  function flashToast(msg) {
    let toast = $("#tdk-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "tdk-toast";
      toast.style.cssText = "position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:rgba(13,13,20,0.9);border:1px solid rgba(255,255,255,0.08);padding:10px 18px;border-radius:999px;font-family:'Rajdhani',sans-serif;letter-spacing:0.1em;font-size:0.8rem;z-index:5000;transition:opacity 0.4s ease;";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 1800);
  }

  function initSound() {
    const btn = $("#sound-toggle");
    let on = false;
    btn.addEventListener("click", () => {
      on = !on;
      btn.textContent = on ? "🔊" : "🔇";
      btn.setAttribute("aria-label", on ? "Sound on" : "Sound off");
      // No autoplay: audio only ever starts from this explicit user click.
    });
  }

  /* ---------------------------------------------------------
     TIKTOK CARD
     --------------------------------------------------------- */
  function initTiktokCard() {
    const card = $("#tiktok-video-card");
    if (!card) return;
    card.addEventListener("click", () => {
      const url = safeLink(cfg.social.tiktok);
      if (url === "#") { flashToast("Add your TikTok link in config.js"); return; }
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyTextContent();
    renderPlayers();
    renderGallery();
    initNav();
    initCursor();
    initParticles();
    initSocialRail();
    initSound();
    initTiktokCard();
    $("#profile-close").addEventListener("click", closeProfile);
    $("#profile-overlay").addEventListener("click", e => { if (e.target.id === "profile-overlay") closeProfile(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeProfile(); });

    $$(".stat-value[data-count]").forEach(el => {
      el.textContent = "0" + (el.dataset.suffix || "");
    });

    runLoader();
  });
})();
