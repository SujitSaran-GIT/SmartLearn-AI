import React, { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import PermissionGuard from './PermissionGuard';
import { motion } from 'framer-motion';

interface ExportButtonProps {
  quizId: string;
  quizTitle: string;
  className?: string;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  quizId,
  quizTitle,
  className = '',
  variant = 'button',
  size = 'md'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportStatus('idle');
    setErrorMessage(null);

    try {
      const pdfBlob = await apiService.exportQuizResultsToPDF(quizId);

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz_results_${quizTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL
      window.URL.revokeObjectURL(url);

      setExportStatus('success');

      // Reset success status after 3 seconds
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);

    } catch (error: any) {
      console.error('Export failed:', error);
      setErrorMessage(error.message || 'Failed to export PDF');
      setExportStatus('error');

      // Reset error status after 5 seconds
      setTimeout(() => {
        setExportStatus('idle');
        setErrorMessage(null);
      }, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return variant === 'icon' ? 'p-1.5' : 'px-3 py-1.5 text-sm';
      case 'lg':
        return variant === 'icon' ? 'p-3' : 'px-6 py-3 text-lg';
      default:
        return variant === 'icon' ? 'p-2' : 'px-4 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <PermissionGuard
      feature="pdf_export"
      fallback={
        variant === 'button' ? (
          <button
            className={`${getSizeClasses()} ${className} opacity-50 cursor-not-allowed border border-gray-300 bg-gray-50 text-gray-500 rounded-lg flex items-center gap-2 font-medium`}
            disabled
            title="PDF export requires Pro plan or higher"
          >
            <Download className={getIconSize()} />
            Export PDF
          </button>
        ) : (
          <button
            className={`${getSizeClasses()} ${className} opacity-50 cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors`}
            disabled
            title="PDF export requires Pro plan or higher"
          >
            <Download className={getIconSize()} />
          </button>
        )
      }
    >
      <div className="relative">
        {variant === 'button' ? (
          <motion.button
            onClick={handleExport}
            disabled={isExporting}
            className={`
              ${getSizeClasses()} ${className}
              ${exportStatus === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                : exportStatus === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                : 'bg-primary-600 text-white hover:bg-primary-700 border-primary-600'
              }
              border rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            `}
            whileHover={{ scale: isExporting ? 1 : 1.02 }}
            whileTap={{ scale: isExporting ? 1 : 0.98 }}
          >
            {isExporting ? (
              <>
                <Loader2 className={`${getIconSize()} animate-spin`} />
                Exporting...
              </>
            ) : exportStatus === 'success' ? (
              <>
                <CheckCircle className={getIconSize()} />
                Exported!
              </>
            ) : exportStatus === 'error' ? (
              <>
                <AlertCircle className={getIconSize()} />
                Export Failed
              </>
            ) : (
              <>
                <Download className={getIconSize()} />
                Export PDF
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleExport}
            disabled={isExporting}
            className={`
              ${getSizeClasses()} ${className}
              ${exportStatus === 'success'
                ? 'text-green-600 hover:bg-green-50'
                : exportStatus === 'error'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-600 hover:bg-gray-100'
              }
              rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            `}
            whileHover={{ scale: isExporting ? 1 : 1.1 }}
            whileTap={{ scale: isExporting ? 1 : 0.9 }}
            title={exportStatus === 'success' ? 'PDF exported successfully!' :
                   exportStatus === 'error' ? errorMessage || 'Export failed' :
                   'Export quiz results as PDF'}
          >
            {isExporting ? (
              <Loader2 className={`${getIconSize()} animate-spin`} />
            ) : exportStatus === 'success' ? (
              <CheckCircle className={getIconSize()} />
            ) : exportStatus === 'error' ? (
              <AlertCircle className={getIconSize()} />
            ) : (
              <Download className={getIconSize()} />
            )}
          </motion.button>
        )}

        {/* Tooltip for error state */}
        {exportStatus === 'error' && errorMessage && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg whitespace-nowrap z-10">
            {errorMessage}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-red-600"></div>
            </div>
          </div>
        )}

        {/* Success tooltip */}
        {exportStatus === 'success' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg whitespace-nowrap z-10">
            PDF exported successfully!
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-green-600"></div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default ExportButton;