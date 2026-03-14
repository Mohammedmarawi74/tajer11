
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
    '--grid-color': '#2563EB',
  } as React.CSSProperties;

  const logoIndex = slide.logoIndex ?? 0;
  const selectedLogo = LOGO_OPTIONS[logoIndex];

  // Determine highlight tag color based on slide index or content type
  const getHighlightClass = (index: number) => {
    const highlights = ['mint', 'purple', 'orange'];
    return highlights[index % highlights.length];
  };

  return (
    <div
      className={`poster-root ${isActive ? 'active' : 'inactive'}`}
      style={{
        ...cssVars,
        backgroundColor: slide.backgroundColor,
        backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
      }}
    >
      {/* Decorative Overlays */}
      <div className="poster-gradient-overlay"></div>

      {/* Geometric Grid Pattern */}
      <div className="poster-geometric-grid"></div>

      {/* Grid Pattern */}
      <div className="poster-grid-overlay"></div>

      {/* Glow Elements */}
      <div className="poster-glow-accent"></div>
      
      {/* Corner Accent */}
      <div className="poster-corner-accent"></div>

      {/* Content Container */}
      <div className="poster-content">
        {slide.elements.map((el, idx) => {
          if (el.type === 'logo') {
            return (
              <div key={el.id} className="poster-logo-container">
                <div className="flex items-center gap-3">
                  {selectedLogo ? (
                    <img src={selectedLogo} alt="Logo" className="poster-logo-image" />
                  ) : (
                    <div className="poster-logo-placeholder">
                      <span className="poster-logo-text">AT</span>
                    </div>
                  )}
                  {!selectedLogo && <span className="poster-brand-label">Al-Tajer Digital</span>}
                </div>
                <div className="poster-divider"></div>
              </div>
            );
          }
          if (el.type === 'title') {
            return (
              <h1 key={el.id} className="poster-title">
                {el.content}
              </h1>
            );
          }
          if (el.type === 'subtitle') {
            return (
              <div key={el.id} className="poster-subtitle">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{el.content}</span>
              </div>
            );
          }
          if (el.type === 'body') {
            return (
              <div key={el.id} className="poster-body-container">
                <div className="poster-accent-bar"></div>
                <p className="poster-body">
                  {el.content}
                </p>
              </div>
            );
          }
          if (el.type === 'footer') {
            return (
              <div key={el.id} className="poster-footer-section">
                <div className="poster-footer-text-right">التاجر الرقمي</div>
                <div className="poster-pagination">
                  <div className="poster-pagination-dot active"></div>
                  <div className="poster-pagination-dot"></div>
                  <div className="poster-pagination-dot"></div>
                </div>
                <div className="poster-footer-text-left">al-tajer.com</div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
