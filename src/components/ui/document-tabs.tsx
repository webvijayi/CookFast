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

  // Add check for empty sections or error content
  const validSections = React.useMemo(() => {
    if (!sections || sections.length === 0) {
      return [{
        title: "Documentation Error",
        content: (
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <h3 className="text-red-800 font-medium mb-2">Documentation Error</h3>
            <p className="text-red-700">No content was generated. Please try again with different settings or AI provider.</p>
          </div>
        )
      }];
    }
    
    // Improved content validation logic
    const hasValidContent = sections.some(section => {
      // If content is a string, check if it has non-whitespace content
      if (typeof section.content === 'string') {
        return section.content.trim().length > 0;
      }
      
      // If content is a React element, consider it valid
      if (React.isValidElement(section.content)) {
        return true;
      }
      
      // Handle cases where content is an object (like from JSON)
      if (section.content && typeof section.content === 'object') {
        // For objects that have a toString method or can be stringified
        try {
          const contentStr = String(section.content);
          return contentStr && contentStr.trim().length > 0 && contentStr !== '[object Object]';
        } catch (e) {
          return false;
        }
      }
      
      return false;
    });
    
    // Additional check for specific titles that indicate generated content
    const hasRecognizedTitles = sections.some(section => {
      const title = section.title?.toLowerCase() || '';
      return title.includes('requirements') || 
             title.includes('guidelines') || 
             title.includes('structure') || 
             title.includes('flow') || 
             title.includes('technology') ||
             title.includes('system') ||
             title.includes('introduction');
    });
    
    // Only show warning if both content and title checks fail
    if (!hasValidContent && !hasRecognizedTitles) {
      return [{
        title: "Documentation Warning",
        content: (
          <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
            <h3 className="text-yellow-800 font-medium mb-2">Documentation Warning</h3>
            <p className="text-yellow-700">No content provided. Please try regenerating the documentation.</p>
          </div>
        )
      }];
    }
    
    // Always log section info for debugging
    if (typeof window !== 'undefined') {
      console.log('Document sections:', sections.map(s => ({
        title: s.title,
        contentType: typeof s.content,
        contentLength: typeof s.content === 'string' ? s.content.length : 'n/a'
      })));
    }
    
    // Return original sections if they have valid content or recognized titles
    return sections;
  }, [sections]);

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
  }, [checkScrollability, validSections]); // Update dependency from sections to validSections

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
      defaultValue={defaultValue || validSections[0]?.title} // Use validSections instead of sections
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
              {validSections.map((section) => ( // Use validSections instead of sections
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
      
      {validSections.map((section) => ( // Use validSections instead of sections
        <TabsContent key={section.title} value={section.title} className="mt-4">
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  );
});

DocumentTabs.displayName = "DocumentTabs";

export { DocumentTabs }; 