import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Sparkles, Wand2, Send, Save, Eye, Loader2,
  Info, Upload, CheckCircle2, AlertTriangle, Edit3, Image as ImageIcon,
  Link as LinkIcon, Facebook, Instagram, Linkedin, Twitter, Youtube, Plus, Trash2, Check, ShieldAlert,
  Laptop, Smartphone, Calendar, AlertCircle, Users, Mail, ArrowUp, ArrowDown, Settings, Video,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Eraser, Undo2, Redo2
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
import { getLinks, createLink, deleteLink } from '../services/linkService';
import { Campaign, SocialLink, Contact, LinkItem, EmailSection, EmailBlock, EmailBlockType } from '../types';
import { useTheme } from '../App';

type Step = 'details' | 'content' | 'audience' | 'review';

const PHD_TEMPLATES: Record<string, {
  name: string;
  description: string;
  bgColor: string;
  containerBgColor: string;
  textColor: string;
  fontFamily: string;
  sections: EmailSection[];
}> = {
  consultoria: {
    name: 'Consultoria em Gestão',
    description: 'Visual editorial premium (fundo creme, títulos em bronze/ouro, fontes serifadas).',
    bgColor: '#F3EFE6',
    containerBgColor: '#FDFBF7',
    textColor: '#17130E',
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    sections: [
      {
        id: 'c1',
        bgColor: '#F3EFE6',
        textColor: '#17130E',
        padding: 'medium',
        blocks: [
          {
            id: 'c1-b1',
            type: 'text',
            content: `<h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; color: #A87828; font-weight: bold; margin-bottom: 10px; margin-top: 0;">Consultoria em Gestão</h1><p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #3A3025; line-height: 1.7;">A evolução da liderança e a otimização de processos executivos na prática.</p>`
          }
        ]
      },
      {
        id: 'c2',
        bgColor: '#FDFBF7',
        textColor: '#17130E',
        padding: 'large',
        blocks: [
          {
            id: 'c2-b1',
            type: 'text',
            content: `<h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; color: #17130E; font-weight: bold; margin-bottom: 15px; margin-top: 0;">Os 3 Pilares da Gestão Eficiente</h2><p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #3A3025; line-height: 1.6; margin-bottom: 20px;">Para impulsionar a lucratividade e o alinhamento estratégico, focamos em processos enxutos, pessoas capacitadas e tecnologia adequada.</p>`
          },
          {
            id: 'c2-b2',
            type: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          }
        ]
      },
      {
        id: 'c3',
        bgColor: '#F3EFE6',
        textColor: '#17130E',
        padding: 'medium',
        blocks: [
          {
            id: 'c3-b1',
            type: 'cta',
            ctaText: 'Conhecer Mentoria de Gestão',
            ctaUrl: 'https://www.phdonassolo.com/mentoria',
            ctaAlign: 'center',
            ctaBgColor: '#A87828',
            ctaTextColor: '#FDFBF7'
          }
        ]
      }
    ]
  },
  curso: {
    name: 'Curso Online / Lançamento',
    description: 'Fundo escuro (Navy), botões chamativos em Gold, foco em conversão e escassez.',
    bgColor: '#0C1824',
    containerBgColor: '#122030',
    textColor: '#FDFBF7',
    fontFamily: '"DM Sans", sans-serif',
    sections: [
      {
        id: 'l1',
        bgColor: '#0C1824',
        textColor: '#FDFBF7',
        padding: 'medium',
        blocks: [
          {
            id: 'l1-b1',
            type: 'text',
            content: `<h1 style="font-size: 30px; color: #EDE0C0; font-weight: bold; text-align: center; margin-bottom: 10px; margin-top: 0;">CURSO DE GESTÃO ESTRATÉGICA</h1><p style="font-size: 15px; color: #FDFBF7; text-align: center; opacity: 0.9; margin-bottom: 0;">Inscrições abertas por tempo limitado!</p>`
          }
        ]
      },
      {
        id: 'l2',
        bgColor: '#122030',
        textColor: '#FDFBF7',
        padding: 'large',
        blocks: [
          {
            id: 'l2-b1',
            type: 'text',
            content: `<p style="font-size: 16px; line-height: 1.7; margin-bottom: 15px; margin-top: 0;">Desenvolva as habilidades de liderança e gestão financeira que as empresas de sucesso exigem.</p><p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Assista à apresentação completa do Prof. Paulo Donassolo no vídeo abaixo:</p>`
          },
          {
            id: 'l2-b2',
            type: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          }
        ]
      },
      {
        id: 'l3',
        bgColor: '#0C1824',
        textColor: '#FDFBF7',
        padding: 'medium',
        blocks: [
          {
            id: 'l3-b1',
            type: 'cta',
            ctaText: 'Garantir Minha Vaga com Desconto',
            ctaUrl: 'https://www.phdonassolo.com/cursos',
            ctaAlign: 'center',
            ctaBgColor: '#C8983C',
            ctaTextColor: '#0C1824'
          }
        ]
      }
    ]
  },
  mentoria: {
    name: 'Mentoria Executiva',
    description: 'Layout focado em pilares, com botão de agendamento integrado e visual creme premium.',
    bgColor: '#FDFBF7',
    containerBgColor: '#FDFBF7',
    textColor: '#17130E',
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    sections: [
      {
        id: 'm1',
        bgColor: '#FDFBF7',
        textColor: '#17130E',
        padding: 'medium',
        blocks: [
          {
            id: 'm1-b1',
            type: 'text',
            content: `<h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; color: #A87828; font-weight: bold; text-align: center; margin-bottom: 10px; margin-top: 0;">Mentoria Executiva Individual</h1><p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #6B5E50; text-align: center; margin-bottom: 0;">Acelere sua carreira executiva com acompanhamento estratégico personalizado.</p>`
          }
        ]
      },
      {
        id: 'm2',
        bgColor: '#F3EFE6',
        textColor: '#17130E',
        padding: 'large',
        blocks: [
          {
            id: 'm2-b1',
            type: 'text',
            content: `<h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: #17130E; font-weight: bold; margin-bottom: 15px; margin-top: 0;">Como funciona a mentoria?</h2><p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #3A3025; line-height: 1.6; margin-bottom: 15px;">Sessões quinzenais focadas em resolver os desafios reais da sua organização, desenhando um plano de crescimento estruturado.</p>`
          },
          {
            id: 'm2-b2',
            type: 'cta',
            ctaText: 'Agendar Conversa de Diagnóstico',
            ctaUrl: 'https://www.phdonassolo.com/falecomigo',
            ctaAlign: 'left',
            ctaBgColor: '#17130E',
            ctaTextColor: '#FDFBF7'
          }
        ]
      }
    ]
  },
  newsletter: {
    name: 'Dicas de Gestão (Newsletter)',
    description: 'Layout minimalista e limpo para leitura fluida, com separadores discretos.',
    bgColor: '#f9fafb',
    containerBgColor: '#ffffff',
    textColor: '#334155',
    fontFamily: '"DM Sans", sans-serif',
    sections: [
      {
        id: 'n1',
        bgColor: '#ffffff',
        textColor: '#334155',
        padding: 'medium',
        blocks: [
          {
            id: 'n1-b1',
            type: 'text',
            content: `<p style="font-size: 12px; font-weight: bold; color: #A87828; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; margin-top: 0;">Edição Semanal #42</p><h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; color: #17130E; font-weight: bold; margin-bottom: 15px; margin-top: 0;">3 Dicas Rápidas para Reduzir Reuniões Inúteis</h1><p style="font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 0;">Reuniões improdutivas custam caro para a empresa e drenam a energia dos colaboradores. Aqui estão 3 práticas imediatas para resgatar a produtividade da sua equipe:</p>`
          }
        ]
      },
      {
        id: 'n2',
        bgColor: '#f9fafb',
        textColor: '#334155',
        padding: 'medium',
        blocks: [
          {
            id: 'n2-b1',
            type: 'text',
            content: `<p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px; margin-top: 0;"><b>1. Regra dos 15 minutos:</b> Tente agendar reuniões de 15 minutos em vez de 30, forçando objetividade.</p><p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px;"><b>2. Pauta Antecipada:</b> Nenhuma reunião deve acontecer sem uma pauta escrita enviada com 24h de antecedência.</p><p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 0;"><b>3. Decisão Clara:</b> Toda reunião deve terminar com uma lista explícita de próximos passos e responsáveis.</p>`
          }
        ]
      },
      {
        id: 'n3',
        bgColor: '#ffffff',
        textColor: '#334155',
        padding: 'medium',
        blocks: [
          {
            id: 'n3-b1',
            type: 'text',
            content: `<p style="font-size: 14px; color: #64748b; font-style: italic; margin-bottom: 0; margin-top: 0;">O que achou das dicas de hoje? Responda a este e-mail compartilhando sua experiência!</p>`
          }
        ]
      }
    ]
  }
};

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

  // Link Library States
  const [savedLinks, setSavedLinks] = useState<LinkItem[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [activeLinkField, setActiveLinkField] = useState<{ sectionId?: string; blockId?: string; field: string } | null>(null);
  const [savedSelectionRange, setSavedSelectionRange] = useState<Range | null>(null);

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

    // Layout configuration
    editorMode: 'classic' as 'classic' | 'visual',
    sections: [] as EmailSection[],
    bgColor: '#f9fafb',
    containerBgColor: '#ffffff',
    textColor: '#334155',
    fontFamily: 'Helvetica, Arial, sans-serif',

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

            // Layout load
            editorMode: (existing as any).editorMode || 'classic',
            sections: (existing as any).sections || [],
            bgColor: (existing as any).bgColor || '#f9fafb',
            containerBgColor: (existing as any).containerBgColor || '#ffffff',
            textColor: (existing as any).textColor || '#334155',
            fontFamily: (existing as any).fontFamily || 'Helvetica, Arial, sans-serif',

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
    const loadLinks = async () => {
      try {
        const linksList = await getLinks();
        setSavedLinks(linksList);
      } catch (err) {
        console.error("Erro ao carregar links salvos:", err);
      }
    };
    loadLinks();
  }, []);

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

  // Select a preset template
  const handleSelectTemplate = (templateKey: string) => {
    const template = PHD_TEMPLATES[templateKey];
    if (!template) return;
    
    // Deep clone sections to avoid referencing the same object in state
    const clonedSections = JSON.parse(JSON.stringify(template.sections)) as EmailSection[];
    
    setFormData(prev => ({
      ...prev,
      bgColor: template.bgColor,
      containerBgColor: template.containerBgColor,
      textColor: template.textColor,
      fontFamily: template.fontFamily,
      sections: clonedSections,
      editorMode: 'visual'
    }));
  };

  // Add a new section
  const handleAddSection = () => {
    const newSection: EmailSection = {
      id: Math.random().toString(36).substr(2, 9),
      bgColor: '#ffffff',
      textColor: '#334155',
      padding: 'medium',
      blocks: []
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  // Remove section
  const handleRemoveSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  // Move section
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = formData.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.sections.length - 1) return;
    
    const newSections = [...formData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  // Add block to section
  const handleAddBlock = (sectionId: string, type: EmailBlockType) => {
    const newBlock: EmailBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? '<p>Escreva seu texto aqui...</p>' : '',
      videoUrl: type === 'video' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : '',
      imageUrl: type === 'image' ? 'https://via.placeholder.com/600x300?text=Imagem+PhD' : '',
      ctaText: type === 'cta' ? 'Clique Aqui' : '',
      ctaUrl: type === 'cta' ? 'https://www.phdonassolo.com' : '',
      ctaAlign: 'center',
      ctaBgColor: '#A87828',
      ctaTextColor: '#FDFBF7',
      spacing: type === 'divider' ? 20 : undefined
    };
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          blocks: [...s.blocks, newBlock]
        };
      })
    }));
  };

  // Remove block
  const handleRemoveBlock = (sectionId: string, blockId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          blocks: s.blocks.filter(b => b.id !== blockId)
        };
      })
    }));
  };

  // Move block within section
  const handleMoveBlock = (sectionId: string, blockId: string, direction: 'up' | 'down') => {
    const section = formData.sections.find(s => s.id === sectionId);
    if (!section) return;
    const index = section.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === section.blocks.length - 1) return;
    
    const newBlocks = [...section.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, blocks: newBlocks };
      })
    }));
  };

  // Update block fields
  const handleUpdateBlock = (sectionId: string, blockId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          blocks: s.blocks.map(b => {
            if (b.id !== blockId) return b;
            return { ...b, [field]: value };
          })
        };
      })
    }));
  };

  // Update section fields
  const handleUpdateSection = (sectionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, [field]: value };
      })
    }));
  };

  // Save new link in Library
  const handleCreateSavedLink = async () => {
    if (!newLinkName || !newLinkUrl) return;
    try {
      const created = await createLink({ name: newLinkName, url: newLinkUrl });
      setSavedLinks(prev => [...prev, created]);
      setNewLinkName('');
      setNewLinkUrl('');
    } catch (err) {
      console.error("Erro ao criar link rápido:", err);
    }
  };

  // Delete saved link from Library
  const handleDeleteSavedLink = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      setSavedLinks(prev => prev.filter(l => l.id !== linkId));
    } catch (err) {
      console.error("Erro ao excluir link rápido:", err);
    }
  };

  // Open Link Picker
  const handleOpenLinkPicker = (sectionId?: string, blockId?: string, field: string = 'ctaUrl') => {
    // Save Selection Range for WYSIWYG insertLink operation
    if (field === 'content') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        setSavedSelectionRange(sel.getRangeAt(0));
      } else {
        setSavedSelectionRange(null);
      }
    } else {
      setSavedSelectionRange(null);
    }

    setActiveLinkField({ sectionId, blockId, field });
    setShowLinkModal(true);
  };

  // Select link from picker
  const handleSelectLink = (url: string) => {
    if (!activeLinkField) return;
    
    const { sectionId, blockId, field } = activeLinkField;
    
    if (field === 'content') {
      if (sectionId && blockId) {
        // Visual block rich-text
        const editorEl = document.getElementById(`editor-${blockId}`);
        if (editorEl) {
          const sel = window.getSelection();
          if (sel && savedSelectionRange) {
            sel.removeAllRanges();
            sel.addRange(savedSelectionRange);
            
            if (savedSelectionRange.collapsed) {
              const linkNode = document.createElement('a');
              linkNode.href = url;
              linkNode.innerText = url;
              savedSelectionRange.insertNode(linkNode);
              savedSelectionRange.setStartAfter(linkNode);
              savedSelectionRange.setEndAfter(linkNode);
              sel.removeAllRanges();
              sel.addRange(savedSelectionRange);
            } else {
              document.execCommand('createLink', false, url);
            }
          } else {
            editorEl.innerHTML += ` <a href="${url}">${url}</a>`;
          }
          handleUpdateBlock(sectionId, blockId, 'content', editorEl.innerHTML);
        }
      } else {
        // Classic editor rich-text
        const editorEl = editorRef.current;
        if (editorEl) {
          const sel = window.getSelection();
          if (sel && savedSelectionRange) {
            sel.removeAllRanges();
            sel.addRange(savedSelectionRange);
            
            if (savedSelectionRange.collapsed) {
              const linkNode = document.createElement('a');
              linkNode.href = url;
              linkNode.innerText = url;
              savedSelectionRange.insertNode(linkNode);
              savedSelectionRange.setStartAfter(linkNode);
              savedSelectionRange.setEndAfter(linkNode);
              sel.removeAllRanges();
              sel.addRange(savedSelectionRange);
            } else {
              document.execCommand('createLink', false, url);
            }
          } else {
            editorEl.innerHTML += ` <a href="${url}">${url}</a>`;
          }
          setFormData(prev => ({ ...prev, content: editorEl.innerHTML }));
        }
      }
    } else if (sectionId && blockId) {
      // It's a block field (like ctaUrl or imageLink)
      handleUpdateBlock(sectionId, blockId, field, url);
    } else {
      // It's a general field on formData
      setFormData(prev => ({ ...prev, [field]: url }));
    }
    
    setShowLinkModal(false);
    setActiveLinkField(null);
    setSavedSelectionRange(null);
  };

  // Compile Visual Sections to responsive HTML table structure
  const compileSectionsToHtml = (sections: EmailSection[]): string => {
    if (!sections || sections.length === 0) return '';
    
    let html = '';
    sections.forEach(section => {
      const pad = section.padding === 'small' ? '12px 24px' : section.padding === 'large' ? '40px 48px' : '24px 32px';
      
      html += `<!-- SECTION START -->\n`;
      html += `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${section.bgColor}; color: ${section.textColor}; margin: 0; padding: 0;">\n`;
      html += `  <tr>\n`;
      html += `    <td style="padding: ${pad};">\n`;
      
      section.blocks.forEach(block => {
        if (block.type === 'text' && block.content) {
          html += `      <div style="margin-bottom: 20px; font-family: inherit; line-height: 1.7; color: ${section.textColor};">${block.content}</div>\n`;
        } 
        else if (block.type === 'video' && block.videoUrl) {
          // Extract YouTube ID
          const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const match = block.videoUrl.match(ytReg);
          const ytId = match ? match[1] : '';
          const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://via.placeholder.com/600x338?text=Video+no+YouTube';
          
          html += `      <div style="margin-top: 15px; margin-bottom: 25px; text-align: center;">\n`;
          html += `        <a href="${block.videoUrl}" target="_blank" style="text-decoration: none; display: inline-block; position: relative; max-width: 100%;">\n`;
          html += `          <table border="0" cellpadding="0" cellspacing="0" align="center" style="background-image: url('${thumbUrl}'); background-size: cover; background-position: center; width: 500px; max-width: 100%; height: 281px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">\n`;
          html += `            <tr>\n`;
          html += `              <td align="center" valign="middle" style="background-color: rgba(0,0,0,0.3); height: 281px;">\n`;
          html += `                <table border="0" cellpadding="0" cellspacing="0" style="background-color: #A87828; border-radius: 50%; width: 68px; height: 68px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">\n`;
          html += `                  <tr>\n`;
          html += `                    <td align="center" valign="middle" style="height: 68px; padding-left: 5px;">\n`;
          html += `                      <div style="width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 20px solid #FFFFFF;"></div>\n`;
          html += `                    </td>\n`;
          html += `                  </tr>\n`;
          html += `                </table>\n`;
          html += `              </td>\n`;
          html += `            </tr>\n`;
          html += `          </table>\n`;
          html += `        </a>\n`;
          html += `      </div>\n`;
        } 
        else if (block.type === 'image' && block.imageUrl) {
          const imgTag = `<img src="${block.imageUrl}" alt="Imagem" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; border: 0; display: block; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" />`;
          
          html += `      <div style="margin-top: 15px; margin-bottom: 20px; text-align: center;">\n`;
          if (block.imageLink) {
            html += `        <a href="${block.imageLink}" target="_blank">${imgTag}</a>\n`;
          } else {
            html += `        ${imgTag}\n`;
          }
          html += `      </div>\n`;
        } 
        else if (block.type === 'cta' && block.ctaText && block.ctaUrl) {
          const align = block.ctaAlign || 'center';
          const bg = block.ctaBgColor || '#A87828';
          const textColors = block.ctaTextColor || '#FDFBF7';
          
          html += `      <div style="text-align: ${align}; margin-top: 25px; margin-bottom: 25px;">\n`;
          html += `        <table border="0" cellspacing="0" cellpadding="0" style="display: inline-block;">\n`;
          html += `          <tr>\n`;
          html += `            <td align="center" bgcolor="${bg}" style="border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.12);">\n`;
          html += `              <a href="${block.ctaUrl}" target="_blank" style="font-size: 15px; font-family: inherit; color: ${textColors}; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; font-weight: bold; border: 1px solid ${bg};">${block.ctaText}</a>\n`;
          html += `            </td>\n`;
          html += `          </tr>\n`;
          html += `        </table>\n`;
          html += `      </div>\n`;
        }
        else if (block.type === 'divider') {
          const h = block.spacing || 20;
          html += `      <table border="0" cellpadding="0" cellspacing="0" width="100%">\n`;
          html += `        <tr>\n`;
          html += `          <td style="padding: ${h / 2}px 0; border-top: 1px solid rgba(0,0,0,0.06);"></td>\n`;
          html += `        </tr>\n`;
          html += `      </table>\n`;
        }
      });
      
      html += `    </td>\n`;
      html += `  </tr>\n`;
      html += `</table>\n`;
      html += `<!-- SECTION END -->\n`;
    });
    
    return html;
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

  const renderWysiwygToolbar = (onInsertSavedLink?: () => void) => {
    return (
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 p-2 flex gap-1 flex-wrap items-center">
        {/* Undo/Redo */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('undo'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Desfazer"
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('redo'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Refazer"
        >
          <Redo2 size={15} />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Text Formats */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold transition-colors"
          title="Negrito"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 italic transition-colors"
          title="Itálico"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 underline transition-colors"
          title="Sublinhado"
        >
          <Underline size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('strikeThrough'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Riscado"
        >
          <Strikethrough size={15} />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Headings Dropdown */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            handleFormat('formatBlock', val);
          }}
          defaultValue="<p>"
          className="text-xs border border-slate-200 dark:border-slate-850 rounded px-1.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none max-w-[100px]"
          title="Estilo de Bloco"
        >
          <option value="<p>">Texto</option>
          <option value="<h1>">Título 1</option>
          <option value="<h2>">Título 2</option>
          <option value="<h3>">Título 3</option>
        </select>

        {/* Font Family */}
        <select
          onChange={(e) => handleFormat('fontName', e.target.value)}
          defaultValue="Arial"
          className="text-xs border border-slate-200 dark:border-slate-850 rounded px-1.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none max-w-[100px]"
          title="Fonte"
        >
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times</option>
          <option value="Verdana">Verdana</option>
          <option value="Cormorant Garamond">Cormorant</option>
          <option value="DM Sans">DM Sans</option>
        </select>

        {/* Font Size */}
        <select
          onChange={(e) => handleFormat('fontSize', e.target.value)}
          defaultValue="3"
          className="text-xs border border-slate-200 dark:border-slate-850 rounded px-1.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
          title="Tamanho da Fonte"
        >
          <option value="1">Muito P</option>
          <option value="2">Pequeno</option>
          <option value="3">Normal</option>
          <option value="4">Médio</option>
          <option value="5">Grande</option>
          <option value="6">Muito G</option>
          <option value="7">Gigante</option>
        </select>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyLeft'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Alinhar à Esquerda"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyCenter'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Centralizar"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyRight'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Alinhar à Direita"
        >
          <AlignRight size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyFull'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Justificar"
        >
          <AlignJustify size={15} />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Lista de Marcadores"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Lista Numerada"
        >
          <ListOrdered size={15} />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Branding Colors Palette Dropdown */}
        <div className="relative group/color">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] font-bold"
            title="Cor do Texto"
          >
            <span className="w-3.5 h-3.5 rounded-full border border-slate-350 bg-slate-800 dark:bg-slate-100 block"></span>
            Cor
          </button>
          <div className="absolute left-0 top-full mt-1 hidden group-hover/color:flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-2 shadow-xl z-10 gap-1.5 min-w-[130px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase px-1">Cor do Texto</span>
            <div className="grid grid-cols-5 gap-1">
              {['#0C1824', '#A87828', '#17130E', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#6B7280', '#000000'].map(color => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat('foreColor', color);
                  }}
                  className="w-5 h-5 rounded border border-slate-200 dark:border-slate-800"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormat('foreColor', '#17130E');
              }}
              className="w-full py-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 font-semibold rounded"
            >
              Cor Padrão
            </button>
          </div>
        </div>

        {/* Custom URL Link */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Digite o endereço do Link (URL):", "https://");
            if (url) {
              handleFormat('createLink', url);
            }
          }}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 transition-colors"
          title="Inserir Link Externo"
        >
          <LinkIcon size={15} />
        </button>

        {/* Saved Link Selector */}
        {onInsertSavedLink && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onInsertSavedLink();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 rounded-lg text-[10px] font-bold text-brand-700 dark:text-brand-400 transition-colors"
            title="Inserir Link Salvo do Banco"
          >
            <LinkIcon size={11} />
            <span>Link Salvo</span>
          </button>
        )}

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Clear formatting */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleFormat('removeFormat'); }}
          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded text-slate-500 transition-colors"
          title="Limpar Formatação"
        >
          <Eraser size={15} />
        </button>
      </div>
    );
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
    let compiledContent = formData.content;
    if (formData.editorMode === 'visual') {
      compiledContent = compileSectionsToHtml(formData.sections);
    }

    const campaign: Campaign = {
      id: formData.id,
      name: formData.name || 'Sem nome',
      subject: formData.subject,
      content: compiledContent,
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

    // Store visual builder specific parameters
    (campaign as any).editorMode = formData.editorMode;
    (campaign as any).sections = formData.sections;
    (campaign as any).bgColor = formData.bgColor;
    (campaign as any).containerBgColor = formData.containerBgColor;
    (campaign as any).textColor = formData.textColor;
    (campaign as any).fontFamily = formData.fontFamily;

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

    try {
      // Step 1: Compile HTML content
      setSendingStatus("1 de 4: Compilando seções e blocos do e-mail...");
      await new Promise(r => setTimeout(r, 600));
      
      let compiledContent = formData.content;
      if (formData.editorMode === 'visual') {
        compiledContent = compileSectionsToHtml(formData.sections);
      }

      // Step 2: Preparing metadata
      setSendingStatus("2 de 4: Preparando e-mails dos destinatários e cabeçalhos...");
      await new Promise(r => setTimeout(r, 600));

      const campaign: Campaign = {
        id: formData.id,
        name: formData.name || 'Sem nome',
        subject: formData.subject,
        content: compiledContent,
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

      // Store visual builder specific parameters
      (campaign as any).editorMode = formData.editorMode;
      (campaign as any).sections = formData.sections;
      (campaign as any).bgColor = formData.bgColor;
      (campaign as any).containerBgColor = formData.containerBgColor;
      (campaign as any).textColor = formData.textColor;
      (campaign as any).fontFamily = formData.fontFamily;

      // Step 3: Firestore write
      setSendingStatus("3 de 4: Salvando dados no banco de dados Firestore...");
      await new Promise(r => setTimeout(r, 600));
      await updateCampaign(campaign);
      
      // Step 4: Finalizing
      setSendingStatus(scheduleType === 'scheduled' ? "4 de 4: Campanha agendada com sucesso!" : "4 de 4: Campanha enviada para processamento!");
      await new Promise(r => setTimeout(r, 800));

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
      let compiledContent = formData.content;
      if (formData.editorMode === 'visual') {
        compiledContent = compileSectionsToHtml(formData.sections);
      }

      const testCampaign: Campaign = {
        id: `test_${Date.now()}_${formData.id}`,
        name: `[TESTE] ${formData.name || 'Campanha'}`,
        subject: `[TESTE] ${formData.subject}`,
        content: compiledContent,
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
      
      // Store visual builder specific parameters for test as well
      (testCampaign as any).editorMode = formData.editorMode;
      (testCampaign as any).sections = formData.sections;
      (testCampaign as any).bgColor = formData.bgColor;
      (testCampaign as any).containerBgColor = formData.containerBgColor;
      (testCampaign as any).textColor = formData.textColor;
      (testCampaign as any).fontFamily = formData.fontFamily;
      
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
                {/* Subject Line */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">Linha de Assunto</label>
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

                  {/* Galeria de Templates PhD */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Templates Rápidos baseados em phdonassolo.com</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(PHD_TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectTemplate(key)}
                          className="p-3 text-left bg-white dark:bg-slate-900 border dark:border-slate-800 hover:border-brand-500 hover:ring-2 hover:ring-brand-500/10 rounded-xl transition-all flex flex-col justify-between group"
                        >
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">{template.name}</span>
                          <span className="text-[9px] text-slate-450 mt-1 line-clamp-2">{template.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor Mode Selector */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, editorMode: 'classic' })}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        formData.editorMode === 'classic'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-355'
                      }`}
                    >
                      Editor Clássico (HTML)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, editorMode: 'visual' })}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        formData.editorMode === 'visual'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-355'
                      }`}
                    >
                      Construtor Visual (Seções)
                    </button>
                  </div>

                  {/* -------------------- CLASSIC MODE EDITOR -------------------- */}
                  {formData.editorMode === 'classic' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mensagem (Corpo do E-mail)</label>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 bg-white dark:bg-slate-900">
                          {renderWysiwygToolbar()}
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
                  )}

                  {/* -------------------- VISUAL SECTION BUILDER -------------------- */}
                  {formData.editorMode === 'visual' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Configurações Gerais de Design */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border dark:border-slate-800 space-y-4">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Settings size={16} className="text-brand-500" />
                          Configurações Gerais do E-mail
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipografia Principal</label>
                            <select
                              className="w-full text-xs border dark:border-slate-800 rounded px-2.5 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                              value={formData.fontFamily}
                              onChange={e => setFormData({ ...formData, fontFamily: e.target.value })}
                            >
                              <option value='"Cormorant Garamond", Georgia, serif'>PhD Editorial (Serif - Cormorant)</option>
                              <option value='"DM Sans", sans-serif'>PhD Corporativo (Sans-Serif - DM Sans)</option>
                              <option value='Arial, sans-serif'>Padrão E-mail (Arial)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cor de Fundo do E-mail</label>
                            <div className="flex gap-2 mt-1">
                              {['#f9fafb', '#F3EFE6', '#0C1824', '#ffffff'].map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, bgColor: color })}
                                  className={`w-6 h-6 rounded-full border-2 ${formData.bgColor === color ? 'border-brand-500 scale-110' : 'border-slate-200 dark:border-slate-800'} transition-all`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Seções */}
                      <div className="space-y-6">
                        {formData.sections.map((section, sIdx) => (
                          <div key={section.id} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border dark:border-slate-800 space-y-4">
                            {/* Section Toolbar */}
                            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3 flex-wrap gap-2">
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Seção #{sIdx + 1}</span>
                              <div className="flex items-center space-x-2 flex-wrap gap-1">
                                {/* Color choices */}
                                <div className="flex gap-1 items-center bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 mr-1">Fundo:</span>
                                  {['#FDFBF7', '#F3EFE6', '#0C1824', '#ffffff'].map(color => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => handleUpdateSection(section.id, 'bgColor', color)}
                                      className={`w-4 h-4 rounded-full border ${section.bgColor === color ? 'border-brand-500 scale-110' : 'border-slate-200 dark:border-slate-800'}`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                                <div className="flex gap-1 items-center bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 mr-1">Texto:</span>
                                  {['#17130E', '#FDFBF7', '#3A3025'].map(color => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => handleUpdateSection(section.id, 'textColor', color)}
                                      className={`w-4 h-4 rounded-full border ${section.textColor === color ? 'border-brand-500 scale-110' : 'border-slate-200 dark:border-slate-800'}`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                                {/* Padding */}
                                <select
                                  className="text-[10px] border dark:border-slate-800 rounded px-1.5 py-1 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                                  value={section.padding || 'medium'}
                                  onChange={e => handleUpdateSection(section.id, 'padding', e.target.value)}
                                >
                                  <option value="small">Espaço P</option>
                                  <option value="medium">Espaço M</option>
                                  <option value="large">Espaço G</option>
                                </select>

                                {/* Action Buttons */}
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(section.id, 'up')}
                                  disabled={sIdx === 0}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 p-1"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(section.id, 'down')}
                                  disabled={sIdx === formData.sections.length - 1}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 p-1"
                                >
                                  <ArrowDown size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSection(section.id)}
                                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Blocks container */}
                            <div className="space-y-3">
                              {section.blocks.map((block, bIdx) => (
                                <div key={block.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl border dark:border-slate-800 space-y-3 shadow-inner relative group/block">
                                  {/* Block header */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{block.type === 'text' ? 'Texto' : block.type === 'video' ? 'Vídeo' : block.type === 'image' ? 'Imagem' : block.type === 'cta' ? 'Botão' : 'Divisor'}</span>
                                    <div className="flex items-center space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => handleMoveBlock(section.id, block.id, 'up')}
                                        disabled={bIdx === 0}
                                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-1"
                                      >
                                        <ArrowUp size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveBlock(section.id, block.id, 'down')}
                                        disabled={bIdx === section.blocks.length - 1}
                                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-1"
                                      >
                                        <ArrowDown size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBlock(section.id, block.id)}
                                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Block input fields */}
                                  {block.type === 'text' && (
                                    <div className="space-y-2">
                                      {renderWysiwygToolbar(() => handleOpenLinkPicker(section.id, block.id, 'content'))}
                                      <div
                                        id={`editor-${block.id}`}
                                        contentEditable
                                        suppressContentEditableWarning
                                        className="w-full p-3 min-h-[120px] bg-slate-50/50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-lg outline-none prose prose-sm max-w-none dark:prose-invert text-xs"
                                        onBlur={(e) => handleUpdateBlock(section.id, block.id, 'content', e.currentTarget.innerHTML)}
                                        dangerouslySetInnerHTML={{ __html: block.content || '' }}
                                        style={{ fontFamily: formData.fontFamily }}
                                      />
                                    </div>
                                  )}

                                  {block.type === 'video' && (
                                    <div className="space-y-2">
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase">URL do Vídeo do YouTube</label>
                                      <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                                        value={block.videoUrl}
                                        onChange={e => handleUpdateBlock(section.id, block.id, 'videoUrl', e.target.value)}
                                      />
                                      {block.videoUrl && (
                                        <div className="mt-2 text-center text-slate-400 text-[10px] italic">
                                          Preview do player com botão de play será gerado no e-mail.
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {block.type === 'image' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">URL da Imagem</label>
                                        <input
                                          type="url"
                                          placeholder="https://imagem.com/foto.jpg"
                                          className="w-full px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                                          value={block.imageUrl}
                                          onChange={e => handleUpdateBlock(section.id, block.id, 'imageUrl', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Link de Destino</label>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenLinkPicker(section.id, block.id, 'imageLink')}
                                            className="text-[9px] text-brand-600 font-bold hover:underline"
                                          >
                                            Link Salvo
                                          </button>
                                        </div>
                                        <input
                                          type="url"
                                          placeholder="https://pagina.com"
                                          className="w-full px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                                          value={block.imageLink}
                                          onChange={e => handleUpdateBlock(section.id, block.id, 'imageLink', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {block.type === 'cta' && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Texto do Botão</label>
                                          <input
                                            type="text"
                                            placeholder="ex: Fazer Inscrição"
                                            className="w-full px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                                            value={block.ctaText}
                                            onChange={e => handleUpdateBlock(section.id, block.id, 'ctaText', e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Link do Botão</label>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenLinkPicker(section.id, block.id, 'ctaUrl')}
                                              className="text-[9px] text-brand-600 font-bold hover:underline"
                                            >
                                              Link Salvo
                                            </button>
                                          </div>
                                          <input
                                            type="url"
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                                            value={block.ctaUrl}
                                            onChange={e => handleUpdateBlock(section.id, block.id, 'ctaUrl', e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Alinhamento</label>
                                          <select
                                            className="w-full text-xs border dark:border-slate-800 rounded px-2 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none"
                                            value={block.ctaAlign}
                                            onChange={e => handleUpdateBlock(section.id, block.id, 'ctaAlign', e.target.value)}
                                          >
                                            <option value="left">Esquerda</option>
                                            <option value="center">Centralizado</option>
                                            <option value="right">Direita</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Cor do Botão (Fundo)</label>
                                          <input
                                            type="text"
                                            placeholder="Hex/Cód"
                                            className="w-full px-2 py-1.5 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-mono"
                                            value={block.ctaBgColor}
                                            onChange={e => handleUpdateBlock(section.id, block.id, 'ctaBgColor', e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Cor do Texto</label>
                                          <input
                                            type="text"
                                            placeholder="Hex/Cód"
                                            className="w-full px-2 py-1.5 text-xs rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-mono"
                                            value={block.ctaTextColor}
                                            onChange={e => handleUpdateBlock(section.id, block.id, 'ctaTextColor', e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {block.type === 'divider' && (
                                    <div className="flex items-center space-x-3">
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">Altura do Espaço</label>
                                      <input
                                        type="range"
                                        min="10"
                                        max="80"
                                        className="flex-1 accent-brand-600"
                                        value={block.spacing}
                                        onChange={e => handleUpdateBlock(section.id, block.id, 'spacing', parseInt(e.target.value))}
                                      />
                                      <span className="text-xs font-mono">{block.spacing}px</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Add Block Toolbar */}
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t dark:border-slate-800 justify-center">
                              <span className="text-[9px] font-bold text-slate-450 uppercase self-center mr-1">Adicionar Bloco:</span>
                              <button type="button" onClick={() => handleAddBlock(section.id, 'text')} className="px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-slate-950 border dark:border-slate-850 rounded hover:bg-slate-100 text-slate-700 dark:text-slate-300 shadow-sm">+ Texto</button>
                              <button type="button" onClick={() => handleAddBlock(section.id, 'video')} className="px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-slate-950 border dark:border-slate-850 rounded hover:bg-slate-100 text-slate-700 dark:text-slate-300 shadow-sm">+ Vídeo</button>
                              <button type="button" onClick={() => handleAddBlock(section.id, 'image')} className="px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-slate-950 border dark:border-slate-850 rounded hover:bg-slate-100 text-slate-700 dark:text-slate-300 shadow-sm">+ Imagem</button>
                              <button type="button" onClick={() => handleAddBlock(section.id, 'cta')} className="px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-slate-950 border dark:border-slate-850 rounded hover:bg-slate-100 text-slate-700 dark:text-slate-300 shadow-sm">+ Botão CTA</button>
                              <button type="button" onClick={() => handleAddBlock(section.id, 'divider')} className="px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-slate-950 border dark:border-slate-850 rounded hover:bg-slate-100 text-slate-700 dark:text-slate-300 shadow-sm">+ Divisor</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Section Button */}
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-400 hover:text-brand-600 rounded-2xl transition-all flex items-center justify-center space-x-2 bg-white dark:bg-slate-900/10 shadow-sm"
                      >
                        <Plus size={18} />
                        <span className="text-sm font-bold">Nova Seção Horizontal</span>
                      </button>
                    </div>
                  )}
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
                              {formData.editorMode === 'visual' ? (
                                <div 
                                  className="w-full text-xs leading-relaxed rounded-lg overflow-hidden border dark:border-slate-800"
                                  style={{ 
                                    fontFamily: formData.fontFamily, 
                                    color: formData.textColor, 
                                    backgroundColor: formData.bgColor 
                                  }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: compileSectionsToHtml(formData.sections) || '<div class="p-6 text-center text-slate-400 italic">Adicione seções e blocos para começar a construir seu layout...</div>' 
                                  }}
                                />
                              ) : (
                                <>
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
                                </>
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

      {/* BANCO DE LINKS MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon size={20} className="text-brand-500" />
                Banco de Links Rápidos
              </h3>
              <button 
                type="button" 
                onClick={() => {
                  setShowLinkModal(false);
                  setActiveLinkField(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Gerencie seus links frequentes (cursos, redes sociais, agendamentos) para inserção rápida nos CTAs, Banners ou Textos do e-mail.
            </p>

            {/* Form to Add New Link */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 space-y-3">
              <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Adicionar Novo Link Útil</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nome Amigável (ex: Pagina de Vendas)"
                  className="px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                  value={newLinkName}
                  onChange={e => setNewLinkName(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="https://suapagina.com"
                  className="px-3 py-2 text-xs rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                  value={newLinkUrl}
                  onChange={e => setNewLinkUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!newLinkName || !newLinkUrl}
                  onClick={handleCreateSavedLink}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Salvar no Banco
                </button>
              </div>
            </div>

            {/* List of Saved Links */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Links Arquivados</span>
              {savedLinks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-450 italic">
                  Nenhum link arquivado ainda. Adicione um acima.
                </div>
              ) : (
                savedLinks.map(link => (
                  <div key={link.id} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-950 border dark:border-slate-850 rounded-xl transition-all">
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{link.name}</span>
                      <span className="text-[10px] text-slate-450 block truncate font-mono">{link.url}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSelectLink(link.url)}
                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-lg transition-all"
                      >
                        Selecionar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedLink(link.id)}
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded transition-all"
                        title="Excluir link do banco"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setActiveLinkField(null);
                }}
                className="px-4 py-2 border dark:border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignWizard;
