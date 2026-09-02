'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-graphite bg-void px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="w-full flex-1 md:flex md:justify-center">
        <button 
          onClick={() => {
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              ctrlKey: true,
              bubbles: true
            });
            document.dispatchEvent(event);
          }}
          className="relative flex w-full max-w-sm items-center gap-2 rounded-md border border-graphite bg-transparent px-3 py-1.5 text-sm text-ash-gray hover:border-iron transition-colors duration-150"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left font-mono text-[13px]">Search documentation...</span>
          <div className="flex items-center gap-1 rounded border border-graphite bg-void px-1.5 py-0.5 font-mono text-[10px] font-medium text-ash-gray">
            <span className="text-xs">⌘</span>K
          </div>
        </button>
      </div>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pulse-green"></span>
        <span className="sr-only">Notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full" />
          }
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-iris-violet/15 text-iris-violet text-xs font-bold">U</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
