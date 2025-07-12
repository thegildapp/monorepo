import { type ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.pageContainer}>
      {children}
    </div>
  );
}