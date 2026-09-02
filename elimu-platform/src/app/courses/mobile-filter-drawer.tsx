'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface MobileFilterDrawerProps {
  categories: { name: string; slug: string }[];
  currentCategory: string;
  currentLevel: string;
}

export default function MobileFilterDrawer({ categories, currentCategory, currentLevel }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const applyFilter = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    router.push(`/courses?${sp.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-full bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
        {(currentCategory || currentLevel) && (
          <span className="h-5 w-5 rounded-full bg-[#1a6b3c] text-white text-[10px] flex items-center justify-center font-bold">
            {(currentCategory ? 1 : 0) + (currentLevel ? 1 : 0)}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-[#111310]">Filter Courses</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="h-5 w-5 text-[#7a7468]" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {/* Category filter */}
              <div>
                <h4 className="font-semibold text-sm text-[#111310] mb-3">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => applyFilter({ level: currentLevel })}
                    className={`block w-full text-left px-3 py-2 rounded-full text-sm transition-colors ${
                      !currentCategory ? 'bg-[#f0f7f3] text-[#1a6b3c] font-medium' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => applyFilter({ category: cat.slug, level: currentLevel })}
                      className={`block w-full text-left px-3 py-2 rounded-full text-sm transition-colors ${
                        currentCategory === cat.slug ? 'bg-[#f0f7f3] text-[#1a6b3c] font-medium' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Level filter */}
              <div>
                <h4 className="font-semibold text-sm text-[#111310] mb-3">Level</h4>
                <div className="space-y-1">
                  {['', 'beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => applyFilter({ category: currentCategory, level })}
                      className={`block w-full text-left px-3 py-2 rounded-full text-sm transition-colors ${
                        currentLevel === level ? 'bg-[#f0f7f3] text-[#1a6b3c] font-medium' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {level || 'All Levels'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
