
import React, { useState, useEffect, useRef } from 'react';
import { Carousel, Slide } from './types';
import { generateCarouselContent, generateTechImage } from './services/geminiService';
import { SlideCanvas } from './components/SlideCanvas';
import { toPng } from 'html-to-image';

// Al-Tajer Digital Default Theme - Modern Light
const DEFAULT_THEME = {
  bg: '#FFFFFF',
  primary: '#2563EB',    // Electric Blue
  secondary: '#3B82F6',  // Lighter Blue
  text: '#0F172A'        // Charcoal Black
};

// Al-Tajer Digital Modern Themes
const THEMES = [
  { name: 'الأبيض النقي', bg: '#FFFFFF', primary: '#2563EB', secondary: '#3B82F6', text: '#0F172A' },
  { name: 'الرمادي الفاتح', bg: '#F8FAFC', primary: '#2563EB', secondary: '#60A5FA', text: '#0F172A' },
  { name: 'الأزرق الملكي', bg: '#EFF6FF', primary: '#1D4ED8', secondary: '#3B82F6', text: '#1E293B' },
  { name: 'النعناع المنعش', bg: '#F0FDF4', primary: '#059669', secondary: '#10B981', text: '#064E3B' },
  { name: 'البنفسجي الهادئ', bg: '#F5F3FF', primary: '#7C3AED', secondary: '#8B5CF6', text: '#2E1065' },
  { name: 'البرتقالي الدافئ', bg: '#FFFBEB', primary: '#EA580C', secondary: '#F97316', text: '#7C2D12' },
  { name: 'الروز الكريمي', bg: '#FFF1F2', primary: '#DB2777', secondary: '#EC4899', text: '#831843' },
  { name: 'الوضع الاحترافي', bg: '#F1F5F9', primary: '#0284C7', secondary: '#06B6D4', text: '#0F172A' },
];

const LOGO_OPTIONS = [
  { id: 0, name: 'الشعار 1', path: '/logooo/logo-1.png' },
  { id: 1, name: 'الشعار 2', path: '/logooo/logo-2.png' },
  { id: 2, name: 'الشعار 3', path: '/logooo/logo-3.png' },
  { id: 3, name: 'الشعار 4', path: '/logooo/logo-4.png' },
];

type TabType = 'ai' | 'text' | 'design' | 'custom';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const exportRef = useRef<HTMLDivElement>(null);
  const [customCss, setCustomCss] = useState<string>(`/* محرر الأنماط المتقدم */
.poster-root { transition: all 0.4s ease; }
.poster-title { text-transform: uppercase; }`);

  const [carousel, setCarousel] = useState<Carousel>({
    title: "Al-Tajer Digital Carousel",
    slides: [
      {
        id: '1',
        backgroundColor: DEFAULT_THEME.bg,
        primaryColor: DEFAULT_THEME.primary,
        secondaryColor: DEFAULT_THEME.secondary,
        textColor: DEFAULT_THEME.text,
        backgroundType: 'color',
        elements: [
          { id: 'l1', type: 'logo', content: '', style: {} },
          { id: 't1', type: 'title', content: 'منصة التاجر الرقمي', style: {} },
          { id: 's1', type: 'subtitle', content: 'حلول ذكية لأعمالك', style: {} },
          { id: 'b1', type: 'body', content: 'اكتشف منصة التاجر الرقمي - وجهتك الأولى للحلول التقنية المبتكرة. نقدم أدوات متطورة تساعدك على تنمية أعمالك وتحقيق أهدافك التجارية بذكاء.', style: {} },
          { id: 'f1', type: 'footer', content: '', style: {} }
        ]
      }
    ]
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const styleId = 'custom-poster-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = customCss;
  }, [customCss]);

  const applyTheme = (theme: typeof THEMES[0]) => {
    const newSlides = [...carousel.slides];
    newSlides[activeSlideIndex] = {
      ...newSlides[activeSlideIndex],
      backgroundColor: theme.bg,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      textColor: theme.text,
      backgroundImage: undefined
    };
    setCarousel({ ...carousel, slides: newSlides });
  };

  const updateColor = (key: 'backgroundColor' | 'primaryColor' | 'secondaryColor' | 'textColor', value: string) => {
    const newSlides = [...carousel.slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], [key]: value };
    setCarousel({ ...carousel, slides: newSlides });
  };

  const updateLogo = (logoIndex: number) => {
    const newSlides = [...carousel.slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], logoIndex };
    setCarousel({ ...carousel, slides: newSlides });
  };

  const removeLogo = () => {
    const newSlides = [...carousel.slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], logoIndex: -1 };
    setCarousel({ ...carousel, slides: newSlides });
  };

  const handleBodyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSlides = [...carousel.slides];
        newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], bodyImage: reader.result as string };
        setCarousel({ ...carousel, slides: newSlides });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBodyImage = () => {
    const newSlides = [...carousel.slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], bodyImage: undefined };
    setCarousel({ ...carousel, slides: newSlides });
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const content = await generateCarouselContent(prompt);
      const currentLogo = carousel.slides[0]?.elements.find(e => e.type === 'logo')?.content || '';
      const currentSlide = carousel.slides[activeSlideIndex];
      
      const newSlides: Slide[] = content.map((item: any, idx: number) => ({
        id: Math.random().toString(),
        backgroundColor: currentSlide.backgroundColor,
        primaryColor: currentSlide.primaryColor,
        secondaryColor: currentSlide.secondaryColor,
        textColor: currentSlide.textColor,
        backgroundType: 'color',
        elements: [
          { id: `l-${idx}`, type: `logo`, content: currentLogo, style: {} },
          { id: `t-${idx}`, type: 'title', content: item.title, style: {} },
          { id: `s-${idx}`, type: 'subtitle', content: item.subtitle, style: {} },
          { id: `b-${idx}`, type: 'body', content: item.body, style: {} },
          { id: `f-${idx}`, type: 'footer', content: '', style: {} }
        ]
      }));
      setCarousel({ ...carousel, slides: newSlides });
      setActiveSlideIndex(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const currentSlide = carousel.slides[activeSlideIndex];
      const title = currentSlide.elements.find(e => e.type === 'title')?.content || prompt;
      const imageUrl = await generateTechImage(title);
      if (imageUrl) {
        const newSlides = [...carousel.slides];
        newSlides[activeSlideIndex] = { ...currentSlide, backgroundImage: imageUrl, backgroundType: 'image' };
        setCarousel({ ...carousel, slides: newSlides });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBodyImage = async () => {
    setIsGenerating(true);
    try {
      const currentSlide = carousel.slides[activeSlideIndex];
      const bodyText = currentSlide.elements.find(e => e.type === 'body')?.content || prompt;
      const imageUrl = await generateTechImage(`Detailed minimalist illustration, symbolic representation of: ${bodyText}`);
      if (imageUrl) {
        const newSlides = [...carousel.slides];
        newSlides[activeSlideIndex] = { ...currentSlide, bodyImage: imageUrl };
        setCarousel({ ...carousel, slides: newSlides });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateElement = (id: string, content: string) => {
    const newSlides = [...carousel.slides];
    const slide = { ...newSlides[activeSlideIndex] };
    slide.elements = slide.elements.map(el => el.id === id ? { ...el, content } : el);
    newSlides[activeSlideIndex] = slide;
    setCarousel({ ...carousel, slides: newSlides });
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure all assets/fonts are settled
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        // We include a filter to skip the scan-line animation during export if it causes issues
        filter: (node) => {
          return !node.classList?.contains('poster-scan-line');
        }
      });
      
      const link = document.createElement('a');
      link.download = `tech-design-${activeSlideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("حدث خطأ أثناء تصدير الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-sans" dir="rtl">
      <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
        <div className="flex bg-slate-50 p-2 gap-2 border-b border-slate-200">
          {[
            { id: 'ai', label: 'الذكاء الآلي', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'text', label: 'المحتوى', icon: 'M4 6h16M4 12h16M4 18h7' },
            { id: 'design', label: 'المظهر', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3' },
            { id: 'custom', label: 'برمجة CSS', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none ${activeTab === tab.id ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-none border border-slate-200 shadow-lg">
                <h3 className="text-slate-800 font-bold text-base mb-4">توليد المحتوى الذكي</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-none p-4 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none h-32 mb-4 text-right"
                  placeholder="اكتب موضوع الكاروسيل..."
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-none font-bold transition-all ${isGenerating ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'}`}
                >
                  {isGenerating ? 'جاري التوليد...' : 'إنشاء السلسلة الآن'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
              <h3 className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">تحرير الشريحة الحالية</h3>
              {carousel.slides[activeSlideIndex].elements.map(el => (
                el.type !== 'logo' && el.type !== 'footer' && (
                  <div key={el.id} className="space-y-2 group">
                    <label className="text-[10px] font-bold text-slate-500">{el.type === 'title' ? 'العنوان الرئيسي' : el.type === 'subtitle' ? 'العنوان الفرعي' : 'النص التفصيلي'}</label>
                    <input
                      type="text"
                      value={el.content}
                      onChange={(e) => updateElement(el.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-none p-3 text-sm focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                )
              ))}
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              {/* الثيمات الجاهزة */}
              <section>
                <h3 className="text-slate-500 font-bold text-sm mb-4">الثيمات الجاهزة</h3>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => applyTheme(theme)}
                      className={`p-3 rounded-none border transition-all text-right group ${carousel.slides[activeSlideIndex].backgroundColor === theme.bg && carousel.slides[activeSlideIndex].primaryColor === theme.primary ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-none" style={{ backgroundColor: theme.primary }}></div>
                        <div className="w-3 h-3 rounded-none" style={{ backgroundColor: theme.secondary }}></div>
                        <span className="text-[11px] font-bold text-slate-700 flex-1 truncate">{theme.name}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-none overflow-hidden">
                        <div className="h-full" style={{ width: '40%', backgroundColor: theme.primary }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <div className="h-px bg-slate-200"></div>

              {/* تخصيص الألوان */}
              <section>
                <h3 className="text-slate-500 font-bold text-sm mb-4">تخصيص الألوان</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'الأساسي', key: 'primaryColor' },
                    { label: 'الثانوي', key: 'secondaryColor' },
                    { label: 'الخلفية', key: 'backgroundColor' },
                    { label: 'النصوص', key: 'textColor' },
                  ].map(item => (
                    <div key={item.key} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</label>
                      <div className="relative group">
                        <input
                          type="color"
                          value={(carousel.slides[activeSlideIndex] as any)[item.key]}
                          onChange={(e) => updateColor(item.key as any, e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-none group-hover:border-slate-300 transition-all shadow-sm">
                           <div className="w-8 h-4 rounded-none" style={{ backgroundColor: (carousel.slides[activeSlideIndex] as any)[item.key] }}></div>
                           <span className="text-[10px] font-mono text-slate-600 uppercase">{(carousel.slides[activeSlideIndex] as any)[item.key]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-slate-200"></div>

              {/* اختيار الشعار */}
              <section className="space-y-4">
                <h3 className="text-slate-500 font-bold text-sm">اختيار الشعار</h3>

                {/* شبكة اختيار الشعار */}
                <div className="grid grid-cols-4 gap-3">
                  {LOGO_OPTIONS.map((logo) => {
                    const currentLogoIndex = carousel.slides[activeSlideIndex]?.logoIndex ?? 0;
                    const isSelected = currentLogoIndex === logo.id;

                    return (
                      <button
                        key={logo.id}
                        onClick={() => updateLogo(logo.id)}
                        className={`relative aspect-square rounded-none border-2 overflow-hidden transition-all group ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={logo.path}
                          alt={logo.name}
                          className="w-full h-full object-contain bg-white p-2"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* زر إزالة الشعار */}
                <button
                  onClick={removeLogo}
                  className="w-full py-3 bg-red-50 border border-red-200 text-red-600 rounded-none text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  إزالة الشعار
                </button>

                {/* حالة الشعار الحالي */}
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">
                    {carousel.slides[activeSlideIndex]?.logoIndex === -1
                      ? 'لا يوجد شعار محدد'
                      : `الشعار المحدد: ${LOGO_OPTIONS[carousel.slides[activeSlideIndex]?.logoIndex ?? 0]?.name}`
                    }
                  </p>
                </div>
              </section>

              <div className="h-px bg-slate-200"></div>

              {/* الوسائط */}
              <section className="space-y-4">
                <h3 className="text-slate-500 font-bold text-sm">الوسائط والجماليات</h3>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">خلفية الشريحة</label>
                  <button onClick={handleGenerateImage} className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-none text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    توليد خلفية ذكية
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">خلفية منطقة النص (Body)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="cursor-pointer py-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-none text-xs font-bold hover:bg-indigo-100 transition-all text-center flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      رفع
                      <input type="file" accept="image/*" className="hidden" onChange={handleBodyImageUpload} />
                    </label>
                    <button onClick={handleGenerateBodyImage} className="py-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-none text-xs font-bold hover:bg-purple-100 transition-all flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.348 9a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.652 9a3 3 0 100-6 3 3 0 000 6z" /></svg>
                      ذكاء
                    </button>
                    {carousel.slides[activeSlideIndex].bodyImage && (
                      <button onClick={removeBodyImage} className="col-span-2 py-2 bg-red-50 border border-red-200 text-red-600 rounded-none text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                        إزالة صورة المنطقة النصية
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-6">
              <h3 className="text-blue-600 font-bold text-xs uppercase mb-4">CSS مخصص</h3>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="w-full bg-white p-5 text-xs font-mono text-slate-700 outline-none h-80 rounded-none border border-slate-200 shadow-sm"
                dir="ltr"
              />
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] p-8 overflow-hidden">
        <div className="flex items-center gap-12 w-full justify-center py-10">
          <div className="relative group">
            <div ref={exportRef}>
              <SlideCanvas slide={carousel.slides[activeSlideIndex]} isActive={true} />
            </div>
            <div className="absolute top-1/2 -left-16 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
               <button onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))} className="p-3 bg-white border border-slate-200 rounded-none hover:bg-blue-50 hover:text-blue-600 shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
            </div>
            <div className="absolute top-1/2 -right-16 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
               <button onClick={() => setActiveSlideIndex(prev => Math.min(carousel.slides.length - 1, prev + 1))} className="p-3 bg-white border border-slate-200 rounded-none hover:bg-blue-50 hover:text-blue-600 shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 p-4 bg-white/80 backdrop-blur-md rounded-none border border-slate-200 shadow-lg">
          {carousel.slides.map((_, idx) => (
            <button key={idx} onClick={() => setActiveSlideIndex(idx)} className={`w-12 h-1 rounded-none transition-all duration-500 ${activeSlideIndex === idx ? 'bg-blue-600 w-16' : 'bg-slate-300'}`} />
          ))}
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`bg-blue-600 text-white px-12 py-4 rounded-none font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-105 hover:bg-blue-500 transition-all flex items-center gap-2 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التصدير...
              </>
            ) : (
              'تصدير التصميم'
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;