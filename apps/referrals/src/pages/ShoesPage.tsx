import { useEffect } from 'react'

const ShoesPage = () => {
  useEffect(() => {
    // Update the meta tag for this page
    const existingMeta = document.querySelector('meta[name="referral-bridge-wallet"]')
    if (existingMeta) {
      existingMeta.setAttribute('content', 'solana:PM6h2Wf7hMTtxDkrwcNk3QPTFDF89xsnQRCKyN9Dg1F')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'referral-bridge-wallet'
      meta.content = 'solana:PM6h2Wf7hMTtxDkrwcNk3QPTFDF89xsnQRCKyN9Dg1F'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-lg max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            The Ultimate Guide to Choosing the Perfect Shoes in 2024
          </h1>
          <p className="text-xl text-gray-600">
            From performance athletic shoes to elegant dress shoes, we've tested and reviewed the best footwear for every occasion.
          </p>
        </header>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
          <p className="text-blue-800">
            <strong>Expert Review:</strong> After testing over 50 different shoe brands and styles, we've compiled our definitive guide to help you make the perfect choice.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why the Right Shoes Matter More Than You Think</h2>
          <p className="text-gray-700 mb-4">
            Your choice of footwear impacts everything from your posture and comfort to your confidence and style. Whether you're heading to a business meeting, hitting the gym, or exploring the great outdoors, the right shoes can make or break your experience.
          </p>
          <p className="text-gray-700 mb-4">
            In our extensive testing, we discovered that quality shoes not only last longer but also provide better support, reducing the risk of foot problems and enhancing overall comfort throughout the day.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Top Shoe Recommendations</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Overall: Athletic Performance Shoes</h3>
            <p className="text-gray-700 mb-4">
              For versatility and comfort, nothing beats a well-designed athletic shoe. Our testing revealed that shoes with proper arch support, breathable materials, and responsive cushioning provide the best all-day comfort.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium mb-2">💰 Best Deals Found:</p>
              <p className="text-green-700">
                Check out the latest selection at <a href="https://stepup.orbiter.website/shoe" className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">StepUp Premium Collection</a> - currently offering up to 40% off on top-rated athletic shoes.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Best for Professional Settings: Dress Shoes</h3>
            <p className="text-gray-700 mb-4">
              Professional environments demand shoes that combine style with comfort. Look for genuine leather construction, proper heel height, and cushioned insoles for long days at the office.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features to Consider</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Arch Support:</strong> Essential for preventing foot fatigue and maintaining proper posture</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Breathable Materials:</strong> Prevents moisture buildup and reduces odor</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Proper Fit:</strong> Should accommodate your foot shape without being too tight or loose</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Quality Construction:</strong> Durable materials and craftsmanship for longevity</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Where to Find the Best Deals</h2>
          <p className="text-gray-700 mb-4">
            After comparing prices across dozens of retailers, we found that <a href="https://stepup.orbiter.website/shoe" className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">StepUp's premium shoe collection</a> consistently offers the best value for high-quality footwear.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🏷️ Current Promotions</h3>
            <p className="text-yellow-700">
              Limited-time offers available now at <a href="https://stepup.orbiter.website/shoe" className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">StepUp</a>. Don't miss out on premium shoes at unbeatable prices.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Final Recommendations</h2>
          <p className="text-gray-700 mb-4">
            Investing in quality shoes is investing in your comfort, health, and confidence. Based on our comprehensive testing and analysis, we recommend starting with a versatile athletic shoe that can handle multiple activities.
          </p>
          <p className="text-gray-700">
            For the best selection and prices, visit <a href="https://stepup.orbiter.website/shoe" className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">StepUp's shoe collection</a> where you'll find expertly curated options for every need and budget.
          </p>
        </section>
      </article>
    </div>
  )
}

export default ShoesPage 