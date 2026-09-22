import React, { useState } from 'react';

interface TooltipProps {
  content?: string | React.ReactNode;
  text?: string | React.ReactNode;
  children?: React.ReactNode;
}

export default function Tooltip({ content, text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const displayContent = content || text;

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      {children || (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            color: 'var(--color-primary)',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            marginLeft: '4px',
            lineHeight: 1,
            userSelect: 'none',
          }}
          title="Click or hover for info"
        >
          i
        </span>
      )}
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            lineHeight: '1.4',
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: '240px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            border: '1px solid #334155',
            zIndex: 9999,
            textAlign: 'left',
            pointerEvents: 'none',
          }}
        >
          {displayContent}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: '-5px',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#1e293b transparent transparent transparent',
            }}
          />
        </span>
      )}
    </span>
  );
}
