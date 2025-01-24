export function PDFViewerFallback() {
  return (
    <div 
      className="h-full w-full" 
      style={{ 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden'
        }}
        className="flex items-center justify-center bg-gray-100"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <div className="text-gray-500">Loading PDF viewer...</div>
        </div>
      </div>
    </div>
  );
}