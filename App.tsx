import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
// Dosyaların ana dizinde olduğu için yolları güncelledik
import { useCamera } from './useCamera'; 
import { useOCR } from './userOCR'; 
import Papa from 'papaparse';

function App() {
    const [drugs, setDrugs] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { videoRef, startCamera, stopCamera, captureImage } = useCamera();
    const { scanImage } = useOCR();

    useEffect(() => {
        // public/liste.csv dosyasını okuyoruz
        fetch("/liste.csv")
            .then(res => res.text())
            .then(csvData => {
                Papa.parse(csvData, {
                    header: true,
                    delimiter: ";", 
                    skipEmptyLines: true,
                    complete: (results: any) => {
                        const validData = results.data.filter((item: any) => item["İlaç Adı"]);
                        setDrugs(validData);
                    }
                });
            })
            .catch(err => console.error("CSV Yükleme Hatası:", err));
    }, []);

    const handleSearch = (name: string) => {
        const found = drugs.find(d => 
            d["İlaç Adı"]?.trim().toLowerCase() === name.trim().toLowerCase()
        );
        if (found) {
            setResult(found);
        } else {
            alert("İlaç veritabanında bulunamadı!");
        }
    };

    const handleCapture = async () => {
        const image = captureImage();
        if (image) {
            setIsProcessing(true);
            stopCamera();
            setShowCamera(false);
            try {
                const text = await scanImage(image);
                if (text) {
                    const found = drugs.find(d => 
                        text.toLowerCase().includes(d["İlaç Adı"]?.toLowerCase().trim())
                    );
                    if (found) setResult(found);
                    else alert("Kamera ilacı tanıyamadı.");
                }
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'sans-serif'
        }}>
            <h1>İlaç Bilgi Sistemi 💊</h1>

            {drugs.length > 0 ? (
                <p style={{ color: '#93c5fd' }}>{drugs.length} İlaç Veritabanı Hazır</p>
            ) : (
                <p>Veriler yükleniyor...</p>
            )}

            {!showCamera && (
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ position: 'relative', marginBottom: '30px' }}>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="İlaç adı yazın..."
                            style={{ width: '100%', padding: '12px', borderRadius: '25px', border: '1px solid #38bdf8', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <button onClick={() => handleSearch(query)} style={{ position: 'absolute', right: '5px', top: '5px', padding: '8px 15px', borderRadius: '20px', background: '#22c55e', border: 'none', color: 'white', cursor: 'pointer' }}>
                            Ara
                        </button>
                    </div>

                    <button 
                        onClick={() => { setShowCamera(true); setTimeout(startCamera, 500); }}
                        style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#22c55e', border: 'none', fontSize: '30px', cursor: 'pointer' }}
                    >
                        📸
                    </button>
                    <p style={{ marginTop: '10px' }}>Kamerayı Aç</p>
                </div>
            )}

            {isProcessing && <p style={{ color: '#fbbf24' }}>🔍 Taranıyor...</p>}

            {showCamera && (
                <div style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
                    <video ref={videoRef} autoPlay playsInline style={{ flex: 1, width: '100%' }} />
                    <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <button onClick={handleCapture} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', border: 'none' }}></button>
                        <button onClick={() => { stopCamera(); setShowCamera(false); }} style={{ color: 'white', background: 'none', border: '1px solid white', padding: '10px' }}>İptal</button>
                    </div>
                </div>
            )}

            {result && !showCamera && (
                <div style={{ marginTop: '30px', padding: '20px', borderRadius: '15px', background: 'rgba(255,255,255,0.1)', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <h2 style={{ color: '#fbbf24', marginTop: 0 }}>{result["İlaç Adı"]}</h2>
                    <p><strong>Etken Madde:</strong> {result["Etken Madde"]}</p>
                    <p><strong>Kullanım Amacı:</strong> {result["Kullanım Amacı"]}</p>
                    <p><strong>Yan Etkiler:</strong> {result["Yan Etkiler"]}</p>
                    <p><strong>Yaş Aralığı:</strong> {result["Yaş Aralığı"]}</p>
                    <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: '#93c5fd', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>Kapat</button>
                </div>
            )}
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}

export default App;
