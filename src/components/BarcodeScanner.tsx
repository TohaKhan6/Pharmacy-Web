import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onClose();
      },
      (error) => {
        // Handle scan failure, usually better to ignore
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white text-center">Scan Barcode</h3>
          <div id="reader" className="w-full rounded-xl overflow-hidden"></div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
            Position the medicine barcode within the frame to scan automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
