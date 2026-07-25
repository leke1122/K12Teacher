'use client';

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Settings, ArrowLeft, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubjectStore, SUBJECTS } from "@/stores/subjectStore";
import { useScrollHide } from "@/hooks/useScrollHide";
import { useEffect, useState, useRef } from "react";
import { GEOGRAPHY_KNOWLEDGE_CHAPTERS } from "@/data/geography/knowledgeFull";

const PAGE_NAMES: Record<string, { name: string; icon: string }> = {
  '/': { name: '首页', icon: 'H' },
  '/settings': { name: '设置', icon: 'S' },
  '/history': { name: '学习记录', icon: 'R' },
  '/analysis': { name: '薄弱分析', icon: 'A' },
  '/connect': { name: '串联学习', icon: 'L' },
  '/wrong-questions': { name: '错题本', icon: 'W' },
  '/words': { name: '单词学习', icon: 'D' },
  '/words/stats': { name: '学习统计', icon: 'T' },
};

const SUBJECT_PATHS: Record<string, { id: string; name: string; icon: string }> = {
  '/learn/math': { id: 'math', name: '数学学习中心', icon: 'M' },
  '/learn/math/geogebra': { id: 'math', name: 'GeoGebra', icon: 'G' },
  '/learn/math/geogebra/model': { id: 'math', name: 'GeoGebra', icon: 'G' },
  '/learn/physics': { id: 'physics', name: '物理学习中心', icon: 'P' },
  '/learn/chemistry': { id: 'chemistry', name: '化学学习中心', icon: 'C' },
  '/learn/english': { id: 'english', name: '英语学习中心', icon: 'E' },
  '/learn/chinese': { id: 'chinese', name: '语文学习中心', icon: 'Y' },
  '/learn/biology': { id: 'biology', name: '生物学习中心', icon: 'B' },
  '/learn/geography': { id: 'geography', name: '地理学习中心', icon: 'D' },
  '/learn/history': { id: 'history', name: '历史学习中心', icon: 'H' },
  '/learn/politics': { id: 'politics', name: '政治学习中心', icon: 'Z' },
};

function getPageInfo(pathname: string, currentSubject: string | null) {
  if (PAGE_NAMES[pathname]) {
    return PAGE_NAMES[pathname];
  }

  const subjectsMatch = pathname.match(/^\/subjects\/([^\/]+)/);
  if (subjectsMatch) {
    const subject = SUBJECTS.find((s) => s.id === subjectsMatch[1]);
    return { name: subject?.name || '学科', icon: subject?.icon || 'X' };
  }

  const sortedPaths = Object.entries(SUBJECT_PATHS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [path, subject] of sortedPaths) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return { name: subject.name, icon: subject.icon };
    }
  }

  const subject = SUBJECTS.find((s) => s.id === currentSubject);
  return { name: subject?.name || '学习', icon: subject?.icon || 'X' };
}

const GEOGRAPHY_KNOWLEDGE_TABS = [
  { id: 'guided', label: '导学' },
  { id: 'knowledge', label: '知识点' },
  { id: 'exam', label: '真题' },
  { id: 'mistakes', label: '易错' },
  { id: 'mustknow', label: '必背' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentSubject } = useSubjectStore();
  const page = getPageInfo(pathname, currentSubject);
  const isHidden = useScrollHide({ threshold: 10, sensitivity: 1, hideDelay: 0 });
  const [mounted, setMounted] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setChapterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const isGeographyKnowledge = pathname.includes('/learn/geography/knowledge-full/');
  const currentChapterId = searchParams.get('chapter') || 'chapter1';
  const currentMode = searchParams.get('mode') || 'guided';
  const currentChapter = GEOGRAPHY_KNOWLEDGE_CHAPTERS.find(ch => ch.id === currentChapterId) || GEOGRAPHY_KNOWLEDGE_CHAPTERS[0];

  const switchChapter = (chapterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('chapter', chapterId);
    router.push(`${pathname}?${params.toString()}`);
    setChapterOpen(false);
  };

  const switchMode = (mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', mode);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header
      className={`
        h-auto min-h-[56px] border-b bg-card/95 backdrop-blur-sm px-4 sm:px-6 py-2
        fixed top-0 left-0 right-0 z-50 transition-transform duration-200
        ${isHidden ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isGeographyKnowledge && (
            <Link href="/subjects/geography">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
          )}
          {page.icon === 'D' && page.name === '地理学习中心' ? (
            <Globe className="h-5 w-5 text-emerald-600" />
          ) : (
            <span className="text-lg font-bold text-emerald-600">{page.icon}</span>
          )}
          <h1 className="text-lg sm:text-xl font-semibold">{page.name}</h1>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {isGeographyKnowledge && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setChapterOpen(!chapterOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
            >
              {currentChapter.title.slice(0, 15)}
              <ChevronDown className="h-4 w-4" />
            </button>
            {chapterOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px]">
                {GEOGRAPHY_KNOWLEDGE_CHAPTERS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => switchChapter(ch.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                      ch.id === currentChapterId ? 'bg-emerald-50 text-emerald-600' : ''
                    }`}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {GEOGRAPHY_KNOWLEDGE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchMode(tab.id)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentMode === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
