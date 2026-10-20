import { animate, stagger, onScroll, svg } from "https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@12/lib/marked.esm.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function loadToc() {
  const res = await fetch("content/toc.json");
  return res.json();
}

function chapterHref(ch) {
  return `chapter.html?id=${ch.id}`;
}

function renderSideRail(toc, currentId) {
  const list = document.querySelector("[data-side-rail-list]");
  if (!list) return;
  list.innerHTML = toc.chapters
    .map((ch) => {
      const current = ch.id === currentId ? ' aria-current="page"' : "";
      return `<li><a href="${chapterHref(ch)}"${current}><span class="nav-num">${ch.id}</span>${ch.title}</a></li>`;
    })
    .join("");
}

function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const rail = document.querySelector("[data-side-rail]");
  if (!toggle || !rail) return;
  toggle.addEventListener("click", () => {
    const open = rail.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  rail.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      rail.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

function drawHeroRule() {
  const path = document.querySelector("[data-hero-rule] path");
  if (!path) return;
  if (reduceMotion) return;
  const drawable = svg.createDrawable(path);
  animate(drawable, {
    draw: ["0 0", "0 1"],
    duration: 600,
    ease: "outExpo",
  });
}

function categoryName(toc, id) {
  return toc.categories.find((c) => c.id === id)?.name ?? id;
}

function cardMarkup(ch) {
  const authors = ch.authors.join(", ");
  return `
    <a class="chapter-card" href="${chapterHref(ch)}">
      <span class="chapter-card-num">${ch.id}</span>
      <h3 class="chapter-card-title">${ch.title}</h3>
      <p class="chapter-card-meta">${authors} · น. ${ch.pageStart}–${ch.pageEnd}</p>
      <p class="chapter-card-excerpt">${ch.excerpt ?? ""}</p>
    </a>`;
}

function renderChapterList(toc, filterText, activeCategory) {
  const root = document.querySelector("[data-chapter-list]");
  if (!root) return;
  const query = filterText.trim().toLowerCase();

  const groups = toc.categories
    .filter((cat) => activeCategory === "all" || activeCategory === cat.id)
    .map((cat) => {
      const chapters = toc.chapters.filter((ch) => {
        if (ch.category !== cat.id) return false;
        if (!query) return true;
        const haystack = `${ch.title} ${ch.authors.join(" ")}`.toLowerCase();
        return haystack.includes(query);
      });
      return { cat, chapters };
    })
    .filter((g) => g.chapters.length > 0);

  if (groups.length === 0) {
    root.innerHTML = `<p class="empty-state">ไม่พบบทที่ตรงกับคำค้นหา</p>`;
    return;
  }

  root.innerHTML = groups
    .map(
      (g) => `
      <section class="category-group">
        <h2>${g.cat.name}</h2>
        <div class="card-grid">${g.chapters.map(cardMarkup).join("")}</div>
      </section>`
    )
    .join("");

  if (!reduceMotion) {
    const cards = root.querySelectorAll(".chapter-card");
    animate(cards, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 400,
      delay: stagger(60),
      ease: "outExpo",
      autoplay: onScroll({ enter: "bottom-=40" }),
    });

    // shortcut: anime's onScroll enter-threshold can be skipped by an instant scroll jump
    // (End key, #anchor link) in one frame, leaving a card stuck at opacity:0 forever — force-reveal
    // as a safety net once the browser reports the card as actually in view
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0px)";
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "200px" });
    cards.forEach((c) => revealObserver.observe(c));

    // shortcut: full-page screenshot/capture tools render content beyond the live viewport
    // without ever moving it, so neither trigger above fires — force-reveal everything left
    // hidden after a bounded delay (upgrade: debounce per-card if this ever fights real scrolling)
    setTimeout(() => {
      revealObserver.disconnect();
      cards.forEach((c) => {
        c.style.opacity = "1";
        c.style.transform = "translateY(0px)";
      });
    }, 1500);
  }
}

function initSearchFilter(toc) {
  const search = document.querySelector("[data-search]");
  const chips = document.querySelectorAll("[data-filter-chip]");
  let activeCategory = "all";

  const rerender = () => renderChapterList(toc, search?.value ?? "", activeCategory);

  search?.addEventListener("input", rerender);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.filterChip;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      rerender();
    });
  });

  rerender();
}

async function initIndexPage() {
  const toc = await loadToc();
  renderSideRail(toc, null);
  initNavToggle();
  drawHeroRule();
  initSearchFilter(toc);
}

function renderArticleBody(container, markdown) {
  const body = markdown.replace(/^---[\s\S]*?---\s*/, "");
  container.innerHTML = marked.parse(body);

  const headings = [...container.querySelectorAll("h2")];
  headings.forEach((h, i) => (h.id = `sec-${i}`));
  if (headings.length) {
    const listHtml = headings.map((h) => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join("");
    const subtoc = document.createElement("nav");
    subtoc.className = "chapter-subtoc";
    subtoc.setAttribute("aria-label", "หัวข้อในบทนี้");
    subtoc.innerHTML = `<h2>ในบทนี้</h2><ul>${listHtml}</ul>`;
    container.insertBefore(subtoc, headings[0]);

    const asideList = document.querySelector("[data-aside-subtoc] ul");
    if (asideList) asideList.innerHTML = listHtml;
  }

  container.querySelectorAll("a").forEach((a) => {
    if (a.textContent.trim() === "กลับสู่สารบัญ") a.href = "index.html";
  });

  // shortcut: regex runs on serialized HTML, not text nodes — safe here since
  // "(น. …)" only appears in paragraph text, never inside an attribute
  container.innerHTML = container.innerHTML.replace(
    /\(น\.\s[0-9ก-ฮ,\-–\s]+\)/g,
    (m) => `<span class="page-badge">${m.slice(1, -1)}</span>`
  );
}

function renderPager(toc, currentOrder) {
  const pager = document.querySelector("[data-chapter-pager]");
  if (!pager) return;
  const sorted = [...toc.chapters].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((c) => c.order === currentOrder);
  const prev = sorted[idx - 1];
  const next = sorted[idx + 1];
  pager.innerHTML = `
    ${prev ? `<a class="pager-link pager-prev" href="${chapterHref(prev)}">← บทก่อนหน้า</a>` : "<span></span>"}
    ${next ? `<a class="pager-link pager-next btn" href="${chapterHref(next)}">บทถัดไป →</a>` : "<span></span>"}
  `;
}

function initProgressBar() {
  const fill = document.querySelector("[data-progress-fill]");
  const infoFill = document.querySelector("[data-info-progress-fill]");
  const infoPct = document.querySelector("[data-info-progress-pct]");
  const article = document.querySelector("[data-chapter-article]");
  if (!fill || !article) return;
  const update = () => {
    const max = article.offsetHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    fill.style.width = `${pct * 100}%`;
    if (infoFill) infoFill.style.width = `${pct * 100}%`;
    if (infoPct) infoPct.textContent = `${Math.round(pct * 100)}%`;
  };
  document.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initSubtocSpy(article) {
  const headings = [...article.querySelectorAll("h2[id]")];
  const subtocLinks = [...document.querySelectorAll(".chapter-subtoc a")];
  if (!headings.length || !subtocLinks.length) return;

  // header + reading-progress bar are both sticky at top:0 / top:var(--header-h),
  // so measuring the bar's real rect beats trusting --header-h to match actual rendered height
  const headerOffset = () => {
    const bar = document.querySelector(".reading-progress");
    return (bar ? bar.getBoundingClientRect().bottom : 0) + 24;
  };

  const syncLayout = () => {
    const offset = headerOffset();
    headings.forEach((h) => (h.style.scrollMarginTop = `${offset}px`));
  };

  const setActive = (id) => {
    subtocLinks.forEach((a) => {
      if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };

  const pickActive = () => {
    // at max scroll, trailing content may be too short to push the last heading
    // up to the header line — treat it as active anyway since it's as close as it gets
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 1) {
      return headings[headings.length - 1];
    }
    // +4px tolerance: a settled smooth-scroll can land a hair past the exact
    // scroll-margin target (subpixel rounding), which would otherwise demote
    // the just-landed heading back to its predecessor
    const limit = headerOffset() + 4;
    let active = headings[0];
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= limit) active = h;
      else break;
    }
    return active;
  };

  let suppressed = false;
  let resumeTimer = null;

  syncLayout();
  setActive(pickActive().id);

  window.addEventListener("resize", () => {
    syncLayout();
    if (!suppressed) setActive(pickActive().id);
  });

  document.addEventListener(
    "scroll",
    () => {
      if (suppressed) return;
      setActive(pickActive().id);
    },
    { passive: true }
  );

  subtocLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const heading = document.getElementById(id);
      if (!heading) return;
      e.preventDefault();
      setActive(id);
      suppressed = true;
      clearTimeout(resumeTimer);
      heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
      resumeTimer = setTimeout(() => {
        suppressed = false;
        setActive(pickActive().id);
      }, reduceMotion ? 50 : 700);
    });
  });
}

function renderChapterInfo(toc, chapter) {
  const card = document.querySelector("[data-chapter-info]");
  if (!card) return;
  card.innerHTML = `
    <h2>ข้อมูลบท</h2>
    <dl>
      <dt>ผู้เขียน</dt>
      <dd>${chapter.authors.join(", ")}</dd>
      <dt>ช่วงหน้า</dt>
      <dd>น. ${chapter.pageStart}–${chapter.pageEnd}</dd>
    </dl>
    <a class="btn" href="${toc.book.sourceUrl}" target="_blank" rel="noopener">อ่านต้นฉบับ</a>
    <p>ความคืบหน้าการอ่าน</p>
    <div class="chapter-info-progress-track"><div class="chapter-info-progress-fill" data-info-progress-fill></div></div>
    <p class="chapter-info-progress-pct" data-info-progress-pct>0%</p>
  `;
}

async function initChapterPage() {
  const toc = await loadToc();
  const id = new URLSearchParams(location.search).get("id");
  const chapter = toc.chapters.find((c) => c.id === id);
  const article = document.querySelector("[data-chapter-article]");

  renderSideRail(toc, chapter?.id ?? null);
  initNavToggle();

  if (!chapter) {
    article.innerHTML = `<p>ไม่พบบทที่ระบุ กรุณา<a href="index.html">กลับสู่สารบัญ</a></p>`;
    return;
  }

  document.title = `${chapter.title} | ท้องถิ่นเล่าเรื่องประวัติศาสตร์`;

  renderChapterInfo(toc, chapter);

  const res = await fetch(`content/chapters/${chapter.id}.md`);
  const markdown = await res.text();
  renderArticleBody(article, markdown);
  renderPager(toc, chapter.order);
  initProgressBar();
  initSubtocSpy(article);
}

if (document.body.dataset.page === "index") {
  initIndexPage();
} else if (document.body.dataset.page === "chapter") {
  initChapterPage();
}
