'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubjectStore, SUBJECTS } from "@/stores/subjectStore";

// 路径 → 页面名称映射
const PAGE_NAMES: Record<string, { name: string; icon: string }> = {
  '/': { name: '首页', icon: '🏠' },
  '/settings': { name: '设置', icon: '⚙️' },
  '/history': { name: '学习记录', icon: '📋' },
  '/analysis': { name: '薄弱分析', icon: '📊' },
  '/connect': { name: '串联学习', icon: '🔗' },
  '/wrong-questions': { name: '错题本', icon: '📝' },
  '/words': { name: '单词学习', icon: '📚' },
  '/words/stats': { name: '学习统计', icon: '📊' },
};

// 学科路径映射（优先级高于 SUBJECTS 常量）
const SUBJECT_PATHS: Record<string, { id: string; name: string; icon: string }> = {
  '/learn/math': { id: 'math', name: '数学', icon: '📐' },
  '/learn/math/geogebra': { id: 'math', name: 'GeoGebra', icon: '📐' },
  '/learn/math/geogebra/model': { id: 'math', name: 'GeoGebra', icon: '📐' },
  '/learn/physics': { id: 'physics', name: '物理', icon: '⚛️' },
  '/learn/chemistry': { id: 'chemistry', name: '化学', icon: '🧪' },
  '/learn/english': { id: 'english', name: '英语', icon: '🔤' },
  '/learn/chinese': { id: 'chinese', name: '语文', icon: '📖' },
  '/learn/biology': { id: 'biology', name: '生物', icon: '🧬' },
  '/learn/geography': { id: 'geography', name: '地理', icon: '🌍' },
  '/learn/politics': { id: 'politics', name: '政治', icon: '📜' },
  '/learn/history': { id: 'history', name: '历史', icon: '🏛️' },
};

function getPageInfo(pathname: string, currentSubject: string | null) {
  // 精确匹配优先
  if (PAGE_NAMES[pathname]) {
    return PAGE_NAMES[pathname];
  }

  // 按路径长度从长到短排序，优先匹配更具体的路径
  const sortedPaths = Object.entries(SUBJECT_PATHS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [path, subject] of sortedPaths) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return { name: subject.name, icon: subject.icon };
    }
  }

  // 学科主页：/subjects/math → 数学
  if (pathname.startsWith('/subjects/')) {
    const subject = SUBJECTS.find((s) => s.id === currentSubject);
    return { name: subject?.name || '学科', icon: subject?.icon || '📚' };
  }

  // 默认返回学科名
  const subject = SUBJECTS.find((s) => s.id === currentSubject);
  return { name: subject?.name || '学习', icon: subject?.icon || '📚' };
}

export function Header() {
  const pathname = usePathname();
  const { currentSubject } = useSubjectStore();
  const page = getPageInfo(pathname, currentSubject);

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{page.icon}</span>
        <h1 className="text-xl font-semibold">{page.name}</h1>
      </div>
      <Link href="/settings">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
    </header>
  );
}
