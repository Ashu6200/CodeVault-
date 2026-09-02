'use client';

import { useGetWorkspaceMembersQuery, useSendInviteMutation, useUpdateMemberRoleMutation } from '@/features/workspace/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MembersPage() {
  const workspaceId = 'default-workspace-id';
  const { data: members, isLoading } = useGetWorkspaceMembersQuery(workspaceId);
  const [sendInvite] = useSendInviteMutation();
  const [updateRole] = useUpdateMemberRoleMutation();

  const handleInvite = async () => {
    const email = window.prompt('Member Email');
    if (email) {
      await sendInvite({ workspaceId, email, role: 'MEMBER' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <ShieldAlert className="h-3 w-3 text-red-500" />;
      case 'ADMIN': return <ShieldCheck className="h-3 w-3 text-blue-500" />;
      default: return <Shield className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage roles and permissions for your workspace team.</p>
        </div>
        <Button onClick={handleInvite}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">User</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Role</th>
              <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border w-fit bg-muted/50 text-[10px] font-bold uppercase tracking-wider">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                      Change Role
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateRole({ workspaceId, memberId: member.id, role: 'ADMIN' })}>
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole({ workspaceId, memberId: member.id, role: 'MEMBER' })}>
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Remove from Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
