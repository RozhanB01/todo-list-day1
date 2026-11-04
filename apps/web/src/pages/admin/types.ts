export interface AdminNovelRow {
  id: string
  slug: string
  title: string
  subtitle: string | null
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED'
  coverImageUrl: string | null
  coverPalette: string
  coverMotif: string
  isDemo: boolean
  featured: boolean
  updatedAt: string
  publishedAt: string | null
  moods: string[]
  genres: Array<{ slug: string; name: string }>
  chapterCount: number
  draftCount: number
  views: number
  favorites: number
}

export interface AdminChapter {
  id: string
  novelId: string
  slug: string
  title: string
  summary: string | null
  contentHtml: string
  status: 'DRAFT' | 'PUBLISHED'
  number: number
  wordCount: number
  readingMinutes: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminNovelDetail extends Omit<AdminNovelRow, 'chapterCount' | 'draftCount'> {
  description: string
  contentWarning: string | null
  featuredNote: string | null
  seoTitle: string | null
  seoDescription: string | null
  genreSlugs: string[]
  chapters: AdminChapter[]
}

export interface AdminGenres {
  genres: Array<{ id: string; slug: string; name: string; icon: string }>
  moods: string[]
  palettes: string[]
  motifs: string[]
}
