import React, { useEffect, useState, useRef } from 'react';
import { useFormContext, useWatch, useFieldArray } from 'react-hook-form';
import type { OnboardingData } from './schema';
import { 
  User, Mail, Phone, Linkedin, Globe, Briefcase, Award, Heart, 
  Zap, Shield, Target, TrendingUp, Plus, Trash2, Camera, Check, GraduationCap, MapPin, Users
} from 'lucide-react';
import { countries } from '../../data/countries';
import { uploadFile } from '../../lib/uploadUtils';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface StepProps {
  readOnlyFields?: string[];
  showProfileTypeSelection?: boolean;
}

type ReferenceEntry = {
  fullName: string;
  role: string;
  company: string;
  contact: string;
};

const createEmptyReference = (): ReferenceEntry => ({
  fullName: '',
  role: '',
  company: '',
  contact: '',
});

const parseReferenceLine = (line: string): ReferenceEntry => {
  const [fullName = '', role = '', company = '', contact = ''] = line
    .split('|')
    .map((part) => part.trim());

  return {
    fullName,
    role,
    company,
    contact,
  };
};

const parseReferencesValue = (value?: string): ReferenceEntry[] => {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return [createEmptyReference()];
  }

  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseReferenceLine);
};

const serializeReferencesValue = (entries: ReferenceEntry[]) =>
  entries
    .map((entry) => [entry.fullName, entry.role, entry.company, entry.contact].map((part) => part.trim()).join(' | '))
    .filter((line) => line.replace(/\|/g, '').trim().length > 0)
    .join('\n');

const EntryAnimation = ({ children }: { children: React.ReactNode }) => {
  const container = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.from(container.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1
    });
  }, { scope: container });

  return <div ref={container}>{children}</div>;
};

export const BasicInfo = ({ readOnlyFields = [], showProfileTypeSelection = false }: StepProps) => {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <User size={18} className="text-[var(--sp-accent)]" />
              Full Name
            </label>
            <div className="relative">
              <input
                {...register('fullName')}
                className={`input-glass-premium w-full ${readOnlyFields.includes('fullName') ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Enter your full name"
                readOnly={readOnlyFields.includes('fullName')}
              />
              <div className="input-focus-line" />
            </div>
            {errors.fullName && <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1">{errors.fullName.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <Briefcase size={18} className="text-[var(--sp-accent)]" />
              Professional Title
            </label>
            <div className="relative">
              <input
                {...register('professionalTitle')}
                className="input-glass-premium w-full"
                placeholder="e.g. Senior Software Engineer"
              />
              <div className="input-focus-line" />
            </div>
            {errors.professionalTitle && <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1">{errors.professionalTitle.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <Mail size={18} className="text-[var(--sp-accent)]" />
              Email Address
            </label>
            <input
              {...register('email')}
              className="input-glass-premium w-full opacity-50 cursor-not-allowed"
              readOnly
            />
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <Linkedin size={18} className="text-[var(--sp-accent)]" />
              LinkedIn URL
            </label>
            <div className="relative">
              <input
                {...register('linkedinUrl')}
                className="input-glass-premium w-full"
                placeholder="https://linkedin.com/in/..."
              />
              <div className="input-focus-line" />
            </div>
            {errors.linkedinUrl && <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1">{errors.linkedinUrl.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <MapPin size={18} className="text-[var(--sp-accent)]" />
              Country of Residence
            </label>
            <select {...register('countryOfResidence')} className="input-glass-premium w-full appearance-none pr-10" title="Country of Residence">
              <option value="">Select Country</option>
              {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
            </select>
            {errors.countryOfResidence && <p className="text-red-400 text-xs mt-1">{errors.countryOfResidence.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <Globe size={18} className="text-[var(--sp-accent)]" />
              Nationality
            </label>
            <select {...register('nationality')} className="input-glass-premium w-full appearance-none pr-10" title="Nationality">
              <option value="">Select Nationality</option>
              {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
            </select>
            {errors.nationality && <p className="text-red-400 text-xs mt-1">{errors.nationality.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <Phone size={18} className="text-[var(--sp-accent)]" />
              Phone Number
            </label>
            <div className="relative">
              <input
                {...register('phone')}
                className="input-glass-premium w-full"
                placeholder="+254 ..."
              />
              <div className="input-focus-line" />
            </div>
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <Globe size={18} className="text-[var(--sp-accent)]" />
              Website URL (Optional)
            </label>
            <div className="relative">
              <input
                {...register('websiteUrl')}
                className="input-glass-premium w-full"
                placeholder="https://..."
              />
              <div className="input-focus-line" />
            </div>
          </div>
        </div>

        {showProfileTypeSelection && (
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Profile Type Selection</p>
            <div className="rounded-2xl border border-[var(--sp-accent)]/20 bg-[var(--sp-accent)]/8 px-4 py-3 text-sm text-[var(--text-secondary)]">
              Your professional data is imported securely from LinkedIn. Strategic Pathways does not post or share information without your permission.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { id: 'Standard Member' as const, title: 'Standard Member', icon: Shield, desc: 'Free lifetime access to the basic network features.', color: 'from-blue-500/10 to-transparent' },
                { id: 'Premium (Verified)' as const, title: 'Premium (Verified)', icon: Award, desc: 'Highest level of trust. Unlocks exclusive features & visibility.', color: 'from-[var(--sp-accent)]/20 to-transparent' }
              ].map((type) => (
                <label key={type.id} className="cursor-pointer group relative">
                  <input type="radio" value={type.id} {...register('profileType')} className="sr-only peer" />
                  <div className={`p-6 rounded-2xl border border-[var(--sp-accent)]/10 bg-white/5 backdrop-blur-md transition-all duration-300 peer-checked:border-[var(--sp-accent)] peer-checked:shadow-[0_0_20px_rgba(var(--sp-accent-rgb),0.2)] group-hover:bg-white/10 h-full flex flex-col gap-4 relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 peer-checked:opacity-100 transition-opacity`} />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--sp-accent)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <type.icon size={22} className="text-[var(--sp-accent)]" />
                      </div>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{type.title}</span>
                    </div>
                    <p className="relative z-10 text-xs text-[var(--text-secondary)] leading-relaxed">{type.desc}</p>
                    <div className="relative z-10 mt-auto flex items-center gap-2 text-[var(--sp-accent)] opacity-0 peer-checked:opacity-100 transition-opacity">
                      <Check size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Selected</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </EntryAnimation>
  );
};

export const EducationEnhanced = () => {
  const { register, control, formState: { errors } } = useFormContext<OnboardingData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languagesSpoken" as never
  });

  return (
    <EntryAnimation>
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <GraduationCap size={18} className="text-[var(--sp-accent)]" />
              Highest Education Level
            </label>
            <select {...register('highestEducation')} className="input-glass-premium w-full appearance-none pr-10" title="Highest Education">
              <option value="">Select Level</option>
              <option value="PhD">PhD</option>
              <option value="Masters">Masters</option>
              <option value="Post-Graduate Diploma">Post-Graduate Diploma</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Diploma">Diploma</option>
              <option value="Other">Other</option>
            </select>
            {errors.highestEducation && <p className="text-red-400 text-xs mt-1">{errors.highestEducation.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <Award size={18} className="text-[var(--sp-accent)]" />
              Institution Name
            </label>
            <div className="relative">
              <input
                {...register('institutions')}
                className="input-glass-premium w-full"
                placeholder="e.g. Harvard University"
              />
              <div className="input-focus-line" />
            </div>
            {errors.institutions && <p className="text-red-400 text-xs mt-1">{errors.institutions.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2 transition-colors group-focus-within:text-[var(--sp-accent)]">
              <Target size={18} className="text-[var(--sp-accent)]" />
              Field of Study
            </label>
            <div className="relative">
              <input
                {...register('fieldOfStudy')}
                className="input-glass-premium w-full"
                placeholder="e.g. Molecular Biology"
              />
              <div className="input-focus-line" />
            </div>
            {errors.fieldOfStudy && <p className="text-red-400 text-xs mt-1">{errors.fieldOfStudy.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <Globe size={18} className="text-[var(--sp-accent)]" />
              Country of Study
            </label>
            <select {...register('studyCountry')} className="input-glass-premium w-full appearance-none pr-10" title="Country of Study">
              <option value="">Select Country</option>
              {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
            </select>
            {errors.studyCountry && <p className="text-red-400 text-xs mt-1">{errors.studyCountry.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
            <MapPin size={18} className="text-[var(--sp-accent)]" />
            Global Exposure (Worked/Lived Abroad)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['UK', 'USA', 'Canada', 'Germany', 'China', 'India', 'South Africa', 'UAE', 'Australia', 'Other'].map(country => (
              <label key={country} className="sp-checkbox-glass group">
                <input
                  type="checkbox"
                  value={country}
                  {...register('countriesWorkedIn')}
                  className="sr-only peer"
                />
                <div className="peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] border border-white/5 bg-white/5 rounded-xl p-3 flex items-center justify-between transition-all group-hover:bg-white/10">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold group-hover:text-[var(--text-primary)] transition-colors">{country}</span>
                  <div className="w-4 h-4 rounded border border-[var(--sp-accent)]/30 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity bg-[var(--sp-accent)]">
                    <Check size={10} className="text-[var(--text-inverse)]" />
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6 group space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-semibold ml-1">Other Countries or Specific Details (Optional)</label>
            <div className="relative">
              <input
                {...register('otherCountriesWorked')}
                className="input-glass-premium w-full text-sm"
                placeholder="List other relevant global experience..."
              />
              <div className="input-focus-line" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <Globe size={18} className="text-[var(--sp-accent)]" />
              Languages & Proficiency
            </label>
            <button
              type="button"
              onClick={() => append({ lang: '', level: 'Intermediate' } as never)}
              className="text-xs font-bold text-[var(--sp-accent)] flex items-center gap-1 hover:underline transition-all"
            >
              <Plus size={14} /> Add New
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex-1 relative group">
                  <input
                    {...register(`languagesSpoken.${index}.lang` as never)}
                    placeholder="Language (e.g. French)"
                    className="input-glass-premium w-full text-sm"
                  />
                  <div className="input-focus-line" />
                </div>
                <div className="w-48 relative">
                  <select 
                    {...register(`languagesSpoken.${index}.level` as never)}
                    className="input-glass-premium w-full appearance-none text-sm pr-10"
                    title="Language Proficiency"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all group"
                  title="Remove Language"
                >
                  <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ))}
          </div>
          
          {fields.length === 0 && (
            <div className="text-center py-8 rounded-2xl border border-dashed border-[var(--sp-accent)]/20 bg-white/5 opacity-60">
              <p className="text-xs text-[var(--text-secondary)]">No languages added yet. Add languages to showcase your global profile.</p>
            </div>
          )}
        </div>
      </div>
    </EntryAnimation>
  );
};

export const ProfessionalExperience = () => {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              Years of Professional Experience
            </label>
            <select {...register('yearsOfExperience')} className="input-glass-premium w-full appearance-none pr-10" title="Years of Experience">
              <option value="0–3">0–3 years</option>
              <option value="3–7">3–7 years</option>
              <option value="7–12">7–12 years</option>
              <option value="12+">12+ years</option>
            </select>
            {errors.yearsOfExperience && <p className="text-red-400 text-xs mt-1">{errors.yearsOfExperience.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              Primary Industry Sector
            </label>
            <select {...register('primarySector')} className="input-glass-premium w-full appearance-none pr-10" title="Primary Sector">
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Health">Health</option>
              <option value="Policy & Governance">Policy & Governance</option>
              <option value="Education">Education</option>
              <option value="Development">Development</option>
              <option value="Entrepreneurship">Entrepreneurship</option>
              <option value="Energy">Energy</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Creative Industries">Creative Industries</option>
              <option value="Other">Other</option>
            </select>
            {errors.primarySector && <p className="text-red-400 text-xs mt-1">{errors.primarySector.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              Current Employment Status
            </label>
            <select {...register('employmentStatus')} className="input-glass-premium w-full appearance-none pr-10" title="Employment Status">
              <option value="Employed (Full-time)">Employed (Full-time)</option>
              <option value="Employed (Part-time)">Employed (Part-time)</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Consultant">Consultant</option>
              <option value="In Transition">In Transition</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Other">Other</option>
            </select>
            {errors.employmentStatus && <p className="text-red-400 text-xs mt-1">{errors.employmentStatus.message}</p>}
          </div>

          <div className="group space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-semibold transition-colors group-focus-within:text-[var(--sp-accent)]">
              Current/Last Organization
            </label>
            <div className="relative">
              <input
                {...register('currentOrganisation')}
                className="input-glass-premium w-full"
                placeholder="e.g. Meta, UN, Standard Chartered"
              />
              <div className="input-focus-line" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[var(--text-secondary)] text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
            <Zap size={18} className="text-[var(--sp-accent)] animate-pulse" />
            Functional Expertise (Select up to 5)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Software dev', 'Cybersecurity', 'AI/ML', 'Cloud', 'Data Science',
              'Investment Banking', 'Corporate Finance', 'FinTech', 'Accounting',
              'Supply Chain', 'Logistics', 'Digital Strategy', 'Brand Management',
              'Medical technology', 'Pharma', 'Public Health', 'Policy Design'
            ].map((exp) => (
              <label key={exp} className="sp-checkbox-glass group">
                <input
                  type="checkbox"
                  value={exp}
                  {...register('functionalExpertise')}
                  className="sr-only peer"
                />
                <div className="peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] border border-white/5 bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group-hover:bg-white/10 group-active:scale-95 h-24">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold text-center leading-tight transition-colors group-hover:text-[var(--text-primary)]">{exp}</span>
                  <div className="w-4 h-4 rounded-full border border-[var(--sp-accent)]/30 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity bg-[var(--sp-accent)]">
                    <Check size={10} className="text-[var(--text-inverse)]" />
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.functionalExpertise && <p className="text-red-400 text-xs mt-2 text-center animate-bounce">{errors.functionalExpertise.message}</p>}
        </div>

        <div className="group space-y-4">
          <label className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Professional Impact Bio (Elevator Pitch)</label>
          <div className="relative">
            <textarea
              {...register('bio')}
              className="input-glass-premium w-full min-h-[200px] py-4"
              placeholder="Describe your journey, key milestones, and the unique value you bring to the network. Minimum 50 words."
            />
            <div className="input-focus-line" />
          </div>
          <div className="flex justify-between items-center px-2">
             <p className="text-[10px] text-[var(--text-secondary)] italic">Write from the heart. Authenticity builds better connections.</p>
             {errors.bio && <p className="text-red-400 text-[10px] font-bold uppercase">{errors.bio.message}</p>}
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
};

export const AreasOfInterest = () => {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-10">
        <div className="space-y-6">
          <label className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={20} className="text-[var(--sp-accent)]" />
            Primary Engagement interests
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Networking', 'Mentorship', 'Investment', 'Board Roles',
              'Venture Building', 'Advisory', 'Consultancy', 'Jobs',
              'Policy Design', 'Impact Projects', 'Research', 'Training'
            ].map((interest) => (
              <label key={interest} className="sp-checkbox-glass group">
                <input
                  type="checkbox"
                  value={interest}
                  {...register('engagementTypes')}
                  className="sr-only peer"
                />
                <div className="peer-checked:bg-[var(--sp-accent)]/20 peer-checked:border-[var(--sp-accent)] border border-white/5 bg-white/5 rounded-2xl p-5 flex items-center group-hover:bg-white/10 transition-all">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] peer-checked:text-[var(--text-primary)] transition-colors">{interest}</span>
                  <div className="ml-auto w-5 h-5 rounded border border-[var(--sp-accent)]/50 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-all transform scale-50 peer-checked:scale-100 bg-[var(--sp-accent)] shadow-[0_0_10px_var(--sp-accent)]">
                    <Check size={12} className="text-[var(--text-inverse)]" />
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.engagementTypes && <p className="text-red-400 text-xs mt-2 text-center">{errors.engagementTypes.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="group space-y-4">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <Zap size={18} className="text-[var(--sp-accent)]" />
              Availability to Engage
            </label>
            <select {...register('availability')} className="input-glass-premium w-full appearance-none pr-10" title="Availability">
              <option value="5 hours/week">5 hours/week</option>
              <option value="5–10 hours/week">5–10 hours/week</option>
              <option value="10+ hours/week">10+ hours/week</option>
              <option value="Full time">Full time</option>
              <option value="Project-based only">Project-based only</option>
            </select>
          </div>

          <div className="group space-y-4">
            <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
              <MapPin size={18} className="text-[var(--sp-accent)]" />
              Preferred Format
            </label>
            <select {...register('preferredFormat')} className="input-glass-premium w-full appearance-none pr-10" title="Preferred Format">
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="In-person">In-person</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
};

export const PremiumDetails = () => {
  const { register } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-10">
        <div className="group space-y-4">
          <label className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Award size={20} className="text-[var(--sp-accent)]" />
            Key Quantifiable Achievements
          </label>
          <div className="relative">
            <textarea
              {...register('keyAchievements')}
              className="input-glass-premium w-full min-h-[140px] py-4"
              placeholder="e.g. 'Executed market entry for 3 FinTech startups in East Africa, yielding 50k+ user growth'..."
            />
            <div className="input-focus-line" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="group space-y-4">
            <label className="text-[var(--text-secondary)] text-sm font-semibold">Specialized Industry Sub-Sector</label>
            <div className="relative">
              <input
                {...register('industrySubSpecialization')}
                className="input-glass-premium w-full"
                placeholder="e.g. Agri-Tech Supply Chain Logistics"
              />
              <div className="input-focus-line" />
            </div>
          </div>

          <div className="group space-y-4">
            <label className="text-[var(--text-secondary)] text-sm font-semibold">Compensation Expectation</label>
            <select {...register('compensationExpectation')} className="input-glass-premium w-full appearance-none pr-10" title="Compensation Expectation">
              <option value="Pro-bono">Pro-bono</option>
              <option value="Below market (impact driven)">Below market (impact driven)</option>
              <option value="Market rate">Market rate</option>
              <option value="Premium rate">Premium rate</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[var(--text-secondary)] text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
            <Target size={18} className="text-[var(--sp-accent)]" />
            Preferred Project Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Advisory', 'Interim Executive', 'Venture Partner', 'Board Advisor'].map(type => (
              <label key={type} className="sp-checkbox-glass group">
                <input 
                  type="checkbox" 
                  value={type} 
                  {...register('preferredProjectType')}
                  className="sr-only peer"
                />
                <div className="peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:bg-white/10 text-center h-28 justify-center">
                  <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-tight">{type}</span>
                  <div className="w-5 h-5 rounded-lg border border-[var(--sp-accent)]/50 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100 bg-[var(--sp-accent)]">
                    <Check size={12} className="text-[var(--text-inverse)]" />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
};

export const ContributionValue = () => {
  const { register, control, formState: { errors } } = useFormContext<OnboardingData>();
  const workedWithSmes = useWatch({ control, name: 'workedWithSmes' });
  const profileType = useWatch({ control, name: 'profileType' });

  return (
    <EntryAnimation>
      <div className="space-y-10">
        <div className="group space-y-4">
          <label className="text-[var(--text-secondary)] text-sm font-semibold flex items-center gap-2">
            <Zap size={18} className="text-[var(--sp-accent)]" />
            Specific Skills & Mastery
          </label>
          <div className="relative">
            <textarea
              {...register('specificSkills')}
              className="input-glass-premium w-full min-h-[140px] py-4"
              placeholder="List technical and leadership skills with relevant context. Bullet points are encouraged."
            />
            <div className="input-focus-line" />
          </div>
          {errors.specificSkills && <p className="text-red-400 text-xs mt-1 animate-pulse">{errors.specificSkills.message}</p>}
        </div>

        {profileType === 'Premium (Verified)' && (
          <div className="space-y-6 bg-[var(--sp-accent)]/5 p-6 rounded-3xl border border-[var(--sp-accent)]/10">
            <label className="text-[var(--text-secondary)] text-sm font-bold flex items-center gap-2 uppercase tracking-widest px-2">
               <Heart size={20} className="text-[var(--sp-accent)]" />
               SDG Alignment & Social Impact
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education', 
                'Gender Equality', 'Clean Water', 'Affordable Energy', 'Decent Work',
                'Industry & Innovation', 'Reduced Inequalities', 'Sustainable Cities'
              ].map(sdg => (
                <label key={sdg} className="sp-checkbox-glass group">
                  <input 
                    type="checkbox" value={sdg} {...register('sdgAlignment')}
                    className="sr-only peer"
                  />
                  <div className="peer-checked:bg-[var(--sp-accent)]/20 peer-checked:border-[var(--sp-accent)] border border-white/10 bg-white/5 rounded-xl p-3 flex items-center justify-between transition-all hover:bg-white/10">
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] truncate">{sdg}</span>
                    <div className="w-3 h-3 rounded-sm border border-[var(--sp-accent)] flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity bg-[var(--sp-accent)] shadow-[0_0_8px_var(--sp-accent)]">
                      <Check size={8} className="text-[var(--text-inverse)]" />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="group space-y-4">
          <label className="text-[var(--text-secondary)] text-sm font-semibold">What global or local challenges are you mission-driven to solve?</label>
          <div className="relative">
            <textarea
              {...register('passionateProblems')}
              className="input-glass-premium w-full min-h-[140px] py-4"
              placeholder="Explain the problems that keep you up at night..."
            />
            <div className="input-focus-line" />
          </div>
          {errors.passionateProblems && <p className="text-red-400 text-xs mt-1">{errors.passionateProblems.message}</p>}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-[var(--sp-accent)]/20 transition-all shadow-xl">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--sp-accent)]/10 transition-colors">
                 <Briefcase size={24} className="text-[var(--sp-accent)]" />
               </div>
               <div>
                  <h4 className="text-[var(--text-primary)] font-bold">SME / NGO Support</h4>
                  <p className="text-[var(--text-secondary)] text-[10px] italic">Willing to assist local organizations</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('workedWithSmes')} className="sr-only peer" />
              <div className="w-14 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[var(--text-secondary)] peer-checked:after:bg-white after:rounded-full after:h-5 after:w-7 after:transition-all peer-checked:bg-[var(--sp-accent)] shadow-inner"></div>
            </label>
          </div>

          {workedWithSmes && (
            <div className="animate-in slide-in-from-top-4 fade-in duration-500 group space-y-2">
              <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase ml-2">Describe Your Previous or Future Commitment</label>
              <div className="relative">
                <textarea
                  {...register('smeDescription')}
                  className="input-glass-premium w-full min-h-[120px] py-4"
                  placeholder="Tell us more about how you've supported or plan to support SMEs/NGOs..."
                />
                <div className="input-focus-line" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-[var(--sp-accent)]/20 transition-all shadow-xl">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--sp-accent)]/10 transition-colors">
                 <Users size={24} className="text-[var(--sp-accent)]" />
               </div>
               <div>
                  <h4 className="text-[var(--text-primary)] font-bold">Cross-Sector Collaboration</h4>
                  <p className="text-[var(--text-secondary)] text-[10px] italic">Open to diverse partnership models</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('crossSectorCollaboration')} className="sr-only peer" />
              <div className="w-14 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[var(--text-secondary)] peer-checked:after:bg-white after:rounded-full after:h-5 after:w-7 after:transition-all peer-checked:bg-[var(--sp-accent)] shadow-inner"></div>
            </label>
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
};

export const IncomeVenture = () => {
  const { register } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-12">
        {[
          { 
            label: 'Are you seeking additional income opportunities?', 
            name: 'seekingIncome' as const, 
            options: ['Yes actively', 'Yes selectively', 'No'] 
          },
          { 
            label: 'Interested in starting or joining a venture?', 
            name: 'ventureInterest' as const, 
            options: ['Yes', 'Maybe', 'No'] 
          },
          { 
            label: 'Interested in investment opportunities?', 
            name: 'investorInterest' as const, 
            options: ['Yes', 'No', 'Possibly in future'] 
          }
        ].map((section) => (
          <div key={section.name} className="space-y-6">
            <label className="text-[var(--text-secondary)] text-sm font-bold flex items-center gap-2 uppercase tracking-widest ml-1">
               <Zap size={18} className="text-[var(--sp-accent)]" />
               {section.label}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {section.options.map((val) => (
                <label key={val} className="cursor-pointer group">
                  <input type="radio" value={val} {...register(section.name)} className="sr-only peer" />
                  <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md text-center transition-all peer-checked:border-[var(--sp-accent)] peer-checked:bg-[var(--sp-accent)]/20 peer-checked:text-[var(--sp-accent)] peer-checked:shadow-[0_0_15px_rgba(var(--sp-accent-rgb),0.3)] group-hover:bg-white/10 font-bold text-xs uppercase tracking-widest">{val}</div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </EntryAnimation>
  );
};

export const UserCategorySelection = () => {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-[0.2em] mb-4">Identify Your Perspective</h3>
          <p className="text-xs text-[var(--text-secondary)] opacity-60">This helps us tailor the network experience to your specific background.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { 
              id: 'Study-Abroad Returnee (Recent Graduate)' as const, 
              title: 'Study-Abroad Returnee', 
              desc: 'Completed degree or diploma abroad and returned to Kenya. Focus on networking and local integration.',
              icon: GraduationCap
            },
            { 
              id: 'Diaspora Returnee (Professional)' as const, 
              title: 'Diaspora Returnee', 
              desc: 'Studied/worked abroad for a significant period and relocated back. Focus on expertise sharing & ventures.',
              icon: Briefcase
            },
            { 
              id: 'Diaspora Expert (Still Abroad)' as const, 
              title: 'Diaspora Expert', 
              desc: 'Currently living and working abroad but looking to engage remotely through advisory, impact or investment.',
              icon: Globe
            },
          ].map((cat) => (
            <label key={cat.id} className="cursor-pointer group relative">
              <input type="radio" value={cat.id} {...register('userCategory')} className="sr-only peer" />
              <div className="relative p-8 rounded-[2rem] border border-[var(--sp-accent)]/10 bg-white/5 backdrop-blur-xl transition-all duration-500 peer-checked:border-[var(--sp-accent)] peer-checked:bg-[var(--sp-accent)]/10 group-hover:scale-[1.02] shadow-2xl flex items-center gap-8 group-hover:border-[var(--sp-accent)]/40 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--sp-accent)]/10 to-transparent rounded-bl-[100%] opacity-0 peer-checked:opacity-100 transition-opacity" />
                
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--sp-accent)]/10 group-hover:border-[var(--sp-accent)]/30 transition-all shadow-inner relative z-10 shrink-0">
                  <cat.icon size={40} className="text-[var(--text-secondary)] group-hover:text-[var(--sp-accent)] transition-colors duration-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="font-extrabold text-2xl text-[var(--text-primary)] mb-2 group-hover:text-[var(--sp-accent)] transition-colors leading-tight">{cat.title}</div>
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{cat.desc}</div>
                </div>

                <div className="ml-auto relative z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--sp-accent)]/30 flex items-center justify-center peer-checked:bg-[var(--sp-accent)] peer-checked:border-[var(--sp-accent)] transition-all scale-75 peer-checked:scale-100 shadow-[0_0_15px_-5px_var(--sp-accent)]">
                    <Check size={18} className="text-transparent peer-checked:text-[var(--text-inverse)] transition-colors" />
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.userCategory && <p className="text-red-400 text-xs mt-6 text-center font-bold uppercase tracking-widest">{errors.userCategory.message}</p>}
      </div>
    </EntryAnimation>
  );
};

export const VerificationCredits = () => {
  const { register, control, setValue, formState: { errors } } = useFormContext<OnboardingData>();
  const userCategory = useWatch({ control, name: 'userCategory' });
  const referencesValue = useWatch({ control, name: 'references' });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [referenceEntries, setReferenceEntries] = useState<ReferenceEntry[]>(() => parseReferencesValue(''));

  useEffect(() => {
    setReferenceEntries(parseReferencesValue(referencesValue));
  }, [referencesValue]);

  const syncReferenceEntries = (entries: ReferenceEntry[]) => {
    setReferenceEntries(entries);
    setValue('references', serializeReferencesValue(entries), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const updateReferenceEntry = (index: number, field: keyof ReferenceEntry, value: string) => {
    const nextEntries = referenceEntries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [field]: value } : entry
    );
    syncReferenceEntries(nextEntries);
  };

  const addReferenceEntry = () => {
    syncReferenceEntries([...referenceEntries, createEmptyReference()]);
  };

  const removeReferenceEntry = (index: number) => {
    const nextEntries = referenceEntries.filter((_, entryIndex) => entryIndex !== index);
    syncReferenceEntries(nextEntries.length ? nextEntries : [createEmptyReference()]);
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    setUploaded(prev => ({ ...prev, [fieldName]: false }));
    try {
      const result = await uploadFile(file, 'verification');
      setValue(fieldName as keyof OnboardingData, result.url, { shouldValidate: true, shouldDirty: true });
      toast.success('Document secure! Verification pending.');
      setUploaded(prev => ({ ...prev, [fieldName]: true }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload interrupted';
      toast.error(errorMessage);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const UploadField = ({ name, label, description }: { name: keyof OnboardingData, label: string, description: string }) => {
    const currentValue = useWatch({ control, name: name as never }) as string | undefined;
    const { onChange, ...rest } = register(name as never);
    const fieldError = errors[name];
    const errorMessage = typeof fieldError?.message === 'string' ? fieldError.message : '';
    
    return (
      <div className="space-y-4 mb-8 text-left animate-in fade-in zoom-in-95 duration-500">
        <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-[0.1em] ml-1">{label}</label>
        <div className={`relative group overflow-hidden rounded-2xl border backdrop-blur-md flex items-center transition-all shadow-xl ${
          errorMessage
            ? 'border-red-400/50 bg-red-500/5'
            : 'border-white/10 bg-white/5 hover:border-[var(--sp-accent)]/30'
        }`}>
          <div className="pl-5 pr-3 text-[var(--sp-accent)] border-r border-white/10 h-14 flex items-center">
            <Shield size={22} className="group-hover:rotate-12 transition-transform" />
          </div>
          <input
            {...rest}
            className="flex-1 bg-transparent h-14 px-4 text-sm outline-none placeholder:text-white/20 font-medium"
            placeholder="Cloud link or click upload"
            defaultValue={currentValue || ''}
            onChange={(e) => {
              onChange(e);
              setUploaded(prev => ({ ...prev, [name as string]: false }));
            }}
          />
          <label className="mr-3 cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, name as string);
              }}
            />
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--text-inverse)] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--sp-accent)]/20">
              {uploading[name as string] ? (
                <div className="w-4 h-4 border-2 border-[var(--text-inverse)]/30 border-t-[var(--text-inverse)] rounded-full animate-spin" />
              ) : (
                <>
                  <Camera size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Secure Upload</span>
                </>
              )}
            </div>
          </label>
        </div>
        {uploaded[name as string] && (
          <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-widest ml-1 animate-in slide-in-from-left-2">
             <Check size={12} /> <span>Upload Encrypted & Stored</span>
          </div>
        )}
        {errorMessage && (
          <p className="text-red-400 text-xs ml-1 font-semibold">{errorMessage}</p>
        )}
        <p className="text-[10px] text-[var(--text-secondary)] opacity-50 ml-2 italic">{description}</p>
      </div>
    );
  };

  return (
    <EntryAnimation>
      <div className="space-y-10">
        <div className="p-10 bg-[var(--sp-accent)]/5 border border-[var(--sp-accent)]/10 rounded-[2.5rem] shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--sp-accent)]/10 to-transparent -rotate-45 translate-x-32 -translate-y-32" />
          
          <div className="relative z-10 text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/20 flex items-center justify-center mx-auto mb-6 shadow-2xl pulse-glow">
              <Shield size={40} className="text-[var(--sp-accent)]" />
            </div>
            <h4 className="text-[var(--text-primary)] font-extrabold text-2xl uppercase tracking-tighter mb-4">Verification Center</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-lg mx-auto font-medium opacity-80">
              Building a trusted community. Verification adheres to the highest data protection standards.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <UploadField
              name="identityProofUrl"
              label="Identity Verification (Passport/ID) *"
              description="Front page of passport or primary national identity card."
            />

            {userCategory === 'Study-Abroad Returnee (Recent Graduate)' && (
              <UploadField
                name="academicProofUrl"
                label="Academic Achievement (Degree/Graduation) *"
                description="Final degree certificate or official graduation confirmation."
              />
            )}

            {userCategory === 'Diaspora Returnee (Professional)' && (
              <>
                <UploadField
                  name="employmentProofUrl"
                  label="Employment Track Record"
                  description="Recent contract, offer letter or professional reference."
                />
                <UploadField
                  name="residencyProofUrl"
                  label="Global Residency Proof"
                  description="Visa stamp, work permit, or residency certificate."
                />
              </>
            )}

            {userCategory === 'Diaspora Expert (Still Abroad)' && (
              <UploadField
                name="professionalProofUrl"
                label="International Professional Evidence"
                description="Link to professional portfolio or industry accreditation."
              />
            )}
          </div>

          <div className="mt-12 pt-10 border-t border-[var(--sp-accent)]/10">
            <label className="flex items-center justify-center gap-4 p-6 bg-white/5 rounded-2xl cursor-pointer group hover:bg-[var(--sp-accent)]/10 border border-dashed border-[var(--sp-accent)]/30 transition-all transform hover:scale-[1.01]">
              <div className="relative">
                <input 
                  type="checkbox" 
                  {...register('consentToVerification')}
                  className="sr-only peer"
                />
                <div className="w-8 h-8 rounded-lg border-2 border-[var(--sp-accent)]/40 flex items-center justify-center peer-checked:bg-[var(--sp-accent)] peer-checked:border-[var(--sp-accent)] transition-all bg-white/5 shadow-inner">
                  <Check size={20} className="text-transparent peer-checked:text-[var(--text-inverse)] transition-colors" />
                </div>
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">I consent to the background verification process</span>
                <p className="text-[10px] text-[var(--text-secondary)] opacity-60">I confirm that all uploaded documents are authentic and valid.</p>
              </div>
            </label>
            {errors.consentToVerification && <p className="text-red-400 text-xs mt-4 text-center font-bold animate-bounce">{errors.consentToVerification.message}</p>}
          </div>
        </div>

        <div className="group space-y-5 px-2">
          <div className="text-center space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Users size={18} className="text-[var(--sp-accent)]" />
              Professional References (Optional)
            </label>
            <p className="text-xs text-[var(--text-secondary)] opacity-70">
              Add people who can speak to your work. You can include one or more references.
            </p>
          </div>

          <input type="hidden" {...register('references')} />

          <div className="space-y-4">
            {referenceEntries.map((entry, index) => (
              <div
                key={`reference-${index}`}
                className="rounded-[2rem] border border-[var(--sp-accent)]/20 bg-white/5 p-5 sm:p-6 shadow-xl backdrop-blur-md"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[var(--text-primary)] font-semibold">Reference {index + 1}</p>
                    <p className="text-xs text-[var(--text-secondary)] opacity-70">Full Name, Role, Company, Email or phone</p>
                  </div>
                  {referenceEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReferenceEntry(index)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                      title="Remove reference"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={entry.fullName}
                      onChange={(event) => updateReferenceEntry(index, 'fullName', event.target.value)}
                      className="input-glass-premium w-full"
                      placeholder="e.g. Jane Wanjiku"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">Role</label>
                    <input
                      type="text"
                      value={entry.role}
                      onChange={(event) => updateReferenceEntry(index, 'role', event.target.value)}
                      className="input-glass-premium w-full"
                      placeholder="e.g. Program Director"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      value={entry.company}
                      onChange={(event) => updateReferenceEntry(index, 'company', event.target.value)}
                      className="input-glass-premium w-full"
                      placeholder="e.g. Acme Foundation"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">Email / Contact</label>
                    <input
                      type="text"
                      value={entry.contact}
                      onChange={(event) => updateReferenceEntry(index, 'contact', event.target.value)}
                      className="input-glass-premium w-full"
                      placeholder="e.g. jane@company.com or +254..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={addReferenceEntry}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--sp-accent)]/25 bg-[var(--sp-accent)]/10 px-5 py-3 text-sm font-semibold text-[var(--sp-accent)] transition-colors hover:bg-[var(--sp-accent)]/15"
            >
              <Plus size={16} />
              Add Another Reference
            </button>
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
};

export const CommunityVisibility = () => {
  const { register } = useFormContext<OnboardingData>();
  
  return (
    <EntryAnimation>
      <div className="space-y-10 max-w-2xl mx-auto">
        <div className="space-y-6">
          {[
            { 
              id: 'openToSpotlight' as const, 
              label: 'Network Member Spotlight', 
              desc: 'Get featured in strategic highlights and success stories across the platform.',
              icon: Award 
            },
            { 
              id: 'wouldLikeToMentor' as const, 
              label: 'Willing to Mentor', 
              desc: 'Guide the next generation of professionals returning to the local ecosystem.',
              icon: Heart 
            }
          ].map((toggle) => (
            <div key={toggle.id} className="group p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-[var(--sp-accent)]/30 transition-all flex items-center gap-8 shadow-2xl backdrop-blur-xl group hover:scale-[1.02]">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--sp-accent)]/10 flex items-center justify-center group-hover:bg-[var(--sp-accent)]/20 group-hover:rotate-6 transition-all shrink-0">
                <toggle.icon size={32} className="text-[var(--sp-accent)]" />
              </div>
              <div className="flex-1">
                <h4 className="text-[var(--text-primary)] font-extrabold text-xl mb-1 group-hover:text-[var(--sp-accent)] transition-colors">{toggle.label}</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed opacity-70">{toggle.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" {...register(toggle.id)} className="sr-only peer" />
                <div className="w-16 h-8 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[var(--text-secondary)] peer-checked:after:bg-white after:rounded-full after:h-6 after:w-9 after:transition-all peer-checked:bg-[var(--sp-accent)] shadow-[0_0_15px_rgba(0,0,0,0.5)]"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="space-y-8 pt-6">
          <div className="text-center group">
            <label className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-[0.3em] mb-8 inline-block group-hover:text-[var(--sp-accent)] transition-colors">Serve as a Community Ambassador?</label>
            <div className="grid grid-cols-3 gap-6">
              {['Yes', 'Maybe', 'No'].map((val) => (
                <label key={val} className="cursor-pointer group/opt">
                  <input type="radio" value={val} {...register('communityAmbassador')} className="sr-only peer" />
                  <div className="p-6 rounded-[2rem] border-2 border-white/5 bg-white/5 backdrop-blur-md text-center transition-all peer-checked:border-[var(--sp-accent)] peer-checked:bg-[var(--sp-accent)]/10 peer-checked:text-[var(--sp-accent)] group-hover/opt:bg-white/10 text-xs font-bold uppercase tracking-widest leading-none shadow-xl peer-checked:scale-105">{val}</div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EntryAnimation>
  );
};
// End of OnboardingSteps.tsx refactored for FormProvider
