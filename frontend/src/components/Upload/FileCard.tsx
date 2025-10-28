import React from 'react';
import { FileText, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formating';
import type { FileUpload } from '../../types';

interface FileCardProps {
  file: FileUpload;
  onDownload?: (file: FileUpload) => void;
  onDelete?: (file: FileUpload) => void;
  onRetry?: (file: FileUpload) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ 
  file, 
  onDownload, 
  onDelete, 
  onRetry 
}) => {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'uploading':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'uploading':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{file.moduleName}</h3>
            <p className="text-sm text-gray-600">{file.filename}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="capitalize">{file.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Uploaded:</span>
          <p>{formatDate(file.uploadedAt)}</p>
        </div>
        <div>
          <span className="font-medium">Text Size:</span>
          <p>{file.textSize ? `${file.textSize} KB` : 'Processing...'}</p>
        </div>
        {file.numPages && (
          <div>
            <span className="font-medium">Pages:</span>
            <p>{file.numPages}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDownload?.(file)}
            disabled={file.status !== 'completed'}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          
          {file.status === 'error' && onRetry && (
            <button
              onClick={() => onRetry?.(file)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onDelete?.(file)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
