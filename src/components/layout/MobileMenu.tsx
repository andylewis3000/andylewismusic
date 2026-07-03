/**
 * MobileMenu — accessible slide-in navigation drawer (Preact island).
 *
 * Accessibility:
 *  - Trigger exposes aria-expanded / aria-controls.
 *  - Open traps focus within the drawer; Tab/Shift+Tab cycle.
 *  - Escape closes; focus returns to the trigger.
 *  - Backdrop click closes; body scroll is locked while open.
 *  - Closes automatically on Astro view-transition navigation.
 */
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import './MobileMenu.css';

interface NavLink {
  label: string;
  href: string;
}
interface Props {
  links: NavLink[];
  cta?: { label: string; href: string } | null;
  currentPath: string;
}

const isActive = (href: string, path: string) =>
  href === '/' ? path === '/' : path.startsWith(href);

export default function MobileMenu({ links, cta, currentPath }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>('a, button');
      first?.focus();
    }
  }, [open]);

  // Close on route change (view transitions).
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener('astro:after-swap', close);
    return () => document.removeEventListener('astro:after-swap', close);
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>('a, button');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div class="mobile-nav">
      <button
        ref={triggerRef}
        type="button"
        class="menu-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <div
        class={`menu-backdrop${open ? ' is-open' : ''}`}
        hidden={!open}
        onClick={() => setOpen(false)}
      />

      <div
        id={panelId}
        ref={panelRef}
        class={`menu-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        onKeyDown={onKeyDown}
      >
        <nav aria-label="Mobile">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} aria-current={isActive(link.href, currentPath) ? 'page' : undefined}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {cta && (
          <a class="btn btn-primary menu-cta" href={cta.href}>
            {cta.label}
          </a>
        )}
      </div>
    </div>
  );
}
