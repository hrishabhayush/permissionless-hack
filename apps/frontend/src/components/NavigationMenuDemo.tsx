"use client"

import * as React from "react"
import Link from "next/link"
import { WalletIcon, GlobeIcon, UserIcon, SettingsIcon } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const connectOptions: { title: string; href: string; description: string; icon: React.ReactNode }[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "View your attribution analytics and earnings.",
    icon: <GlobeIcon className="h-4 w-4" />,
  },
  {
    title: "Profile",
    href: "/profile",
    description: "Manage your creator profile and settings.",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Configure your attribution preferences.",
    icon: <SettingsIcon className="h-4 w-4" />,
  },
]

export function NavigationMenuDemo() {
  return (
    <div className="flex justify-end w-full">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="flex flex-row items-center space-x-2">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Connect</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mt-4 mb-2 text-lg font-medium">
                        ReferralBridge
                      </div>
                      <p className="text-muted-foreground text-sm leading-tight">
                        Fair attribution for content creators with automated tracking.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                {connectOptions.map((option) => (
                  <ListItem
                    key={option.title}
                    title={option.title}
                    href={option.href}
                    icon={option.icon}
                  >
                    {option.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/connect-wallet" className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4" />
                Connect Wallet
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

function ListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { 
  href: string; 
  icon?: React.ReactNode;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link 
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2 text-sm leading-none font-medium">
            {icon}
            {title}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
