
import { Upload, FileText, X, CheckCircle, AlertCircle, Image, File } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

interface UploaderProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const Uploader: React.FC<UploaderProps> = ({ 
  onFileSelect, 
  acceptedFormats = '.pdf,.docx,.doc',
  maxSize = 50,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEventt<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (file.size === 0) {
      setError('File appears to be empty');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (file.type.includes('word')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept={acceptedFormats}
        className="hidden"
        title="Upload a file"
        onChange={handleFileChange}
      />
      
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
            ${isDragOver 
              ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Drop your file here or click to browse
              </h3>
              <p className="text-gray-600 text-sm">
                Supports PDF and Word documents up to {maxSize}MB
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>PDF, DOC, DOCX</span>
              </span>
              <span>•</span>
              <span>Max {maxSize}MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getFileIcon(selectedFile)}
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • Ready to upload
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <button
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-500 transition p-1 rounded"
                title="Remove file"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">
              File selected successfully
            </span>
            <button
              onClick={handleBrowseClick}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Choose different file
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p><strong>For best results:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use clear, readable text documents</li>
          <li>Scanned PDFs should have high-quality text</li>
          <li>Break large documents into smaller modules</li>
          <li>Ensure text is selectable (not image-based)</li>
        </ul>
      </div>
    </div>
  );
};
