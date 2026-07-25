"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ListChecks, BarChart3, Link2, BookMarked, Home, Ruler, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SUBJECTS } from "@/stores/subjectStore";
import { useLayoutStore } from "@/stores/layoutStore";
import { useScrollHide } from "@/hooks/useScrollHide";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const isHidden = useScrollHide({ threshold: 80, sensitivity: 5, hideDelay: 150, showDelay: 50 });

  return (
    <aside
      className={`
        border-r bg-card h-screen sticky top-0 flex flex-col overflow-hidden
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? "w-14" : "w-56 sm:w-64"}
        ${isHidden ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      `}
    >
      {/* Collapse Toggle Button */}
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className={`flex-1 overflow-y-auto px-2 pb-4 ${sidebarCollapsed ? "px-1" : ""}`}>
        {/* Home Button */}
        <div className="mb-3">
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/">
                  <Button
                    variant={pathname === "/" ? "secondary" : "ghost"}
                    size="icon"
                    className="w-10 h-10"
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">首页</TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                className="w-full justify-start py-2.5 px-3 text-sm font-medium"
              >
                <Home className="h-4 w-4 mr-2.5" />
                首页
              </Button>
            </Link>
          )}
        </div>

        {/* Subjects Title */}
        {!sidebarCollapsed && (
          <h2 className="text-sm font-bold mb-2 px-2 text-slate-500 dark:text-slate-400 sticky top-0 bg-card py-1 z-10">
            学科
          </h2>
        )}

        {/* Subjects */}
        <div className="space-y-0.5">
          {SUBJECTS.map((subject) => {
            const href = `/subjects/${subject.id}`;
            const isActive = pathname === href;

            if (sidebarCollapsed) {
              return (
                <Tooltip key={subject.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className="w-10 h-10"
                        style={isActive ? {
                          backgroundColor: `${subject.color}15`,
                          color: subject.color,
                          borderColor: `${subject.color}50`
                        } : {}}
                      >
                        <span className="text-lg">{subject.icon}</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{subject.name}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={subject.id} href={href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start text-left py-2 px-2.5 text-sm font-medium"
                  style={isActive ? {
                    backgroundColor: `${subject.color}15`,
                    color: subject.color,
                    borderColor: `${subject.color}50`
                  } : {}}
                >
                  <span className="mr-2 text-lg">{subject.icon}</span>
                  <span>{subject.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className={`mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 ${sidebarCollapsed ? "pt-2" : ""}`}>
          <div className="space-y-0.5">
            {[
              { href: "/history", icon: ListChecks, label: "学习记录" },
              { href: "/analysis", icon: BarChart3, label: "薄弱分析" },
              { href: "/wrong-questions", icon: BookMarked, label: "错题本" },
              { href: "/connect", icon: Link2, label: "串联学习" },
              { href: "/learn/math/geogebra", icon: Ruler, label: "GeoGebra" },
            ].map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="icon"
                          className="w-10 h-10"
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start py-2 px-2.5 text-sm font-medium"
                  >
                    <Icon className="h-4 w-4 mr-2.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings - Bottom */}
      <div className={`border-t border-slate-200 dark:border-slate-700 p-2 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
        {sidebarCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="w-10 h-10">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">设置</TooltipContent>
          </Tooltip>
        ) : (
          <Link href="/settings" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start py-2 px-2.5 text-sm font-medium"
            >
              <Settings className="h-4 w-4 mr-2.5" />
              设置
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
