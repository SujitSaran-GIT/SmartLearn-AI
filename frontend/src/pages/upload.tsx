import React, { useState } from 'react';
import { DashboardLayout } from '../components/Shared/DashboardLayout';
import { FileCard } from '../components/Upload/FileCard';
import { ProgressBar } from '../components/Upload/ProgressBar';
import { useUpload } from '../hooks/useUpload';
import { CheckCircle, FileText, AlertCircle, Upload, Plus } from 'lucide-react';
import type { FileUpload, PageType } from '../types';
import { Uploader } from '../components/Upload/Uploader';

interface UploadPageProps {
  onNavigate: (page: PageType, params?: any) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [moduleName, setModuleName] = useState('');
  const [uploadResult, setUploadResult] = useState<{ fileId: string; textSize: number } | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileUpload[]>([]);
  
  const { uploadFile, uploading, progress, error, reset } = useUpload();

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setUploadResult(null);
    reset();
    
    // Set module name from filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setModuleName(nameWithoutExt);
  };

  const handleUpload = async () => {
    if (!uploadedFile || !moduleName) return;

    try {
      const result = await uploadFile(uploadedFile, moduleName);
      setUploadResult(result);
      
      // Add to recent files
      const newFile: FileUpload = {
        id: result.fileId,
        filename: uploadedFile.name,
        moduleName,
        status: 'completed',
        uploadedAt: new Date().toISOString(),
        textSize: result.textSize
      };
      
      setRecentFiles(prev => [newFile, ...prev.slice(0, 4)]);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleFileDelete = (file: FileUpload) => {
    setRecentFiles(prev => prev.filter(f => f.id !== file.id));
  };

  const handleFileRetry = (file: FileUpload) => {
    // Implement retry logic
    console.log('Retry file:', file);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadResult(null);
    setModuleName('');
    reset();
  };

  return (
    <DashboardLayout currentPage="upload" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Learning Material</h1>
              <p className="text-gray-600">Upload your course materials to generate practice MCQs</p>
            </div>
            <button
              onClick={resetUpload}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!uploadedFile && !uploading && (
              <Uploader onFileSelect={handleFileSelect} />
            )}
            
            {uploadedFile && !uploadResult && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Details</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter module name (e.g., Core Java - Module 1)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Give your module a descriptive name for easy reference
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetUpload}
                    aria-label="Remove file"
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>

                {!uploading && (
                  <button
                    onClick={handleUpload}
                    disabled={!moduleName.trim()}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload & Process File
                  </button>
                )}
              </div>
            )}

            {uploading && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Your File</h3>
                <ProgressBar 
                  progress={progress} 
                  label="Upload Progress" 
                  color="purple"
                />
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>✓ File uploaded successfully</p>
                  <p>⏳ Extracting text content...</p>
                  <p>⏳ Analyzing document structure...</p>
                  <p>⏳ Preparing for MCQ generation...</p>
                </div>
              </div>
            )}

            {uploadResult && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Upload Successful!</h3>
                </div>
                <div className="space-y-3 text-sm text-green-700">
                  <p><strong>File ID:</strong> {uploadResult.fileId}</p>
                  <p><strong>Text extracted:</strong> {uploadResult.textSize} KB</p>
                  <p><strong>Status:</strong> Ready for MCQ generation</p>
                  <p>Your file has been processed and is ready to generate practice questions.</p>
                </div>
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => onNavigate('generate', { fileId: uploadResult.fileId })}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Generate MCQs</span>
                  </button>
                  <button
                    onClick={resetUpload}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">Upload Failed</h3>
                </div>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={reset}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={resetUpload}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">Upload Guidelines</h3>
              </div>
              
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span><strong>Supported formats:</strong> PDF, DOCX</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span><strong>Maximum file size:</strong> 50MB</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span><strong>Best results:</strong> Clear, readable text</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span><strong>Processing time:</strong> 2-3 minutes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span><strong>Text extraction:</strong> Automatic OCR for scanned PDFs</span>
                </li>
              </ul>
            </div>

            {recentFiles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Uploads</h3>
                <div className="space-y-4">
                  {recentFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDelete={handleFileDelete}
                      onRetry={handleFileRetry}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Use high-quality scanned documents</li>
                <li>• Ensure text is selectable in PDFs</li>
                <li>• Break large documents into modules</li>
                <li>• Use descriptive module names</li>
                <li>• Verify text extraction before generating MCQs</li>
                <li>• Include code snippets in separate modules</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
