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
  const [activeTab, setActiveTab] = React.useState<string | undefined>(defaultValue || sections[0]?.title);

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
  }, [checkScrollability, sections]);

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
    
    // When tab changes, ensure the tab is visible by scrolling to it
    if (scrollRef.current) {
      const tabElement = scrollRef.current.querySelector(`[data-value="${value}"]`) as HTMLElement;
      if (tabElement) {
        const scrollContainer = scrollRef.current;
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        
        // Check if tab is outside the visible area
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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!scrollRef.current) return;
    
    // Handle left/right arrow keys for horizontal navigation
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
      defaultValue={defaultValue || sections[0]?.title} 
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
              {sections.map((section) => (
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
      
      {sections.map((section) => (
        <TabsContent key={section.title} value={section.title} className="mt-4">
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  );
});

DocumentTabs.displayName = "DocumentTabs";

export { DocumentTabs }; 