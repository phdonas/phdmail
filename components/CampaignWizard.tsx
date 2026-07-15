import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Sparkles, Wand2, Send, Save, Eye, Loader2,
  Info, Upload, CheckCircle2, AlertTriangle, Edit3, Image as ImageIcon,
  Link as LinkIcon, Facebook, Instagram, Linkedin, Twitter, Youtube, Plus, Trash2, Check, ShieldAlert,
  Laptop, Smartphone, Calendar, AlertCircle
} from 'lucide-react';
import { 
  generateEmailContent, 
  suggestSubjectLines, 
  analyzeSpamRisk, 
  rewriteText, 
  suggestCta,
  SpamAnalysisResult,
  CtaSuggestion
} from '../services/geminiService';
import { getCampaignById, updateCampaign } from '../services/campaignService';
import { getContacts } from '../services/contactService';
import { Campaign, SocialLink, Contact } from '../types';
import { useTheme } from '../App';

type Step = 'details' | 'content' | 'audience' | 'review';

const CampaignWizard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingStatus, setSendingStatus] = useState<string>('');

  const [dbContacts, setDbContacts] = useState<Contact[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [spamResult, setSpamResult] = useState<SpamAnalysisResult | null>(null);
  const [spamChecking, setSpamChecking] = useState(false);

  // Scheduling States
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  // Right Tab (Preview vs Gemini Copilot)
  const [rightTab, setRightTab] = useState<'preview' | 'copilot'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');

  // Gemini Copilot States
  const [copilotText, setCopilotText] = useState('');
  const [copilotTone, setCopilotTone] = useState('profissional');
  const [copilotInstruction, setCopilotInstruction] = useState('');
  const [copilotResult, setCopilotResult] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [ctaSuggestions, setCtaSuggestions] = useState<CtaSuggestion[]>([]);
  const [ctaLoading, setCtaLoading] = useState(false);

  // Test Send States
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const [formData, setFormData] = useState({
    id: id || Math.random().toString(36).substr(2, 9),
    name: '',
    subject: '',
    topic: '',
    tone: 'profissional',
    content: '',
    contacts: [] as string[],
    segmentType: 'csv' as 'csv' | 'all' | 'tags',
    segmentTags: [] as string[],
    imageUrl: '',
    imageLink: '',
    ctaText: '',
    ctaUrl: '',
    socialLinks: [] as SocialLink[],

    // Footer State
    footerText: '',
    footerLinkText: '',
    footerLinkUrl: '',
    footerButtonText: '',
    footerButtonUrl: '',
    footerImageUrl: '',
    footerImageLink: ''
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
            topic: existing.topic || '',
            tone: 'profissional',
            content: existing.content || '',
            contacts: existing.contacts || [],
            segmentType: existing.segmentType || 'csv',
            segmentTags: existing.segmentTags || [],
            imageUrl: existing.imageUrl || '',
            imageLink: existing.imageLink || '',
            ctaText: existing.ctaText || '',
            ctaUrl: existing.ctaUrl || '',
            socialLinks: existing.socialLinks || [],

            // Footer Load
            footerText: existing.footerText || '',
            footerLinkText: existing.footerLinkText || '',
            footerLinkUrl: existing.footerLinkUrl || '',
            footerButtonText: existing.footerButtonText || '',
            footerButtonUrl: existing.footerButtonUrl || '',
            footerImageUrl: existing.footerImageUrl || '',
            footerImageLink: existing.footerImageLink || ''
          });

          if (existing.scheduledFor) {
            setScheduleType('scheduled');
            try {
              const date = new Date(existing.scheduledFor);
              const tzoffset = date.getTimezoneOffset() * 60000;
              const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
              setScheduleDateTime(localISOTime);
            } catch (_) {}
          }
        }
      }
    };
    loadCampaign();
  }, [id]);

  useEffect(() => {
    const fetchDbContacts = async () => {
      try {
        const contactsList = await getContacts();
        setDbContacts(contactsList);
        
        // Extract unique tags
        const tags = new Set<string>();
        contactsList.forEach(c => {
          if (c.tags) {
            c.tags.forEach(t => tags.add(t));
          }
        });
        setAvailableTags(Array.from(tags));
      } catch (err) {
        console.error("Erro ao carregar contatos do banco:", err);
      }
    };
    fetchDbContacts();
  }, []);

  // Recalculate preview count when segment settings or database contacts change
  useEffect(() => {
    const subscribed = dbContacts.filter(c => c.status === 'subscribed');
    if (formData.segmentType === 'all') {
      setPreviewCount(subscribed.length);
    } else if (formData.segmentType === 'tags') {
      if (formData.segmentTags.length === 0) {
        setPreviewCount(0);
      } else {
        const filtered = subscribed.filter(c => 
          c.tags && c.tags.some(t => formData.segmentTags.includes(t))
        );
        setPreviewCount(filtered.length);
      }
    } else {
      setPreviewCount(formData.contacts.length);
    }
  }, [formData.segmentType, formData.segmentTags, formData.contacts, dbContacts]);

  const cleanUrl = (url: string): string => {
    if (!url) return '';
    const match = url.match(/(https?:\/\/[^\s]+)/);
    return match ? match[0] : url;
  };

  // Initialize editor content when step changes to 'content'
  useEffect(() => {
    if (step === 'content' && editorRef.current) {
      if (editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content;
      }
    }
  }, [step]);

  const editorRef = useRef<HTMLDivElement>(null);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, content: editorRef.current?.innerHTML || '' }));
    }
  };

  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);

  const handleAiContent = async () => {
    if (!formData.topic) return;
    setAiLoading(true);
    try {
      const { subject, body } = await generateEmailContent(formData.topic, formData.tone);
      const htmlBody = body.replace(/\n/g, '<br/>');
      setFormData(prev => ({ ...prev, subject, content: htmlBody }));
      if (editorRef.current) editorRef.current.innerHTML = htmlBody;
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

  const handleCopilotRewrite = async () => {
    if (!copilotText) return;
    setCopilotLoading(true);
    try {
      const result = await rewriteText(copilotText, copilotTone, copilotInstruction);
      setCopilotResult(result);
    } catch (err) {
      alert("Falha ao reescrever texto. Tente novamente.");
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleCopilotCta = async () => {
    setCtaLoading(true);
    try {
      const suggestions = await suggestCta(formData.content);
      setCtaSuggestions(suggestions);
    } catch (err) {
      alert("Falha ao carregar sugestões de CTA.");
    } finally {
      setCtaLoading(false);
    }
  };

  const grabTextFromEditor = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || editorRef.current.textContent || '';
      setCopilotText(text.trim());
    } else {
      const plainText = formData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      setCopilotText(plainText);
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

  const persistCampaign = async (status: 'draft' | 'sent' | 'queued' | 'scheduled') => {
    const campaign: Campaign = {
      id: formData.id,
      name: formData.name || 'Sem nome',
      subject: formData.subject,
      content: formData.content,
      status: status,
      sentAt: status === 'sent' ? new Date().toLocaleString('pt-BR') : undefined,
      scheduledFor: scheduleType === 'scheduled' && scheduleDateTime ? new Date(scheduleDateTime).toISOString() : undefined,
      recipientsCount: formData.segmentType === 'csv' ? formData.contacts.length : previewCount,
      contacts: formData.segmentType === 'csv' ? formData.contacts : [],
      segmentType: formData.segmentType,
      segmentTags: formData.segmentTags,
      imageUrl: formData.imageUrl,
      imageLink: formData.imageLink,
      ctaText: formData.ctaText,
      ctaUrl: formData.ctaUrl,
      socialLinks: formData.socialLinks,

      // Save Topic and Footer
      topic: formData.topic,
      footerText: formData.footerText,
      footerLinkText: formData.footerLinkText,
      footerLinkUrl: formData.footerLinkUrl,
      footerButtonText: formData.footerButtonText,
      footerButtonUrl: formData.footerButtonUrl,
      footerImageUrl: formData.footerImageUrl,
      footerImageLink: formData.footerImageLink
    };
    await updateCampaign(campaign);
  };

  const handleSaveDraft = async () => {
    try {
      await persistCampaign('draft');
      alert("Rascunho salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
      alert("Erro ao salvar rascunho. Verifique sua conexão.");
    }
  };

  const handleSend = async () => {
    if (formData.segmentType === 'csv' && formData.contacts.length === 0) {
      alert("Por favor, importe contatos antes de enviar.");
      return;
    }
    if (formData.segmentType === 'tags' && formData.segmentTags.length === 0) {
      alert("Por favor, selecione pelo menos uma tag de destino.");
      return;
    }
    if (previewCount === 0) {
      alert("Não há destinatários selecionados para esta campanha.");
      return;
    }

    setLoading(true);
    const targetStatus = scheduleType === 'scheduled' ? 'scheduled' : 'queued';
    setSendingStatus(scheduleType === 'scheduled' ? "Agendando campanha..." : "Enviando campanha para processamento...");

    try {
      const campaign: Campaign = {
        id: formData.id,
        name: formData.name || 'Sem nome',
        subject: formData.subject,
        content: formData.content,
        status: targetStatus,
        sentAt: undefined,
        scheduledFor: scheduleType === 'scheduled' && scheduleDateTime ? new Date(scheduleDateTime).toISOString() : undefined,
        recipientsCount: previewCount,
        contacts: formData.segmentType === 'csv' ? formData.contacts : [],
        segmentType: formData.segmentType,
        segmentTags: formData.segmentTags,
        imageUrl: formData.imageUrl,
        imageLink: formData.imageLink,
        ctaText: formData.ctaText,
        ctaUrl: formData.ctaUrl,
        socialLinks: formData.socialLinks,
        
        // Topic and Footer
        topic: formData.topic,
        footerText: formData.footerText,
        footerLinkText: formData.footerLinkText,
        footerLinkUrl: formData.footerLinkUrl,
        footerButtonText: formData.footerButtonText,
        footerButtonUrl: formData.footerButtonUrl,
        footerImageUrl: formData.footerImageUrl,
        footerImageLink: formData.footerImageLink,

        // Pre-initialize counters for better UI experience
        sentCount: 0,
        failedCount: 0,
        totalRecipients: previewCount
      };

      await updateCampaign(campaign);
      
      setSendingStatus(scheduleType === 'scheduled' ? "Campanha agendada com sucesso!" : "Campanha na fila de envio!");
      await new Promise(r => setTimeout(r, 1200));

      if (scheduleType === 'scheduled') {
        alert(`Campanha agendada com sucesso para ${new Date(scheduleDateTime).toLocaleString('pt-BR')}!`);
      } else {
        alert(`Campanha enviada para processamento! ID: ${formData.id}`);
      }
      navigate('/campaigns');
    } catch (error) {
      console.error("Erro CRÍTICO ao processar campanha:", error);
      alert(`Erro ao salvar campanha: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert("Por favor, insira um e-mail válido para o teste.");
      return;
    }
    setSendingTest(true);
    try {
      const testCampaign: Campaign = {
        id: `test_${Date.now()}_${formData.id}`,
        name: `[TESTE] ${formData.name || 'Campanha'}`,
        subject: `[TESTE] ${formData.subject}`,
        content: formData.content,
        status: 'queued',
        recipientsCount: 1,
        contacts: [testEmail],
        segmentType: 'csv',
        imageUrl: formData.imageUrl,
        imageLink: formData.imageLink,
        ctaText: formData.ctaText,
        ctaUrl: formData.ctaUrl,
        socialLinks: formData.socialLinks,
        
        // Footer and topic
        topic: formData.topic,
        footerText: formData.footerText,
        footerLinkText: formData.footerLinkText,
        footerLinkUrl: formData.footerLinkUrl,
        footerButtonText: formData.footerButtonText,
        footerButtonUrl: formData.footerButtonUrl,
        footerImageUrl: formData.footerImageUrl,
        footerImageLink: formData.footerImageLink,
        
        isTest: true
      };
      
      await updateCampaign(testCampaign);
      alert(`Disparo de teste solicitado para ${testEmail}! O envio ocorre em segundo plano.`);
      setShowTestModal(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar disparo de teste.");
    } finally {
      setSendingTest(false);
    }
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

  // Compile final email html to render in iframe or container preview
  const getCompiledEmailHtml = () => {
    const headerHtml = formData.imageUrl 
      ? `<div style="text-align: center;"><img src="${formData.imageUrl}" alt="Banner" style="width:100%; max-height:240px; object-fit:cover; display:block;" /></div>` 
      : '';
    const ctaHtml = (formData.ctaText && formData.ctaUrl)
      ? `<div style="text-align: center; margin: 25px 0;"><a href="${formData.ctaUrl}" style="background-color:#7c3aed; color:white; padding:12px 24px; text-decoration:none; font-weight:bold; border-radius:8px; display:inline-block;">${formData.ctaText}</a></div>`
      : '';
    
    const socialIconsHtml = formData.socialLinks.map(s => 
      `<span style="margin: 0 8px; color:#8b5cf6; font-size:12px; font-family:sans-serif;">${s.platform.toUpperCase()}</span>`
    ).join('');
    const socialHtml = formData.socialLinks.length > 0
      ? `<div style="margin-top: 30px; border-top:1px solid #e2e8f0; padding-top:15px; text-align:center;">${socialIconsHtml}</div>`
      : '';

    // Footer Custom
    let footerCustom = '';
    if (formData.footerButtonText && formData.footerButtonUrl) {
      footerCustom += `<div style="text-align:center; margin-bottom:15px;"><a href="${formData.footerButtonUrl}" style="background-color:#64748b; color:white; padding:8px 16px; font-size:12px; text-decoration:none; font-weight:bold; border-radius:4px; display:inline-block;">${formData.footerButtonText}</a></div>`;
    }
    if (formData.footerText || (formData.footerLinkText && formData.footerLinkUrl)) {
      footerCustom += `<div style="color:#64748b; font-size:12px; text-align:center; margin-bottom:15px;">`;
      if (formData.footerText) footerCustom += `<p style="margin:4px 0;">${formData.footerText}</p>`;
      if (formData.footerLinkText && formData.footerLinkUrl) {
        footerCustom += `<p style="margin:4px 0;"><a href="${formData.footerLinkUrl}" style="color:#7c3aed;">${formData.footerLinkText}</a></p>`;
      }
      footerCustom += `</div>`;
    }
    if (formData.footerImageUrl) {
      footerCustom += `<div style="text-align:center; margin-top:10px;"><img src="${formData.footerImageUrl}" alt="Footer Logo" style="max-height:40px; object-fit:contain;" /></div>`;
    }

    return `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin:0; padding:15px; font-family: sans-serif; background-color:#f8fafc; color:#334155; }
            .card { background-color:white; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; max-width:600px; margin: 0 auto; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); }
            .content { padding:24px; line-height:1.6; font-size:15px; }
            .footer { background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:20px; font-size:11px; color:#94a3b8; text-align:center; }
            a { color: #7c3aed; }
          </style>
        </head>
        <body>
          <div class="card">
            ${headerHtml}
            <div class="content">
              ${formData.content || '<p style="color:#94a3b8; font-style:italic;">O corpo do seu e-mail aparecerá aqui...</p>'}
              ${ctaHtml}
              ${socialHtml}
              ${footerCustom ? `<div style="margin-top:25px; border-top:1px dashed #e2e8f0; padding-top:20px;">${footerCustom}</div>` : ''}
            </div>
            <div class="footer">
              <p>Você recebeu este e-mail pois está inscrito em nossa lista.</p>
              <p><a href="#" style="color:#94a3b8; text-decoration:underline;">Descadastrar-se</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition-colors">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Sparkles className="mr-2 text-brand-500 animate-pulse" />
            {id ? 'Editar Campanha' : 'Criar Nova Campanha'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Siga os passos para configurar sua mensagem, público e disparar.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Salvar Rascunho
          </button>
        </div>
      </header>

      {/* Stepper progress indicator */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition-colors">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          {(['details', 'content', 'audience', 'review'] as Step[]).map((s, i) => {
            const stepLabels: Record<Step, string> = {
              details: 'Configurações',
              content: 'Editor & IA',
              audience: 'Público',
              review: 'Revisão'
            };
            return (
              <React.Fragment key={s}>
                {i > 0 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    ['details', 'content', 'audience', 'review'].indexOf(step) >= i
                      ? 'bg-brand-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`} />
                )}
                <div className="flex flex-col items-center cursor-pointer" onClick={() => {
                  // Allow navigation to previous steps or next step if validated
                  const currentIndex = ['details', 'content', 'audience', 'review'].indexOf(step);
                  if (i <= currentIndex || (i === 1 && formData.name)) {
                    setStep(s);
                  }
                }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === s 
                      ? 'bg-brand-600 text-white ring-4 ring-brand-500/20' 
                      : ['details', 'content', 'audience', 'review'].indexOf(step) > i 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {['details', 'content', 'audience', 'review'].indexOf(step) > i ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mt-1.5 ${
                    step === s ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {stepLabels[s]}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Steps Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
        {loading && (
          <div className="bg-slate-500/10 backdrop-blur-sm absolute inset-0 z-30 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-brand-600 w-12 h-12" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">{sendingStatus}</p>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* STEP 1: DETAILS */}
          {step === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 mb-2">
                {id ? <Edit3 size={18} /> : <Info size={18} />}
                <h2 className="text-xl font-bold">{id ? 'Editar Configurações da Campanha' : 'Configurações de Campanha'}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome da Campanha</label>
                  <input
                    type="text"
                    placeholder="ex: Campanha Lançamento Verão 2026"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Qual o tema / objetivo principal da campanha?</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o produto, promoção ou ideia para guiar o assistente de inteligência artificial..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all"
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tom de Voz</label>
                  <div className="flex flex-wrap gap-2">
                    {['profissional', 'amigável', 'urgente', 'casual', 'educativo'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, tone: t })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.tone === t 
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scheduling Config */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-brand-500" />
                    Opções de Envio e Agendamento
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setScheduleType('immediate')}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        scheduleType === 'immediate'
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 ring-2 ring-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-sm block">Disparar Imediatamente</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">A campanha entra na fila de despacho assim que finalizada.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScheduleType('scheduled')}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        scheduleType === 'scheduled'
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 ring-2 ring-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-sm block">Agendar para Depois</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Defina uma data e horário específicos para o envio automático.</span>
                    </button>
                  </div>

                  {scheduleType === 'scheduled' && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Selecione Data e Horário</label>
                      <div className="relative max-w-xs">
                        <input
                          type="datetime-local"
                          className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={scheduleDateTime}
                          onChange={e => setScheduleDateTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTENT EDITOR & IA COPILOT */}
          {step === 'content' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Design & Conteúdo do E-mail</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Escreva seu e-mail ou utilize o Gemini para criar a cópia automaticamente.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleAiContent}
                  disabled={aiLoading || !formData.topic}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 rounded-xl font-bold border border-brand-100 dark:border-brand-900/50 hover:bg-brand-100/80 disabled:opacity-50 transition-colors self-start sm:self-auto"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>Escrever com Gemini</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Inputs & Editor Column */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Subject Line */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Linha de Assunto</label>
                      <button
                        type="button"
                        onClick={handleSubjectSuggestions}
                        disabled={aiLoading || !formData.topic}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline disabled:opacity-40"
                      >
                        Sugerir Assuntos (IA)
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Assunto que aparecerá na caixa de entrada..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />

                    {suggestedSubjects.length > 0 && (
                      <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 animate-in slide-in-from-top-1">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sugestões do Gemini (Clique para aplicar)</span>
                        {suggestedSubjects.map((sub, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, subject: sub });
                              setSuggestedSubjects([]);
                            }}
                            className="block w-full text-left text-xs p-1.5 hover:bg-white dark:hover:bg-slate-850 rounded text-slate-750 dark:text-slate-350 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-all truncate"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HTML Editor */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mensagem (Corpo do E-mail)</label>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 bg-white dark:bg-slate-900">
                      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 p-2 flex gap-1 flex-wrap items-center">
                        <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold" title="Negrito">B</button>
                        <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 italic" title="Itálico">I</button>
                        <button type="button" onClick={() => handleFormat('underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 underline" title="Sublinhado">U</button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-750 mx-1"></div>
                        <select onChange={(e) => handleFormat('fontName', e.target.value)} className="text-xs border border-slate-200 dark:border-slate-800 rounded p-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                          <option value="Arial">Arial</option>
                          <option value="Courier New">Courier</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning={true}
                        className="w-full p-4 min-h-[280px] outline-none prose prose-sm max-w-none dark:prose-invert"
                        onInput={(e) => setFormData({ ...formData, content: e.currentTarget.innerHTML })}
                        onBlur={(e) => setFormData({ ...formData, content: e.currentTarget.innerHTML })}
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Layout Elements Container */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b dark:border-slate-800 pb-2">
                      <ImageIcon size={18} className="text-brand-500" />
                      Mídia e Call-to-Action (Botão)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">Banner Principal (URL)</label>
                        <input
                          type="url"
                          placeholder="https://imagem.com/banner.jpg"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={formData.imageUrl}
                          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                          onBlur={e => setFormData({ ...formData, imageUrl: cleanUrl(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">Link de Destino do Banner</label>
                        <input
                          type="url"
                          placeholder="https://suapagina.com"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={formData.imageLink}
                          onChange={e => setFormData({ ...formData, imageLink: e.target.value })}
                          onBlur={e => setFormData({ ...formData, imageLink: cleanUrl(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">Texto do Botão CTA</label>
                        <input
                          type="text"
                          placeholder="ex: Acessar Produto"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={formData.ctaText}
                          onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">URL do Botão CTA</label>
                        <input
                          type="url"
                          placeholder="https://suapagina.com/checkout"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={formData.ctaUrl}
                          onChange={e => setFormData({ ...formData, ctaUrl: e.target.value })}
                          onBlur={e => setFormData({ ...formData, ctaUrl: cleanUrl(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Social links */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Links de Redes Sociais</label>
                        <button type="button" onClick={addSocialLink} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">+ Adicionar</button>
                      </div>
                      <div className="space-y-2">
                        {formData.socialLinks.map((link, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              className="text-xs border border-slate-200 dark:border-slate-800 rounded px-2 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                              value={link.platform}
                              onChange={e => updateSocialLink(idx, 'platform', e.target.value as any)}
                            >
                              <option value="facebook">Facebook</option>
                              <option value="instagram">Instagram</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="twitter">X / Twitter</option>
                              <option value="youtube">YouTube</option>
                            </select>
                            <input
                              type="url"
                              placeholder="https://redesocial.com/seuusuario"
                              className="flex-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded px-3 py-2 outline-none"
                              value={link.url}
                              onChange={e => updateSocialLink(idx, 'url', e.target.value)}
                              onBlur={e => updateSocialLink(idx, 'url', cleanUrl(e.target.value))}
                            />
                            <button type="button" onClick={() => removeSocialLink(idx)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rich Footer Configuration */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
                      <h3 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2 mb-2">
                        <Sparkles size={18} className="text-brand-500" />
                        Rodapé Adicional
                      </h3>
                      
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">Texto Auxiliar do Rodapé</label>
                          <input
                            type="text"
                            placeholder="ex: Dúvidas? Fale conosco no suporte"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={formData.footerText}
                            onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-1">Texto do Link Extra</label>
                            <input
                              type="text"
                              placeholder="ex: Termos de Uso"
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              value={formData.footerLinkText}
                              onChange={e => setFormData({ ...formData, footerLinkText: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-1">URL do Link Extra</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              value={formData.footerLinkUrl}
                              onChange={e => setFormData({ ...formData, footerLinkUrl: e.target.value })}
                              onBlur={e => setFormData({ ...formData, footerLinkUrl: cleanUrl(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-1">Texto Botão Rodapé</label>
                            <input
                              type="text"
                              placeholder="ex: Fale Conosco"
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              value={formData.footerButtonText}
                              onChange={e => setFormData({ ...formData, footerButtonText: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-1">URL Botão Rodapé</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              value={formData.footerButtonUrl}
                              onChange={e => setFormData({ ...formData, footerButtonUrl: e.target.value })}
                              onBlur={e => setFormData({ ...formData, footerButtonUrl: cleanUrl(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-1">Logo Rodapé (URL)</label>
                            <input
                              type="url"
                              placeholder="https://loja.com/mini-logo.png"
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              value={formData.footerImageUrl}
                              onChange={e => setFormData({ ...formData, footerImageUrl: e.target.value })}
                              onBlur={e => setFormData({ ...formData, footerImageUrl: cleanUrl(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase mb-1">Link de Destino do Logo</label>
                            <input
                              type="url"
                              placeholder="https://loja.com"
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              value={formData.footerImageLink}
                              onChange={e => setFormData({ ...formData, footerImageLink: e.target.value })}
                              onBlur={e => setFormData({ ...formData, footerImageLink: cleanUrl(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Sidebar (Split Pane) */}
                <div className="lg:col-span-5 lg:sticky lg:top-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
                  {/* Sidebar Tabs Header */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setRightTab('preview')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        rightTab === 'preview'
                          ? 'border-brand-650 text-brand-600 dark:text-brand-400 bg-brand-50/10'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Pré-visualização
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightTab('copilot')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
                        rightTab === 'copilot'
                          ? 'border-brand-650 text-brand-600 dark:text-brand-400 bg-brand-50/10'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Sparkles size={14} className="text-brand-500 animate-pulse" />
                      <span>Copiloto Gemini</span>
                    </button>
                  </div>

                  <div className="p-5">
                    {rightTab === 'preview' ? (
                      /* Live Preview Container */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border dark:border-slate-800">
                          <span className="text-xs text-slate-500 font-bold uppercase">Dispositivo</span>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => setPreviewDevice('desktop')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                previewDevice === 'desktop'
                                  ? 'bg-slate-200 dark:bg-slate-800 text-brand-600'
                                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                              }`}
                              title="Visualização Desktop"
                            >
                              <Laptop size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewDevice('mobile')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                previewDevice === 'mobile'
                                  ? 'bg-slate-200 dark:bg-slate-800 text-brand-600'
                                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                              }`}
                              title="Visualização Mobile"
                            >
                              <Smartphone size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Frame Simulator */}
                        <div className="bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800/80 rounded-2xl p-4 shadow-inner min-h-[460px] flex items-center justify-center transition-colors">
                          <div
                            className={`bg-white dark:bg-slate-950 w-full transition-all duration-300 rounded-xl overflow-hidden shadow-xl border border-slate-350 dark:border-slate-800 ${
                              previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-md'
                            }`}
                          >
                            {/* Window Dots */}
                            <div className="bg-slate-100 dark:bg-slate-900 px-3 py-2 flex items-center gap-1.5 border-b dark:border-slate-800">
                              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                              <span className="text-[10px] text-slate-400 font-medium truncate ml-2">
                                {formData.subject || 'Sem Assunto'}
                              </span>
                            </div>
                            
                            {/* Email Render Frame */}
                            <div className="max-h-[380px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 font-sans">
                              {formData.imageUrl && (
                                <img src={formData.imageUrl} alt="Banner" className="w-full h-32 object-cover rounded-lg mb-4" />
                              )}
                              <h2 className="text-sm font-bold mb-3">{formData.subject || 'Sem Assunto'}</h2>
                              <div 
                                className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: formData.content || 'Digitar corpo...' }}
                              />
                              
                              {formData.ctaText && formData.ctaUrl && (
                                <div className="text-center my-4">
                                  <a href={formData.ctaUrl} className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-5 rounded-lg no-underline shadow-sm">
                                    {formData.ctaText}
                                  </a>
                                </div>
                              )}

                              {formData.socialLinks.length > 0 && (
                                <div className="flex justify-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                                  {formData.socialLinks.map((s, idx) => (
                                    <div key={idx}>{getSocialIcon(s.platform)}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Gemini Copilot Panel */
                      <div className="space-y-5 animate-in fade-in">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assistente de Escrita Inteligente</h3>
                          <p className="text-[11px] text-slate-400">Otimize ou reescreva textos utilizando a IA do Gemini.</p>
                        </div>

                        {/* Rewrite Text Option */}
                        <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">Reescrever Parágrafo</span>
                            <button
                              type="button"
                              onClick={grabTextFromEditor}
                              className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline"
                            >
                              Puxar do Editor
                            </button>
                          </div>
                          
                          <textarea
                            rows={3}
                            placeholder="Insira ou puxe o texto que deseja otimizar..."
                            className="w-full p-2.5 text-xs rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={copilotText}
                            onChange={e => setCopilotText(e.target.value)}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Tom</label>
                              <select
                                className="w-full p-2 text-xs border dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded outline-none"
                                value={copilotTone}
                                onChange={e => setCopilotTone(e.target.value)}
                              >
                                <option value="profissional">Profissional</option>
                                <option value="amigável">Amigável</option>
                                <option value="urgente">Urgente</option>
                                <option value="casual">Casual</option>
                                <option value="educativo">Educativo</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ajuste Específico</label>
                              <input
                                type="text"
                                placeholder="ex: Deixe mais curto"
                                className="w-full p-2 text-xs border dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded outline-none"
                                value={copilotInstruction}
                                onChange={e => setCopilotInstruction(e.target.value)}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleCopilotRewrite}
                            disabled={copilotLoading || !copilotText}
                            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            {copilotLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                            <span>Reescrever Texto</span>
                          </button>

                          {copilotResult && (
                            <div className="mt-3 p-3 bg-brand-50/20 border border-brand-100/50 dark:border-brand-900/30 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Resultado da IA</span>
                              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 select-all font-medium">{copilotResult}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  // Simple copy or overwrite editor
                                  if (editorRef.current) {
                                    // Append or replace
                                    editorRef.current.innerHTML = editorRef.current.innerHTML + `<br/><br/>` + copilotResult.replace(/\n/g, '<br/>');
                                    setFormData(prev => ({ ...prev, content: editorRef.current?.innerHTML || '' }));
                                  } else {
                                    setFormData(prev => ({ ...prev, content: prev.content + '<br/>' + copilotResult }));
                                  }
                                  setCopilotResult('');
                                }}
                                className="text-[10px] bg-brand-650 hover:bg-brand-750 text-white font-bold py-1 px-3 rounded"
                              >
                                Adicionar ao Editor
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Suggest CTAs Option */}
                        <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Otimizador de Chamada para Ação (CTA)</span>
                          <p className="text-[10px] text-slate-400">Receba sugestões de CTAs com base no corpo do seu e-mail.</p>
                          
                          <button
                            type="button"
                            onClick={handleCopilotCta}
                            disabled={ctaLoading || !formData.content}
                            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            {ctaLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            <span>Sugerir CTAs Conversão</span>
                          </button>

                          {ctaSuggestions.length > 0 && (
                            <div className="space-y-2 mt-2 max-h-[220px] overflow-y-auto pr-1 animate-in fade-in">
                              {ctaSuggestions.map((cta, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 border dark:border-slate-850 rounded-xl space-y-1.5 text-left">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">"{cta.text}"</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">{cta.justification}</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, ctaText: cta.text }));
                                      setCtaSuggestions([]);
                                    }}
                                    className="text-[9px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
                                  >
                                    Aplicar este CTA
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AUDIENCE & CONTACT SEGMENTATION */}
          {step === 'audience' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 mb-2">
                <Users size={18} />
                <h2 className="text-xl font-bold">Configuração de Destinatários</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3">Segmentação de Envio</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, segmentType: 'all' })}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        formData.segmentType === 'all'
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 ring-2 ring-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-sm block">Toda a Base</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-2">Enviar para todos os contatos ativos inscritos.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, segmentType: 'tags' })}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        formData.segmentType === 'tags'
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 ring-2 ring-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-sm block">Por Tags</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-2">Filtrar base de contatos por categorias ou tags específicas.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, segmentType: 'csv' })}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        formData.segmentType === 'csv'
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 ring-2 ring-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-sm block">Importação CSV</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-2">Carregar arquivo de contatos sob demanda na hora do disparo.</span>
                    </button>
                  </div>
                </div>

                {/* Sub-form segments */}
                {formData.segmentType === 'tags' && (
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Selecione as Tags de Destino</label>
                    {availableTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                          const isSelected = formData.segmentTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const newTags = isSelected 
                                  ? formData.segmentTags.filter(t => t !== tag) 
                                  : [...formData.segmentTags, tag];
                                setFormData({ ...formData, segmentTags: newTags });
                              }}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                isSelected
                                  ? 'bg-brand-600 text-white border-brand-650'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-550 italic">Nenhuma tag cadastrada na base de contatos.</p>
                    )}
                  </div>
                )}

                {formData.segmentType === 'csv' && (
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border dark:border-slate-800 space-y-5 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Importar Arquivo CSV</label>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleCsvImport}
                      />
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-white dark:bg-slate-900 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
                      >
                        <Upload className="text-slate-400 group-hover:text-brand-500 transition-colors w-8 h-8" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-350">Selecione ou Arraste o arquivo CSV</span>
                        <span className="text-xs text-slate-400">O importador irá extrair todos os endereços de e-mail válidos detectados.</span>
                      </div>
                    </div>

                    {formData.contacts.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold">
                            ✓
                          </div>
                          <div>
                            <p className="text-sm font-bold">{formData.contacts.length} destinatários</p>
                            <p className="text-xs text-slate-400">Importados com sucesso do CSV</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, contacts: [] })}
                          className="text-xs text-rose-500 font-bold hover:underline"
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Recipients summary panel */}
                <div className="bg-slate-100/50 dark:bg-slate-950/60 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Estimativa de Destinatários</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-4 py-1.5 rounded-xl border dark:border-slate-800">
                    {previewCount.toLocaleString()} e-mails
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DISPATCH */}
          {step === 'review' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 mb-2">
                <Eye size={20} />
                <h2 className="text-xl font-bold">Revisão e Confirmação</h2>
              </div>

              {/* Review card */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Destinatários Estimados</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {formData.segmentType === 'csv' 
                        ? `${formData.contacts.length} e-mails (CSV)` 
                        : `${previewCount} e-mails (${formData.segmentType === 'all' ? 'Toda a base' : 'Tags'})`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Assunto do E-mail</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formData.subject || 'Sem Assunto'}</p>
                  </div>
                </div>

                {/* Inline HTML Email Preview */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Estrutura Final Compilada</span>
                  <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white shadow-sm max-w-md mx-auto">
                    <iframe
                      srcDoc={getCompiledEmailHtml()}
                      title="Compiled Email Preview"
                      className="w-full h-80 border-0"
                    />
                  </div>
                </div>

                {/* Deliverability and Spam Risk Meter */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-base">
                        <Sparkles size={18} className="text-brand-500 animate-pulse" />
                        Análise de Entregabilidade por IA
                      </h3>
                      <p className="text-[11px] text-slate-400">Verifique o risco de filtros anti-spam analisando seu texto.</p>
                    </div>

                    <button
                      type="button"
                      disabled={spamChecking}
                      onClick={async () => {
                        setSpamChecking(true);
                        try {
                          const result = await analyzeSpamRisk(formData.subject, formData.content);
                          setSpamResult(result);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSpamChecking(false);
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50 hover:bg-brand-100/80 rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-50 self-start sm:self-auto"
                    >
                      {spamChecking ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Avaliando...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={12} />
                          <span>Analisar com Gemini</span>
                        </>
                      )}
                    </button>
                  </div>

                  {spamResult && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
                      {/* Visual Spam Thermometer */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Pontuação de Spam (Métrica Gemini)</span>
                          <span className={`${
                            spamResult.score >= 80 ? 'text-emerald-500' :
                            spamResult.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                          }`}>{spamResult.score} / 100</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              spamResult.score >= 80 ? 'bg-emerald-500' :
                              spamResult.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${spamResult.score}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-450 leading-relaxed mt-1">
                          Nível de risco: <span className="font-extrabold capitalize">{spamResult.riskLevel}</span>. 
                          {spamResult.score >= 80 ? ' O e-mail está bem escrito e tem grande chance de alcançar a Inbox.' :
                           spamResult.score >= 50 ? ' Recomenda-se fazer pequenas alterações nos termos sugeridos.' :
                           ' Perigo alto de spam. Edite seu assunto ou conteúdo antes de enviar.'}
                        </div>
                      </div>

                      {spamResult.spamTriggerWords.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-rose-500" />
                            Gatilhos de Spam Identificados
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {spamResult.spamTriggerWords.map((word, idx) => (
                              <span key={idx} className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {spamResult.recommendations.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Ações Recomendadas</label>
                          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                            {spamResult.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Server checklist info box */}
                <div className="bg-amber-50/50 dark:bg-slate-950/30 border border-amber-200/50 dark:border-slate-800 rounded-2xl p-5 flex items-start space-x-3 text-amber-850 dark:text-amber-400">
                  <AlertTriangle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Verificação do Servidor</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Lembre-se de manter o Docker Desktop aberto e rodar `start_backend.bat` para processar a fila de campanhas e o rastreamento em tempo real.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex justify-between items-center border-t dark:border-slate-800 pt-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowTestModal(true)}
                  className="px-4 py-2.5 border border-brand-100 dark:border-brand-900/50 bg-brand-50/10 dark:bg-slate-900 hover:bg-brand-50/30 dark:hover:bg-slate-800 text-brand-700 dark:text-brand-400 rounded-xl text-sm font-semibold transition-colors"
                >
                  Enviar E-mail de Teste
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 'details' || loading}
            className="flex items-center space-x-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 rounded-xl text-sm font-semibold text-slate-650 dark:text-slate-350 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          {step === 'review' ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || previewCount === 0}
              className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-550/10 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              <span>{scheduleType === 'scheduled' ? 'Agendar Disparo' : 'Disparar Agora'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 'details' && !formData.name}
              className="flex items-center space-x-1 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-550/10 disabled:opacity-50 transition-colors"
            >
              <span>Próximo</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* DISPARO DE TESTE MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Mail size={20} className="text-brand-500" />
                Disparo de Teste
              </h3>
              <button 
                type="button" 
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Digite seu endereço de e-mail para receber uma cópia de teste desta campanha e validar a visualização.
            </p>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">E-mail Destino</label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 border dark:border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={sendingTest || !testEmail}
                onClick={handleSendTest}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5"
              >
                {sendingTest ? <Loader2 size={12} className="animate-spin" /> : null}
                <span>Enviar Teste</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignWizard;
