'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import styles from './Navbar.module.css';

/**
 * Ana navigasyon componenti
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'Tablo Gezgini', icon: 'fa-database' },
    { href: '/sorgu-olusturucu', label: 'Sorgu Oluşturucu', icon: 'fa-code' },
    { href: '/hazir-sorgular', label: 'Hazır Sorgular', icon: 'fa-list' },
    { href: '/rest-api', label: 'REST API', icon: 'fa-cloud' },
    { href: '/hakkinda', label: 'Hakkında', icon: 'fa-info-circle' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <i className="fas fa-database"></i>
          <span>Logo Tiger 3 Araçları</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.navLink}>
                <i className={`fas ${link.icon}`}></i>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side Actions */}
        <div className={styles.actions}>
          {/* Theme Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}
            title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
          >
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/canberkdoger/logo-tiger-araclar"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            title="GitHub"
          >
            <i className="fab fa-github"></i>
          </a>

          {/* Mobile Menu Button */}
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fas ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            className={styles.mobileThemeToggle}
            onClick={toggleTheme}
          >
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            <span>{theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
