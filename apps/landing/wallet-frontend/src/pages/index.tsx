import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { BentoDemo } from '../components/BentoDemo';
import ParticlesBackground from '../components/ParticlesBackground';
import { WebsiteAttributionTerminal } from '../components/Terminal';
import { TweetInteractions } from '../components/Tweet';

const Home: NextPage = () => {
  return (
    <div className="relative min-h-screen">
      <Head>
        <h1>ReferralBridge - Earn Revenue Share</h1>
        <meta
          content="Earn revenue share when AI crawls your website and there is a sale inference creating a market of embedded finance and AI."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      
             {/* Particles Background */}
       <ParticlesBackground 
         title=""
         subtitle=""
         particleCount={1500}
         className="fixed inset-0 z-0"
       />
       
       {/* Main Content */}
       <div className="relative z-10">
         <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
           <ConnectButton />
         </div>
         
         <main className="min-h-screen flex flex-col p-4 pt-20">
           <div className="max-w-7xl mx-auto w-full">
             <div className="text-center mb-8">
               <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Requity
               </h1>
               <p className="text-lg text-black-600 dark:text-gray-300">
                 Generating revenue for websites with <b style={{ color: 'var(--rk-colors-accentColor)' }}>1 line of code</b>
               </p>
             </div>
             
             <div className="mb-8">
               <BentoDemo />
             </div>
           </div>
           
           <div className="w-full">
             <WebsiteAttributionTerminal />
           </div>
           
           <div className="w-full py-16">
             <TweetInteractions />
           </div>
         </main>
       </div>
    </div>
  );
};

export default Home;
