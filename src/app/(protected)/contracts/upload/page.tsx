import { UploadZone } from '@/components/contracts/upload/UploadZone';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Upload Contract</h1>
        <p className="text-gray-500 text-center">
          Upload your contract to get started with AI-powered analysis
        </p>
        <div className="bg-gradient-to-b from-indigo-950 to-indigo-900 rounded-2xl shadow-xl border border-white/20 p-8">
          <UploadZone />
        </div>
      </div>
    </div>
  );
}
