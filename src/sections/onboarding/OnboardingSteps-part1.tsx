import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { useWatch, useFieldArray } from 'react-hook-form';
import type { OnboardingData } from './schema';
import { User, Mail, Phone, Linkedin, Globe, Briefcase, Award, Heart, Upload, Zap, Shield, Target, TrendingUp, Check, Plus, Trash2, Camera } from 'lucide-react';
import { countries } from '../../data/countries';
import { institutionsByCountry } from '../../data/institutions';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface StepProps {
  register: UseFormRegister<OnboardingData>;
  errors: FieldErrors<OnboardingData>;
  control?: Control<OnboardingData>;
}

export const ProfileTypeSelection = ({ register, errors }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
    <div className="max-w-xl mx-auto space-y-4">
      <h3 className="text-xl font-bold text-[var(--text-primary)]">Select your profile type</h3>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Choose the Standard flow for a quick 5-minute setup, or the Premium flow for high-value consulting opportunities and verification.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="cursor-pointer group relative">
          <input type="radio" value="Standard (MVP)" {...register('profileType')} className="sr-only peer" />
          <div className="p-8 rounded-3xl border border-[var(--sp-accent)]/20 transition-all peer-checked:bg-[var(--sp-accent)]/10 peer-checked:border-[var(--sp-accent)] hover:bg-white/5 flex flex-col items-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
              <Zap size={32} className="text-[var(--sp-accent)]" />
            </div>
            <div className="font-bold text-xl text-[var(--text-primary)] mb-2">Standard MVP</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Lean & Fast. Manual matching support. Perfect for early traction.
            </p>
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
            <div className="font-bold text-xl text-[var(--text-primary)] mb-2">Premium Verified</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Institutional Ready. High-value matching. Verified Professional badge.
            </p>
             <div className="mt-auto pt-6 text-[var(--sp-accent)] text-xs font-bold opacity-0 peer-checked:opacity-100 transition-opacity flex items-center gap-1">
               SELECTED <Check size={14} />
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--sp-accent)] text-[var(--text-inverse)] text-[10px] font-bold rounded-full border border-[var(--sp-accent)] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            RECOMMENDED
          </div>
        </label>
      </div>
      {errors.profileType && <p className="text-red-400 text-xs mt-4">{errors.profileType.message}</p>}
    </div>
  </div>
);

export const BasicInfo = ({ register, errors }: StepProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm block ml-1">Full Name</label>
        <div className="relative">
          <input
            {...register('fullName')}
            className="input-glass w-full pl-10"
            placeholder="Enter your full name"
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
            className="input-glass w-full pl-10"
            placeholder="your@email.com"
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
              <option key={country.code} value={country.code}>
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
        <label className="text-[var(--text-secondary)] text-sm block ml-1">LinkedIn Profile URL</label>
        <div className="relative">
          <input
            {...register('linkedinUrl')}
            className="input-glass w-full pl-10"
            placeholder="https://linkedin.com/in/..."
          />
          <Linkedin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sp-accent)]" />
        </div>
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

export const Education = ({ register, errors, control }: StepProps) => {
  const studyCountry = useWatch({ control, name: 'studyCountry' });
  const highestEducation = useWatch({ control, name: 'highestEducation' });
  const selectedInstitution = useWatch({ control, name: 'institutions' });
  const selectedCountries = useWatch({ control, name: 'otherCountriesWorked' }) || [];

  const availableInstitutions = studyCountry && institutionsByCountry[studyCountry] ? institutionsByCountry[studyCountry] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Highest Level of Education</label>
          <select {...register('highestEducation')} className="input-glass w-full appearance-none">
            <option value="">Select...</option>
            <option value="Bachelor's">Bachelor's</option>
            <option value="Master's">Master's</option>
            <option value="PhD">PhD</option>
            <option value="Professional Certification">Professional Certification</option>
            <option value="Other">Other</option>
          </select>
          {errors.highestEducation && <p className="text-red-400 text-xs mt-1">{errors.highestEducation.message}</p>}
        </div>

        {highestEducation === 'Other' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Please Specify</label>
            <input
              {...register('educationOther')}
              className="input-glass w-full"
              placeholder="Enter your education level"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Country Where You Studied</label>
          <select {...register('studyCountry')} className="input-glass w-full appearance-none">
            <option value="">Select country...</option>
            {countries.map(country => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.studyCountry && <p className="text-red-400 text-xs mt-1">{errors.studyCountry.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Institution Name</label>
          <select 
            {...register('institutions')} 
            className="input-glass w-full appearance-none"
            disabled={!studyCountry}
          >
            <option value="">{studyCountry ? 'Select institution...' : 'Select country first...'}</option>
            {availableInstitutions.map(inst => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
          {errors.institutions && <p className="text-red-400 text-xs mt-1">{errors.institutions.message}</p>}
        </div>

        {selectedInstitution === 'Other' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-[var(--text-secondary)] text-sm block ml-1">Please Specify Institution</label>
            <input
              {...register('institutionOther')}
              className="input-glass w-full"
              placeholder="Enter institution name"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">Field of Study / Specialization</label>
          <input
            {...register('fieldOfStudy')}
            className="input-glass w-full"
            placeholder="e.g. Strategic Management"
          />
          {errors.fieldOfStudy && <p className="text-red-400 text-xs mt-1">{errors.fieldOfStudy.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[var(--text-secondary)] text-sm block ml-1">
            Other Countries Worked In
            <span className="ml-2 text-[var(--sp-accent)] text-xs">({selectedCountries.length} selected)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 glass-light p-4 rounded-xl border border-[var(--sp-accent)]/10 max-h-48 overflow-y-auto">
            {countries.map(country => (
              <label key={country.name} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={country.name} 
                  {...register('otherCountriesWorked')}
                  className="w-4 h-4 rounded border-[var(--sp-accent)]/30 text-[var(--sp-accent)] focus:ring-[var(--sp-accent)]/50 bg-transparent"
                />
                <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{country.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
