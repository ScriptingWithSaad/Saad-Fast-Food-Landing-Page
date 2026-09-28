(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#main-nav");
  const search = document.querySelector("#menu-search");
  const category = document.querySelector("#menu-category");
  const dishes = [...document.querySelectorAll(".dish")];
  const more = document.querySelector("#more-menu");
  const count = document.querySelector("#menu-count");
  const initialCount = 12;
  const mobile = window.matchMedia("(max-width: 760px)");
  let expanded = false;

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      closeNav();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeNav();
  });
  mobile.addEventListener("change", closeNav);

  function updateMenu() {
    const query = search.value.trim().toLowerCase();
    const selectedCategory = category.value;
    const filtering = query.length > 0 || selectedCategory !== "All";
    let matched = 0;
    let shown = 0;
    dishes.forEach((dish) => {
      const categoryMatches =
        selectedCategory === "All" ||
        dish.dataset.category === selectedCategory;
      const matches =
        categoryMatches && dish.textContent.toLowerCase().includes(query);
      if (matches) matched++;
      const visible =
        matches && (filtering || expanded || shown < initialCount);
      dish.hidden = !visible;
      if (visible) shown++;
    });
    count.textContent = filtering
      ? `${matched} ${matched === 1 ? "item" : "items"} found`
      : `Showing ${shown} of ${dishes.length} menu items`;
    more.hidden = filtering || dishes.length <= initialCount;
    more.textContent = expanded
      ? "Show highlights"
      : `View full menu (${dishes.length} items)`;
    more.setAttribute("aria-expanded", String(expanded));
    document.querySelector("#empty-menu").hidden = matched > 0;
  }

  function applyFilter() {
    expanded = false;
    updateMenu();
  }
  search.addEventListener("input", applyFilter);
  category.addEventListener("change", applyFilter);
  document.querySelector("#reset-menu").addEventListener("click", () => {
    search.value = "";
    category.value = "All";
    expanded = false;
    updateMenu();
    search.focus();
  });
  more.addEventListener("click", () => {
    expanded = !expanded;
    updateMenu();
    if (!expanded) {
      document.querySelector("#menu").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  });

  document.querySelector("#menu-tools").hidden = false;
  toggle.hidden = false;
  header.classList.add("nav-ready");
  updateMenu();
})();
