import React from 'react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import styles from './InquiryCard.module.css';

interface InquiryCardProps {
  inquiry: {
    id: string;
    buyer: {
      name: string | null;
      avatarUrl?: string | null;
    };
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    respondedAt?: string | null;
  };
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isResponding?: boolean;
}

const InquiryCard: React.FC<InquiryCardProps> = ({ 
  inquiry, 
  onAccept, 
  onReject,
  isResponding = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isPending = inquiry.status === 'PENDING';
  const isAccepted = inquiry.status === 'ACCEPTED';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar 
          src={inquiry.buyer.avatarUrl} 
          name={inquiry.buyer.name || 'Anonymous'} 
          size="medium"
          className={styles.avatar}
        />
        <div className={styles.info}>
          <div className={styles.name}>{inquiry.buyer.name || 'Anonymous'}</div>
          <div className={styles.time}>
            {isAccepted && 'Accepted '}
            {formatDate(inquiry.respondedAt || inquiry.createdAt)}
          </div>
        </div>
        {isPending && onAccept && (
          <Button
            variant="primary"
            onClick={() => onAccept(inquiry.id)}
            disabled={isResponding}
            size="small"
          >
            Accept
          </Button>
        )}
        {isPending && onReject && (
          <Button
            variant="secondary"
            onClick={() => onReject(inquiry.id)}
            disabled={isResponding}
            size="small"
          >
            Pass
          </Button>
        )}
      </div>
      
      
      {isAccepted && (
        <div className={styles.status}>
          Contact info shared
        </div>
      )}
    </div>
  );
};

export default InquiryCard;