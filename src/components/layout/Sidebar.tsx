"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ListChecks, BarChart3, Link2, BookMarked, BookOpen, GraduationCap, Headphones, Home, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBJECTS, useSubjectStore } from "@/stores/subjectStore";

export function Sidebar() {
  const { currentSubject } = useSubjectStore();
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r bg-card h-screen sticky top-0 p-4 flex flex-col gap-1 overflow-y-auto">
      <div className="mb-3 px-2">
        <Link href="/">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            className="w-full justify-start py-3 px-3 text-base font-medium transition-colors"
          >
            <Home className="h-5 w-5 mr-3" />
            首页
          </Button>
        </Link>
      </div>

      <h2 className="text-lg font-bold mb-3 px-2 text-slate-700 dark:text-slate-300 sticky top-0 bg-card py-2 z-10">
        学科选择
      </h2>
      
      <div className="space-y-0.5">
        {SUBJECTS.map((subject) => {
          const href = `/subjects/${subject.id}`;
          const isActive = pathname === href || currentSubject === subject.id;

          return (
            <Link key={subject.id} href={href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start text-left py-3 px-3 text-base font-medium transition-colors"
                style={isActive ? { 
                  backgroundColor: `${subject.color}15`,
                  color: subject.color,
                  borderColor: `${subject.color}50`
                } : {}}
              >
                <span className="mr-3 text-xl">{subject.icon}</span>
                <span>{subject.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-0.5">
          <Link href="/history" className="block">
            <Button
              variant={pathname === "/history" ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <ListChecks className="h-5 w-5 mr-3" />
              学习记录
            </Button>
          </Link>
          <Link href="/analysis" className="block">
            <Button
              variant={pathname === "/analysis" ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              薄弱分析
            </Button>
          </Link>
          <Link href="/wrong-questions" className="block">
            <Button
              variant={pathname === "/wrong-questions" ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <BookMarked className="h-5 w-5 mr-3" />
              错题本
            </Button>
          </Link>
          <Link href="/connect" className="block">
            <Button
              variant={pathname === "/connect" ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Link2 className="h-5 w-5 mr-3" />
              串联学习
            </Button>
          </Link>
          <Link href="/learn/english" className="block">
            <Button
              variant={pathname.startsWith("/learn/english") ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <GraduationCap className="h-5 w-5 mr-3" />
              英语学习中心
            </Button>
          </Link>
          <Link href="/learn/english/listening" className="block">
            <Button
              variant={pathname === "/learn/english/listening" ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Headphones className="h-5 w-5 mr-3" />
              英语听力训练
            </Button>
          </Link>
          <Link href="/words" className="block">
            <Button
              variant={pathname === "/words" ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <BookOpen className="h-5 w-5 mr-3" />
              英语单词
            </Button>
          </Link>
          <Link href="/learn/math/geogebra" className="block">
            <Button
              variant={pathname.startsWith("/learn/math/geogebra") ? "secondary" : "ghost"}
              className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Ruler className="h-5 w-5 mr-3" />
              GeoGebra
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start py-3 px-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Settings className="h-5 w-5 mr-3" />
            设置
          </Button>
        </Link>
      </div>
    </aside>
  );
}
