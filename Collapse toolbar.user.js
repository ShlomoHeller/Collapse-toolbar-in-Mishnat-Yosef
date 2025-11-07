// ==UserScript==
// @name         כיווץ הסרגל כלים והסל קניות של משנת יוסף
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Shlomo Heller
// @description  הוספת כפתור כיווץ לסרגל כלים וסל הקניות באתר משנת יוסף
// @match        https://mishnatyosef.org/*
// @icon         https://mishnatyosef.org/assets/logo-lg-a1d09199.svg
// @downloadURL  https://github.com/ShlomoHeller/Collapse-toolbar-in-Mishnat-Yosef/raw/refs/heads/main/Collapse%20toolbar.user.js
// @grant        GM_addStyle
// ==/UserScript==

(() => {
  'use strict';

  GM_addStyle(`
    section, .flex.flex-row.gap-\\[36px\\] {
      transition: width .3s ease, gap .3s ease, flex-basis .3s ease !important;
    }
    #cart.cart-collapsed {
      width: 100px !important;
    }
    #cart.cart-collapsed #cart-title,
    #cart.cart-collapsed div.bg-gray_semantic,
    #cart.cart-collapsed .item p:not(.font-bold.text-primary-900),
    #cart.cart-collapsed .item input,
    #cart.cart-collapsed > button,
    #cart.cart-collapsed .item button[data-v-f81940d1],
    #cart.cart-collapsed .tooltip {
      display: none !important;
    }
    #cart.cart-collapsed .item > div[data-v-986e9b24] {
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 0 0 5px !important;
      position: relative;
    }
    #cart.cart-collapsed .item img {
      width: 80px !important;
      height: 80px !important;
      margin: 0 !important;
    }
    #cart.cart-collapsed .item p.font-bold.text-primary-900 {
      display: block !important;
      font-size: 12px;
      text-align: center;
      margin-top: 4px;
    }
    #cart.cart-collapsed .item button.absolute {
      display: flex !important;
      position: absolute !important;
      bottom: -45px;
      left: 50%;
      transform: translateX(-50%) scale(0.9);
    }
    #cart.cart-collapsed .custom-scroll-bar { padding-bottom: 100px; }
    #cart.cart-collapsed .text-grays-900,
    #cart.cart-collapsed .text-primary-700 {
      font-size: 12px !important;
      display: block !important;
      text-align: center !important;
      white-space: nowrap !important;
      overflow: hidden !important;
    }
  `);

  const qs = s => document.querySelector(s);
  const storageKey = 'sidebarIsCollapsed';
  const widths = { expand: '196px', collapse: '69px' };

  const waitFor = (sel, cb) => {
    const interval = setInterval(() => {
      const el = qs(sel);
      if (el) {
        clearInterval(interval);
        cb(el);
      }
    }, 200);
  };

  const observer = new MutationObserver((_, obs) => {
    const el = qs('#cart.cart-collapsed .border-t');
    if (!el) return;

    obs.disconnect();

    Object.assign(el.style, {
      position: 'absolute',
      bottom: '50px',
      left: '0',
      width: '100%',
      background: 'white',
      zIndex: 10,
      pointerEvents: 'none',
      borderTop: '1px solid #ccc',
      padding: '0',
      boxSizing: 'border-box'
    });

    const cartContainer = qs('#cart.cart-collapsed .relative.w-full.h-screen.flex.flex-col.justify-between.bg-white');
    if (cartContainer) Object.assign(cartContainer.style, { background: 'white', paddingBottom: '100px' });

    const totalSpan = el.querySelector('.text-primary-700');
    if (totalSpan) totalSpan.innerHTML = totalSpan.innerHTML.replace('סך הכל', 'סה״כ');
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const toggleSidebar = (collapsed, el) => {
    const { main, cont, top, nav, logo, logoWrap, badges, headers, items, btn } = el;
    main.style.paddingRight = collapsed ? widths.collapse : widths.expand;
    cont.classList.toggle('md:w-[196px]', !collapsed);
    cont.classList.toggle('md:w-20', collapsed);
    top.style.right = `calc(${collapsed ? widths.collapse : widths.expand} - 1px)`;
    top.classList.remove('xl:w-[calc(100%-196px)]');
    nav?.querySelector('[style*="flex-grow: 1"]')?.style.setProperty('display', collapsed ? 'block' : 'none');
    if (logo) logo.style.width = collapsed ? '50px' : '';
    if (logoWrap) Object.assign(logoWrap.style, { marginTop: collapsed ? '8px' : '', marginBottom: collapsed ? '20px' : '' });
    badges.forEach(b => b.style.display = collapsed ? 'none' : '');
    headers.forEach(h => h.style.justifyContent = collapsed ? 'center' : '');
    items.forEach(el => {
      el.querySelector('.sidebar-text')?.style.setProperty('display', collapsed ? 'none' : 'inline');
      el.querySelector('.material-symbols-rounded')?.classList.toggle('ml-2', !collapsed);
      el.style.justifyContent = collapsed ? 'center' : '';
    });
    const icon = btn.querySelector('.material-symbols-rounded');
    const text = btn.querySelector('.sidebar-text');
    icon.textContent = collapsed ? 'chevron_left' : 'chevron_right';
    text.style.display = collapsed ? 'none' : 'inline';
    btn.style.justifyContent = collapsed ? 'center' : '';
  };

  const toggleCart = (collapsed, main) => {
    const cart = qs('#cart');
    const cont = cart?.closest('section');
    if (cart && cont && main) {
      cart.classList.toggle('cart-collapsed', collapsed);
      cont.style.flex = collapsed ? '0 0 40px' : '0 0 300px';
    }
  };

  waitFor('div.sidebar', sidebar => {
    const cont = qs('div.md\\:flex.md\\:w-\\[196px\\]');
    const main = qs('.md\\:pr-\\[196px\\]');
    const top = qs('div.fixed.z-30.bg-primary-900');
    if (!cont || !main || !top) return;

    [cont, main].forEach(e => e.style.transition = 'all .3s ease-in-out');

    const logo = cont.querySelector('img.logo');
    const logoWrap = logo?.closest('div.items-center');
    const badges = cont.querySelectorAll('.bg-secondary-200');
    const headers = [...cont.querySelectorAll('.text-slate-400')];
    const bottom = cont.querySelector('.mb-\\[30px\\]');
    const nav = sidebar.querySelector('nav');
    if (nav) Object.assign(nav.style, { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' });

    const items = [...cont.querySelectorAll('nav a, .pointer-events-none, button.h-10')];
    items.forEach(el => {
      if (!el.querySelector('.sidebar-text')) {
        const txt = el.innerText.trim();
        const ic = el.querySelector('.material-symbols-rounded');
        el.innerHTML = ic ? `${ic.outerHTML}<span class="sidebar-text">${txt.replace(ic.innerText, '').trim()}</span>` : `<span class="sidebar-text">${txt}</span>`;
      }
    });

    const btn = document.createElement('a');
    btn.className = 'group flex items-center px-2 py-2 text-base font-medium rounded-[4px] text-primary-200 hover:text-primary-500 hover:bg-purple_semantic h-10';
    btn.style.cursor = 'pointer';
    btn.innerHTML = `<span class="material-symbols-rounded">chevron_right</span><span class="sidebar-text"> כווץ סרגל</span>`;
    btn.onclick = e => {
      e.preventDefault();
      const collapsed = !cont.classList.contains('md:w-20');
      localStorage.setItem(storageKey, collapsed);
      toggleSidebar(collapsed, { main, cont, top, nav, logo, logoWrap, badges, headers, items, btn });
      toggleCart(collapsed, main);
    };

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col px-2';
    wrap.append(btn);
    bottom?.before(wrap);

    toggleSidebar(localStorage.getItem(storageKey) === 'true', { main, cont, top, nav, logo, logoWrap, badges, headers, items, btn });
  });

  waitFor('#cart', () => toggleCart(localStorage.getItem(storageKey) === 'true', qs('.md\\:pr-\\[196px\\]')));
})();
