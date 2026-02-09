
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Sparkles, Wand2, Send, Save, Eye, Loader2,
  Info, Upload, CheckCircle2, AlertTriangle, Edit3, Image as ImageIcon,
  Link as LinkIcon, Facebook, Instagram, Linkedin, Twitter, Youtube, Plus, Trash2
} from 'lucide-react';
import { generateEmailContent, suggestSubjectLines } from '../services/geminiService';
import { getCampaignById, updateCampaign } from '../services/campaignService';
import { Campaign, SocialLink } from '../types';

type Step = 'details' | 'content' | 'audience' | 'review';

const CampaignWizard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingStatus, setSendingStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    id: id || Math.random().toString(36).substr(2, 9),
    name: '',
    subject: '',
    topic: '',
    tone: 'profissional',
    content: '',
    contacts: [] as string[],
    imageUrl: '',
    ctaText: '',
    ctaUrl: '',
    socialLinks: [] as SocialLink[]
  });

  useEffect(() => {
    const loadCampaign = async () => {
      if (id) {
        const existing = await getCampaignById(id);
        if (existing) {
          setFormData({
            id: existing.id,
            name: existing.name,
            subject: existing.subject,
            topic: '',
            tone: 'profissional',
            content: existing.content,
            contacts: existing.contacts || [],
            imageUrl: existing.imageUrl || '',
            ctaText: existing.ctaText || '',
            ctaUrl: existing.ctaUrl || '',
            socialLinks: existing.socialLinks || []
          });
        }
      }
    };
    loadCampaign();
  }, [id]);

  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);

  const handleAiContent = async () => {
    if (!formData.topic) return;
    setAiLoading(true);
    try {
      const { subject, body } = await generateEmailContent(formData.topic, formData.tone);
      setFormData(prev => ({ ...prev, subject, content: body }));
    } catch (error) {
      alert("Falha ao gerar conteúdo. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubjectSuggestions = async () => {
    if (!formData.topic) return;
    setAiLoading(true);
    try {
      const subjects = await suggestSubjectLines(formData.topic);
      setSuggestedSubjects(subjects);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = Array.from(new Set(text.match(emailRegex) || []));
      setFormData(prev => ({ ...prev, contacts: emails }));
    };
    reader.readAsText(file);
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: 'facebook', url: '' }]
    });
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const removeSocialLink = (index: number) => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((_, i) => i !== index)
    });
  };

  const nextStep = () => {
    if (step === 'details') setStep('content');
    else if (step === 'content') setStep('audience');
    else if (step === 'audience') setStep('review');
  };

  const prevStep = () => {
    if (step === 'content') setStep('details');
    else if (step === 'audience') setStep('content');
    else if (step === 'review') setStep('audience');
  };

  const persistCampaign = (status: 'draft' | 'sent') => {
    const campaign: Campaign = {
      id: formData.id,
      name: formData.name || 'Sem nome',
      subject: formData.subject,
      content: formData.content,
      status: status,
      sentAt: status === 'sent' ? new Date().toLocaleString('pt-BR') : undefined,
      recipientsCount: formData.contacts.length,
      contacts: formData.contacts,
      imageUrl: formData.imageUrl,
      ctaText: formData.ctaText,
      ctaUrl: formData.ctaUrl,
      socialLinks: formData.socialLinks
    };
    updateCampaign(campaign);
  };

  const handleSaveDraft = () => {
    persistCampaign('draft');
    navigate('/campaigns');
  };

  const handleSend = async () => {
    if (formData.contacts.length === 0) {
      alert("Por favor, importe contatos antes de enviar.");
      return;
    }

    setLoading(true);
    const steps = [
      "Validando credenciais de envio...",
      "Processando lista de destinatários...",
      "Gerando template HTML otimizado...",
      "Enviando mensagens via SMTP...",
      "Campanha finalizada!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setSendingStatus(steps[i]);
      setSendingProgress(((i + 1) / steps.length) * 100);
      await new Promise(r => setTimeout(r, 800));
    }

    persistCampaign('sent');
    setSendingStatus("Campanha enviada com sucesso!");
    setTimeout(() => {
      setLoading(false);
      navigate('/campaigns');
    }, 1000);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook size={16} />;
      case 'instagram': return <Instagram size={16} />;
      case 'linkedin': return <Linkedin size={16} />;
      case 'twitter': return <Twitter size={16} />;
      case 'youtube': return <Youtube size={16} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-12">
        {(['details', 'content', 'audience', 'review'] as Step[]).map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step === s ? 'bg-indigo-600 text-white' : i < ['details', 'content', 'audience', 'review'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                {i + 1}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${step === s ? 'text-indigo-600' : 'text-slate-400'}`}>
                {s === 'details' ? 'Detalhes' : s === 'content' ? 'Conteúdo' : s === 'audience' ? 'Público' : 'Revisão'}
              </span>
            </div>
            {i < 3 && <div className="h-px bg-slate-200 flex-1 mb-6"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
            <Loader2 size={64} className="text-indigo-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{sendingStatus}</h2>
            <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
              <div
                className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${sendingProgress}%` }}
              ></div>
            </div>
            <p className="text-slate-500 mt-4">Simulando disparo real de e-mails...</p>
          </div>
        )}

        <div className="p-8">
          {step === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                {id ? <Edit3 size={18} /> : <Info size={18} />}
                <h2 className="text-xl font-bold">{id ? 'Editar Campanha' : 'Detalhes da Campanha'}</h2>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Campanha</label>
                  <input
                    type="text"
                    placeholder="ex: Lançamento Produto Verão 2024"
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sobre o que é esta campanha?</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva seus objetivos ou novidades para a IA usar como base."
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tom de Voz</label>
                  <div className="flex flex-wrap gap-2">
                    {['profissional', 'amigável', 'urgente', 'casual', 'educativo'].map(t => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, tone: t })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.tone === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border hover:bg-slate-100'
                          }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'content' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Conteúdo e Layout</h2>
                <button
                  onClick={handleAiContent}
                  disabled={aiLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold border border-indigo-100 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                >
                  {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span>Escrever com Gemini</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Linha de Assunto</label>
                    <input
                      type="text"
                      placeholder="Assunto do e-mail"
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Corpo do E-mail</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-40 resize-none"
                      placeholder="Sua mensagem principal..."
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <Plus size={18} /> Elementos de Layout
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Imagem Principal (URL)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          placeholder="https://imagem.jpg"
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          value={formData.imageUrl}
                          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Texto do Botão</label>
                        <input
                          type="text"
                          placeholder="Comprar Agora"
                          className="w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          value={formData.ctaText}
                          onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link do Botão</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            type="text"
                            placeholder="https://loja.com"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            value={formData.ctaUrl}
                            onChange={e => setFormData({ ...formData, ctaUrl: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Redes Sociais</label>
                        <button onClick={addSocialLink} className="text-xs text-indigo-600 font-bold hover:underline">+ Adicionar</button>
                      </div>
                      <div className="space-y-2">
                        {formData.socialLinks.map((link, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              className="text-xs border rounded px-1 py-2 outline-none"
                              value={link.platform}
                              onChange={e => updateSocialLink(idx, 'platform', e.target.value)}
                            >
                              <option value="facebook">Facebook</option>
                              <option value="instagram">Instagram</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="twitter">X / Twitter</option>
                              <option value="youtube">YouTube</option>
                            </select>
                            <input
                              type="text"
                              placeholder="URL"
                              className="flex-1 text-xs border rounded px-3 py-2 outline-none"
                              value={link.url}
                              onChange={e => updateSocialLink(idx, 'url', e.target.value)}
                            />
                            <button onClick={() => removeSocialLink(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div className="hidden lg:block">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prévia em Tempo Real</label>
                  <div className="bg-slate-200 p-8 rounded-3xl border shadow-inner h-full min-h-[500px] overflow-auto">
                    <div className="bg-white max-w-sm mx-auto shadow-xl rounded overflow-hidden">
                      {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="Banner" className="w-full h-40 object-cover" />
                      )}
                      <div className="p-6">
                        <h1 className="text-xl font-bold text-slate-800 mb-4">{formData.subject || 'Sem Assunto'}</h1>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{formData.content || 'Sua mensagem aparecerá aqui...'}</p>

                        {formData.ctaText && formData.ctaUrl && (
                          <div className="mt-8 text-center">
                            <a href="#" className="inline-block bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg pointer-events-none">
                              {formData.ctaText}
                            </a>
                          </div>
                        )}

                        {formData.socialLinks.length > 0 && (
                          <div className="mt-12 pt-6 border-t flex justify-center gap-4 text-slate-400">
                            {formData.socialLinks.map((s, i) => (
                              <div key={i}>{getSocialIcon(s.platform)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-4 text-[10px] text-center text-slate-400">
                        Você recebeu este e-mail pois se inscreveu em nossa lista.<br />
                        <a href="#" className="underline">Descadastrar-se</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'audience' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                <Upload size={18} />
                <h2 className="text-xl font-bold">Importar Público</h2>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all mb-4">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Selecione seu arquivo CSV</h3>
                <p className="text-slate-500 text-sm mt-1">Nós processaremos os e-mails automaticamente.</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.txt"
                  onChange={handleCsvImport}
                />
              </div>

              {formData.contacts.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">{formData.contacts.length} destinatários prontos</p>
                    </div>
                  </div>
                  <button onClick={() => setFormData({ ...formData, contacts: [] })} className="text-xs font-bold text-rose-600">Limpar</button>
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Eye size={22} />
                <h2 className="text-xl font-bold">Revisão Final</h2>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Destinatários</label>
                    <p className="text-lg font-bold text-slate-800">{formData.contacts.length} e-mails</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assunto</label>
                    <p className="text-lg font-bold text-slate-800">{formData.subject}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-48 object-cover" />}
                  <div className="p-8">
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-lg">
                      {formData.content}
                    </p>

                    {formData.ctaText && (
                      <div className="mt-8">
                        <button className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100">
                          {formData.ctaText}
                        </button>
                      </div>
                    )}

                    {formData.socialLinks.length > 0 && (
                      <div className="mt-12 pt-8 border-t flex gap-4 text-slate-400">
                        {formData.socialLinks.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" className="hover:text-indigo-600 transition-colors">
                            {getSocialIcon(s.platform)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t px-8 py-5 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={step === 'details' || loading}
            className="flex items-center space-x-2 text-slate-600 font-semibold hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
            <span>Voltar</span>
          </button>

          <div className="flex space-x-4">
            <button
              className="flex items-center space-x-2 px-6 py-2.5 bg-white border rounded-xl text-slate-700 font-semibold hover:bg-slate-100 shadow-sm"
              onClick={handleSaveDraft}
            >
              <Save size={18} />
              <span>Salvar Rascunho</span>
            </button>
            {step === 'review' ? (
              <button
                onClick={handleSend}
                disabled={loading || formData.contacts.length === 0}
                className="flex items-center space-x-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
                <span>{id ? 'Confirmar e Enviar' : 'Enviar Campanha'}</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <span>Próximo Passo</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
