/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, ArrowUpRight, Inbox, Scissors, Palette, CheckCircle, Star, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-target').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

function ScrollCounter({ value, duration = 1600, suffix = "" }: { value: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    let isCounting = false;
    let observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isCounting) {
        isCounting = true;
        let startTimestamp: number | null = null;
        
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeOutQuart * value));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function MagneticButton({ children, href, className, style }: any) {
  const buttonRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const distanceToEdge = Math.sqrt(dx * dx + dy * dy);
      
      if (distanceToEdge < 80) {
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const distanceX = e.clientX - btnCenterX;
        const distanceY = e.clientY - btnCenterY;
        
        buttonRef.current.style.transform = `translate(${distanceX * 0.3}px, ${distanceY * 0.3}px) scale(1.02)`;
      } else {
        buttonRef.current.style.transform = `translate(0px, 0px) scale(1)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <a 
      ref={buttonRef} 
      href={href} 
      className={className} 
      style={{ ...style, transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
    >
      {children}
    </a>
  );
}

function AnimatedWaveform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hoverXRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;
    const numBars = 75; // Between 60 and 80
    const barWidth = 3;
    
    const svg = svgRef.current;
    if (!svg) return;

    if (svg.childNodes.length === 0) {
      for (let i = 0; i < numBars; i++) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", barWidth.toString());
        rect.setAttribute("rx", "1.5");
        
        const centerDist = Math.abs(numBars / 2 - i) / (numBars / 2); 
        const r = Math.round(255 * (1 - centerDist) + 180 * centerDist);
        const g = Math.round(0 * (1 - centerDist) + 180 * centerDist);
        const b = Math.round(138 * (1 - centerDist) + 180 * centerDist);
        
        rect.setAttribute("fill", `rgb(${r}, ${g}, ${b})`);
        rect.setAttribute("data-phase", (Math.random() * Math.PI * 2).toString());
        rect.setAttribute("data-speed", (0.015 + Math.random() * 0.02).toString());
        rect.setAttribute("data-baseamp", (10 + Math.random() * 20).toString());
        svg.appendChild(rect);
      }
    }

    const render = () => {
      time += 1;
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = 80;
      
      const actualGap = width > 0 ? Math.max(1, (width - numBars * barWidth) / (numBars - 1)) : 4;
      const totalWidth = numBars * barWidth + (numBars - 1) * actualGap;
      const offsetX = width > 0 ? (width - totalWidth) / 2 : 0;

      const rects = Array.from(svg.querySelectorAll("rect")) as SVGRectElement[];
      let hoverIndex: number | null = null;
      
      if (hoverXRef.current !== null) {
        hoverIndex = (hoverXRef.current - offsetX) / (barWidth + actualGap);
      }

      rects.forEach((rect, i) => {
        const x = offsetX + i * (barWidth + actualGap);
        rect.setAttribute("x", x.toString());
        
        let edgeFade = 1;
        const edgeWindow = 15;
        if (i < edgeWindow) edgeFade = Math.pow(i / edgeWindow, 1.5);
        if (i > numBars - 1 - edgeWindow) edgeFade = Math.pow((numBars - 1 - i) / edgeWindow, 1.5);
        
        const phase = parseFloat(rect.getAttribute("data-phase") || "0");
        const speed = parseFloat(rect.getAttribute("data-speed") || "0");
        const baseAmp = parseFloat(rect.getAttribute("data-baseamp") || "0");
        
        const wave1 = Math.sin(time * speed + phase);
        const wave2 = Math.sin(time * speed * 0.5 + phase * 1.5);
        let baseHeight = (wave1 * 0.6 + wave2 * 0.4) * baseAmp + 15; 
        
        let hoverBoost = 0;
        if (hoverIndex !== null) {
          const dist = Math.abs(hoverIndex - i);
          if (dist < 8) {
            hoverBoost = (8 - dist) * 5; 
          }
        }
        
        let barHeight = (baseHeight + hoverBoost) * edgeFade;
        barHeight = Math.max(2 * edgeFade, Math.min(barHeight, height - 2));
        
        const y = (height - barHeight) / 2;
        rect.setAttribute("y", y.toString());
        rect.setAttribute("height", barHeight.toString());
        rect.setAttribute("opacity", (0.2 + 0.8 * edgeFade).toString());
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    hoverXRef.current = e.clientX - rect.left;
  };

  const handleMouseLeave = () => {
    hoverXRef.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-[80px] relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg ref={svgRef} className="w-full h-full" preserveAspectRatio="none" />
    </div>
  );
}

function ProcessTimeline() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = [
    { title: "Brief & Assets", desc: "You share the raw footage + creative direction", icon: <Inbox size={18} /> },
    { title: "Rough Cut", desc: "I build the structure, pacing, and narrative flow", icon: <Scissors size={18} /> },
    { title: "Color & Sound", desc: "Grade, SFX, music sync, and motion refinements", icon: <Palette size={18} /> },
    { title: "Delivery", desc: "Final export in your format, revisions included", icon: <CheckCircle size={18} /> }
  ];

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto mt-16 mb-8 px-4 sm:px-8 relative reveal-target reveal-slide-up" style={{ transitionDelay: '400ms' }}>
      <div className="flex flex-col md:flex-row justify-between relative w-full gap-8 md:gap-0">
        
        {/* Background line */}
        <div className="absolute left-[19px] md:left-[12.5%] top-[20px] md:top-[19px] h-[calc(100%-40px)] md:h-[2px] w-[2px] md:w-[75%] bg-border/40 z-0" />

        {/* Foreground animated svg line */}
        <svg 
          className="absolute left-[19px] md:left-[12.5%] top-[20px] md:top-[19px] h-[calc(100%-40px)] md:h-[2px] w-[2px] md:w-[75%] z-0 overflow-visible pointer-events-none"
        >
          {/* Vertical line (Mobile) */}
          <line 
            x1="0" y1="0" 
            x2="0" y2="100%" 
            pathLength="100"
            className="md:hidden stroke-[#FF008A]"
            strokeWidth="2"
            strokeDasharray="100"
            strokeDashoffset={isVisible ? "0" : "100"}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' }}
          />
          {/* Horizontal line (Desktop) */}
          <line 
            x1="0" y1="0" 
            x2="100%" y2="0" 
            pathLength="100"
            className="hidden md:block stroke-[#FF008A]"
            strokeWidth="2"
            strokeDasharray="100"
            strokeDashoffset={isVisible ? "0" : "100"}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' }}
          />
        </svg>

        {steps.map((step, i) => (
          <div 
            key={i} 
            className={`relative z-10 flex flex-row md:flex-col items-center md:items-start text-left md:text-center w-full md:w-1/4 transition-all duration-500 ease-out 
              ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.6] translate-y-4'}`}
            style={{ transitionDelay: `${i * 200 + 400}ms` }}
          >
            <div className="w-[40px] h-[40px] rounded-full bg-background border-2 border-[#FF008A] text-[#FF008A] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,0,138,0.4)] mx-0 md:mx-auto mb-0 md:mb-5 bg-[#050505]">
              {step.icon}
            </div>
            <div className="pl-6 md:pl-0 flex-1 md:w-full flex md:items-center flex-col md:px-3">
              <h4 className="font-bold text-[0.9rem] text-foreground tracking-tight mb-2">{step.title}</h4>
              <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  'Motion Graphics': '#4F7FFF',
  'Map Animation': '#22c55e',
  '2D Hoodie Guy Style': '#f97316',
  '2D Animation': '#a855f7',
  'SaaS Animation': '#06b6d4',
  'AMV': '#e94dff',
  'Typography': '#eab308',
  'Simple Shorts': '#ef4444',
  'Documentary': '#14b8a6',
  'Promotional Ad': '#f43f5e'
};

const FILTER_CATEGORIES = ['All', ...Object.keys(CATEGORY_COLORS)];

interface Project {
  id: number;
  title: string;
  category: string;
  type: string;
  mediaType: 'video';
  description: string;
  youtubeId: string;
  videoUrl: string;
  poster: string;
}

function getYouTubeEmbedUrl(youtubeId: string, mode: 'preview' | 'modal') {
  const baseUrl = `https://www.youtube.com/embed/${youtubeId}`;

  if (mode === 'preview') {
    return `${baseUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`;
  }

  return `${baseUrl}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Typography edit',
    category: 'Typography',
    type: 'Typography Short',
    mediaType: 'video',
    description: 'Punchy type-led motion built for fast retention, crisp pacing, and high-scroll stopping power.',
    youtubeId: 'tp6cVrtNaQM',
    videoUrl: 'https://youtube.com/shorts/tp6cVrtNaQM',
    poster: 'https://i.ytimg.com/vi/tp6cVrtNaQM/hqdefault.jpg'
  },
  {
    id: 2,
    title: 'cartoon animation',
    category: '2D Animation',
    type: 'Cartoon Animation',
    mediaType: 'video',
    description: 'Character-driven animation with playful timing, readable staging, and a clean short-form hook.',
    youtubeId: '7xiSD9sFVPc',
    videoUrl: 'https://youtube.com/shorts/7xiSD9sFVPc',
    poster: 'https://i.ytimg.com/vi/7xiSD9sFVPc/hqdefault.jpg'
  },
  {
    id: 3,
    title: 'documentary',
    category: 'Documentary',
    type: 'Documentary Edit',
    mediaType: 'video',
    description: 'A documentary-style short shaped around clarity, mood, and narrative momentum in a compact runtime.',
    youtubeId: 'pyaagZpUIE4',
    videoUrl: 'https://youtube.com/shorts/pyaagZpUIE4',
    poster: 'https://i.ytimg.com/vi/pyaagZpUIE4/hqdefault.jpg'
  },
  {
    id: 4,
    title: 'Aot AMV 4k',
    category: 'AMV',
    type: 'Anime Music Video',
    mediaType: 'video',
    description: 'High-energy anime edit work with sync-heavy pacing, sharp cuts, and cinematic impact.',
    youtubeId: 'J2zRqtzjwLk',
    videoUrl: 'https://youtube.com/shorts/J2zRqtzjwLk',
    poster: 'https://i.ytimg.com/vi/J2zRqtzjwLk/hqdefault.jpg'
  },
  {
    id: 5,
    title: 'BMW edit 2k',
    category: 'Motion Graphics',
    type: 'Automotive Edit',
    mediaType: 'video',
    description: 'An automotive short focused on polish, speed, and premium visual rhythm for car content.',
    youtubeId: 'j86KkVflx08',
    videoUrl: 'https://youtube.com/shorts/j86KkVflx08',
    poster: 'https://i.ytimg.com/vi/j86KkVflx08/hqdefault.jpg'
  },
  {
    id: 6,
    title: 'Moolah promotional ad',
    category: 'Promotional Ad',
    type: 'Promo Ad',
    mediaType: 'video',
    description: 'A promotional ad cut built to sell quickly, highlight value fast, and keep the CTA front and center.',
    youtubeId: '1DA9knqlZoA',
    videoUrl: 'https://youtube.com/shorts/1DA9knqlZoA',
    poster: 'https://i.ytimg.com/vi/1DA9knqlZoA/hqdefault.jpg'
  },
  {
    id: 7,
    title: 'Results matters 2k',
    category: 'Simple Shorts',
    type: 'Results Short',
    mediaType: 'video',
    description: 'A direct response-focused short that keeps the message lean, visual, and conversion-minded.',
    youtubeId: 'opXh54yLjSk',
    videoUrl: 'https://youtube.com/shorts/opXh54yLjSk',
    poster: 'https://i.ytimg.com/vi/opXh54yLjSk/hqdefault.jpg'
  },
  {
    id: 8,
    title: 'animated explainer shorts',
    category: '2D Hoodie Guy Style',
    type: 'Explainer Short',
    mediaType: 'video',
    description: 'An animated explainer short designed for fast education, clarity, and high audience retention.',
    youtubeId: 'AttmmiJe9uc',
    videoUrl: 'https://youtube.com/shorts/AttmmiJe9uc',
    poster: 'https://i.ytimg.com/vi/AttmmiJe9uc/hqdefault.jpg'
  },
  {
    id: 9,
    title: 'How to justify your rates',
    category: 'Simple Shorts',
    type: 'Educational Short',
    mediaType: 'video',
    description: 'A talking-point driven short built for authority, clarity, and repeat watch value.',
    youtubeId: 'fAYGVCJ7jgM',
    videoUrl: 'https://youtube.com/shorts/fAYGVCJ7jgM',
    poster: 'https://i.ytimg.com/vi/fAYGVCJ7jgM/hqdefault.jpg'
  }
];

function PortfolioCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    const glare = cardRef.current.querySelector('.glare-layer') as HTMLElement;
    if (glare) {
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.15) 0%, transparent 50%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
    const glare = cardRef.current.querySelector('.glare-layer') as HTMLElement;
    if (glare) {
      glare.style.opacity = '0';
    }
  };

  const categoryColor = CATEGORY_COLORS[project.category] || '#FF008A';

  return (
    <div style={{ perspective: '800px' }} className="h-full">
      <style>{`
        .play-overlay { transform: scale(1); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .group:hover .play-overlay { transform: scale(1.15); }
      `}</style>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative aspect-[9/16] md:h-[540px] overflow-hidden rounded-[28px] border border-border/20 transition-transform duration-200 ease-out preserve-3d bg-black"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <iframe
          src={getYouTubeEmbedUrl(project.youtubeId, 'preview')}
          title={`${project.title} preview`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
          className="absolute inset-0 z-10 h-full w-full pointer-events-none"
        />

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30" />
        <div className="glare-layer absolute inset-0 z-40 opacity-0 pointer-events-none transition-opacity duration-300 mix-blend-overlay" />

        <div className="absolute top-3 right-3 z-50 bg-black/60 backdrop-blur-md px-2 py-1 flex items-center gap-1.5 rounded-md border border-white/10 shadow-sm">
           <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
           <span className="text-[10px] uppercase font-bold tracking-wider text-white">Muted Autoplay</span>
        </div>

        <div className="absolute top-3 left-3 z-50 bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-md shadow-sm border border-white/10" style={{ borderLeftWidth: '4px', borderLeftColor: categoryColor }}>
           <span className="text-[10px] uppercase font-bold tracking-wider text-white border-0">{project.category}</span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 z-50">
           <h3 className="text-2xl md:text-[2rem] font-normal text-white tracking-tight mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-display)' }}>{project.title}</h3>
           <div className="flex justify-between items-center text-xs text-white/80 font-medium">
              <span className="tracking-wide uppercase">{project.type}</span>
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto font-sans flex items-center gap-1 drop-shadow-md pb-0.5 border-b border-white/30 hover:text-white"
              >
                YouTube <ArrowUpRight size={14} />
              </a>
           </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = Array.from({ length: 11 }, (_, index) => ({
    id: index + 1,
    image: `/testimonials/testimonial-${String(index + 1).padStart(2, '0')}.png`,
    alt: `Client testimonial screenshot ${index + 1}`,
  }));

  const getCardScrollAmount = () => {
    const track = scrollRef.current;
    if (!track) return 0;

    const firstCard = track.firstElementChild as HTMLElement | null;
    if (!firstCard) return track.clientWidth;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return firstCard.offsetWidth + gap;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && scrollRef.current) {
      interval = setInterval(() => {
        const el = scrollRef.current;
        if (!el) return;

        const cardWidth = getCardScrollAmount();
        if (!cardWidth) return;

        let nextScroll = el.scrollLeft + cardWidth;
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (nextScroll >= maxScroll - 10) {
          nextScroll = 0;
        }

        el.scrollTo({ left: nextScroll, behavior: 'smooth' });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle active dot update based on scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;

    const cardWidth = getCardScrollAmount();
    if (!cardWidth) return;

    const index = Math.min(Math.round(el.scrollLeft / cardWidth), testimonials.length - 1);
    setActiveIndex(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleDragEnd = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollByAmount = (direction: number) => {
    if (scrollRef.current) {
      const amount = getCardScrollAmount();
      scrollRef.current.scrollBy({ left: amount * direction, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="w-full mt-32 mb-16 text-left reveal-target reveal-slide-up relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        .carousel-track::-webkit-scrollbar { display: none; }
        .carousel-track { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fillBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-fill-bar {
           transform-origin: left;
           animation: fillBar 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/20 pb-8">
        <div>
           <h3 className="text-4xl md:text-5xl font-normal text-foreground leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
             What Our Clients Say
           </h3>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-3 reveal-target reveal-slide-left">
           <div className="flex items-center gap-3">
             <span className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>5.0</span>
             <div className="flex items-center gap-1">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={18} className="fill-[#FF008A] text-[#FF008A]" />
               ))}
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="flex flex-col gap-1.5 w-[100px]">
                <div className="h-1 bg-border/40 rounded-full w-full overflow-hidden">
                   <div className="h-full bg-[#FF008A] rounded-full animate-fill-bar" style={{ width: '100%', animationDelay: '0.2s' }}></div>
                </div>
                <div className="h-1 bg-border/40 rounded-full w-full overflow-hidden">
                   <div className="h-full bg-[#FF008A] rounded-full animate-fill-bar" style={{ width: '92%', animationDelay: '0.4s' }}></div>
                </div>
                <div className="h-1 bg-border/40 rounded-full w-full overflow-hidden">
                   <div className="h-full bg-[#FF008A] rounded-full animate-fill-bar" style={{ width: '95%', animationDelay: '0.6s' }}></div>
                </div>
             </div>
             <div className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium leading-none mt-0.5">Reliability Score</div>
           </div>
        </div>
      </div>
      
      {/* Swipe Track */}
      <div className="relative max-w-7xl mx-auto pl-6 md:pl-16 pr-6 md:pr-0">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="carousel-track flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleDragEnd}
          onMouseUp={handleDragEnd}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleDragEnd}
          onTouchMove={handleTouchMove}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {testimonials.map((t) => (
             <div
               key={t.id}
               className="flex-shrink-0 w-[250px] md:w-[280px] snap-start rounded-[30px] bg-[#111318] border border-black/10 p-3 md:p-4 shadow-[0_18px_50px_rgba(0,0,0,0.10)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.14)] transition-shadow duration-300"
              >
                <div className="w-full h-[520px] md:h-[580px] rounded-[22px] overflow-hidden bg-[#0a0b10] flex items-center justify-center ring-1 ring-white/6">
                  <img src={t.image} alt={t.alt} className="w-full h-full object-contain object-top pointer-events-none" />
                </div>
              </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="flex justify-between items-center pr-6 md:pr-16 mt-6 md:mt-8">
           {/* Dots */}
           <div className="flex items-center gap-2.5">
             {testimonials.map((_, i) => (
               <div 
                 key={i} 
                 className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-[#FF008A]' : 'w-2 bg-border/80'}`}
               ></div>
             ))}
           </div>
           
           {/* Navigation Arrows */}
           <div className="flex gap-2 md:gap-3">
             <button aria-label="Previous testimonial" onClick={() => scrollByAmount(-1)} className="p-3 rounded-full border border-border/60 text-foreground/80 hover:text-foreground hover:bg-black/5 hover:border-black/20 transition-all flex items-center justify-center bg-transparent cursor-pointer">
               <ChevronLeft size={18} strokeWidth={2.5} />
             </button>
             <button aria-label="Next testimonial" onClick={() => scrollByAmount(1)} className="p-3 rounded-full border border-border/60 text-foreground/80 hover:text-foreground hover:bg-black/5 hover:border-black/20 transition-all flex items-center justify-center bg-transparent cursor-pointer">
               <ChevronRight size={18} strokeWidth={2.5} />
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}

function PageLoader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`page-loader ${!visible ? 'fade-out' : ''}`}>
      <span className="text-white text-2xl font-bold tracking-widest animate-pulse">pulse.</span>
    </div>
  );
}

function ScrollProgressBar() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setWidth((scrolled / height) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${width}%` }} />;
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`back-to-top bg-gray-200/60 backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/20 text-foreground p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:bg-gray-200/70 transition-all duration-300 ${visible ? 'visible' : ''}`}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}

function SectionDivider() {
  return (
    <div className="w-full h-24 overflow-hidden pointer-events-none">
       <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-background">
         <path d="M0,0 C25,100 75,100 100,0 L100,100 L0,100 Z" />
       </svg>
    </div>
  );
}

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Filtering System State
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);
  const [animatingCards, setAnimatingCards] = useState(false);
  const [displayProjects, setDisplayProjects] = useState<Project[]>(projects.slice(0, 6));

  useScrollReveal();

  const handleCategoryClick = (cat: string) => {
    if (cat === activeCategory) return;
    setAnimatingCards(true);
    setTimeout(() => {
      setActiveCategory(cat);
      const newFiltered = projects.filter(p => cat === 'All' || p.category === cat);
      setVisibleCount(6);
      setDisplayProjects(newFiltered.slice(0, 6));
      setAnimatingCards(false);
    }, 150);
  };

  const handleLoadMore = () => {
    const newCount = visibleCount + 6;
    const newFiltered = projects.filter(p => activeCategory === 'All' || p.category === activeCategory);
    setVisibleCount(newCount);
    setDisplayProjects(newFiltered.slice(0, newCount));
  };
  
  const currentTotal = projects.filter(p => activeCategory === 'All' || p.category === activeCategory).length;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Pulse Studio - Form Data Submitted:', formData);
    // In future: hook to backend database
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-background min-h-screen text-foreground overflow-x-hidden selection:bg-foreground selection:text-background font-sans">
      <PageLoader />
      <ScrollProgressBar />
      <BackToTopButton />

      <div 
        className="absolute inset-0 w-full h-[100vh] z-0 overflow-hidden bg-[#050505]"
        style={{ 
          WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)', 
          maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)' 
        }}
      >
        <video 
          className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-[1.15] saturate-[0.85] opacity-[0.95]"
          autoPlay 
          loop 
          muted 
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
        />
        
        {/* 1. Cinematic dark vignette (focuses the eye on center text) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        
        {/* 2. Brand Color Wash (subtle pink/magenta tint to tie the video into the website) */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-color bg-gradient-to-br from-[#FF2DF5] via-[#FF008A] to-[#FF0030] pointer-events-none" />

        {/* 3. Film Grain Overlay (Animated SVG Turbulence) */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.06] mix-blend-overlay">
          <svg width="100%" height="100%">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch">
                <animate attributeName="baseFrequency" values="0.65; 0.7; 0.65" keyTimes="0; 0.5; 1" dur="0.2s" repeatCount="indefinite" />
              </feTurbulence>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
      </div>

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center justify-between px-3 py-2 w-[95%] max-w-5xl bg-gray-200/55 backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/20 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:bg-gray-200/65 transition-all duration-500">
        <div className="pl-3 text-[17px] font-semibold text-black/90 tracking-tight" style={{ fontFamily: 'var(--font-body)' }}>
          Pulse
        </div>
        <nav className="hidden md:flex flex-row items-center gap-1">
          <a href="#about" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>About</a>
          <a href="#projects" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>Works</a>
          <a href="#testimonial" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>Testimonials</a>
        </nav>
        <a href="https://calendly.com/reachresolve89/schedule-a-meeting-with-us" target="_blank" rel="noopener noreferrer" className="bg-black text-white rounded-xl flex flex-row items-center pl-4 pr-1.5 py-1.5 gap-2 text-[13px] font-medium hover:bg-black/80 transition-all duration-300 inline-flex" style={{ fontFamily: 'var(--font-body)' }}>
          Book Meeting
          <div className="bg-white/10 rounded-lg p-1.5 flex items-center justify-center">
            <ArrowUpRight size={14} className="text-white" />
          </div>
        </a>
      </header>
      
      <main>
        <section id="home" className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 min-h-[90vh]">
          <div className="flex flex-col items-center justify-center">
            <h1 style={{ fontFamily: 'var(--font-body)' }} className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-none mb-2 drop-shadow-md">
              {"The editor that makes your".split(" ").map((word, i) => (
                <span 
                  key={i} 
                  className="inline-block opacity-0 animate-word-reveal" 
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {word}&nbsp;
                </span>
              ))}
            </h1>
            <h2 style={{ fontFamily: 'var(--font-display)', animationDelay: '400ms' }} className="text-6xl md:text-[80px] italic text-white leading-none drop-shadow-md opacity-0 animate-word-reveal">
              <span className="text-glitch" data-text="videos & reels">videos & reels</span>{' '}
              <span className="bg-gradient-to-r from-[#FF2DF5] via-[#FF008A] to-[#FF0030] text-transparent bg-clip-text font-normal">viral</span>
            </h2>
          </div>
          
          <p style={{ fontFamily: 'var(--font-body)' }} className="animate-fade-rise-delay text-white text-lg font-medium max-w-2xl mt-8 drop-shadow-sm">
            Premium short-form video editing for Influencers, Creators, and Brands
          </p>
          
          <MagneticButton href="#projects" style={{ fontFamily: 'var(--font-body)' }} className="animate-fade-rise-delay-2 mt-12 bg-white text-black rounded-full pl-4 pr-8 py-3 flex items-center gap-4 text-base font-semibold transition-colors cursor-pointer inline-flex shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)]">
            <div className="bg-gradient-to-br from-[#FF2DF5] via-[#FF008A] to-[#FF0030] rounded-full p-2.5 flex items-center justify-center">
              <Play size={18} className="text-white fill-white ml-0.5" />
            </div>
            See My Showreel
          </MagneticButton>
        </section>
        <SectionDivider />

        <section id="stats" className="relative z-10 w-full py-24 bg-transparent overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,138,0.03)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <div className="text-center mb-16 reveal-target reveal-slide-up">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold inline-block border border-border/20 px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-sm">By The Numbers</h3>
            </div>

            {/* Row 1: Big platform stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 mb-20 relative">
              <div className="hidden lg:block absolute left-1/4 top-0 bottom-0 w-[1px] bg-border/20"></div>
              <div className="hidden lg:block absolute left-2/4 top-0 bottom-0 w-[1px] bg-border/20"></div>
              <div className="hidden lg:block absolute left-3/4 top-0 bottom-0 w-[1px] bg-border/20"></div>
              
              <div className="text-center flex flex-col items-center justify-center py-4 reveal-target reveal-slide-up" style={{ transitionDelay: '0ms' }}>
                <div className="text-[clamp(2.8rem,6vw,5rem)] font-bold text-[#FF008A] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  <ScrollCounter value={47} suffix="M+" />
                </div>
                <div className="text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground font-medium">Total Views</div>
              </div>
              
              <div className="text-center flex flex-col items-center justify-center py-4 reveal-target reveal-slide-up" style={{ transitionDelay: '100ms' }}>
                <div className="text-[clamp(2.8rem,6vw,5rem)] font-bold text-[#FF008A] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  <ScrollCounter value={120} suffix="K+" />
                </div>
                <div className="text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground font-medium">Subscribers Helped Grow</div>
              </div>

              <div className="text-center flex flex-col items-center justify-center py-4 reveal-target reveal-slide-up" style={{ transitionDelay: '200ms' }}>
                <div className="text-[clamp(2.8rem,6vw,5rem)] font-bold text-[#FF008A] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  <ScrollCounter value={200} suffix="+" />
                </div>
                <div className="text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground font-medium">Videos Edited</div>
              </div>

              <div className="text-center flex flex-col items-center justify-center py-4 reveal-target reveal-slide-up" style={{ transitionDelay: '300ms' }}>
                <div className="text-[clamp(2.8rem,6vw,5rem)] font-bold text-[#FF008A] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  <ScrollCounter value={82} suffix="%" />
                </div>
                <div className="text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground font-medium">Avg Retention Rate</div>
              </div>
            </div>

            {/* Row 2: Trust signals */}
            <div className="flex flex-wrap justify-center items-center gap-4 reveal-target reveal-slide-up" style={{ transitionDelay: '400ms' }}>
              {[
                { text: "⚡ 3-Day Avg Delivery" },
                { text: "🔁 Unlimited Revisions" },
                { text: "🎯 Retention-First Editing" },
                { text: "🌍 Worked with Creators in 6 Countries" }
              ].map((badge, i) => (
                <div key={i} className="group flex items-center justify-center gap-2 bg-background border border-border/40 text-foreground/80 hover:text-foreground hover:border-[#FF008A] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,0,138,0.15)] cursor-default">
                  <span className="text-[13px] font-medium whitespace-nowrap">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />

        <section id="projects" className="relative z-10 w-full py-32 bg-transparent">
          <style>{`
            .grid-container {
               column-count: 1;
               column-gap: 2rem;
            }
            @media (min-width: 768px) {
               .grid-container {
                 column-count: 2;
               }
            }
            .filter-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .filter-scrollbar {
              -ms-overflow-style: none;  
              scrollbar-width: none;  
              -webkit-overflow-scrolling: touch;
            }
          `}</style>
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="reveal-target reveal-slide-left flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left mb-12 gap-4 border-b border-border/50 pb-8">
              <h2 className="text-5xl md:text-6xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Selected Works</h2>
              <p className="text-muted-foreground max-w-sm text-sm uppercase tracking-widest font-medium">A collection of movement & sound.</p>
            </div>
            
            {/* Filter Bar */}
            <div className="flex flex-wrap lg:flex-nowrap justify-center gap-2 lg:gap-1.5 xl:gap-2 pb-4 mb-10 w-full reveal-target reveal-slide-up">
              {FILTER_CATEGORIES.map((cat, i) => {
                 const isActive = activeCategory === cat;

                 return (
                   <button
                     key={i}
                     onClick={() => handleCategoryClick(cat)}
                     className={`px-4 py-2.5 md:px-5 md:py-2.5 lg:px-3 xl:px-4 rounded-full text-[10px] md:text-[11px] font-semibold leading-none uppercase tracking-wider md:tracking-widest lg:tracking-wider transition-all duration-300 flex-shrink-0 cursor-pointer whitespace-nowrap ${
                       isActive 
                         ? 'bg-[#FF008A] text-white shadow-[0_0_15px_rgba(255,0,138,0.4)] border border-[#FF008A]' 
                         : 'bg-transparent text-foreground/70 border border-border/60 hover:border-foreground/40 hover:text-foreground'
                     }`}
                   >
                     {cat}
                   </button>
                 );
              })}
            </div>

            {/* Masonry Grid */}
            <div className={`grid-container w-full transition-all duration-150 ease-out ${animatingCards ? 'opacity-0 scale-[0.95]' : 'opacity-100 scale-100'}`}>
              {displayProjects.map((project, index) => (
                <div key={`${project.id}`} className="break-inside-avoid mb-8">
                  <PortfolioCard project={project} />
                </div>
              ))}
              {displayProjects.length === 0 && (
                <div className="py-20 text-center w-full col-span-full">
                  <p className="text-muted-foreground/60 tracking-widest uppercase text-sm">No items matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Load More Pagination */}
            {visibleCount < currentTotal && (
              <div className="w-full flex justify-center mt-6">
                 <button onClick={handleLoadMore} className="bg-transparent text-foreground border border-border/60 rounded-full px-6 py-3 text-xs uppercase font-medium tracking-widest hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                   Load More
                 </button>
              </div>
            )}
          </div>
        </section>
        <SectionDivider />

        <section id="about" className="relative z-10 w-full py-40 border-y border-border/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/5 to-background">
          <div className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
             <h2 className="text-5xl md:text-[5.5rem] font-normal tracking-tight mb-8 text-foreground leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
               {"I shape the narrative.".split(" ").map((word, i, arr) => (
                 <span key={i} className="inline-block reveal-target reveal-slide-up" style={{ transitionDelay: `${i * 100}ms` }}>
                   {word}{i !== arr.length - 1 && '\u00A0'}
                 </span>
               ))}
             </h2>
             <p className="reveal-target reveal-slide-up text-muted-foreground text-lg md:text-xl leading-relaxed font-sans mb-12 max-w-2xl px-4" style={{ transitionDelay: '300ms' }}>
               I am a specialized freelance video editor focusing on high-retention cuts, dynamic color grading, and immersive soundscapes. With a deep understanding of platform algorithms, I transform raw footage into highly engaging content that grabs attention.
             </p>
             
             <ProcessTimeline />
             
             <TestimonialCarousel />

             {/* ANIMATED WAVEFORM VISUALIZER */}
             <div className="reveal-target reveal-scale-up w-full max-w-3xl mx-auto mt-24 md:mt-32 mb-8 w-[90%] md:w-full" style={{ transitionDelay: '500ms' }}>
               <AnimatedWaveform />
               <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono mt-8 opacity-70">
                 Every frame, shaped with intention.
               </p>
             </div>

          </div>
        </section>

        <footer id="testimonial" className="relative z-10 w-full bg-background pt-32 pb-12 px-8 md:px-16 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-20">
            
            <div className="w-full lg:w-1/2 reveal-target reveal-slide-up">
              <h2 className="text-6xl md:text-[64px] mb-6 leading-none tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Let's work<br/>together.</h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">Ready to bring your vision to life? Fill out the form or reach out directly.</p>
              <a href="mailto:hello@pulse.studio" className="text-base text-foreground underline decoration-border hover:decoration-foreground underline-offset-4 transition-colors font-medium">hello@pulse.studio</a>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-8 mt-12 w-full max-w-md">
                <div className="relative">
                  <input 
                    type="text" 
                    name="name" 
                    id="name"
                    required 
                    value={formData.name}
                    onChange={handleFormChange}
                    className="group peer w-full bg-transparent border-b border-border pb-3 text-[15px] text-foreground focus:outline-none focus:border-foreground transition-colors placeholder-transparent" 
                    placeholder="Name" 
                  />
                  <label htmlFor="name" className="absolute left-0 top-0 text-[13px] text-muted-foreground transition-all peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-foreground">Name</label>
                </div>
                
                <div className="relative mt-2">
                  <input 
                    type="email" 
                    name="email" 
                    id="email"
                    required 
                    value={formData.email}
                    onChange={handleFormChange}
                    className="group peer w-full bg-transparent border-b border-border pb-3 text-[15px] text-foreground focus:outline-none focus:border-foreground transition-colors placeholder-transparent" 
                    placeholder="Email" 
                  />
                  <label htmlFor="email" className="absolute left-0 top-0 text-[13px] text-muted-foreground transition-all peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-foreground">Email Address</label>
                </div>

                <div className="relative mt-2">
                  <textarea 
                    name="message" 
                    id="message"
                    required 
                    rows={1}
                    value={formData.message}
                    onChange={handleFormChange}
                    className="group peer w-full bg-transparent border-b border-border pb-3 text-[15px] text-foreground focus:outline-none focus:border-foreground transition-colors resize-y min-h-[40px] placeholder-transparent" 
                    placeholder="Message" 
                  />
                  <label htmlFor="message" className="absolute left-0 top-0 text-[13px] text-muted-foreground transition-all peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-0 peer-focus:-top-5 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-foreground">Project Details</label>
                </div>

                <button type="submit" className="bg-[#222] text-white rounded-full flex flex-row items-center pl-6 pr-2 py-2 gap-3 text-sm font-medium hover:bg-black transition-colors self-center lg:self-start mt-4 cursor-pointer" style={{ fontFamily: 'var(--font-body)' }}>
                  Submit Query
                  <div className="bg-white/20 rounded-full p-2 flex items-center justify-center">
                    <ArrowUpRight size={16} className="text-white" />
                  </div>
                </button>
              </form>
            </div>
            
          </div>

          <div className="reveal-target reveal-slide-up max-w-7xl mx-auto mt-32 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center text-[11px] uppercase tracking-widest text-muted-foreground gap-4" style={{ transitionDelay: '300ms' }}>
            <p>&copy; 2026 Pulse Studio. All rights reserved.</p>
            <p>Designed with Intent</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

