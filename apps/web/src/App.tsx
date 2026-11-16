import './App.css'

import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AboutSection } from './components/epk/AboutSection'
import { CartPage } from './components/epk/CartPage'
import { CheckoutPage } from './components/epk/CheckoutPage'
import { ConfirmationPage } from './components/epk/ConfirmationPage'
import { HomeSection } from './components/epk/HomeSection'
import { MerchPage } from './components/epk/MerchPage'
import { MusicPage } from './components/epk/MusicPage'
import { NewsletterSection } from './components/epk/NewsletterSection'
import { ProductPage } from './components/epk/ProductPage'
import { TourPage } from './components/epk/TourPage'
import { VIPPage } from './components/epk/VIPPage'
import { VideoGrid } from './components/epk/VideoGrid'
import { EPKPage } from './pages/EPKPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EPKPage />}>
          <Route index element={<HomeSection />} />
          <Route path="music" element={<MusicPage />} />
          <Route path="videos" element={<VideoGrid />} />
          <Route path="tour" element={<TourPage />} />
          <Route path="vip" element={<VIPPage />} />
          <Route path="merch" element={<MerchPage />} />
          <Route path="merch/:slug" element={<ProductPage />} />
          <Route path="shop" element={<Navigate replace to="/merch" />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
          <Route path="about" element={<AboutSection />} />
          <Route path="newsletter" element={<NewsletterSection />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
