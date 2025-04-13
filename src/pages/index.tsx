import { useState } from 'react';

// Define types for form data and document selection
interface ProjectDetails {
  projectName: string;
  projectType: string;
  projectGoal: string;
  features: string;
  techStack: string;
}

interface DocumentSelection {
  requirements: boolean;
  frontendGuidelines: boolean;
  backendStructure: boolean;
  appFlow: boolean;
  techStackDoc: boolean;
  systemPrompts: boolean;
  fileStructure: boolean;
}


export default function CookFastHome() { // Renamed component
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: '',
    projectType: 'Web Application',
    projectGoal: '',
    features: '',
    techStack: '',
  });
  const [selectedDocs, setSelectedDocs] = useState<DocumentSelection>({
    requirements: true,
    frontendGuidelines: true,
    backendStructure: true,
    appFlow: true,
    techStackDoc: true,
    systemPrompts: true,
    fileStructure: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleDocSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSelectedDocs(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDetails, selectedDocs }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
      setResults(data.message); // Display success message
      // TODO: Later, maybe display links to generated files here?
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format checkbox labels nicely
  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/ Doc$/, ' Document').trim();
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-indigo-600 dark:text-indigo-400">
            CookFast
          </h1>
           <p className="text-lg mb-6 text-center text-gray-600 dark:text-gray-400">
            Code planning documents for any project.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Details */}
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-700 dark:text-gray-300">
                1. Tell us about your project
              </h2>
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                 <div className="sm:col-span-3">
                    <label htmlFor="projectName" className="block text-sm font-medium mb-1">Project Name <span className="text-red-500">*</span></label>
                    <input type="text" id="projectName" name="projectName" value={projectDetails.projectName} onChange={handleDetailChange} required className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"/>
                 </div>
                 <div className="sm:col-span-3">
                     <label htmlFor="projectType" className="block text-sm font-medium mb-1">Project Type</label>
                     <select id="projectType" name="projectType" value={projectDetails.projectType} onChange={handleDetailChange} className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700">
                        <option>Web Application</option>
                        <option>Mobile App</option>
                        <option>API Service</option>
                        <option>Library/Package</option>
                         <option>Desktop Application</option>
                        <option>Other</option>
                     </select>
                 </div>
                 <div className="sm:col-span-6">
                    <label htmlFor="projectGoal" className="block text-sm font-medium mb-1">Main Goal/Purpose</label>
                    <textarea id="projectGoal" name="projectGoal" rows={2} value={projectDetails.projectGoal} onChange={handleDetailChange} className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700" placeholder="What is the primary objective?"></textarea>
                 </div>
                 <div className="sm:col-span-6">
                    <label htmlFor="features" className="block text-sm font-medium mb-1">Key Features (Optional)</label>
                    <textarea id="features" name="features" rows={3} value={projectDetails.features} onChange={handleDetailChange} className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700" placeholder="List main functionalities, e.g., user auth, dashboard, data export..."></textarea>
                 </div>
                 <div className="sm:col-span-6">
                    <label htmlFor="techStack" className="block text-sm font-medium mb-1">Known Tech Stack (Optional)</label>
                    <input type="text" id="techStack" name="techStack" value={projectDetails.techStack} onChange={handleDetailChange} className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700" placeholder="e.g., React, Python (Flask), PostgreSQL, Docker"/>
                 </div>
              </div>
            </section>

            {/* Document Selection */}
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-700 dark:text-gray-300">
                2. Choose documents to generate
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(selectedDocs).map((key) => (
                  <div key={key} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={key}
                        name={key}
                        type="checkbox"
                        checked={selectedDocs[key as keyof DocumentSelection]}
                        onChange={handleDocSelectionChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-500 rounded bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={key} className="font-medium text-gray-700 dark:text-gray-300">{formatLabel(key)}</label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Submission */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={isLoading || !projectDetails.projectName}
                className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${ 
                  isLoading || !projectDetails.projectName 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : 'Cook up the Docs!'}
              </button>
            </div>
          </form>

          {/* Results/Error Display Area */}
           {results && (
            <div className="mt-8 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200">
              <h3 className="font-semibold mb-2">Success!</h3>
              <p>{results}</p>
              {/* Consider adding links to generated files here */}
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200">
              <h3 className="font-semibold mb-2">Oops! An error occurred:</h3>
              <p>{error}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 mt-8 border-t border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        Built by: <a href="https://webfortuners.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Web Fortuners</a>
      </footer>
    </div>
  );
}
