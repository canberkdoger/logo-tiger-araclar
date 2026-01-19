import styles from './GlassCard.module.css';

/**
 * Glass efektli kart componenti
 * @param {Object} props
 * @param {React.ReactNode} props.children - Kart icerigi
 * @param {string} props.className - Ek CSS class
 * @param {boolean} props.hover - Hover efekti
 */
export default function GlassCard({ children, className = '', hover = false }) {
  return (
    <div className={`${styles.card} ${hover ? styles.hover : ''} ${className}`}>
      {children}
    </div>
  );
}
