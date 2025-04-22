"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentTabsProps {
  sections: { title: string; content: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

const DocumentTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  DocumentTabsProps & React.ComponentPropsWithoutRef<typeof Tabs>
>(({ sections, defaultValue, className, ...props }, ref) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string | undefined>(() => {
    const firstValidTitle = sections && sections.length > 0 ? sections[0].title : undefined;
    return defaultValue || firstValidTitle;
  });

  const isValidSectionsData = Array.isArray(sections) && sections.length > 0;

  const displayedSections = React.useMemo(() => {
    if (isValidSectionsData) {
      if (typeof window !== 'undefined') {
        console.log('Document sections received:', sections.map(s => ({
          title: s.title,
          contentType: typeof s.content,
          contentLength: typeof s.content === 'string' ? s.content.length : 'n/a',
          isReactNode: React.isValidElement(s.content)
        })));
      }
      return sections;
    } else {
      console.warn('Invalid or empty sections data received. Displaying error tab.');
      return [{
        title: "Documentation Error",
        content: (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
            <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Generation Error</h3>
            <p className="text-red-700 dark:text-red-400">No valid documentation content was generated or received. Please check the generation logs or try again.</p>
          </div>
        )
      }];
    }
  }, [sections, isValidSectionsData]);

  React.useEffect(() => {
    const currentTitles = displayedSections.map(s => s.title);
    if (activeTab && !currentTitles.includes(activeTab)) {
      setActiveTab(currentTitles[0] || undefined);
    } else if (!activeTab && currentTitles.length > 0) {
      setActiveTab(currentTitles[0]);
    }
  }, [displayedSections, activeTab]);

  const checkScrollability = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      setCanScrollLeft(scrollEl.scrollLeft > 0);
      setCanScrollRight(
        scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1
      );
    }
  }, []);

  React.useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [checkScrollability, displayedSections]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (scrollRef.current) {
      const tabElement = scrollRef.current.querySelector(`[data-value="${value}"]`) as HTMLElement;
      if (tabElement) {
        const scrollContainer = scrollRef.current;
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        
        if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
          tabElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!scrollRef.current) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      scrollRef.current.scrollBy({
        left: direction * 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Tabs
      defaultValue={defaultValue || displayedSections[0]?.title}
      className={cn("w-full", className)}
      {...props}
      ref={ref}
      onValueChange={handleTabChange}
      value={activeTab}
    >
      <div className="relative flex items-center">
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 z-10 h-8 w-8 rounded-full bg-background shadow-md hover:bg-background/90"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        <ScrollArea className="w-full">
          <div 
            ref={scrollRef} 
            className="overflow-x-auto flex items-center px-8"
            onScroll={checkScrollability}
            onKeyDown={handleKeyDown}
          >
            <TabsList 
              className="mb-2 w-full flex-nowrap justify-start inline-flex"
              role="tablist"
              aria-orientation="horizontal"
            >
              {displayedSections.map((section: { title: string; content: React.ReactNode }) => (
                <TabsTrigger 
                  key={section.title} 
                  value={section.title} 
                  className="px-4 py-2 flex-shrink-0 whitespace-nowrap"
                  data-value={section.title}
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
        
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 z-10 h-8 w-8 rounded-full bg-background shadow-md hover:bg-background/90"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {displayedSections.map((section: { title: string; content: React.ReactNode }) => (
        <TabsContent key={section.title} value={section.title} className="mt-4">
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  );
});

DocumentTabs.displayName = "DocumentTabs";

export { DocumentTabs }; 