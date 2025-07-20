import React from 'react';
import styles from './AnimatedDots.module.css';

interface AnimatedDotsProps {
  text: string;
}

const AnimatedDots: React.FC<AnimatedDotsProps> = ({ text }) => {
  return (
    <div className={styles.container}>
      <span className={styles.text}>{text}</span>
      <span className={styles.dots}>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </span>
    </div>
  );
};

export default AnimatedDots;