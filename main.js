const drawer = document.getElementById("navDrawer");
const menuBtn = document.getElementById("menuBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");

if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => drawer.classList.add("open"));
}

if (closeDrawerBtn && drawer) {
    closeDrawerBtn.addEventListener("click", () => drawer.classList.remove("open"));
}

document.querySelectorAll("[data-close-drawer]").forEach((link) => {
    link.addEventListener("click", () => drawer && drawer.classList.remove("open"));
});

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer) drawer.classList.remove("open");
});

function initReveals() {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });
    items.forEach((item) => observer.observe(item));
}

function initSliders() {
    document.querySelectorAll("[data-slider]").forEach((slider) => {
        const track = slider.querySelector(".slider-track");
        const slides = Array.from(slider.querySelectorAll(".slide"));
        const dots = Array.from(slider.querySelectorAll(".slider-dot"));
        if (!track || slides.length <= 1) return;

        let idx = 0;
        const move = (next) => {
            idx = next;
            track.style.transform = `translateX(-${idx * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle("active", i === idx));
        };

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => move(i));
        });

        setInterval(() => move((idx + 1) % slides.length), 4500);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initReveals();
    initSliders();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
