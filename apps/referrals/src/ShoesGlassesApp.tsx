import React from 'react';
import LatestTransactions from './LatestTransactions';

const ShoesGlassesApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shoes & Glasses Reviews Hub</h1>
          <p className="mt-2 text-lg text-gray-600">Style and function, reviewed by experts.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Latest Reviews</h2>
        <div className="space-y-12">
          <article className="prose lg:prose-xl">
            <h3>Complete the Look: The Urban Walker Shoes & Visionary Frames</h3>
            <p>This review covers the ultimate pairing for the style-conscious individual. The Urban Walker shoes provide exceptional comfort for all-day wear, while the Visionary Frames offer a sophisticated look with top-notch lens quality. We explore how these two products complement each other to create a polished and modern aesthetic, perfect for both work and leisure.</p>
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

export default ShoesGlassesApp; 