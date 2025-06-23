import React, { useEffect } from "react";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from "lucide-react";

interface TweetProps {
  author: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  verified?: boolean;
}

interface CommentProps {
  author: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

declare global {
  interface Window {
    twttr: any;
  }
}

interface RealTweetProps {
  tweetId: string;
  theme?: 'light' | 'dark';
  width?: number;
}

const RealTweet: React.FC<RealTweetProps> = ({ 
  tweetId, 
  theme = 'light',
  width = 550 
}) => {
  useEffect(() => {
    // Load Twitter widgets script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
      
      script.onload = () => {
        if (window.twttr) {
          window.twttr.widgets.load();
        }
      };
    } else {
      // If script is already loaded, just reload widgets
      window.twttr.widgets.load();
    }
  }, [tweetId]);

  return (
    <div className="twitter-tweet-container">
      <blockquote className="twitter-tweet" data-theme={theme} data-width={width}>
        <a href={`https://twitter.com/x/status/${tweetId}`}>Loading tweet...</a>
      </blockquote>
    </div>
  );
};

const Tweet: React.FC<TweetProps> = ({
  author,
  username,
  avatar,
  content,
  timestamp,
  likes,
  retweets,
  comments,
  verified = false
}) => (
  <div className="border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
    <div className="flex space-x-3">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
        {avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-bold text-gray-900 dark:text-white">{author}</h4>
          {verified && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>}
          <span className="text-gray-500">@{username}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500">{timestamp}</span>
          <MoreHorizontal className="w-4 h-4 text-gray-500 ml-auto cursor-pointer hover:text-gray-700" />
        </div>
        <p className="mt-2 text-gray-900 dark:text-white">{content}</p>
        <div className="flex items-center justify-between mt-4 max-w-md">
          <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-500 group">
            <MessageCircle className="w-5 h-5 group-hover:bg-blue-100 group-hover:rounded-full p-1 w-8 h-8 transition-all" />
            <span className="text-sm">{comments}</span>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer hover:text-green-500 group">
            <Repeat2 className="w-5 h-5 group-hover:bg-green-100 group-hover:rounded-full p-1 w-8 h-8 transition-all" />
            <span className="text-sm">{retweets}</span>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer hover:text-red-500 group">
            <Heart className="w-5 h-5 group-hover:bg-red-100 group-hover:rounded-full p-1 w-8 h-8 transition-all" />
            <span className="text-sm">{likes}</span>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-500 group">
            <Share className="w-5 h-5 group-hover:bg-blue-100 group-hover:rounded-full p-1 w-8 h-8 transition-all" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Comment: React.FC<CommentProps> = ({
  author,
  username,
  avatar,
  content,
  timestamp,
  likes
}) => (
  <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-6 mt-4">
    <div className="flex space-x-3">
      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h5 className="font-semibold text-gray-900 dark:text-white">{author}</h5>
          <span className="text-gray-500 text-sm">@{username}</span>
          <span className="text-gray-500 text-sm">·</span>
          <span className="text-gray-500 text-sm">{timestamp}</span>
        </div>
        <p className="mt-1 text-gray-900 dark:text-white">{content}</p>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-1 cursor-pointer hover:text-red-500">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{likes}</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Reply</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface TwitterEmbedProps {
  embedHtml: string;
}

const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ embedHtml }) => {
  useEffect(() => {
    // Load Twitter widgets script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
      
      script.onload = () => {
        if (window.twttr) {
          window.twttr.widgets.load();
        }
      };
    } else {
      // If script is already loaded, just reload widgets
      window.twttr.widgets.load();
    }
  }, [embedHtml]);

  return (
    <div 
      className="twitter-embed-container overflow-hidden"
      dangerouslySetInnerHTML={{ __html: embedHtml }}
    />
  );
};

interface TwitterFeedProps {
  embedCodes?: string[];
  title?: string;
  subtitle?: string;
}

export function TweetInteractions({ 
  embedCodes = [
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">ChatGPT used your content. Someone made a purchase. You earned nothing. Requity fixes that. <a href="https://twitter.com/Permissionless?ref_src=twsrc%5Etfw">@Permissionless</a> <a href="https://twitter.com/cracked_labs?ref_src=twsrc%5Etfw">@cracked_labs</a> <a href="https://twitter.com/PayPal?ref_src=twsrc%5Etfw">@PayPal</a> <a href="https://twitter.com/SUPRA_Labs?ref_src=twsrc%5Etfw">@SUPRA_Labs</a> <a href="https://twitter.com/NodeOpsHQ?ref_src=twsrc%5Etfw">@NodeOpsHQ</a> <a href="https://twitter.com/Blockworks_?ref_src=twsrc%5Etfw">@Blockworks_</a> <a href="https://twitter.com/hashtag/OpenAI?src=hash&amp;ref_src=twsrc%5Etfw">#OpenAI</a> <a href="https://t.co/oavqMJsAWQ">pic.twitter.com/oavqMJsAWQ</a></p>&mdash; MoonTrips 🤝🧠 (@moontripss) <a href="https://twitter.com/moontripss/status/1937266902214344949?ref_src=twsrc%5Etfw">June 23, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Builders gonna build 🛠️ <a href="https://t.co/he8x1ZwJdg">pic.twitter.com/he8x1ZwJdg</a></p>&mdash; MoonTrips 🤝🧠 (@moontripss) <a href="https://twitter.com/moontripss/status/1937139878765936707?ref_src=twsrc%5Etfw">June 23, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Get paid with <span style="color: var(--rk-colors-accentColor); font-weight: bold;">one line of code</span> 🫡</p>&mdash; Hrishabh Ayush (@hrishabhayush) <a href="https://twitter.com/hrishabhayush/status/1937267464817020994?ref_src=twsrc%5Etfw">June 23, 2025</a></blockquote>`
  ],
  title = "Twitter Feed",
  subtitle = "See what people are saying about Requity"
}: TwitterFeedProps) {
  return (
    <div className="w-full max-w-7xl mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {subtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {embedCodes.map((embedCode, index) => (
          <div key={index} className="flex justify-center items-start h-[600px]">
            <TwitterEmbed embedHtml={embedCode} />
          </div>
        ))}
      </div>
    </div>
  );
} 