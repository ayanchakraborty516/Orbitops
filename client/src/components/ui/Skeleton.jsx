import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[#E5DED2] dark:bg-[#2A2C27] rounded ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] rounded-lg p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-3.5" />
        <Skeleton className="w-6 h-6 rounded" />
      </div>
      <Skeleton className="w-32 h-6" />
      <Skeleton className="w-44 h-3 mt-1" />
    </div>
  );
}

export default Skeleton;
