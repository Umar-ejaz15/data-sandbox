'use client';

import React from 'react';
import { Download, FileText, Image, FileSpreadsheet } from 'lucide-react';

interface Props {
  onExportImage?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  title?: string;
}

export default function ExportButton({ onExportImage, onExportCSV, onExportPDF, title = 'Export' }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm sm:text-base"
      >
        <Download className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline">{title}</span>
        <span className="sm:hidden">Export</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden">
            {onExportImage && (
              <button
                onClick={() => {
                  onExportImage();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <Image className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Export as Image</span>
              </button>
            )}
            {onExportCSV && (
              <button
                onClick={() => {
                  onExportCSV();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Export as CSV</span>
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={() => {
                  onExportPDF();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Export as PDF</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

