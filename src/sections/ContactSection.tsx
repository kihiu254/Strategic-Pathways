import { useRef, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface ContactSectionProps {
  className?: string;
}

const ContactSection = ({ className = '' }: ContactSectionProps) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Left column animation
      gsap.fromTo(leftRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Form card animation
      gsap.fromTo(formRef.current,
        { x: '6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Inputs stagger animation
      const inputs = inputsRef.current?.querySelectorAll('.form-field') || [];
      gsap.fromTo(inputs,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Save to Database
      const { error } = await supabase
        .from('partner_inquiries')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            organization: formData.organization, 
            message: formData.message 
          }
        ]);

      if (error) throw error;
      
      // 2. Trigger Email Notification via Vercel Serverless Function
      try {
        await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_inquiry',
            data: formData
          })
        });
      } catch (emailError) {
        console.error('Failed to dispatch email:', emailError);
        // We don't throw here because the DB save was successful
      }

      toast.success(t('contact.success'));
      setFormData({ name: '', email: '', organization: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className={`relative bg-[var(--bg-primary)] py-20 lg:py-28 ${className}`}
    >
      <div className="w-full px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column - Info */}
          <div ref={leftRef} className="flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] mb-4">
              {t('contact.headline')}
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 lg:mb-10">
              {t('contact.body')}
            </p>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sp-accent)]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[var(--sp-accent)]" />
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">{t('contact.labels.email')}</p>
                  <a href="mailto:info@joinstrategicpathways.com" className="text-[var(--text-primary)] hover:text-[var(--sp-accent)] transition-colors">
                    info@joinstrategicpathways.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sp-accent)]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[var(--sp-accent)]" />
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">{t('contact.labels.phone')}</p>
                  <a href="https://wa.me/254712275470" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-[var(--sp-accent)] transition-colors">
                    +254 712 275 470
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sp-accent)]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--sp-accent)]" />
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">{t('contact.labels.location')}</p>
                  <p className="text-[var(--text-primary)]">{t('contact.labels.locationVal')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sp-accent)]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[var(--sp-accent)]" />
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">{t('contact.labels.responseTime')}</p>
                  <p className="text-[var(--text-primary)]">{t('contact.labels.responseTimeVal')}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Form */}
          <div 
            ref={formRef}
            className="bg-black/20 border border-white/10 rounded-3xl p-6 lg:p-8"
          >
            <form ref={inputsRef} onSubmit={handleSubmit} className="space-y-5">
              <div className="form-field">
                <Label htmlFor="contact-name" className="text-[var(--text-primary)] mb-2 block">{t('contact.labels.name')}</Label>
                <Input 
                  id="contact-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                  placeholder={t('contact.placeholders.name')}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="contact-email" className="text-[var(--text-primary)] mb-2 block">{t('contact.labels.emailField')}</Label>
                <Input 
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                  placeholder={t('contact.placeholders.email')}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="contact-organization" className="text-[var(--text-primary)] mb-2 block">{t('contact.labels.organization')}</Label>
                <Input 
                  id="contact-organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                  placeholder={t('contact.placeholders.organization')}
                />
              </div>

              <div className="form-field">
                <Label htmlFor="contact-message" className="text-[var(--text-primary)] mb-2 block">{t('contact.labels.message')}</Label>
                <Textarea 
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 min-h-[120px]"
                  placeholder={t('contact.placeholders.message')}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="form-field sp-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmitting ? t('contact.labels.submitting') : t('contact.labels.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
