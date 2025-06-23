import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ShoesPage from './pages/ShoesPage'
import ShoesGlassesPage from './pages/ShoesGlassesPage'
import GlassesPage from './pages/GlassesPage'
import ShoesBagsPage from './pages/ShoesBagsPage'
import BagsPage from './pages/BagsPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Product Reviews Hub
                </h1>
              </div>
              <div className="flex space-x-6">
                <Link 
                  to="/shoes" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Shoes
                </Link>
                <Link 
                  to="/shoes-glasses" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Shoes & Glasses
                </Link>
                <Link 
                  to="/glasses" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Glasses
                </Link>
                <Link 
                  to="/shoes-bags" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Shoes & Bags
                </Link>
                <Link 
                  to="/bags" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Bags
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<ShoesPage />} />
            <Route path="/shoes" element={<ShoesPage />} />
            <Route path="/shoes-glasses" element={<ShoesGlassesPage />} />
            <Route path="/glasses" element={<GlassesPage />} />
            <Route path="/shoes-bags" element={<ShoesBagsPage />} />
            <Route path="/bags" element={<BagsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">
              © 2024 Product Reviews Hub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App 