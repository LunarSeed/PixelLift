import React from 'react';
import { UploadCloud, Cpu, Download, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Image',
      description:
        'Drag and drop any low-resolution JPG, PNG, or WEBP file up to 10MB. Ideal for vintage photos, compressed social media graphics, or low-res thumbnails.',
      icon: UploadCloud,
      color: 'from-brand-500 to-indigo-600',
    },
    {
      number: '02',
      title: 'Neural Super-Resolution',
      description:
        'Our Replicate cluster processes your image through Real-ESRGAN. Deep convolutional layers hallucinate photorealistic details and sharpen blurry facial features.',
      icon: Cpu,
      color: 'from-indigo-500 to-accent-cyan',
    },
    {
      number: '03',
      title: 'Instant 4K Download',
      description:
        'Inspect the interactive before-and-after slider in real-time, then grab your crystal-clear 4x upscaled asset with one click. Ready for print or retina screens.',
      icon: Download,
      color: 'from-accent-cyan to-brand-400',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-3">
            Streamlined Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How PixelLift Enhances Your Photos in 3 Simple Steps
          </h3>
          <p className="mt-4 text-zinc-400 text-base">
            No complex Photoshop workflows or manual color adjustments required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300 group hover:-translate-y-1"
              >
                {/* Step indicator pill */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} p-0.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                  >
                    <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors">
                  {step.title}
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  {step.description}
                </p>

                {/* Subtle indicator bar */}
                <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center text-xs text-brand-400 font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Fast automated pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
