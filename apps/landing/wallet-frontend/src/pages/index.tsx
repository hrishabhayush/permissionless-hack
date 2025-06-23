import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { BentoDemo } from '../components/BentoDemo';
import { MarqueeDemo } from '../components/MarqueeDemo';
import ParticlesBackground from '../components/ParticlesBackground';

const Home: NextPage = () => {
  return (
    <div className="relative min-h-screen">
      <Head>
        <title>ReferralBridge - Earn Revenue Share</title>
        <meta
          content="ReferralBridge - Fair attribution for content creators with automated tracking"
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
         
         <main className="h-screen flex flex-col justify-center p-4">
           <div className="max-w-7xl mx-auto w-full">
             <div className="text-center mb-8">
               <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                 Welcome to Requity
               </h1>
               <p className="text-lg text-gray-600 dark:text-gray-300">
                 Earn revenue share for your website sources whenever AI uses your content for sales inference
               </p>
             </div>
             
             <div className="flex-1">
               <BentoDemo />
             </div>
           </div>
         </main>
       </div>
    </div>
  );
};

export default Home;
