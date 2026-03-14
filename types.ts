
import React from 'react';

export interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'body' | 'image' | 'button' | 'logo' | 'footer';
  content: string;
  style: React.CSSProperties;
}

export interface Slide {
  id: string;
  backgroundType: 'color' | 'image';
  backgroundColor: string;
  primaryColor: string;   // اللون الأساسي (العناوين، الأيقونات)
  secondaryColor: string; // اللون الثانوي (الأزرار، الأشرطة)
  textColor: string;      // لون النصوص الرئيسية
  backgroundImage?: string;
  bodyImage?: string;
  elements: SlideElement[];
  logoIndex?: number; // Index of selected logo (0-3), -1 for no logo
}

export interface Carousel {
  title: string;
  slides: Slide[];
}
