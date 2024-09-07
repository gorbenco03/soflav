import React, { useState } from 'react';
// @ts-ignore
import QrScanner from 'react-qr-scanner';

const ScanPage: React.FC = () => {
  const [scanned, setScanned] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Starea pentru modul camerei

  const handleBarCodeScanned = async (data: any) => {
    if (data) {
      setScanned(true);
      console.log(`Scanned barcode with data ${data}`);
      try {
        const parsedData = JSON.parse(data);
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
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      {!scanned ? (
        <div className="w-full max-w-md mb-4">
          <QrScanner
            delay={300}
            style={previewStyle}
            onError={(err: any) => console.error(err)}
            onScan={handleBarCodeScanned}
            facingMode={facingMode}  // Folosește starea pentru a controla modul camerei
          />
          <button
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')} // Schimbă între față și spate
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