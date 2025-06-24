import React from 'react';
import LatestTransactions from './LatestTransactions';

const ShoesApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shoes Reviews Hub</h1>
          <p className="mt-2 text-lg text-gray-600">Your ultimate guide to the best footwear.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Latest Shoe Reviews</h2>
        <div className="space-y-12">
          <article className="prose lg:prose-xl">
            <h3>Urban Walker Sneakers</h3>
            <p>The Urban Walker Sneakers are the perfect fusion of style and comfort for city living. With a sleek, modern design and a cushioned sole, they provide all-day comfort without sacrificing looks. We were particularly impressed with the breathable materials and the durable outsole, which offers excellent grip on various surfaces.</p>
            <a href="#" className="text-blue-600 hover:underline">Read the full review...</a>
          </article>
          <article className="prose lg:prose-xl">
            <h3>TrailBlazer Hiking Boots</h3>
            <p>Built for the rugged outdoors, the TrailBlazer Hiking Boots offer superior support and protection. The waterproof membrane keeps your feet dry, while the aggressive tread provides stability on challenging terrain. We put these boots through their paces on a multi-day trek and they exceeded our expectations in both comfort and durability.</p>
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

export default ShoesApp; 