import type { UseFormRegister, FieldErrors, Control, UseFormSetValue } from 'react-hook-form';
import { useWatch, useFieldArray } from 'react-hook-form';
import type { OnboardingData } from './schema';
import { User, Mail, Phone, Linkedin, Globe, Briefcase, Award, Heart, Upload, Zap, Shield, Target, TrendingUp, Check, Plus, Trash2, Camera, GraduationCap } from 'lucide-react';
import { countries } from '../../data/countries';
import { institutionsByCountry } from '../../data/institutions';
import { useState } from 'react';
import { uploadFile } from '../../lib/uploadUtils';
import { toast } from 'sonner';

interface StepProps {
  register: UseFormRegister<OnboardingData>;
  errors: FieldErrors<OnboardingData>;
  control?: Control<OnboardingData>;
  setValue?: UseFormSetValue<OnboardingData>;
  readOnlyFields?: string[];
}

export const ProfileTypeSelection = ({ register, errors }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
    <div className="max-w-xl mx-auto space-y-4">
      <h3 className="text-xl font-bold text-[var(--text-primary)]">Select your profile type</h3>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Choose how you want to participate on the platform. The Standard flow enables fast onboarding. The Premium flow provides verification and access to higher-value professional opportunities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="cursor-pointer group relative">
          <input type="radio" value="Standard Member" {...register('profileType')} className="sr-only peer" />
          <div className="p-8 rounded-3xl border border-[var(--sp-accent)]/20 transition-all peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] hover:bg-white/5 flex flex-col items-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
              <Zap size={32} className="text-[var(--sp-accent)]" />
            </div>
            <div className="font-bold text-xl text-[var(--text-primary)] mb-2">Standard Member</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              Fast setup. Ideal for professionals exploring the platform.
            </p>
            <ul className="text-[10px] text-[var(--text-secondary)] space-y-1 text-left">
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />5-minute onboarding</li>
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Standard profile visibility</li>
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Access to curated opportunities</li>
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Manual matching support</li>
            </ul>
            <div className="mt-auto pt-6 text-[var(--sp-accent)] text-xs font-bold opacity-0 peer-checked:opacity-100 transition-opacity flex items-center gap-1">
               SELECTED <Check size={14} />
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] text-[10px] font-bold rounded-full border border-[var(--sp-accent)]/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
            FAST
          </div>
        </label>

        <label className="cursor-pointer group relative">
          <input type="radio" value="Premium (Verified)" {...register('profileType')} className="sr-only peer" />
          <div className="p-8 rounded-3xl border border-[var(--sp-accent)]/20 transition-all peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] hover:bg-white/5 flex flex-col items-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-[var(--sp-accent)]/20 flex items-center justify-center mb-6 border border-[var(--sp-accent)]/30 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(200,159,94,0.1)]">
              <Shield size={32} className="text-[var(--sp-accent)]" />
            </div>
            <div className="font-bold text-xl text-[var(--text-primary)] mb-2">Premium Verified Member</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              For professionals seeking verified status and high-value collaborations.
            </p>
            <ul className="text-[10px] text-[var(--text-secondary)] space-y-1 text-left">
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Verified Professional badge</li>
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Priority matching for consulting opportunities</li>
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Enhanced profile visibility</li>
              <li className="flex items-start gap-2"><Check size={12} className="text-[var(--sp-accent)] mt-0.5" />Institutional credibility for partnerships</li>
            </ul>
             <div className="mt-auto pt-6 text-[var(--sp-accent)] text-xs font-bold opacity-0 peer-checked:opacity-100 transition-opacity flex items-center gap-1">
               SELECTED <Check size={14} />
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--sp-accent)] text-[var(--text-inverse)] text-[10px] font-bold rounded-full border border-[var(--sp-accent)] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            RECOMMENDED
          </div>
        </label>
      </div>
      <p className="text-[10px] text-[var(--text-secondary)] italic">
        Your professional data is imported securely from LinkedIn. Strategic Pathways does not post or share information without your permission.
      </p>
      {errors.profileType && <p className="text-red-400 text-xs mt-4">{errors.profileType.message}</p>}
    </div>
  </div>
);

export const BasicInfo = ({ register, errors, readOnlyFields }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Full Name</label>
        <div className="relative">
          <input
            {...register('fullName')}
            className={`input-glass w-full pl-10 ${readOnlyFields?.includes('fullName') ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Enter your full name"
            readOnly={readOnlyFields?.includes('fullName')}
          />
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        </div>
        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Professional Title</label>
        <div className="relative">
          <input
            {...register('professionalTitle')}
            className="input-glass w-full pl-10"
            placeholder="e.g. Senior Data Scientist"
          />
          <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        </div>
        {errors.professionalTitle && <p className="text-red-400 text-xs mt-1">{errors.professionalTitle.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Email Address</label>
        <div className="relative">
          <input
            {...register('email')}
            className={`input-glass w-full pl-10 ${readOnlyFields?.includes('email') ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="your@email.com"
            readOnly={readOnlyFields?.includes('email')}
          />
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Phone Number (Optional)</label>
        <div className="flex gap-2">
          <select
            {...register('countryCode')}
            className="input-glass w-32 appearance-none"
          >
            {countries.map(country => (
              <option key={`${country.code}-${country.name}`} value={country.code}>
                {country.code}
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <input
              {...register('phone')}
              className="input-glass w-full pl-10"
              placeholder="712345678"
            />
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">LinkedIn Profile URL (Optional)</label>
        <div className="relative">
          <input
            {...register('linkedinUrl')}
            className="input-glass w-full pl-10"
            placeholder="https://linkedin.com/in/..."
          />
          <Linkedin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] ml-1 italic">Providing a LinkedIn profile acts as a strong trust signal for partners and verification.</p>
        {errors.linkedinUrl && <p className="text-red-400 text-xs mt-1">{errors.linkedinUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Personal Website (Optional)</label>
        <div className="relative">
          <input
            {...register('websiteUrl')}
            className="input-glass w-full pl-10"
            placeholder="https://..."
          />
          <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Country of Residence</label>
        <select
          {...register('countryOfResidence')}
          className="input-glass w-full appearance-none"
        >
          <option value="">Select country...</option>
          {countries.map(country => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.countryOfResidence && <p className="text-red-400 text-xs mt-1">{errors.countryOfResidence.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Nationality</label>
        <select
          {...register('nationality')}
          className="input-glass w-full appearance-none"
        >
          <option value="">Select nationality...</option>
          {countries.map(country => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.nationality && <p className="text-red-400 text-xs mt-1">{errors.nationality.message}</p>}
      </div>
    </div>
  </div>
);

export const Education = ({ register, errors, readOnlyFields }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Highest Level of Education</label>
        <select {...register('highestEducation')} className="input-glass w-full appearance-none">
          <option value="Bachelor’s">Bachelor’s</option>
          <option value="Master’s">Master’s</option>
          <option value="PhD">PhD</option>
          <option value="Professional Certification">Professional Certification</option>
          <option value="Other">Other</option>
        </select>
        {errors.highestEducation && <p className="text-red-400 text-xs mt-1">{errors.highestEducation.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Country Where You Studied</label>
        <input
          {...register('studyCountry')}
          className="input-glass w-full"
          placeholder="e.g. United Kingdom"
        />
        {errors.studyCountry && <p className="text-red-400 text-xs mt-1">{errors.studyCountry.message}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Institution Name(s)</label>
        <input
          {...register('institutions')}
          className="input-glass w-full"
          placeholder="e.g. University of Nairobi"
        />
        {errors.institutions && <p className="text-red-400 text-xs mt-1">{errors.institutions.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Field of Study / Specialization</label>
        <input
          {...register('fieldOfStudy')}
          className="input-glass w-full"
          placeholder="e.g. Strategic Management"
        />
        {errors.fieldOfStudy && <p className="text-red-400 text-xs mt-1">{errors.fieldOfStudy.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Other Countries Worked In (Optional)</label>
        <input
          {...register('otherCountriesWorked')}
          className="input-glass w-full"
          placeholder="e.g. Rwanda, UAE"
        />
      </div>
    </div>
  </div>
);

// Enhanced layout used by onboarding wizard
export const EducationEnhanced = ({ register, errors, control }: StepProps) => {
  const [newCountry, setNewCountry] = useState('');
  const [newLang, setNewLang] = useState<{ lang: string; level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native' }>({ lang: '', level: 'Fluent' });

  const countriesWorked = useFieldArray({ control, name: 'countriesWorkedIn' });
  const languages = useFieldArray({ control, name: 'languagesSpoken' });

  const addCountry = () => {
    if (!newCountry.trim()) return;
    if (countriesWorked.fields.some((f: any) => (f as any).value === newCountry || (f as any) === newCountry)) return;
    countriesWorked.append(newCountry.trim());
    setNewCountry('');
  };

  const addLanguage = () => {
    if (!newLang.lang.trim()) return;
    languages.append({ lang: newLang.lang.trim(), level: newLang.level });
    setNewLang({ lang: '', level: 'Fluent' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-light rounded-2xl p-6 border border-white/10 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={18} className="text-[var(--sp-accent)]" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Education</h4>
          </div>
          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Highest Level of Education</label>
            <select {...register('highestEducation')} className="input-glass w-full appearance-none">
              <option value="">Select level...</option>
              <option value="Bachelor’s">Bachelor’s</option>
              <option value="Master’s">Master’s</option>
              <option value="PhD">PhD</option>
              <option value="Professional Certification">Professional Certification</option>
              <option value="Other">Other</option>
            </select>
            {errors.highestEducation && <p className="text-red-400 text-xs">{errors.highestEducation.message}</p>}
            {useWatch({ control, name: 'highestEducation' }) === 'Other' && (
              <div className="pt-2">
                <label className="text-[var(--text-secondary)] text-sm block ml-1">Specify other education</label>
                <input
                  {...register('educationOther')}
                  className="input-glass w-full"
                  placeholder="e.g. Postgraduate diploma, Fellowship"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Country Where You Studied</label>
            <select {...register('studyCountry')} className="input-glass w-full appearance-none">
              <option value="">Select country...</option>
              {countries.map(c => (
                <option key={`study-${c.name}`} value={c.name}>{c.name}</option>
              ))}
            </select>
            {errors.studyCountry && <p className="text-red-400 text-xs">{errors.studyCountry.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Institution Name(s)</label>
            <input
              {...register('institutions')}
              className="input-glass w-full"
              placeholder="e.g. University of Nairobi"
            />
            {errors.institutions && <p className="text-red-400 text-xs">{errors.institutions.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Field of Study / Specialization</label>
            <input
              {...register('fieldOfStudy')}
              className="input-glass w-full"
              placeholder="e.g. Strategic Management"
            />
            {errors.fieldOfStudy && <p className="text-red-400 text-xs">{errors.fieldOfStudy.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Other Countries Worked In (Optional)</label>
            <input
              {...register('otherCountriesWorked')}
              className="input-glass w-full"
              placeholder="e.g. Rwanda, UAE"
            />
          </div>
        </div>

        <div className="glass-light rounded-2xl p-6 border border-white/10 space-y-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={18} className="text-[var(--sp-accent)]" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Global Exposure</h4>
          </div>

          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Countries you have worked in</label>
            <div className="flex gap-2">
              <select
                className="input-glass flex-1 appearance-none"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
              >
                <option value="">Add country...</option>
                {countries.map(c => (
                  <option key={`worked-${c.name}`} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button type="button" onClick={addCountry} className="sp-btn-primary px-4 py-2 flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
            {countriesWorked.fields.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {countriesWorked.fields.map((field, idx) => (
                  <span key={field.id ?? idx} className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs flex items-center gap-1">
                    {(field as any).value ?? (field as any)}
                    <button type="button" onClick={() => countriesWorked.remove(idx)} className="hover:text-red-300">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Languages spoken</label>
            <div className="flex gap-2 flex-wrap">
              <input
                value={newLang.lang}
                onChange={(e) => setNewLang(prev => ({ ...prev, lang: e.target.value }))}
                className="input-glass flex-1 min-w-[160px]"
                placeholder="e.g. English, Kiswahili"
              />
              <select
                value={newLang.level}
                onChange={(e) => setNewLang(prev => ({ ...prev, level: e.target.value as any }))}
                className="input-glass w-40 appearance-none"
              >
                {['Basic', 'Intermediate', 'Fluent', 'Native'].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <button type="button" onClick={addLanguage} className="sp-btn-primary px-4 py-2 flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
            {languages.fields.length > 0 && (
              <div className="space-y-2">
                {languages.fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <div className="text-sm text-[var(--text-primary)]">
                      {(field as any).lang} <span className="text-[var(--text-secondary)]">({(field as any).level})</span>
                    </div>
                    <button type="button" onClick={() => languages.remove(idx)} className="text-[var(--text-secondary)] hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-[var(--text-secondary)]">
            Tip: Listing global experience helps matching with cross-border projects and county governments.
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfessionalExperience = ({ register, errors, control }: StepProps) => {
  const selectedExpertise = useWatch({ control, name: 'functionalExpertise' }) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Years of Experience</label>
          <select {...register('yearsOfExperience')} className="input-glass w-full appearance-none">
            <option value="0–3">0–3</option>
            <option value="3–7">3–7</option>
            <option value="7–12">7–12</option>
            <option value="12+">12+</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Primary Sector</label>
          <select {...register('primarySector')} className="input-glass w-full appearance-none">
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
        </div>

        {useWatch({ control, name: 'primarySector' }) === 'Other' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Specify Other Sector</label>
            <input
              {...register('sectorOther' as any)}
              className="input-glass w-full"
              placeholder="Enter your sector..."
            />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">
            Functional Expertise (Select up to 5)
            <span className="ml-2 text-[var(--sp-accent)] text-xs">({selectedExpertise.length}/5 selected)</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 glass-light p-4 rounded-xl border border-[var(--sp-accent)]/10">
            {[
              'Strategy', 'Operations', 'Investment & Finance', 'Policy & Research', 
              'Data & Analytics', 'Product Development', 'Marketing & Communications', 
              'Legal & Compliance', 'Programme Management', 'SME Advisory', 
              'Venture Building', 'Fundraising', 'Technology Development'
            ].map(expert => {
              const isChecked = selectedExpertise.includes(expert);
              const isDisabled = !isChecked && selectedExpertise.length >= 5;
              
              return (
                <label key={expert} className={`flex items-center gap-2 cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input 
                    type="checkbox" 
                    value={expert} 
                    {...register('functionalExpertise')}
                    disabled={isDisabled}
                    className="w-4 h-4 rounded border-[var(--sp-accent)]/30 text-[var(--sp-accent)] focus:ring-[var(--sp-accent)]/50 bg-transparent disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{expert}</span>
                </label>
              );
            })}
          </div>
          {errors.functionalExpertise && <p className="text-red-400 text-xs mt-1">{errors.functionalExpertise.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Current Employment Status</label>
          <select {...register('employmentStatus')} className="input-glass w-full appearance-none">
            <option value="Employed (Full-time)">Employed (Full-time)</option>
            <option value="Employed (Part-time)">Employed (Part-time)</option>
            <option value="Entrepreneur">Entrepreneur</option>
            <option value="Consultant">Consultant</option>
            <option value="In Transition">In Transition</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Current Organisation (Optional)</label>
          <input
            {...register('currentOrganisation')}
            className="input-glass w-full"
            placeholder="Enter organisation name"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Brief Professional Bio (150–250 words)</label>
          <textarea
            {...register('bio')}
            className="input-glass w-full min-h-[150px] py-4"
            placeholder="Describe your professional journey, key achievements, and what drives you..."
          />
          {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
        </div>
      </div>
    </div>
  );
};

export const AreasOfInterest = ({ register, errors }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-4">
      <label className="text-[var(--text-secondary)] text-sm block ml-1">How would you like to engage? (Select all that apply)</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 glass-light p-4 rounded-xl border border-[var(--sp-accent)]/10">
        {[
          'Short-term paid projects', 'Institutional consulting', 'SME advisory', 
          'Venture co-creation', 'Mentorship', 'Research collaborations', 'Investment opportunities'
        ].map(type => (
          <label key={type} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--sp-accent)]/5 transition-colors cursor-pointer border border-transparent hover:border-[var(--sp-accent)]/10">
            <input 
              type="checkbox" 
              value={type} 
              {...register('engagementTypes')}
              className="w-5 h-5 rounded border-[var(--sp-accent)]/30 text-[var(--sp-accent)] focus:ring-[var(--sp-accent)]/50 bg-transparent"
            />
            <span className="text-[var(--text-secondary)]">{type}</span>
          </label>
        ))}
      </div>
      {errors.engagementTypes && <p className="text-red-400 text-xs mt-1">{errors.engagementTypes.message}</p>}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Availability</label>
        <select {...register('availability')} className="input-glass w-full appearance-none">
          <option value="5 hours/week">5 hours/week</option>
          <option value="5–10 hours/week">5–10 hours/week</option>
          <option value="10+ hours/week">10+ hours/week</option>
          <option value="Full time">Full time</option>
          <option value="Project-based only">Project-based only</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Preferred Engagement Format</label>
        <select {...register('preferredFormat')} className="input-glass w-full appearance-none">
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="In-person">In-person</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>
    </div>
  </div>
);

export const PremiumDetails = ({ register, control }: StepProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languagesSpoken" as any
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--sp-accent)]" />
          Quantifiable Achievements
        </label>
        <textarea
          {...register('keyAchievements')}
          className="input-glass w-full min-h-[120px]"
          placeholder="e.g. 'Scaled SME revenue by 40% YoY' or 'Led 10+ cross-country policy implementations'..."
        />
        <p className="text-[10px] text-[var(--text-secondary)] italic">Focus on measurable impact and results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium">Industry Sub-Specialisation</label>
          <input
            {...register('industrySubSpecialization')}
            className="input-glass w-full"
            placeholder="e.g. FinTech Data Strategy"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium">Compensation Expectation</label>
          <select {...register('compensationExpectation')} className="input-glass w-full appearance-none">
            <option value="Pro-bono">Pro-bono</option>
            <option value="Below market (impact driven)">Below market (impact driven)</option>
            <option value="Market rate">Market rate</option>
            <option value="Premium rate">Premium rate</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium flex items-center gap-2">
          <Globe size={16} className="text-[var(--sp-accent)]" />
          Languages & Proficiency
        </label>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex-1 relative">
                <input
                  {...register(`languagesSpoken.${index}.lang` as any)}
                  placeholder="Language (e.g. Swahili)"
                  className="input-glass w-full"
                />
              </div>
              <select 
                {...register(`languagesSpoken.${index}.level` as any)}
                className="input-glass w-32 appearance-none"
              >
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove Language"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ lang: '', level: 'Intermediate' })}
            className="w-full py-3 rounded-xl border border-dashed border-[var(--sp-accent)]/30 text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            Add Language
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium flex items-center gap-2">
          <Target size={16} className="text-[var(--sp-accent)]" />
          Preferred Project Types
        </label>
        <div className="grid grid-cols-2 gap-3 glass-light p-4 rounded-xl border border-[var(--sp-accent)]/10">
          {['Advisory', 'Interim Executive', 'Venture Partner', 'Board Advisor'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                value={type} 
                {...register('preferredProjectType')}
                className="w-4 h-4 rounded border-[var(--sp-accent)]/30 text-[var(--sp-accent)] focus:ring-[var(--sp-accent)]/50 bg-transparent"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContributionValue = ({ register, errors, control }: StepProps) => {
  const workedWithSmes = useWatch({ control, name: 'workedWithSmes' });
  const profileType = useWatch({ control, name: 'profileType' });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">What specific skills can you offer? (Bullet points encouraged)</label>
        <textarea
          {...register('specificSkills')}
          className="input-glass w-full min-h-[120px]"
          placeholder="- High-level policy design\n- Financial modelling\n- Team leadership..."
        />
        {errors.specificSkills && <p className="text-red-400 text-xs mt-1">{errors.specificSkills.message}</p>}
      </div>

      {profileType === 'Premium (Verified)' && (
        <div className="space-y-4 animate-in zoom-in-95 duration-500">
          <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium flex items-center gap-2">
             <Heart size={16} className="text-[var(--sp-accent)]" />
             SDG Alignment (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education', 
              'Gender Equality', 'Clean Water', 'Affordable Energy', 'Decent Work',
              'Industry & Innovation', 'Reduced Inequalities', 'Sustainable Cities'
            ].map(sdg => (
              <label key={sdg} className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-white/5 hover:border-[var(--sp-accent)]/30 transition-all cursor-pointer">
                <input 
                  type="checkbox" value={sdg} {...register('sdgAlignment')}
                  className="w-3 h-3 rounded border-[var(--sp-accent)]/30 text-[var(--sp-accent)] bg-transparent"
                />
                <span className="text-[10px] text-[var(--text-secondary)] truncate">{sdg}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">What problems are you most passionate about solving?</label>
        <textarea
          {...register('passionateProblems')}
          className="input-glass w-full min-h-[120px]"
          placeholder="Explain the local or global challenges you're motivated to tackle..."
        />
        {errors.passionateProblems && <p className="text-red-400 text-xs mt-1">{errors.passionateProblems.message}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between glass-light p-4 rounded-xl border border-[var(--sp-accent)]/10">
          <span className="text-[var(--text-secondary)]">Have you worked with SMEs, governments, or NGOs before?</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('workedWithSmes')} className="sr-only peer" />
            <div className="w-11 h-6 bg-[var(--bg-secondary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--sp-accent)]"></div>
          </label>
        </div>

        {workedWithSmes && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <textarea
              {...register('smeDescription')}
              className="input-glass w-full min-h-[100px]"
              placeholder="Briefly describe your experience..."
            />
          </div>
        )}

        <div className="flex items-center justify-between glass-light p-4 rounded-xl border border-[var(--sp-accent)]/10">
          <span className="text-[var(--text-secondary)]">Are you open to cross-sector collaboration?</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('crossSectorCollaboration')} className="sr-only peer" />
            <div className="w-11 h-6 bg-[var(--bg-secondary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--sp-accent)]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export const IncomeVenture = ({ register }: StepProps) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-4">
      <label className="text-[var(--text-secondary)] text-sm block ml-1">Are you seeking additional income opportunities?</label>
      <div className="grid grid-cols-3 gap-4">
        {['Yes actively', 'Yes selectively', 'No'].map((val) => (
          <label key={val} className="cursor-pointer group">
            <input type="radio" value={val} {...register('seekingIncome')} className="sr-only peer" />
            <div className="p-4 rounded-xl border border-[var(--sp-accent)]/20 text-center transition-all peer-checked:bg-[var(--sp-accent)]/20 peer-checked:border-[var(--sp-accent)] text-[var(--text-secondary)] peer-checked:text-[var(--sp-accent)] group-hover:bg-white/5">
              {val}
            </div>
          </label>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <label className="text-[var(--text-secondary)] text-sm block ml-1">Are you interested in starting or joining a venture?</label>
      <div className="grid grid-cols-3 gap-4">
        {['Yes', 'Maybe', 'No'].map((val) => (
          <label key={val} className="cursor-pointer group">
            <input type="radio" value={val} {...register('ventureInterest')} className="sr-only peer" />
            <div className="p-4 rounded-xl border border-[var(--sp-accent)]/20 text-center transition-all peer-checked:bg-[var(--sp-accent)]/20 peer-checked:border-[var(--sp-accent)] text-[var(--text-secondary)] peer-checked:text-[var(--sp-accent)] group-hover:bg-white/5">
              {val}
            </div>
          </label>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <label className="text-[var(--text-secondary)] text-sm block ml-1">Are you an investor or interested in investment opportunities?</label>
      <div className="grid grid-cols-3 gap-4">
        {['Yes', 'No', 'Possibly in future'].map((val) => (
          <label key={val} className="cursor-pointer group">
            <input type="radio" value={val} {...register('investorInterest')} className="sr-only peer" />
            <div className="p-4 rounded-xl border border-[var(--sp-accent)]/20 text-center transition-all peer-checked:bg-[var(--sp-accent)]/20 peer-checked:border-[var(--sp-accent)] text-[var(--text-secondary)] peer-checked:text-[var(--sp-accent)] group-hover:bg-white/5">
              {val}
            </div>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export const UserCategorySelection = ({ register, errors }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 gap-4">
      <label className="text-[var(--text-secondary)] text-sm block ml-1">Which category best describes you?</label>
      {[
        { 
          id: 'Study-Abroad Returnee (Recent Graduate)', 
          title: 'Study-Abroad Returnee', 
          desc: 'Completed degree/diploma abroad and recently returned to Kenya.' 
        },
        { 
          id: 'Diaspora Returnee (Professional)', 
          title: 'Diaspora Returnee', 
          desc: 'Studied/worked abroad for a significant period and relocated back.' 
        },
        { 
          id: 'Diaspora Expert (Still Abroad)', 
          title: 'Diaspora Expert', 
          desc: 'Currently abroad but looking to engage remotely or participate in projects.' 
        },
      ].map((cat) => (
        <label key={cat.id} className="cursor-pointer group">
          <input type="radio" value={cat.id} {...register('userCategory')} className="sr-only peer" />
          <div className="p-5 rounded-2xl border border-[var(--sp-accent)]/20 transition-all peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] group-hover:bg-white/5">
            <div className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--sp-accent)] transition-colors">{cat.title}</div>
            <div className="text-sm text-[var(--text-secondary)]">{cat.desc}</div>
          </div>
        </label>
      ))}
      {errors.userCategory && <p className="text-red-400 text-xs mt-1">{errors.userCategory.message}</p>}
    </div>
  </div>
);

export const VerificationCredits = ({ register, errors, control, setValue }: StepProps) => {
  const userCategory = useWatch({ control, name: 'userCategory' });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (file: File, fieldName: string) => {
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    setUploaded(prev => ({ ...prev, [fieldName]: false }));
    try {
      const result = await uploadFile(file, 'verification');
      setValue?.(fieldName as any, result.url, { shouldValidate: true, shouldDirty: true });
      toast.success('File uploaded successfully!');
      setUploaded(prev => ({ ...prev, [fieldName]: true }));
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const renderUploadField = (name: keyof OnboardingData, label: string, description: string) => {
    const currentValue = (control as any)?._formValues?.[name] as string | undefined;
    const { onChange, ...rest } = register(name as any);
    return (
    <div className="space-y-2 mb-4 text-left">
      <label className="text-[var(--text-secondary)] text-sm block ml-1 font-medium">{label}</label>
      <div className="relative group">
        <input
          {...rest}
            className="input-glass w-full pl-10 pr-24 h-12 flex items-center"
            placeholder="Enter document URL (e.g. Google Drive/Dropbox)"
            defaultValue={currentValue || ''}
            onChange={(e) => {
              onChange(e);
              setUploaded(prev => ({ ...prev, [name as string]: false }));
            }}
          />
        <Upload size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, name as string);
            }}
          />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/20 transition-all text-xs font-medium">
            {uploading[name as string] ? (
              <div className="w-3 h-3 border-2 border-[var(--sp-accent)]/30 border-t-[var(--sp-accent)] rounded-full animate-spin" />
            ) : (
              <>
                <Camera size={14} /><span className="hidden sm:inline">Upload</span>
              </>
            )}
          </div>
        </label>
      </div>
      {uploaded[name as string] && (
        <p className="text-[10px] text-green-400 ml-1 font-semibold">Upload</p>
      )}
      <p className="text-[10px] text-[var(--text-secondary)] ml-1 italic">{description}</p>
    </div>
  );};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/20 rounded-2xl">
        <h4 className="text-[var(--text-primary)] font-semibold mb-2 text-center">Document Uploads</h4>
        <p className="text-[var(--text-secondary)] text-sm mb-6 text-center">
          Please provide secure cloud storage links (e.g. Google Drive/Dropbox) to the required documents below. Ensure they are accessible to our admin team.
        </p>

        <div className="space-y-4">
          {/* Identity Proof (Required for all) */}
          {renderUploadField(
            'identityProofUrl', 
            'Identity & Passport Proof *', 
            'Kenyan passport (ID page) or National ID to confirm nationality.',
            control?._formValues ? (name: string, value: any) => control._formValues[name] = value : () => {}
          )}

          {/* Category specific fields */}
          {userCategory === 'Study-Abroad Returnee (Recent Graduate)' && (
            renderUploadField(
              'academicProofUrl', 
              'Academic Verification *', 
              'Degree certificate, transcript, or graduation letter.',
              control?._formValues ? (name: string, value: any) => control._formValues[name] = value : () => {}
            )
          )}

          {userCategory === 'Diaspora Returnee (Professional)' && (
            <>
              {renderUploadField(
                'employmentProofUrl', 
                'Employment Verification', 
                'Contract from foreign employer, reference letter, or payslips.',
                control?._formValues ? (name: string, value: any) => control._formValues[name] = value : () => {}
              )}
              {renderUploadField(
                'residencyProofUrl', 
                'Residency Proof', 
                'Visa, work permit, or immigration stamp history.',
                control?._formValues ? (name: string, value: any) => control._formValues[name] = value : () => {}
              )}
            </>
          )}

          {userCategory === 'Diaspora Expert (Still Abroad)' && (
            renderUploadField(
              'professionalProofUrl', 
              'Professional Proof', 
              'LinkedIn profile, business registration, or professional certification.',
              control?._formValues ? (name: string, value: any) => control._formValues[name] = value : () => {}
            )
          )}
        </div>

        <div className="mt-8 p-4 glass-light rounded-xl border border-[var(--sp-accent)]/10">
          <h5 className="text-xs font-bold text-[var(--sp-accent)] uppercase tracking-wider mb-2">Data Protection & Trust</h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            Strategic Pathways complies with the Kenya Data Protection Act (2019). Your documents are stored securely and visibility is limited strictly to administrators for verification purposes only.
          </p>
        </div>
        
        <label className="flex items-center justify-center gap-3 p-4 mt-6 glass-light rounded-xl cursor-pointer group hover:bg-[var(--sp-accent)]/5 transition-all">
          <input 
            type="checkbox" 
            {...register('consentToVerification')}
            className="w-5 h-5 rounded border-[var(--sp-accent)]/30 text-[var(--sp-accent)] focus:ring-[var(--sp-accent)]/50 bg-transparent"
          />
          <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            I agree that Strategic Pathways may verify my professional background.
          </span>
        </label>
        {errors.consentToVerification && <p className="text-red-400 text-xs mt-2 text-center">{errors.consentToVerification.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Professional References (Optional)</label>
        <textarea
          {...register('references')}
          className="input-glass w-full min-h-[100px]"
          placeholder="Name, Position, Contact Information..."
        />
      </div>
    </div>
  );
};

export const CommunityVisibility = ({ register }: StepProps) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between glass-light p-5 rounded-2xl border border-[var(--sp-accent)]/10 group hover:border-[var(--sp-accent)]/30 transition-all">
      <div className="flex items-center gap-4">
        <Award size={24} className="text-[var(--sp-accent)]" />
        <div>
          <h4 className="text-[var(--text-primary)] font-medium">Member Spotlights</h4>
          <p className="text-[var(--text-secondary)] text-xs">Open to being featured in platform success stories</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" {...register('openToSpotlight')} className="sr-only peer" />
        <div className="w-11 h-6 bg-[var(--bg-secondary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--sp-accent)]"></div>
      </label>
    </div>

    <div className="flex items-center justify-between glass-light p-5 rounded-2xl border border-[var(--sp-accent)]/10 group hover:border-[var(--sp-accent)]/30 transition-all">
      <div className="flex items-center gap-4">
        <Heart size={24} className="text-[var(--sp-accent)]" />
        <div>
          <h4 className="text-[var(--text-primary)] font-medium">Mentorship</h4>
          <p className="text-[var(--text-secondary)] text-xs">Interested in mentoring others in the network</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" {...register('wouldLikeToMentor')} className="sr-only peer" />
        <div className="w-11 h-6 bg-[var(--bg-secondary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--sp-accent)]"></div>
      </label>
    </div>

    <div className="space-y-4 pt-4">
      <label className="text-[var(--text-secondary)] text-sm block ml-1">Would you be interested in serving as a community ambassador?</label>
      <div className="grid grid-cols-3 gap-4">
        {['Yes', 'Maybe', 'No'].map((val) => (
          <label key={val} className="cursor-pointer group">
            <input type="radio" value={val} {...register('communityAmbassador')} className="sr-only peer" />
            <div className="p-4 rounded-xl border border-[var(--sp-accent)]/20 text-center transition-all peer-checked:bg-[var(--sp-accent)]/20 peer-checked:border-[var(--sp-accent)] text-[var(--text-secondary)] peer-checked:text-[var(--sp-accent)] group-hover:bg-white/5">
              {val}
            </div>
          </label>
        ))}
      </div>
    </div>
  </div>
);
