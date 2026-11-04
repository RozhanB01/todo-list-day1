export interface SessionUser {
  id: string
  email: string
  displayName: string
  role: 'READER' | 'ADMIN'
}

export interface GenreRef {
  slug: string
  name: string
  icon: string
}

export interface Genre extends GenreRef {
  description?: string | null
  novelCount: number
}

export interface ChapterRef {
  id: string
  slug: string
  title: string
  summary: string | null
  number: number
  wordCount: number
  readingMinutes: number
  publishedAt: string | null
}

export interface Novel {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  contentWarning: string | null
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED'
  coverImageUrl: string | null
  coverPalette: string
  coverMotif: string
  readingMinutes: number
  totalWords: number
  featured: boolean
  featuredNote: string | null
  moods: string[]
  isDemo: boolean
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  updatedAt: string | null
  genres: GenreRef[]
  chapters: ChapterRef[]
  chapterCount: number
  latestChapter: ChapterRef | null
  favoriteCount: number
  viewCount: number
}

export interface LatestChapter {
  id: string
  slug: string
  title: string
  number: number
  publishedAt: string | null
  readingMinutes: number
  novel: {
    slug: string
    title: string
    coverPalette: string
    coverMotif: string
    coverImageUrl: string | null
  }
}

export interface HomePayload {
  novels: Novel[]
  allPublishedCount: number
  latestChapters: LatestChapter[]
  featured: Novel | null
  genres: Genre[]
  moods: Array<{ key: string; label: string; count: number }>
  stats: { novels: number; chapters: number; words: number }
}

export interface NovelDetailPayload {
  novel: Novel
  related: Novel[]
}

export interface ChapterPayload {
  novel: {
    id: string
    slug: string
    title: string
    subtitle: string | null
    coverPalette: string
    coverMotif: string
    coverImageUrl: string | null
    chapterCount: number
    contentWarning: string | null
  }
  chapter: {
    id: string
    slug: string
    title: string
    number: number
    contentHtml: string
    wordCount: number
    readingMinutes: number
    publishedAt: string | null
  }
  chapters: Array<{ id: string; slug: string; title: string; number: number }>
  previous: { slug: string; title: string; number: number } | null
  next: { slug: string; title: string; number: number } | null
}

export interface LibraryProgressItem {
  novel: Novel
  chapter: { id: string; slug: string; title: string; number: number } | null
  percent: number
  finished: boolean
  updatedAt: string
}

export interface LibraryPayload {
  reading: LibraryProgressItem[]
  finished: LibraryProgressItem[]
  favorites: Array<{ novel: Novel; createdAt: string }>
  bookmarks: Array<{
    id: string
    note: string | null
    createdAt: string
    chapter: { slug: string; title: string; number: number }
    novel: {
      id: string
      slug: string
      title: string
      coverPalette: string
      coverMotif: string
      coverImageUrl: string | null
    } | null
  }>
  lastRead: {
    novelSlug: string
    novelTitle: string
    chapterSlug: string | null
    chapterTitle: string | null
    percent: number
  } | null
}
