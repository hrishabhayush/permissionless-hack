import React from 'react';
import LatestTransactions from './LatestTransactions';

const BagsApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Handbags Reviews Hub</h1>
          <p className="mt-2 text-lg text-gray-600">Your trusted source for handbag reviews and recommendations.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Latest Handbag Reviews</h2>
        <div className="space-y-12">
          <article className="prose lg:prose-xl">
            <h3>Classic Leather Tote</h3>
            <p>The Classic Leather Tote is a timeless piece that combines elegance with practicality. Made from genuine full-grain leather, it's designed to withstand daily use while developing a beautiful patina over time. Its spacious interior includes multiple pockets for organization, making it perfect for work or weekend outings. We were impressed by its durable construction and high-quality hardware.</p>
            <a href="#" className="text-blue-600 hover:underline">Read the full review...</a>
          </article>
          <article className="prose lg:prose-xl">
            <h3>The Adventure Backpack</h3>
            <p>For those who need a versatile and durable bag, the Adventure Backpack is an excellent choice. It features a water-resistant exterior, padded laptop compartment, and numerous pockets for all your gear. We tested it on a weekend hiking trip and found it to be comfortable to carry, even when fully loaded. The thoughtful design and rugged materials make it a top contender for travel and outdoor activities.</p>
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

export default BagsApp; 