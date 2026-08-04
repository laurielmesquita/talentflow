import { describe, it, expect } from 'vitest';
import type { Job, Candidate } from '@/types';

describe('Frontend Domain Types', () => {
  it('should validate Job interface properties', () => {
    const job: Job = {
      id: 'job-123',
      title: 'Engenheiro de Software Senior',
      description: 'Liderar desenvolvimento full-stack',
      location: 'São Paulo (Híbrido)',
      is_active: true,
      slug: 'engenheiro-de-software-senior',
    };

    expect(job.id).toBe('job-123');
    expect(job.title).toBe('Engenheiro de Software Senior');
    expect(job.is_active).toBe(true);
    expect(job.slug).toBe('engenheiro-de-software-senior');
  });

  it('should validate Candidate interface properties with quality score', () => {
    const candidate: Candidate = {
      id: 'cand-456',
      full_name: 'Lauriel Mesquita',
      email: 'lauriel@spacesquare.com',
      categories: ['Engenharia', 'Gestão'],
      skills: ['Python', 'FastAPI', 'Next.js', 'TypeScript'],
      quality_score: 98,
      quality_tier: 'high',
      original_pdf_url: 'https://cloudinary.com/raw/test.pdf',
      summary: 'Fundador e Diretor Tecnológico da Space Square.',
    };

    expect(candidate.id).toBe('cand-456');
    expect(candidate.quality_score).toBe(98);
    expect(candidate.quality_tier).toBe('high');
    expect(candidate.original_pdf_url).toBe('https://cloudinary.com/raw/test.pdf');
    expect(candidate.summary).toContain('Space Square');
  });
});
