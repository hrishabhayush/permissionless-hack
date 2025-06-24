import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPaymentPayload, getUserWallet } from './utils/requity-extension'

const bagProducts = [
  { 
    id: 5, 
    name: 'Executive Briefcase', 
    price: 280, 
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop&crop=center',
    description: 'Professional leather briefcase perfect for business meetings and daily commutes.',
    features: ['Genuine leather construction', 'Multiple compartments', 'Laptop sleeve included'],
    rating: 4.7,
    reviews: 89,
    colors: ['Black', 'Brown', 'Cognac'],
    sizes: ['Standard']
  },
  { 
    id: 6, 
    name: 'Urban Backpack', 
    price: 120, 
    originalPrice: 160,
    image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500&h=400&fit=crop&crop=center',
    description: 'Versatile backpack designed for urban adventures and everyday use.',
    features: ['Water-resistant fabric', 'Padded laptop compartment', 'USB charging port'],
    rating: 4.9,
    reviews: 156,
    colors: ['Black', 'Navy', 'Gray'],
    sizes: ['Standard']
  },
  { 
    id: 7, 
    name: 'Weekend Duffel', 
    price: 95, 
    originalPrice: 130,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop&crop=center',
    description: 'Spacious duffel bag ideal for weekend trips and gym sessions.',
    features: ['Durable canvas material', 'Shoe compartment', 'Adjustable shoulder strap'],
    rating: 4.5,
    reviews: 78,
    colors: ['Olive', 'Black', 'Tan'],
    sizes: ['Medium', 'Large']
  },
  { 
    id: 8, 
    name: 'Designer Tote', 
    price: 220, 
    originalPrice: 280,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=400&fit=crop&crop=center',
    description: 'Elegant tote bag that combines style with functionality for the modern professional.',
    features: ['Premium leather finish', 'Interior organizer pockets', 'Magnetic closure'],
    rating: 4.8,
    reviews: 134,
    colors: ['Black', 'Burgundy', 'Camel'],
    sizes: ['Standard']
  },
];

function BagsPage() {
  const [cart, setCart] = useState<{ id: number; name: string; price: number; image: string; }[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [cashbackStatus, setCashbackStatus] = useState<'success' | 'error' | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string>('');

  // Check for wallet on mount and periodically
  useEffect(() => {
    const checkWallet = () => {
      const wallet = getUserWallet();
      setUserWallet(wallet);
    };

    checkWallet();
    
    // Check every 2 seconds for wallet updates from extension
    const interval = setInterval(checkWallet, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product: { id: number; name: string; price: number; image: string; }) => {
    setCart([...cart, product]);
  };

  const cartTotal = cart.reduce((total, product) => total + product.price, 0);

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleCheckout = async () => {
    // Always complete the checkout first
    setCheckoutComplete(true);
    setCart([]);
    setShowCheckout(false);
    
    // Then try the referral payment in the background
    try {
      const paymentPayload = createPaymentPayload('bags');
      
      const response = await fetch('https://referral-production-6dc1.up.railway.app/api/payments/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Cashback payment successful:', result);
        setCashbackStatus('success');
        // Extract transaction signature from the response
        if (result.data && result.data.signature) {
          setTransactionSignature(result.data.signature);
        }
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          console.error('Cashback payment failed:', errorData);
        } catch {
          console.error('Cashback payment failed:', errorText);
        }
        setCashbackStatus('error');
      }
    } catch (error) {
      console.error('Cashback payment API error:', error);
      setCashbackStatus('error');
    }
  };

  if (checkoutComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center text-center">
        <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-md mx-4">
          <div className="mb-6">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Complete!</h1>
            <p className="text-gray-600 text-lg">Thank you for choosing StepUp Bags</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">Your order confirmation has been sent to your email</p>
            
            {/* Cashback Status */}
            {cashbackStatus === null && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg flex items-center text-xs text-yellow-700 animate-pulse">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 01.525 2.925l.005.005L10 7l-1.03.53a1.5 1.5 0 01-1.93-1.93l.005-.005A1.5 1.5 0 0110 3.5zm1.5 11a1.5 1.5 0 01-1.93-1.93l.005-.005L10 12l-.53-1.03a1.5 1.5 0 012.925-.525l.005.005L15 10l-1.03.53a1.5 1.5 0 01-1.97 1.97zM3.5 10a1.5 1.5 0 012.925-.525l.005-.005L7 10l-.53 1.03a1.5 1.5 0 01-1.93 1.93l-.005-.005A1.5 1.5 0 013.5 10z"></path>
                </svg>
                Processing cashback... please wait.
              </div>
            )}
            {cashbackStatus === 'success' && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg text-xs text-green-700">
                <div className="flex items-center mb-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cashback payment successful
                </div>
                {transactionSignature && (
                  <div className="flex items-center text-xs">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <a 
                      href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      View on Solana Explorer
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {cashbackStatus === 'error' && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center text-xs text-red-700">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Cashback payment failed
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setCheckoutComplete(false);
              setCashbackStatus(null);
              setTransactionSignature(null);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 h-fit">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Standard • Black</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">${item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${cartTotal}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${cartTotal}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="John" 
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="john.doe@example.com" 
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="123 Main Street" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input 
                      type="text" 
                      id="city" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="New York" 
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input 
                      type="text" 
                      id="state" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="NY" 
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                    <input 
                      type="text" 
                      id="zip" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="10001" 
                    />
                  </div>
                </div>
              </form>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  ← Back to Shop
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Complete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="bg-gradient-to-r from-amber-600 to-orange-600 p-2 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  StepUp - Bags
                </h1>
                <p className="text-sm text-gray-500">Premium Bags & Accessories</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/shoes" className="text-gray-600 hover:text-blue-600 transition-colors">Shoes</Link>
              <Link to="/bags" className="text-amber-600 font-semibold border-b-2 border-amber-600 pb-1">Bags</Link>
              <Link to="/glasses" className="text-gray-600 hover:text-emerald-600 transition-colors">Glasses</Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Wallet Status Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100">
                <div className={`w-2 h-2 rounded-full ${userWallet ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-600">
                  {userWallet ? 'Wallet Connected' : 'No Wallet'}
                </span>
              </div>
              
              <button
                onClick={() => setShowCheckout(true)}
                className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                disabled={cart.length === 0}
              >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 8M9 21h6" />
                </svg>
                <span className="font-semibold">Cart</span>
              </div>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {cart.length}
                </span>
                                )}
                </button>
              </div>
            </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Carry Your <span className="text-yellow-200">Success</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-orange-100">
            Premium bags designed for the modern lifestyle
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Bags Collection</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carefully curated bags that blend functionality with sophisticated design
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {bagProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Save ${product.originalPrice - product.price}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <div className="flex items-center space-x-1">
                    <StarRating rating={product.rating} />
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{product.description}</p>
                
                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Available Colors:</h4>
                  <div className="flex space-x-2">
                    {product.colors.map((color, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                    <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 px-4 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold mb-4">StepUp Premium Bags</h3>
          <p className="text-gray-400 mb-4">Elevating your style, one bag at a time.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Returns</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BagsPage 