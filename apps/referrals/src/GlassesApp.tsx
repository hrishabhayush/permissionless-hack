import React from 'react';
import LatestTransactions from './LatestTransactions';

const GlassesApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Glasses Reviews Hub</h1>
          <p className="mt-2 text-lg text-gray-600">Find the perfect pair with our expert reviews.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Latest Glasses Reviews</h2>
        <div className="space-y-12">
          <article className="prose lg:prose-xl">
            <h3>The Tech Innovator Frames</h3>
            <p>These frames are a game-changer for anyone who spends hours in front of a screen. Featuring advanced blue light filtering technology and ultra-lightweight materials, they provide exceptional comfort and reduce eye strain. We found the minimalist design to be both stylish and professional, suitable for any setting.</p>
            <a href="#" className="text-blue-600 hover:underline">Read the full review...</a>
          </article>
          <article className="prose lg:prose-xl">
            <h3>Sunset Aviators</h3>
            <p>Combining classic aviator style with superior lens technology, the Sunset Aviators offer 100% UV protection and polarized lenses to reduce glare. The build quality is excellent, with a sturdy yet lightweight frame. They performed exceptionally well in our outdoor tests, providing crystal-clear vision even in bright sunlight.</p>
            <a href="#" className="text-blue-600 hover:underline">Read the full review...</a>
          </article>
        </div>
      </main>

      <footer className="bg-white mt-12 py-8 text-center">
        <div className="container mx-auto px-4">
          {/* <LatestTransactions
            network="devnet"
            filterByTokenMint="CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM"
          /> */}
          <a href="https://explorer.solana.com/address/3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y/tokens?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Transactions on Solana Explorer</a>
        </div>
      </footer>
    </div>
  );
};

export default GlassesApp; 