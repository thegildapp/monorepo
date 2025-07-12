import { useState, useEffect } from 'react';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading" }: LoadingStateProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const shouldAnimateDot = (index: number): boolean => {
    if (animationPhase === 3) return false;
    return animationPhase === index;
  };

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.animatedDots}>
        <span className={styles.animatedDotsText}>{message}</span>
        {[0, 1, 2].map(index => (
          <span 
            key={index} 
            className={`${styles.animatedDot} ${shouldAnimateDot(index) ? styles.animated : ''}`}
          >
            .
          </span>
        ))}
      </div>
    </div>
  );
}