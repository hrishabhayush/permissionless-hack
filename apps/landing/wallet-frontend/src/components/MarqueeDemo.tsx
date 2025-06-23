import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Alex Chen",
    username: "@alexchen",
    body: "Best wallet experience I've had. Lightning fast transactions and amazing UI.",
    img: "https://avatar.vercel.sh/alexchen",
  },
  {
    name: "Sarah Kim",
    username: "@sarahk",
    body: "Finally, a wallet that doesn't make me feel like I need a PhD in crypto.",
    img: "https://avatar.vercel.sh/sarahk",
  },
  {
    name: "Marcus Johnson",
    username: "@mjohnson",
    body: "The security features are top-notch. I sleep well knowing my assets are safe.",
    img: "https://avatar.vercel.sh/mjohnson",
  },
  {
    name: "Emma Rodriguez",
    username: "@emmar",
    body: "Seamless DeFi integration. Swapping tokens has never been this easy.",
    img: "https://avatar.vercel.sh/emmar",
  },
  {
    name: "David Park",
    username: "@dpark",
    body: "Cross-chain transactions work flawlessly. This is the future of crypto wallets.",
    img: "https://avatar.vercel.sh/dpark",
  },
  {
    name: "Lisa Wang",
    username: "@lisawang",
    body: "The portfolio tracking feature helped me optimize my investments perfectly.",
    img: "https://avatar.vercel.sh/lisawang",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
} 