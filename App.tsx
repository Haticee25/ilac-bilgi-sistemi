import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useCamera } from './useCamera'; 
import { useOCR } from './userOCR'; 
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
        // Dosyayı public klasöründen çekiyoruz
        fetch("/liste.csv")
            .then(res => res.text())
            .then(csvData => {
                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    quoteChar: '"', // Bozuk tırnak hatalarını önlemek için
                    complete: (results: any) => {
                        const parsedData = results.data.map((item: any) => {
                            // Eğer satır noktalı virgülden dolayı tek bir sütun gibi algılandıysa ayırıyoruz
                            if (Object.keys(item).length === 1) {
                                const rowValue = Object.values(item)[0] as string;
                                const parts = rowValue.split(';');
                                return {
                                    "İlaç Adı": parts[0]?.trim(),
                                    "Etken Madde": parts[1]?.trim(),
                                    "Kullanım Amacı": parts[2]?.trim(),
                                    "Yan Etkiler": parts[3]?.trim(),
                                    "Yaş Aralığı": parts[4]?.trim()
                                };
                            }
                            // Normal geldiyse sadece temizlik yapıyoruz
                            return {
                                "İlaç Adı": item["İlaç Adı"]?.trim(),
                                "Etken Madde": item["Etken Madde"]?.trim(),
                                "Kullanım Amacı": item["Kullanım Amacı"]?.trim(),
                                "Yan Etkiler": item["Yan Etkiler"]?.trim(),
                                "Yaş Aralığı": item["Yaş Aralığı"]?.trim()
                            };
                        }).filter((d: any) => d["İlaç Adı"]); // Boş olanları eliyoruz

                        setDrugs(parsedData);
                        setIsLoading(false);
                    },
                    error: (err) => {
                        console.error("CSV Ayrıştırma Hatası:", err);
                        setIsLoading(false);
                    }
                });
            })
            .catch(err => {
                console.error("Dosya yüklenemedi:", err);
                setIsLoading(false);
            });
    }, []);

    const handleSearch = (name: string) => {
        if (!name.trim()) return;
        
        const searchName = name.trim().toLowerCase();
        const found = drugs.find(d => 
            d["İlaç Adı"] && d["İlaç Adı"].toLowerCase() === searchName
        );

        if (found) {
            setResult(found);
        } else {
            alert(`"${name}" veritabanında bulunamadı. Lütfen yazımı kontrol edin.`);
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
                    const searchTerms = text.toLowerCase();
                    // OCR metni içinde ilaç adını arıyoruz
                    const found = drugs.find(d => 
                        d["İlaç Adı"] && searchTerms.includes(d["İlaç Adı"].toLowerCase())
                    );
                    
                    if (found) {
                        setResult(found);
                    } else {
                        alert("Kamera metni okudu ama veritabanındaki ilaçlarla eşleştiremedi.");
                    }
                }
            } catch (err) {
                alert("Görüntü işlenirken bir hata oluştu.");
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
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <h1 style={{ marginBottom: '10px' }}>İlaç Bilgi Sistemi 💊</h1>
            
            {isLoading ? (
                <p style={{ color: '#93c5fd' }}>Veritabanı hazırlanıyor...</p>
            ) : (
                <p style={{ color: '#4ade80' }}>{drugs.length} İlaç Kaydı Aktif</p>
            )}

            {!showCamera && (
                <div style={{ maxWidth: '500px', margin: '20px auto' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                            placeholder="Örn: Arveles"
                            style={{ 
                                flex: 1, padding: '15px', borderRadius: '30px', 
                                border: '2px solid #38bdf8', background: 'rgba(255,255,255,0.1)', 
                                color: 'white', outline: 'none' 
                            }}
                        />
                        <button 
                            onClick={() => handleSearch(query)}
                            style={{ 
                                padding: '0 25px', borderRadius: '30px', 
                                background: '#38bdf8', border: 'none', 
                                color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' 
                            }}
                        >
                            Ara
                        </button>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <button 
                            onClick={() => { setShowCamera(true); setTimeout(startCamera, 500); }}
                            style={{ 
                                width: '100px', height: '100px', borderRadius: '50%', 
                                background: '#22c55e', border: 'none', 
                                fontSize: '40px', cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
                            }}
                        >
                            📸
                        </button>
                        <p style={{ marginTop: '15px', fontSize: '1.1rem' }}>İlaç Kutusunu Tara</p>
                    </div>
                </div>
            )}

            {isProcessing && (
                <div style={{ margin: '20px' }}>
                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid #38bdf8', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#fbbf24', marginTop: '10px' }}>İlaç ismi analiz ediliyor...</p>
                </div>
            )}

            {showCamera && (
                <div style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
                    <video ref={videoRef} autoPlay playsInline style={{ flex: 1, width: '100%', objectFit: 'cover' }} />
                    <div style={{ height: '120px', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
                        <button onClick={handleCapture} style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer' }}></button>
                        <button onClick={() => { stopCamera(); setShowCamera(false); }} style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', padding: '12px 25px', borderRadius: '20px', cursor: 'pointer' }}>Kapat</button>
                    </div>
                </div>
            )}

            {result && !showCamera && (
                <div style={{ 
                    marginTop: '30px', padding: '25px', borderRadius: '20px', 
                    background: 'rgba(255,255,255,0.1)', textAlign: 'left', 
                    border: '1px solid rgba(255,255,255,0.2)', maxWidth: '600px', margin: '30px auto'
                }}>
                    <h2 style={{ color: '#fbbf24', margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        {result["İlaç Adı"]}
                    </h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <p><strong>🧪 Etken Madde:</strong><br/>{result["Etken Madde"]}</p>
                        <p><strong>🎯 Kullanım Amacı:</strong><br/>{result["Kullanım Amacı"]}</p>
                        <p><strong>⚠️ Yan Etkiler:</strong><br/>{result["Yan Etkiler"]}</p>
                        <p><strong>👥 Yaş Aralığı:</strong><br/>{result["Yaş Aralığı"]}</p>
                    </div>
                    <button 
                        onClick={() => setResult(null)} 
                        style={{ 
                            marginTop: '20px', background: 'none', border: '1px solid #93c5fd', 
                            color: '#93c5fd', padding: '8px 20px', borderRadius: '15px', cursor: 'pointer' 
                        }}
                    >
                        Başka Bir İlaç Ara
                    </button>
                </div>
            )}
        </div>
    );
}

// React 18 için root ayarı
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}

export default App;
