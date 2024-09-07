import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

const ScanPage: React.FC = () => {
  const [scanned, setScanned] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const qrCodeRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (qrCodeRegionRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: ["camera"] as unknown as Html5QrcodeScanType[], // Folosește un array mutabil
      };

      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        config,
        /* verbose= */ false
      );

      html5QrcodeScanner.render(handleBarCodeScanned, handleError);

      return () => {
        html5QrcodeScanner.clear().catch(console.error);
      };
    }
  }, [facingMode]);

  const handleBarCodeScanned = async (decodedText: string, decodedResult: any) => {
    setScanned(true);
    console.log(`Scanned barcode with data ${decodedText}`);
    try {
      const parsedData = JSON.parse(decodedText);
      console.log('Parsed data:', parsedData);

      const response = await fetch("https://lavial.icu/verify-ticket", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uniq_id: parsedData.uniq_id }),
      });

      console.log('Server response:', response);

      if (response.ok) {
        const result = await response.json();
        setVerificationStatus('success');
        console.log('Travel data:', result.travel);
        setReservationDetails(result.travel);
      } else {
        console.log('Verification error, status:', response.status);
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error('Error during ticket verification:', error);
      setVerificationStatus('error');
    }
  };

  const handleError = (error: any) => {
    console.error("QR Code scan error", error);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      {!scanned ? (
        <div className="w-full max-w-md mb-4">
          <div id="qr-reader" style={{ width: "100%" }} ref={qrCodeRegionRef}></div>
          <button
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
          >
            Schimbă Camera
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md p-4 bg-white rounded shadow-lg">
          {verificationStatus && (
            <div className="text-center">
              {verificationStatus === 'success' ? (
                <>
                  <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="mt-2 text-lg font-bold">Done</p>
                  {reservationDetails ? (
                    <div className="mt-4 text-left">
                      <p><strong>From:</strong> {reservationDetails.from}</p>
                      <p><strong>To:</strong> {reservationDetails.to}</p>
                      <p><strong>Date:</strong> {new Date(reservationDetails.date).toLocaleDateString()}</p>
                      <p><strong>Name:</strong> {reservationDetails.name} {reservationDetails.surname}</p>
                    </div>
                  ) : (
                    <p className="text-red-500 mt-4">No reservation details available</p>
                  )}
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="mt-2 text-lg font-bold text-red-500">Error</p>
                </>
              )}
            </div>
          )}
          <button
            className="mt-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={() => { setScanned(false); setVerificationStatus(null); setReservationDetails(null); }}
          >
            Tap to Scan Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanPage;