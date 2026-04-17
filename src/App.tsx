/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ArrowUpRight } from 'lucide-react';

const FadeIn = React.forwardRef<HTMLDivElement, { children: React.ReactNode, delay?: number, className?: string }>(
  ({ children, delay = 0, className = "" }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = 'FadeIn';

interface Project {
  id: number;
  title: string;
  type: string;
  description: string;
  videoUrl: string;
  poster: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Echoes of Time',
    type: 'Short Film',
    description: 'A nonlinear narrative exploring the concept of memory and its decay. Edited to reflect the fragmented nature of recollection, using jarring cuts and slow dissolves to simulate fading neural pathways.',
    videoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    poster: 'https://picsum.photos/seed/EchoesTime/1024/768'
  },
  {
    id: 2,
    title: 'Neon Silence',
    type: 'Music Video',
    description: 'A high-energy, visually striking piece set to an electronic soundtrack. Emphasizes rhythm through precise frame-pacing, synthetic overlays, and bold, high-contrast color grading.',
    videoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    poster: 'https://picsum.photos/seed/NeonSilence/1024/768'
  },
  {
    id: 3,
    title: 'Wanderlust',
    type: 'Commercial',
    description: 'A fast-paced travel campaign capturing the thrill of discovery. We utilized dynamic, invisible wipe transitions and sweeping drone cinematography to connect completely disparate global landscapes seamlessly.',
    videoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    poster: 'https://picsum.photos/seed/Wanderlust/1024/768'
  },
  {
    id: 4,
    title: 'Abstract Reality',
    type: 'Experimental',
    description: 'A structural exploration of raw form and sound. Utilizing extreme macro close-ups, brutalist Foley artistry, and avant-garde composition techniques to unsettle and mesmerize the viewer.',
    videoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    poster: 'https://picsum.photos/seed/AbstractReality/1024/768'
  }
];

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

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
      
      {/* Project Modal (AnimatePresence allows graceful unmounting) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-background/90 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
              className="relative w-full max-w-6xl max-h-full overflow-hidden flex flex-col md:flex-row bg-background border border-border shadow-2xl rounded-sm"
              onClick={e => e.stopPropagation()} // Keep modal open when clicking inside
            >
              <button 
                onClick={() => setSelectedProject(null)} 
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[60] p-2 bg-background/50 backdrop-blur-sm rounded-full text-foreground hover:bg-white hover:text-background transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              
              {/* Media Section */}
              <div className="w-full md:w-[65%] bg-black">
                <video 
                  src={selectedProject.videoUrl} 
                  autoPlay 
                  controls 
                  playsInline
                  className="w-full h-full object-contain aspect-video" 
                />
              </div>
              
              {/* Information / Details Section */}
              <div className="w-full md:w-[35%] p-8 md:p-12 flex flex-col justify-center border-l border-border/50">
                <h3 className="text-3xl md:text-5xl mb-3 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  {selectedProject.title}
                </h3>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 rounded-full bg-foreground/30"></span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{selectedProject.type}</span>
                </div>
                <p className="text-muted-foreground font-sans leading-[1.7] text-[15px]">
                  {selectedProject.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      </div>

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center justify-between px-4 py-3 w-[90%] max-w-5xl bg-white/20 backdrop-blur-lg backdrop-saturate-[1.2] border border-white/20 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-500 hover:bg-white/30">
        <div className="pl-2 text-[17px] font-semibold text-black/90 tracking-tight" style={{ fontFamily: 'var(--font-body)' }}>
          Pulse
        </div>
        <nav className="hidden md:flex flex-row items-center gap-1">
          <a href="#about" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl hover:bg-white/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>About</a>
          <a href="#projects" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl hover:bg-white/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>Works</a>
          <a href="#services" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl hover:bg-white/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>Services</a>
          <a href="#testimonial" className="text-sm font-medium text-black/70 hover:text-black/95 px-4 py-2 rounded-xl hover:bg-white/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>Testimonials</a>
        </nav>
        <a href="#testimonial" className="bg-black/90 text-white rounded-xl flex flex-row items-center pl-4 pr-1.5 py-1.5 gap-2.5 text-[13px] font-medium hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 inline-flex shadow-[0_4px_12px_rgba(0,0,0,0.1)]" style={{ fontFamily: 'var(--font-body)' }}>
          Book Meeting
          <div className="bg-white/20 rounded-lg p-1.5 flex items-center justify-center">
            <ArrowUpRight size={14} className="text-white" />
          </div>
        </a>
      </header>
      
      <main>
        <section id="home" className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 min-h-[90vh]">
          <div className="flex flex-col items-center justify-center animate-fade-rise">
            <h1 style={{ fontFamily: 'var(--font-body)' }} className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-none mb-2 drop-shadow-md">
              The editor that makes your
            </h1>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-6xl md:text-[80px] italic text-white leading-none drop-shadow-md">
              videos & reels <span className="bg-gradient-to-r from-[#FF2DF5] via-[#FF008A] to-[#FF0030] text-transparent bg-clip-text font-normal">viral</span>
            </h2>
          </div>
          
          <p style={{ fontFamily: 'var(--font-body)' }} className="animate-fade-rise-delay text-white text-lg font-medium max-w-2xl mt-8 drop-shadow-sm">
            Premium short-form video editing for Influencers, Creators, and Brands
          </p>
          
          <a href="#projects" style={{ fontFamily: 'var(--font-body)' }} className="animate-fade-rise-delay-2 mt-12 bg-white text-black rounded-full pl-4 pr-8 py-3 flex items-center gap-4 text-base font-semibold hover:scale-105 transition-transform cursor-pointer inline-flex">
            <div className="bg-gradient-to-br from-[#FF2DF5] via-[#FF008A] to-[#FF0030] rounded-full p-2.5 flex items-center justify-center">
              <Play size={18} className="text-white fill-white ml-0.5" />
            </div>
            See My Showreel
          </a>
        </section>

        <section id="projects" className="relative z-10 w-full py-32 bg-transparent">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <FadeIn className="flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left mb-16 gap-4 border-b border-border/50 pb-8">
              <h2 className="text-5xl md:text-6xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Selected Works</h2>
              <p className="text-muted-foreground max-w-sm text-sm uppercase tracking-widest font-medium">A collection of movement & sound.</p>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-16">
              {projects.map((project, index) => (
                <FadeIn key={project.id} delay={index * 0.1}>
                  <div 
                    onClick={() => setSelectedProject(project)}
                    className="group relative aspect-[16/9] bg-muted overflow-hidden rounded-xl cursor-pointer border border-border/20 mb-6"
                  >
                    <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    
                    {/* Hover video overlay effect logic could go here, for now using image scale */}
                    <img 
                      src={project.poster}
                      alt={project.title}
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Play button icon overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-500">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-foreground border-b-[6px] border-b-transparent ml-1"></div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <h3 className="text-3xl font-normal text-foreground tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>{project.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed max-w-sm">{project.description}</p>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground border border-border/50 px-2 py-1 rounded-md">{project.type}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="relative z-10 w-full py-40 border-y border-border/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/5 to-background">
          <FadeIn className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
             <h2 className="text-5xl md:text-6xl tracking-tight mb-8 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>I shape the narrative.</h2>
             <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-sans mb-12 max-w-2xl">
               I am a specialized freelance video editor focusing on high-retention cuts, dynamic color grading, and immersive soundscapes. With a deep understanding of platform algorithms, I transform raw footage into highly engaging content that grabs attention.
             </p>
             <button className="px-8 py-4 text-xs font-medium uppercase tracking-[0.1em] border border-border/50 hover:bg-foreground hover:text-background transition-colors duration-300 rounded-full cursor-pointer">
               My Process
             </button>

             {/* THEMATIC INFOGRAPHIC: EDITING TIMELINE */}
             <div className="w-full max-w-3xl mx-auto mt-20 md:mt-28 mb-4 w-[90%] md:w-full">
               <div className="relative w-full h-[120px] rounded-xl border border-border/50 bg-white/40 overflow-hidden flex flex-col pt-5 px-4 md:px-6 shadow-sm">
                 <div className="flex items-center text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
                   <span className="w-8 md:w-12 text-left flex-shrink-0">V1</span>
                   <div className="flex-1 border-l border-border/50 pl-2 md:pl-3 flex gap-1 md:gap-1.5 h-8 items-center">
                     <div className="h-full bg-black/5 rounded-md w-[25%] border border-black/5" />
                     <div className="h-full bg-gradient-to-r from-[#FF2DF5]/10 to-[#FF008A]/20 rounded-md w-[45%] border border-[#FF008A]/30 relative overflow-hidden">
                       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
                     </div>
                     <div className="h-full bg-black/5 rounded-md w-[30%] border border-black/5" />
                   </div>
                 </div>
                 <div className="flex items-center text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
                   <span className="w-8 md:w-12 text-left flex-shrink-0">A1</span>
                   <div className="flex-1 border-l border-border/50 pl-2 md:pl-3 flex gap-1 md:gap-1.5 h-8 items-center">
                     <div className="h-full bg-transparent rounded-md w-[100%] border border-black/5 flex items-center justify-center px-1 overflow-hidden relative">
                        <svg width="100%" height="80%" preserveAspectRatio="none" viewBox="0 0 100 24" className="opacity-30 text-black">
                           <path d="M0,12 L5,5 L10,19 L15,12 L20,8 L25,16 L30,12 L35,6 L40,18 L45,12 L50,9 L55,15 L60,12 L65,4 L70,20 L75,12 L80,7 L85,17 L90,12 L95,10 L100,12" stroke="currentColor" fill="none" strokeWidth="1" strokeLinejoin="round"/>
                        </svg>
                     </div>
                   </div>
                 </div>
                 {/* Playhead */}
                 <motion.div 
                   className="absolute bottom-0 w-[1px] h-[85%] bg-[#FF008A] z-10 shadow-[0_0_10px_rgba(255,0,138,0.5)]"
                   animate={{ left: ["15%", "85%"] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                 >
                   <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-3.5 rounded-sm bg-[#FF008A] shadow-md" />
                 </motion.div>
               </div>
               <div className="flex justify-between text-[9px] text-muted-foreground mt-4 px-2 tracking-[0.15em] uppercase font-mono relative opacity-70">
                  <span>00:00:00:00</span>
                  <span className="hidden sm:block absolute left-1/2 -translate-x-1/2">Timeline Sequence</span>
                  <span>00:01:30:00</span>
               </div>
             </div>

          </FadeIn>
        </section>

        <footer id="testimonial" className="relative z-10 w-full bg-background pt-32 pb-12 px-8 md:px-16">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-20">
            
            <FadeIn className="w-full lg:w-1/2">
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
            </FadeIn>
            
            <FadeIn delay={0.2} className="grid grid-cols-2 gap-16 lg:gap-24 text-sm w-full lg:w-auto">
              <div className="flex flex-col gap-6">
                <span className="text-foreground uppercase tracking-widest text-[11px] font-semibold mb-2">Socials</span>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">Instagram</a>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">Vimeo</a>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">Behance</a>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">LinkedIn</a>
              </div>
              <div className="flex flex-col gap-6">
                <span className="text-foreground uppercase tracking-widest text-[11px] font-semibold mb-2">Legal</span>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground text-muted-foreground transition-colors">Cookie Usage</a>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} className="max-w-7xl mx-auto mt-32 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center text-[11px] uppercase tracking-widest text-muted-foreground gap-4">
            <p>&copy; 2026 Pulse Studio. All rights reserved.</p>
            <p>Designed with Intent</p>
          </FadeIn>
        </footer>
      </main>
    </div>
  );
}

