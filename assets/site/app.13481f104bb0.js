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
        categoryMatches &&
        (dish.querySelector("h3").textContent + " " + dish.dataset.category)
          .toLowerCase()
          .includes(query);
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

(() => {
  const storageKey = "saad-classic-cart-v1";
  const maxQuantity = 99;
  const dialog = document.querySelector("#cart-dialog");
  const opener = document.querySelector("#cart-toggle");
  const list = document.querySelector("#cart-items");
  const status = document.querySelector("#cart-status");
  const products = new Map();
  const addButtons = new Map();
  let cart = new Map();
  let statusTimer;
  let returnFocus;
  let previousOverflow;

  document.querySelectorAll(".dish").forEach((dish) => {
    const img = dish.querySelector("img");
    const id = img.getAttribute("src").match(/dish-(\d+)-/)[1];
    const name = dish.querySelector("h3").textContent;
    products.set(id, { name, image: img.getAttribute("src") });
    const button = document.createElement("button");
    button.className = "add-to-cart";
    button.type = "button";
    button.textContent = "Add +";
    button.setAttribute("aria-label", `Add ${name} to cart`);
    button.addEventListener("click", () => change(id, 1));
    dish.querySelector("div").append(button);
    addButtons.set(id, button);
  });

  function restore(raw) {
    const restored = new Map();
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data))
        data.forEach((entry) => {
          if (
            entry &&
            products.has(entry.id) &&
            Number.isInteger(entry.quantity) &&
            entry.quantity > 0
          ) {
            restored.set(entry.id, Math.min(entry.quantity, maxQuantity));
          }
        });
    } catch {
      /* Invalid or unavailable saved data starts with an empty cart. */
    }
    return restored;
  }

  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.add("visible");
    statusTimer = setTimeout(() => status.classList.remove("visible"), 3500);
  }

  function save() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify([...cart].map(([id, quantity]) => ({ id, quantity }))),
      );
      return true;
    } catch {
      return false;
    }
  }

  function control(label, text, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    button.dataset.action = action;
    return button;
  }

  function render() {
    const active = document.activeElement;
    const focusedRow = active?.closest("[data-cart-id]");
    const focusedId = focusedRow?.dataset.cartId;
    const action = active?.dataset.action;
    const oldIndex = focusedRow ? [...list.children].indexOf(focusedRow) : -1;
    list.replaceChildren();
    let total = 0;
    cart.forEach((quantity, id) => {
      total += quantity;
      const product = products.get(id);
      const row = document.createElement("li");
      row.dataset.cartId = id;
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = "";
      image.width = 64;
      image.height = 64;
      const details = document.createElement("div");
      details.className = "cart-item-details";
      const title = document.createElement("h3");
      title.textContent = product.name;
      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `${product.name} quantity`);
      const minus = control(
        `Decrease ${product.name} quantity`,
        "−",
        "decrease",
      );
      const number = document.createElement("span");
      number.textContent = quantity;
      number.setAttribute("aria-label", `Quantity ${quantity}`);
      const plus = control(
        `Increase ${product.name} quantity`,
        "+",
        "increase",
      );
      plus.disabled = quantity >= maxQuantity;
      const remove = control(
        `Remove ${product.name} from cart`,
        "Remove",
        "remove",
      );
      remove.className = "text-button remove-item";
      controls.append(minus, number, plus, remove);
      details.append(title, controls);
      row.append(image, details);
      list.append(row);
    });
    document.querySelector("#cart-count").textContent = total;
    opener.setAttribute(
      "aria-label",
      `Open cart, ${total} ${total === 1 ? "item" : "items"}`,
    );
    document.querySelector("#cart-total").textContent =
      `${total} ${total === 1 ? "item" : "items"} selected`;
    document.querySelector("#cart-empty").hidden = total > 0;
    document.querySelector("#cart-summary").hidden = total === 0;
    list.hidden = total === 0;
    addButtons.forEach((button, id) => {
      const quantity = cart.get(id) || 0;
      button.textContent = quantity ? `Add + · ${quantity} in cart` : "Add +";
      button.disabled = quantity >= maxQuantity;
      button.setAttribute(
        "aria-label",
        `Add ${products.get(id).name} to cart${quantity ? `, ${quantity} in cart` : ""}`,
      );
    });
    if (dialog.open && focusedId) {
      const row =
        [...list.children].find((item) => item.dataset.cartId === focusedId) ||
        list.children[Math.min(oldIndex, list.children.length - 1)];
      const next =
        row?.querySelector(`[data-action="${action}"]:not(:disabled)`) ||
        row?.querySelector("button") ||
        document.querySelector("#cart-browse");
      next.focus();
    } else if (dialog.open && active?.id === "cart-clear" && total === 0) {
      document.querySelector("#cart-browse").focus();
    }
  }

  function change(id, delta) {
    const current = cart.get(id) || 0;
    const quantity = Math.min(maxQuantity, Math.max(0, current + delta));
    if (quantity === current) return;
    if (quantity) cart.set(id, quantity);
    else cart.delete(id);
    const persisted = save();
    render();
    announce(
      `${products.get(id).name} ${quantity ? `— ${quantity} in cart.` : "removed from cart."}${persisted ? "" : " Storage is unavailable; your cart will last for this visit."}`,
    );
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.closest("[data-cart-id]").dataset.cartId;
    change(
      id,
      button.dataset.action === "remove"
        ? -cart.get(id)
        : button.dataset.action === "increase"
          ? 1
          : -1,
    );
  });
  opener.addEventListener("click", () => {
    returnFocus = document.activeElement;
    previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
  });
  document
    .querySelector("#cart-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.documentElement.style.overflow = previousOverflow || "";
    returnFocus?.focus();
  });
  document.querySelector("#cart-browse").addEventListener("click", () => {
    dialog.close();
    document.querySelector('#main-nav a[href="#menu"]').click();
    setTimeout(
      () =>
        document.querySelector("#menu-search").focus({ preventScroll: true }),
      0,
    );
  });
  document.querySelector("#cart-clear").addEventListener("click", () => {
    cart.clear();
    const persisted = save();
    render();
    announce(
      persisted
        ? "Cart cleared."
        : "Cart cleared for this visit. Saved storage is unavailable.",
    );
  });
  window.addEventListener("storage", (event) => {
    if (
      event.storageArea === localStorage &&
      (event.key === storageKey || event.key === null)
    ) {
      cart = restore(event.newValue);
      render();
    }
  });
  try {
    cart = restore(localStorage.getItem(storageKey));
  } catch {
    /* Cart still works without storage. */
  }
  render();
  opener.hidden = false;
})();
