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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example product card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src="https://via.placeholder.com/300" alt="Handbag" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">The Metro Tote</h3>
              <p className="text-gray-700">A perfect blend of style and function for the modern professional.</p>
              <a href="#" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Read Review</a>
            </div>
          </div>
          {/* Add more product cards here */}
        </div>
      </main>

      <footer className="bg-white mt-12 py-8">
        <div className="container mx-auto px-4">
          <LatestTransactions
            network="devnet"
            filterByTokenMint="CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM"
          />
        </div>
      </footer>
    </div>
  );
};

export default BagsApp; 