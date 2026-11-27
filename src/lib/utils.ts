import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return formatDate(date)
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const CURRICULUM_OPTIONS = [
  { value: 'merdeka', label: 'Kurikulum Merdeka' },
  { value: 'ktsp', label: 'KTSP' },
  { value: 'cambridge', label: 'Cambridge' },
  { value: 'ib', label: 'International Baccalaureate' },
] as const

export const GRADE_OPTIONS = [
  'TK A', 'TK B',
  '1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD',
  '7 SMP', '8 SMP', '9 SMP',
  '10 SMA', '11 SMA', '12 SMA',
  '10 SMK', '11 SMK', '12 SMK',
] as const

export const SUBJECT_OPTIONS = [
  'Pendidikan Agama', 'Pendidikan Pancasila', 'Bahasa Indonesia',
  'Matematika', 'IPA', 'IPS', 'PJOK', 'Seni Budaya',
  'Bahasa Inggris', 'Informatika', 'PKN', 'Sejarah',
  'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Sosiologi',
  'Geografi', 'Bahasa Daerah', 'Muatan Lokal',
] as const

export const OUTPUT_TYPES = [
  { value: 'rpp', label: 'RPP (Rencana Pelaksanaan Pembelajaran)', icon: 'file-text' },
  { value: 'slide', label: 'Slide Presentasi', icon: 'presentation' },
  { value: 'soal', label: 'Bank Soal & Kuis', icon: 'help-circle' },
  { value: 'lks', label: 'LKS (Lembar Kerja Siswa)', icon: 'clipboard' },
  { value: 'rubrik', label: 'Rubrik Penilaian', icon: 'check-square' },
  { value: 'media', label: 'Media Pembelajaran', icon: 'image' },
  { value: 'remedial', label: 'Program Remedial', icon: 'rotate-ccw' },
  { value: 'enrichment', label: 'Program Pengayaan', icon: 'star' },
] as const
