
jQuery(function ($) {


  // jQuery(function ($) {
  //     alert('jQuery is ready.');
  // });

});

//=====================================
//    375px未満はJS で viewport を固定する
//=====================================
!(function () {
  const viewport = document.querySelector('meta[name="viewport"]');
  function switchViewport() {
    const value =
      window.outerWidth > 375
        ? "width=device-width,initial-scale=1"
        : "width=375";
    if (viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  }
  addEventListener("resize", switchViewport, false);
  switchViewport();
})();

//=====================================
//    ドロワーアイコン
//=====================================
const CLASS = "-active";
let flg = false;

const scrollingElement = () => document.scrollingElement || document.documentElement;

const backgroundFix = (bool) => {
  const scrollY = bool ? scrollingElement().scrollTop : -parseInt(document.body.style.top || "0");
  const fixedStyles = {
    height: "100svh",
    position: "fixed",
    top: `${scrollY * -1}px`,
    left: "0",
    width: "100vw",
  };

  Object.keys(fixedStyles).forEach((key) => {
    document.body.style[key] = bool ? fixedStyles[key] : "";
  });

  const drawerBackground = document.getElementById("js-drawer-background");
  drawerBackground.classList.toggle(CLASS, bool);
  if (!bool) {
    window.scrollTo(0, scrollY * -1);
  }
};

const closeDrawer = () => {
  hamburger.classList.remove(CLASS);
  menu.classList.remove(CLASS);
  backgroundFix(false);
  hamburger.focus();
  hamburger.setAttribute("aria-expanded", "false");
  flg = false;
};

const hamburger = document.getElementById("js-drawer-icon");
const focusTrap = document.getElementById("js-focus-trap");
const menu = document.querySelector("#js-drawer-content");
const drawerBackground = document.getElementById("js-drawer-background");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle(CLASS);
    menu.classList.toggle(CLASS);
    backgroundFix(!flg);
    hamburger.setAttribute("aria-expanded", flg ? "false" : "true");
    flg = !flg;
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
  }
});

focusTrap.addEventListener("focus", () => {
  hamburger.focus();
});

drawerBackground.addEventListener("click", () => {
  closeDrawer();
});
