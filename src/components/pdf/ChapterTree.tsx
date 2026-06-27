'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ChevronDown, BookOpen, GraduationCap, 
  BookText, PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SubSection, Section, Chapter, PageRange } from '@/types/chapter';
import { resolvePageRange } from '@/lib/pdf-utils';

interface ChapterTreeProps {
  chapters: Chapter[];
  selectedChapter?: Chapter | null;
  onSelect?: (chapter: Chapter) => void;
  onChapterClick?: (chapter: Chapter, section?: Section, subSection?: SubSection) => void;
  subjectId: string;
  textbookId?: string;
}

function getPageRangeLabel(pages: PageRange): string {
  const effective = resolvePageRange(pages);
  const printedLabel = pages.type === 'printed' && Number.isFinite(pages.fileStart!) && Number.isFinite(pages.fileEnd!)
    ? `(${pages.start}-${pages.end} => ${pages.fileStart}-${pages.fileEnd})`
    : '';
  return `${effective.start}-${effective.end}${printedLabel ? ` ${printedLabel}` : ''}`;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
    .join('&');
}

function SubSectionItem({ 
  subSection, 
  sectionIndex,
  section,
  chapter,
  subjectId,
  textbookId,
}: { 
  subSection: SubSection;
  sectionIndex: string;
  section: Section;
  chapter: Chapter;
  subjectId: string;
  textbookId?: string;
}) {
  const router = useRouter();

  const handleClick = (mode: 'knowledge' | 'textbook' | 'practice') => {
    const basePath = mode === 'knowledge' ? '/learn/knowledge' : mode === 'textbook' ? '/learn/textbook' : '/learn/practice';
    const range = resolvePageRange(subSection.pages);
    const query = buildQuery({
      chapter: chapter.chapterIndex,
      section: section.sectionIndex,
      sectionTitle: section.sectionTitle,
      subSection: subSection.title,
      subSectionTitle: subSection.title,
      startPage: range.start,
      endPage: range.end,
      fileStart: subSection.pages.fileStart,
      fileEnd: subSection.pages.fileEnd,
      pageType: subSection.pages.type,
      pageRangeType: subSection.pages.type,
      textbookId: textbookId || '',
    });
    
    router.push(`${basePath}/${subjectId}/${chapter.chapterIndex}/${section.sectionIndex}?${query}`);
  };

  return (
    <div className="ml-10 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
      <div className="flex items-center gap-3">
        <span className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate">
          {sectionIndex} {subSection.title}
        </span>
        <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{getPageRangeLabel(subSection.pages)}</span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="xs"
            variant="outline"
            className="h-6 min-w-[48px] px-1.5 text-xs font-medium bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            onClick={() => handleClick('knowledge')}
          >
            <GraduationCap className="h-2.5 w-2.5 mr-0.5" />
            学习
          </Button>
          <Button 
            size="xs"
            variant="outline"
            className="h-6 min-w-[48px] px-1.5 text-xs font-medium bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
            onClick={() => handleClick('textbook')}
          >
            <BookText className="h-2.5 w-2.5 mr-0.5" />
            还原
          </Button>
          <Button 
            size="xs"
            variant="outline"
            className="h-6 min-w-[48px] px-1.5 text-xs font-medium bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
            onClick={() => handleClick('practice')}
          >
            <PenTool className="h-2.5 w-2.5 mr-0.5" />
            练习
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionItem({ 
  section, 
  chapter,
  subjectId,
  textbookId,
}: { 
  section: Section;
  chapter: Chapter;
  subjectId: string;
  textbookId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const hasSubSections = section.subSections && section.subSections.length > 0;

  const makeQuery = (extra: Record<string, string | number | undefined>) => buildQuery({
    chapter: chapter.chapterIndex,
    section: section.sectionIndex,
    startPage: resolvePageRange(section.pages).start,
    endPage: resolvePageRange(section.pages).end,
    fileStart: section.pages.fileStart,
    fileEnd: section.pages.fileEnd,
    pageType: section.pages.type,
    pageRangeType: section.pages.type,
    textbookId: textbookId || '',
    ...extra,
  });

  return (
    <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-4">
      <div className="py-2">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 py-2"
          onClick={() => hasSubSections && setExpanded(!expanded)}
        >
          <span className="flex-1 text-base font-medium text-slate-800 dark:text-slate-200 truncate">
            {section.sectionIndex} {section.sectionTitle}
          </span>
          <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{getPageRangeLabel(section.pages)}</span>
          <div className="flex items-center gap-1.5">
            <Button 
              size="sm"
              variant="outline"
              className="h-7 min-w-[56px] px-2 text-xs font-medium bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              onClick={(e) => { e.stopPropagation(); router.push(`/learn/knowledge/${subjectId}/${chapter.chapterIndex}/${section.sectionIndex}?${makeQuery({ sectionTitle: section.sectionTitle })}`); }}
            >
              <GraduationCap className="h-3 w-3 mr-0.5" />
              学习
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="h-7 min-w-[56px] px-2 text-xs font-medium bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
              onClick={(e) => { e.stopPropagation(); router.push(`/learn/textbook/${subjectId}/${chapter.chapterIndex}/${section.sectionIndex}?${makeQuery({ sectionTitle: section.sectionTitle })}`); }}
            >
              <BookText className="h-3 w-3 mr-0.5" />
              还原
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="h-7 min-w-[48px] px-2 text-xs font-medium bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
              onClick={(e) => { e.stopPropagation(); router.push(`/learn/practice/${subjectId}/${chapter.chapterIndex}/${section.sectionIndex}?${makeQuery({ sectionTitle: section.sectionTitle })}`); }}
            >
              <PenTool className="h-3 w-3 mr-0.5" />
              练习
            </Button>
          </div>
          {hasSubSections && (
            expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
        
        {expanded && hasSubSections && (
          <div className="mt-1">
            {section.subSections!.map((sub, idx) => (
              <SubSectionItem
                key={idx}
                subSection={sub}
                sectionIndex={section.sectionIndex}
                section={section}
                chapter={chapter}
                subjectId={subjectId}
                textbookId={textbookId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterCard({ 
  chapter, 
  isSelected,
  onSelect,
  subjectId,
  textbookId,
  isHistory = false,
}: { 
  chapter: Chapter; 
  isSelected?: boolean;
  onSelect?: (chapter: Chapter) => void;
  subjectId: string;
  textbookId?: string;
  isHistory?: boolean;
}) {
  const [expanded, setExpanded] = useState(isSelected || false);
  const router = useRouter();
  const hasSections = chapter.sections && chapter.sections.length > 0;

  // 历史教材显示"单元"，其他显示"章"
  const chapterLabel = isHistory ? '单元' : '章';
  // 历史教材显示"课"，其他显示"节"
  const sectionLabel = isHistory ? '课' : '节';

  return (
    <div className={cn(
      "rounded-xl border bg-white dark:bg-slate-800/50 overflow-hidden transition-all",
      isSelected 
        ? "border-indigo-300 dark:border-indigo-600 shadow-md" 
        : "border-slate-200 dark:border-slate-700"
    )}>
      {/* 章节头部 */}
      <div 
        className={cn(
          "flex items-center gap-3 p-4 cursor-pointer transition-colors",
          hasSections ? "bg-slate-50/80 dark:bg-slate-800/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
        onClick={() => {
          if (hasSections) setExpanded(!expanded);
          onSelect?.(chapter);
        }}
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
          isSelected 
            ? "bg-gradient-to-br from-indigo-600 to-purple-600" 
            : "bg-gradient-to-br from-indigo-500 to-purple-600"
        )}>
          {chapter.chapterIndex}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xl font-bold",
              isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
            )}>
              第{chapter.chapterIndex}{chapterLabel}
            </span>
            <span className="text-lg font-medium text-slate-700 dark:text-slate-300 truncate">
              {chapter.chapterTitle}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="text-sm px-2 py-0.5 h-6 bg-white dark:bg-slate-800">
              {getPageRangeLabel(chapter.pages)}
            </Badge>
            {hasSections && (
              <span className="text-sm text-slate-400">{chapter.sections!.length}{sectionLabel}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="min-w-[72px] h-8 px-3 text-sm font-medium bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            onClick={() => {
              const range = resolvePageRange(chapter.pages);
              router.push(`/learn/knowledge/${subjectId}/${chapter.chapterIndex}/all?${buildQuery({
                chapter: chapter.chapterIndex,
                startPage: range.start,
                endPage: range.end,
                fileStart: chapter.pages.fileStart,
                fileEnd: chapter.pages.fileEnd,
                pageType: chapter.pages.type,
                pageRangeType: chapter.pages.type,
                textbookId: textbookId || '',
              })}`);
            }}
          >
            <GraduationCap className="h-4 w-4 mr-1" />
            学习
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-w-[72px] h-8 px-3 text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
            onClick={() => {
              const range = resolvePageRange(chapter.pages);
              router.push(`/learn/textbook/${subjectId}/${chapter.chapterIndex}/all?${buildQuery({
                chapter: chapter.chapterIndex,
                startPage: range.start,
                endPage: range.end,
                fileStart: chapter.pages.fileStart,
                fileEnd: chapter.pages.fileEnd,
                pageType: chapter.pages.type,
                pageRangeType: chapter.pages.type,
                textbookId: textbookId || '',
              })}`);
            }}
          >
            <BookText className="h-4 w-4 mr-1" />
            还原
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-w-[72px] h-8 px-3 text-sm font-medium bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
            onClick={() => router.push(`/learn/practice/${subjectId}/${chapter.chapterIndex}/all?${buildQuery({
              chapter: chapter.chapterIndex,
              textbookId: textbookId || '',
            })}`)}
          >
            <PenTool className="h-4 w-4 mr-1" />
            练习
          </Button>
        </div>
        {hasSections && (
          expanded ? <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" /> : <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
        )}
      </div>

      {/* 小节列表 */}
      {expanded && hasSections && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-4 space-y-1">
          {chapter.sections!.map((section, idx) => (
            <SectionItem
              key={idx}
              section={section}
              chapter={chapter}
              subjectId={subjectId}
              textbookId={textbookId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChapterTree({ chapters, selectedChapter, onSelect, subjectId, textbookId, isHistory = false }: ChapterTreeProps & { isHistory?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-indigo-500" />
        <span className="text-base font-semibold text-slate-600 dark:text-slate-400">
          共 {chapters.length} {isHistory ? '单元' : '章'}
        </span>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.chapterIndex}
            chapter={chapter}
            isSelected={selectedChapter?.chapterIndex === chapter.chapterIndex}
            onSelect={onSelect}
            subjectId={subjectId}
            textbookId={textbookId}
            isHistory={isHistory}
          />
        ))}
      </div>
    </div>
  );
}
