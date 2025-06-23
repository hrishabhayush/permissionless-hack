import ShoesBagsPage from './pages/ShoesBagsPage'

function ShoesBagsApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Shoes & Bags Reviews Hub
            </h1>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <ShoesBagsPage />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Shoes & Bags Reviews Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default ShoesBagsApp 