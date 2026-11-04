import { Component, type ErrorInfo, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/Home'
import { NovelsPage } from './pages/Novels'
import { NovelDetailPage } from './pages/NovelDetail'
import { ReaderPage } from './pages/Reader'
import { LibraryPage } from './pages/Library'
import { GenresPage } from './pages/Genres'
import { LatestPage } from './pages/Latest'
import { LoginPage, RegisterPage } from './pages/Auth'
import { AboutPage, ContactPage, NotFoundPage, PrivacyPage } from './pages/Static'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminNovelsPage } from './pages/admin/NovelsAdmin'
import { AdminNovelEditor } from './pages/admin/NovelEditor'
import { AdminChapterEditor } from './pages/admin/ChapterEditor'
import { MagicalButton } from './components/ui/MagicalButton'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[moonberry]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-parchment px-4">
          <div className="ornament-frame max-w-md rounded-[24px] p-8 text-center">
            <h1 className="font-display text-lg font-bold text-plum">یک چراغ سوخت</h1>
            <p className="mt-2 text-[12.5px] leading-7 text-ink/60">
              چیزی در این صفحه اشتباه شد. یک بار دیگر باز کن؛ اگر تکرار شد، ماجرا را برای نویسنده بنویس.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <MagicalButton href="/" size="sm">بازگشت به خانه</MagicalButton>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/novels" element={<NovelsPage />} />
              <Route path="/novels/:slug" element={<NovelDetailPage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/latest" element={<LatestPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/read/:novelSlug/:chapterSlug" element={<ReaderPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="novels" element={<AdminNovelsPage />} />
              <Route path="novels/new" element={<AdminNovelEditor />} />
              <Route path="novels/:id" element={<AdminNovelEditor />} />
              <Route path="novels/:id/chapters/:chapterId" element={<AdminChapterEditor />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
