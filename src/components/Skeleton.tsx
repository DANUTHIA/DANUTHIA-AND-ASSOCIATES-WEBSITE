import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-steel/20 dark:bg-concrete/10 ${className}`} />
);
