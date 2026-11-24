import React, { useState } from 'react';

interface AvatarProps {
  src: string;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = 'w-9 h-9' }) => {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'DK';

  if (failed || !src) {
    return (
      <div
        aria-label={name}
        className={`${className} rounded-full bg-secondary text-on-secondary flex items-center justify-center font-headline text-label-sm shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} rounded-full object-cover shrink-0`}
    />
  );
};
