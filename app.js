"use strict";
document.documentElement.classList.add("js");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const clock = document.querySelector(".local-time");
if (clock)
  clock.textContent = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
const journey = document.querySelector(".journey");
if (journey) {
  const chapters = [...document.querySelectorAll(".chapter")];
  const buttons = [...document.querySelectorAll("[data-jump]")];
  const toggle = document.querySelector(".motion-toggle");
  const status = document.querySelector("#chapter-status");
  const next = document.querySelector("[data-next]");
  let simple = reducedMotion.matches || !CSS.supports("perspective", "1000px");
  let current = -1,
    pending = false;
  const names = ["Product", "AI", "Projects", "Contact"];
  function paint() {
    pending = false;
    if (simple) return;
    const distance = Math.max(1, journey.offsetHeight - innerHeight);
    const progress = Math.max(0, Math.min(3, (scrollY / distance) * 3));
    const active = Math.round(progress);
    chapters.forEach((chapter, index) => {
      const delta = index - progress;
      chapter.style.transform = `translate3d(${delta * 88}vw, ${delta * 8}vh, ${-Math.abs(delta) * 2000}px) rotateY(${-delta * 14}deg)`;
      chapter.style.opacity = String(Math.max(0, 1 - Math.abs(delta) * 0.72));
      chapter.style.visibility = Math.abs(delta) < 1.3 ? "visible" : "hidden";
      chapter.inert = index !== active;
      chapter.setAttribute("aria-hidden", String(index !== active));
      chapter.classList.toggle("is-active", index === active);
    });
    if (active !== current) {
      current = active;
      buttons.forEach((b, i) =>
        b.setAttribute("aria-pressed", String(i === active)),
      );
      status.textContent = `${names[active]} chapter, ${active + 1} of 4`;
      next.innerHTML =
        active === 3
          ? 'Back to the start <span aria-hidden="true">↑</span>'
          : 'Scroll to explore <span aria-hidden="true">↓</span>';
      document.body.dataset.chapter = String(active);
    }
  }
  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(paint);
    }
  }
  function jump(index) {
    if (simple)
      chapters[index].scrollIntoView({ behavior: "instant", block: "center" });
    else
      window.scrollTo({
        top: (index / 3) * (journey.offsetHeight - innerHeight),
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
  }
  function setMode(value) {
    simple = value;
    document.body.classList.toggle("simple-view", simple);
    document.body.classList.toggle("spatial-view", !simple);
    toggle.setAttribute("aria-pressed", String(simple));
    toggle.textContent = simple ? "Spatial view" : "Simple view";
    chapters.forEach((c) => {
      c.style.cssText = "";
      c.inert = false;
      c.removeAttribute("aria-hidden");
    });
    current = -1;
    paint();
  }
  buttons.forEach((b, i) => b.addEventListener("click", () => jump(i)));
  next.addEventListener("click", () => jump(current >= 3 ? 0 : current + 1));
  toggle.addEventListener("click", () => {
    setMode(!simple);
    window.scrollTo({ top: 0, behavior: "instant" });
    schedule();
  });
  reducedMotion.addEventListener("change", (e) => {
    setMode(e.matches);
    schedule();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("keydown", (event) => {
    if (
      simple ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target.closest("a,button,input,textarea,select")
    )
      return;
    let target;
    if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key))
      target = Math.min(3, current + 1);
    if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key))
      target = Math.max(0, current - 1);
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = 3;
    if (target !== undefined) {
      event.preventDefault();
      jump(target);
    }
  });
  setMode(simple);
  window.addEventListener("pageshow", schedule);
}
