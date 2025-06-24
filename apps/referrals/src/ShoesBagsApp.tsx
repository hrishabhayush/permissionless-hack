import React from 'react';
import LatestTransactions from './LatestTransactions';

const ShoesBagsApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shoes & Bags Reviews Hub</h1>
          <p className="mt-2 text-lg text-gray-600">The best reviews for all your accessory needs.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Latest Reviews</h2>
        <div className="space-y-12">
          <article className="prose lg:prose-xl">
            <h3>The Globetrotter's Duo: All-Terrain Shoes & City Carry-All Bag</h3>
            <p>We review the perfect combination for the modern traveler. The All-Terrain Shoes offer unparalleled comfort and durability, suitable for both urban exploration and light trails. Paired with the City Carry-All, a versatile and stylish bag with ample storage, you're ready for any adventure. We tested this pair on a week-long city trip and were impressed by their performance and cohesive design.</p>
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

export default ShoesBagsApp; 