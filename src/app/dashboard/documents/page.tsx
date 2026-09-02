'use client';

import { useGetDocumentsQuery, useCreateDocumentMutation } from '@/features/document/api';
import { useGetWorkspacesQuery } from '@/features/workspace/api';
import { Button } from '@/components/ui/button';
import { Plus, FileText, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentsPage() {
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspacesQuery();
  
  // Use the first workspace ID if available, otherwise fallback to a placeholder
  const workspaceId = workspaces?.[0]?.id || 'default-workspace-id';
  
  const { data, isLoading: isLoadingDocuments } = useGetDocumentsQuery(
    { workspaceId },
    { skip: !workspaces?.[0]?.id }
  );
  const [createDocument] = useCreateDocumentMutation();

  const isLoading = isLoadingWorkspaces || isLoadingDocuments;

  const documents = data?.items || [];

  const handleCreate = async () => {
    const title = window.prompt('Document Title', 'Untitled Document');
    if (title) {
      await createDocument({ workspaceId, title });
    }
  };

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and edit your workspace documents.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/dashboard/documents/${doc.id}`}
            className="group flex flex-col gap-2 rounded-xl border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-none">{doc.title}</h3>
              <p className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
        {documents.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">No documents found. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
