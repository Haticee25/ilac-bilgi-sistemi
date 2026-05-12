import React, { useState, useEffect } from 'react';
import { useCamera } from './useCamera';
import { useOCR } from './useOCR';
import Papa from 'papaparse';

function App() {
    const [drugs, setDrugs] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { videoRef, startCamera, stopCamera, captureImage } = useCamera();
    const { scanImage } = useOCR();

    useEffect(() => {
        fetch("/liste.csv")
            .then(res => res.text())
            .then(csvData => {
                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: (header) => header.trim(),
                    complete: (results: any) => {
                        setDrugs(results.data);
                        setIsLoading(false);
                    }
                });
            });
    }, []);

    const handleSearch = (searchTerm: string) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return;

        const found = drugs.find(d => {
            const name = d["İlaç Adı"] || Object.values(d)[0];
            return name?.toString().toLowerCase().includes(term);
        });
        setResult(found || null);
        if (!found) alert("İlaç veritabanında bulunamadı.");
    };

    const handleCapture = async () => {
        const image = captureImage();
        if (image) {
            setIsProcessing(true);
            try {
                const text = await scanImage(image);
                if (text) {
                    const cleanOCR = text.toLowerCase().replace(/[^a-z0-9şğüçöı ]/g, " ").trim();
                    const found = drugs.find(d => {
                        const name = (d["İlaç Adı"] || Object.values(d)[0])?.toString().toLowerCase().trim();
                        if (!name) return false;
                        return cleanOCR.includes(name) || name.includes(cleanOCR);
                    });
                    
                    if (found) {
                        setResult(found);
                        stopCamera();
                        setShowCamera(false);
                    } else {
                        alert(`Okunan metin: "${text.substring(0, 30)}..." \nEşleşen ilaç bulunamadı.`);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto', textAlign: 'center', minHeight: '100vh', backgroundColor: '#1a2a6c', color: 'white' }}>
            <h1>İlaç Bilgi Sistemi 💊</h1>
            
            {isLoading ? (
                <p>Veriler yükleniyor...</p>
            ) : (
                <p style={{ color: '#2ecc71' }}>{drugs.length} İlaç Kaydı Aktif</p>
            )}

            {!showCamera ? (
                <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="İlaç adı yazın..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: 'none', color: '#333' }}
                        />
                        <button onClick={() => handleSearch(query)} style={{ padding: '10px 25px', borderRadius: '20px', backgroundColor: '#3498db', color: 'white', border: 'none', fontWeight: 'bold' }}>Ara</button>
                    </div>

                    <div onClick={() => { setShowCamera(true); startCamera(); }} style={{ backgroundColor: '#2ecc71', color: 'white', padding: '25px', borderRadius: '50%', width: '70px', height: '70px', margin: '20px auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        <span style={{ fontSize: '30px' }}>📸</span>
                    </div>
                    <p>İlaç Kutusunu Tara</p>
                </div>
            ) : (
                <div>
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '15px', border: '3px solid #2ecc71' }} />
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={handleCapture} disabled={isProcessing} style={{ padding: '12px 25px', borderRadius: '25px', backgroundColor: '#e67e22', color: 'white', border: 'none', fontWeight: 'bold' }}>
                            {isProcessing ? 'Okunuyor...' : 'Fotoğraf Çek'}
                        </button>
                        <button onClick={() => { stopCamera(); setShowCamera(false); }} style={{ padding: '12px 25px', borderRadius: '25px', backgroundColor: '#95a5a6', color: 'white', border: 'none' }}>Kapat</button>
                    </div>
                </div>
            )}

            {result && (
                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '15px', textAlign: 'left', border: '1px solid #3498db', backdropFilter: 'blur(5px)' }}>
                    <h2 style={{ color: '#f1c40f', margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
                        {result["İlaç Adı"] || Object.values(result)[0]}
                    </h2>
                    <p><strong>🧪 Etken Madde:</strong> {result["Etken Madde"] || Object.values(result)[1]}</p>
                    <p><strong>🎯 Kullanım Amacı:</strong> {result["Kullanım Amacı"] || Object.values(result)[2]}</p>
                    {/* Sütun sırasına göre garanti alım: index 3 -> Yan Etkiler */}
                    <p><strong>⚠️ Yan Etkiler:</strong> {result["Yan Etkiler"] || Object.values(result)[3] || "Bilgi bulunamadı"}</p>
                    <p><strong>👥 Yaş Aralığı:</strong> {result["Yaş Aralığı"] || Object.values(result)[4]}</p>
                    
                    <button onClick={() => setResult(null)} style={{ marginTop: '15px', background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', width: '100%' }}>
                        Başka Bir İlaç Ara
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
