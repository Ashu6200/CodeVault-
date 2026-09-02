'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Hash,
  Database,
  Activity,
  Plus,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarItemProps {
  name: string;
  href: string;
  icon?: React.ElementType;
  children?: SidebarItemProps[];
}

const navItems: SidebarItemProps[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
    children: [
      { name: 'API Reference', href: '/dashboard/documents/api' },
      { name: 'Guides', href: '/dashboard/documents/guides' },
      { name: 'Architecture', href: '/dashboard/documents/arch' },
    ]
  },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: Activity },
  {
    name: 'Infrastructure',
    href: '/dashboard/infra',
    icon: Database,
    children: [
      { name: 'API Keys', href: '/dashboard/apikey' },
    ]
  },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function NavItem({ item }: { item: SidebarItemProps }) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;
  const isActive = pathname === item.href || (item.children && pathname.startsWith(item.href));
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (hasChildren && isCollapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton tooltip={item.name} isActive={isActive} />}>
            {Icon ? <Icon /> : <Hash />}
            <span>{item.name}</span>
            <ChevronRight className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-48">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
              {item.name}
            </div>
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.name} render={<Link href={child.href} />}>
                <span className={cn(pathname === child.href && "text-iris-violet font-medium")}>
                  {child.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={pathname.startsWith(item.href)} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.name} isActive={isActive} />}>
            {Icon ? <Icon /> : <Hash />}
            <span>{item.name}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children?.map((child) => (
                <SidebarMenuSubItem key={child.name}>
                  <SidebarMenuSubButton
                    render={<Link href={child.href} />}
                    isActive={pathname === child.href}
                  >
                    <span>{child.name}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href} />}
        isActive={pathname === item.href}
        tooltip={item.name}
      >
        {Icon ? <Icon /> : <Hash />}
        <span>{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function Sidebar() {
  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader className="border-b border-graphite h-14 flex items-center px-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight px-2">
          <div className="h-6 w-6 shrink-0 rounded-md bg-iris-violet flex items-center justify-center text-white text-[10px] font-bold">
            CV
          </div>
          <span className="text-sm text-white truncate group-data-[collapsible=icon]:hidden">CodeVault</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-ash-gray">
            <span>Workspace</span>
            <button className="ml-auto p-1 hover:bg-graphite rounded text-ash-gray hover:text-white transition-colors duration-150 group-data-[collapsible=icon]:hidden">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-graphite">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 shrink-0 rounded-full bg-iris-violet/15 flex items-center justify-center text-iris-violet font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-bone-white truncate">John Doe</p>
            <p className="text-[10px] text-iris-violet font-mono truncate">john@example.com</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}
