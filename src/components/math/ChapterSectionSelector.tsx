'use client';

import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Chapter {
  id: string;
  name: string;
  sectionCount: number;
}

interface Section {
  id: string;
  name: string;
  pageRange: string;
}

interface ChapterSectionSelectorProps {
  onSelect: (chapterId: string, sectionId: string, chapterName: string, sectionName: string) => void;
  defaultChapterId?: string;
  defaultSectionId?: string;
}

export function ChapterSectionSelector({ 
  onSelect, 
  defaultChapterId, 
  defaultSectionId 
}: ChapterSectionSelectorProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>(defaultChapterId || '');
  const [selectedSection, setSelectedSection] = useState<string>(defaultSectionId || '');
  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);

  // 加载章节列表
  useEffect(() => {
    async function loadChapters() {
      try {
        const res = await fetch('/api/math/generate-section-practice?action=chapters');
        const json = await res.json();
        if (json.success) {
          setChapters(json.data);
          if (defaultChapterId) {
            setSelectedChapter(defaultChapterId);
          } else if (json.data.length > 0) {
            setSelectedChapter(json.data[0].id);
          }
        }
      } catch (error) {
        console.error('加载章节列表失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadChapters();
  }, []);

  // 加载小节列表
  useEffect(() => {
    async function loadSections() {
      if (!selectedChapter) {
        setSections([]);
        return;
      }
      
      setLoadingSections(true);
      try {
        const res = await fetch(`/api/math/generate-section-practice?action=sections&chapterId=${selectedChapter}`);
        const json = await res.json();
        if (json.success) {
          setSections(json.data);
          if (defaultSectionId && json.data.some((s: Section) => s.id === defaultSectionId)) {
            setSelectedSection(defaultSectionId);
          } else if (json.data.length > 0) {
            setSelectedSection('');
          }
        }
      } catch (error) {
        console.error('加载小节列表失败:', error);
      } finally {
        setLoadingSections(false);
      }
    }
    loadSections();
  }, [selectedChapter]);

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setSelectedSection('');
  };

  const handleStartPractice = () => {
    if (!selectedChapter || !selectedSection) return;
    
    const chapter = chapters.find(c => c.id === selectedChapter);
    const section = sections.find(s => s.id === selectedSection);
    
    if (chapter && section) {
      onSelect(selectedChapter, selectedSection, chapter.name, section.name);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-2" />
          <p className="text-muted-foreground">加载章节列表...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <BookOpen className="h-5 w-5" />
          选择章节开始练习
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 章节选择 */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            选择章节
          </label>
          <div className="grid grid-cols-1 gap-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterChange(chapter.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedChapter === chapter.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{chapter.name}</span>
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${
                    selectedChapter === chapter.id ? 'rotate-90' : ''
                  }`} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{chapter.sectionCount}个小节</p>
              </button>
            ))}
          </div>
        </div>

        {/* 小节选择 */}
        {selectedChapter && (
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              选择小节
              {loadingSections && <Loader2 className="inline-block h-3 w-3 ml-2 animate-spin" />}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedSection === section.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-800">{section.id} {section.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">P{section.pageRange}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 开始练习按钮 */}
        {selectedChapter && selectedSection && (
          <Button
            onClick={handleStartPractice}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            size="lg"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            开始练习
          </Button>
        )}

        {!selectedChapter && (
          <p className="text-center text-sm text-slate-500">
            请先选择一个章节
          </p>
        )}

        {selectedChapter && !selectedSection && sections.length > 0 && (
          <p className="text-center text-sm text-slate-500">
            请选择一个具体的小节
          </p>
        )}
      </CardContent>
    </Card>
  );
}
