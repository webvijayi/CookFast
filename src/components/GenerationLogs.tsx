'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the log item interface
interface LogItem {
  timestamp: string;
  event: string;
  details?: unknown;
}

// Display timestamp in human-readable format
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  } catch (e) {
    return timestamp;
  }
};

// Format JSON for display
const formatJson = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return String(obj);
  }
};

// Main component for generation logs
export default function GenerationLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [logCount, setLogCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [filterError, setFilterError] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Listen for new logs from the main page
  useEffect(() => {
    const handleNewLog = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.log) {
        const newLog = customEvent.detail.log as LogItem;
        setLogs((prevLogs) => [...prevLogs, newLog]);
        setLogCount((prevCount) => prevCount + 1);
        
        // Track success and error counts
        if (newLog.event.toLowerCase().includes('error') || newLog.event.toLowerCase().includes('fail')) {
          setErrorCount((prev) => prev + 1);
        } else if (newLog.event.toLowerCase().includes('success') || newLog.event.toLowerCase().includes('complete')) {
          setSuccessCount((prev) => prev + 1);
        }
        
        // Scroll to bottom on new logs
        setTimeout(() => {
          if (logsEndRef.current && expanded) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };
    
    document.addEventListener('cookfast:newLog', handleNewLog);
    
    return () => {
      document.removeEventListener('cookfast:newLog', handleNewLog);
    };
  }, [expanded]);
  
  // Filter logs based on the error filter
  const filteredLogs = filterError 
    ? logs.filter(log => 
        log.event.toLowerCase().includes('error') || 
        log.event.toLowerCase().includes('fail') ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes('error')))
    : logs;
  
  return (
    <Card className="w-full mt-8 border-gray-200 dark:border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${logs.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            Generation Logs
            <Badge variant="outline" className="ml-2">{logCount}</Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="ml-1">{errorCount} errors</Badge>
            )}
          </CardTitle>
          <CardDescription className="mt-1">
            {expanded 
              ? "Real-time logs from the document generation process" 
              : "Click to view detailed logs from the document generation process"}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilterError(!filterError)}
            className={filterError ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' : ''}
          >
            {filterError ? 'Show All' : 'Show Errors'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="hidden sm:block"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-4">
          {filteredLogs.length > 0 ? (
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="flex flex-col gap-3">
                {filteredLogs.map((log, index) => {
                  const isError = log.event.toLowerCase().includes('error') || log.event.toLowerCase().includes('fail');
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-md ${
                        isError 
                          ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30' 
                          : 'bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span className="font-medium text-sm">
                            {log.event}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      {showDetails && log.details !== undefined && log.details !== null && (
                        <pre className="mt-2 text-xs p-2 bg-white dark:bg-gray-800 rounded overflow-x-auto">
                          {formatJson(log.details)}
                        </pre>
                      )}
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-6 text-gray-500">
              {filterError 
                ? "No error logs found. That's good news!" 
                : "No logs yet. Start the generation process to see logs."}
            </div>
          )}
        </CardContent>
      )}
      
      <CardFooter className="flex justify-between pt-0">
        <div className="text-xs text-muted-foreground">
          {`Elapsed: ${logs.length > 0 ? Math.floor((new Date().getTime() - new Date(logs[0].timestamp).getTime()) / 1000) : 0}s`}
        </div>
        <div className="text-xs text-muted-foreground">
          {successCount > 0 && (
            <span className="text-green-500 dark:text-green-400 mr-3">
              {successCount} successful operations
            </span>
          )}
          {`Total: ${logs.length} entries`}
        </div>
      </CardFooter>
    </Card>
  );
}