
import React from 'react';
import { Slide } from '../types';

interface SlideCanvasProps {
  slide: Slide;
  isActive: boolean;
}

const LOGO_OPTIONS = [
  '/logooo/logo-1.png',
  '/logooo/logo-2.png',
  '/logooo/logo-3.png',
  '/logooo/logo-4.png'
];

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ slide, isActive }) => {
  const cssVars = {
    '--bg-color': slide.backgroundColor,
    '--primary-color': slide.primaryColor,
    '--secondary-color': slide.secondaryColor,
    '--text-color': slide.textColor,
  } as React.CSSProperties;

  const logoIndex = slide.logoIndex ?? 0;
  const selectedLogo = LOGO_OPTIONS[logoIndex];

  return (
    <div
      className={`poster-root ${isActive ? 'active' : ''}`}
      style={{
        ...cssVars,
        backgroundColor: slide.backgroundColor,
        backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Tech Effects */}
      <div className="poster-geometric-grid"></div>
      <div className="poster-scan-line"></div>
      <div className="poster-tech-accent"></div>

      <div className="poster-content">
        {/* Header - Branding */}
        <div className="poster-header">
           <div className="brand-badge">
             {selectedLogo ? (
               <img src={selectedLogo} alt="Logo" className="w-8 h-8 object-contain" />
             ) : (
               <div className="brand-logo-circle">AT</div>
             )}
             <span className="brand-name">Al-Tajer Digital</span>
           </div>
           <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-none bg-blue-500/20"></div>
              <div className="w-1.5 h-1.5 rounded-none bg-blue-500/40"></div>
              <div className="w-1.5 h-1.5 rounded-none bg-blue-500/60"></div>
           </div>
        </div>

        {/* Content Area */}
        {slide.elements.map((el, idx) => {
          if (el.type === 'title') {
            return (
              <h1 key={el.id} className="poster-title">
                {el.content}
              </h1>
            );
          }
          if (el.type === 'subtitle') {
            return (
              <div key={el.id} className="poster-subtitle-tag">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{el.content}</span>
              </div>
            );
          }
          if (el.type === 'body') {
            return (
              <div 
                key={el.id} 
                className={`poster-body-container ${slide.bodyImage ? 'has-image' : ''}`}
                style={slide.bodyImage ? { 
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), url(${slide.bodyImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              >
                <div className="body-accent-line"></div>
                <p className="poster-body">
                  {el.content}
                </p>
                <div className="body-decoration">
                   <div className="deco-dot"></div>
                   <div className="deco-dot" style={{ opacity: 0.1 }}></div>
                   <div className="deco-dot" style={{ opacity: 0.05 }}></div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Footer - Navigation & Info */}
        <div className="poster-footer">
           <div className="footer-link">dtajer.com</div>
           <div className="pagination-container">
              <div className="page-dot active"></div>
              <div className="page-dot"></div>
              <div className="page-dot"></div>
           </div>
        </div>
      </div>
    </div>
  );
};
