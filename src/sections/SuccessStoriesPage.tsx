import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Quote, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { prependFeaturedSuccessStories } from '../data/featuredSuccessStories';

gsap.registerPlugin(ScrollTrigger);

interface ImpactStory {
  id: string;
  full_name: string;
  role: string | null;
  organization: string | null;
  story: string;
  image_url: string | null;
  created_at: string;
}

const SuccessStoriesPage = () => {
  const { t, i18n } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const isSwahili = i18n.language.startsWith('sw');
  const copy = isSwahili
    ? {
        heroBody: 'Soma hadithi halisi kutoka kwa wanachama waliobadilisha ujuzi wao wa kimataifa kuwa matokeo ya ndani kupitia Strategic Pathways.',
        liveStoriesLabel: 'Hadithi za moja kwa moja kutoka kwa jamii yetu',
        emptyTitle: 'Hakuna hadithi za mafanikio zilizowasilishwa bado.',
        emptyBody: 'Hadithi za kwanza zikishawasilishwa, zitaonekana hapa moja kwa moja kutoka Supabase.',
        readyTitle: 'Uko tayari kuandika hadithi yako ya athari?',
        profileCTA: 'Tumia wasifu wako kuwasilisha hadithi mpya ya athari.',
        loadError: 'Imeshindikana kupakia hadithi za athari.',
        schemaHint: 'Huenda jedwali la `impact_stories` halijaanzishwa bado. Endesha SQL mpya ya schema kwanza.',
        defaultRole: 'Mwanachama wa Strategic Pathways',
        fallbackName: 'Mwanachama wa jamii'
      }
    : {
        heroBody: 'Read real member stories about turning global experience into local results through Strategic Pathways.',
        liveStoriesLabel: 'Live stories from our community',
        emptyTitle: 'No success stories have been submitted yet.',
        emptyBody: 'Once members submit stories, they will appear here directly from Supabase.',
        readyTitle: 'Ready to add your own impact story?',
        profileCTA: 'Submit a new impact story from your profile workspace.',
        loadError: 'Failed to load impact stories.',
        schemaHint: 'The `impact_stories` table may not exist yet. Run the new schema SQL first.',
        defaultRole: 'Strategic Pathways Member',
        fallbackName: 'Community Member'
      };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '500+', label: t('impact.stats.professionals') },
    { value: '5-7', label: t('impact.stats.partners') },
    { value: '5-8', label: t('impact.stats.projects') },
    { value: '50+', label: t('impact.stats.opportunities') }
  ];

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const { data, error } = await supabase
        .from('impact_stories')
        .select('id, full_name, role, organization, story, image_url, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setStories(prependFeaturedSuccessStories((data || []) as ImpactStory[]));
    } catch (error) {
      console.error('Error loading impact stories:', error);
      toast.error(copy.loadError, { description: copy.schemaHint });
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    void fetchStories();
  }, []);


  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.successStories')} />
      <div className="w-full px-6 lg:px-12 max-w-7xl mx-auto">
        <div ref={contentRef} className="space-y-12 lg:space-y-16">
          <div className="text-center">
            <p className="sp-label mb-4">{copy.liveStoriesLabel}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6">
              {t('impact.headline')}
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-xl leading-relaxed">
              {copy.heroBody}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[var(--sp-accent)] mb-2">
                  {stat.value}
                </div>
                <div className="text-[var(--text-secondary)] text-sm lg:text-base uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {loadingStories ? (
            <div className="glass-card p-12 rounded-3xl text-center">
              <div className="w-10 h-10 border-4 border-[var(--sp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[var(--text-secondary)]">{copy.liveStoriesLabel}</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center border border-dashed border-white/10">
              <Sparkles className="mx-auto mb-4 text-[var(--sp-accent)]" size={32} />
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{copy.emptyTitle}</h2>
              <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">{copy.emptyBody}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {stories.map((story) => (
                <div key={story.id} className="glass-card p-10 rounded-3xl relative">
                  <Quote className="absolute top-8 right-8 text-[var(--sp-accent)]/20 w-16 h-16" />
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--sp-accent)]/30 bg-white/5 flex items-center justify-center">
                      {story.image_url ? (
                        <img src={story.image_url} alt={story.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-[var(--sp-accent)]">
                          {(story.full_name || copy.fallbackName).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)]">{story.full_name}</h3>
                      <p className="text-[var(--sp-accent)]">{story.role || copy.defaultRole}</p>
                      {story.organization && (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{story.organization}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] text-lg italic leading-relaxed">
                    "{story.story}"
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="glass-card p-12 rounded-3xl text-center bg-gradient-to-br from-[var(--bg-card)]/10 to-transparent">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">{copy.readyTitle}</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">{copy.profileCTA}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;
