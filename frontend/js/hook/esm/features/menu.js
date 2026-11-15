export function initMenu() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const openButton = document.getElementById('bottom-menu-button');
  const closeButton = document.getElementById('close-menu-btn');
  if (!menu || !overlay) return;

  const openMenu = () => {
    menu.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
    openButton?.classList.add('active-menu');
  };
  const closeMenu = () => {
    menu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    openButton?.classList.remove('active-menu');
  };

  window.openMenu = openMenu;
  window.closeMenu = closeMenu;

  openButton?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    menu.classList.contains('active') ? closeMenu() : openMenu();
  });

  closeButton?.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  menu.querySelectorAll('a.menu-link').forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(() => closeMenu(), 200);
    });
  });
}
