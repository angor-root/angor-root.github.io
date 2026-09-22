// ============================================================
// MAIN — scroll reveal, nav mobile menu
// ============================================================

(function () {
  "use strict";

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Nav padding on scroll ---------- */
  const nav = document.getElementById("siteNav");
  function onNavScroll() {
    if (!nav) return;
    nav.style.padding = window.scrollY > 40 ? "14px clamp(20px, 5vw, 48px)" : "20px clamp(20px, 5vw, 48px)";
  }
  window.addEventListener("scroll", onNavScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    function closeMenu() {
      navLinks.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function toggleMenu() {
      const open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", toggleMenu);
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }
})();
