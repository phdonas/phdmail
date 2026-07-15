import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Unsubscribe: React.FC = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        const processUnsubscribe = async () => {
            if (!email) {
                setStatus('error');
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/unsubscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });

                if (response.ok) {
                    setStatus('success');
                } else {
                    console.error('API Error:', await response.text());
                    setStatus('error');
                }
            } catch (error) {
                console.error("Error processing unsubscribe:", error);
                setStatus('error');
            }
        };

        processUnsubscribe();
    }, [email]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {status === 'processing' && (
                    <div className="animate-pulse">
                        <h1 className="text-xl font-bold text-slate-700">Processando sua solicitação...</h1>
                        <p className="text-slate-500 mt-2">Por favor aguarde um momento.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Descadastro realizado com sucesso!</h1>
                        <p className="text-slate-500 mt-2">O e-mail <strong>{email}</strong> foi removido da nossa lista de envio.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Erro ao processar</h1>
                        <p className="text-slate-500 mt-2">Não foi possível identificar o e-mail ou houve um erro de conexão.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Unsubscribe;
