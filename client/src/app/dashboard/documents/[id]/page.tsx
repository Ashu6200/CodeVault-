'use client';

import { useParams } from 'next/navigation';
import { useGetDocumentQuery, useUpdateDocumentMutation } from '@/features/document/api';
import { Editor } from '@/features/document/components/Editor';
import { useAutosave } from '@/hooks/useAutosave';
import { Button } from '@/components/ui/button';
import { Share2, Clock, MoreHorizontal } from 'lucide-react';
import { useSocket } from '@/lib/socket';
import { useEffect } from 'react';

export default function DocumentEditorPage() {
  const { id } = useParams() as { id: string };
  const workspaceId = 'default-workspace-id';
  const { data: document, isLoading } = useGetDocumentQuery({ workspaceId, id });
  const [updateDocument] = useUpdateDocumentMutation();
  const { socket } = useSocket();

  // Join document room
  useEffect(() => {
    if (socket && id) {
      socket.emit('joinDocument', id);
    }
  }, [socket, id]);

  const save = async (content: any) => {
    await updateDocument({ workspaceId, id, content });
  };

  const debouncedSave = useAutosave(save, 1000);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading document...</div>;
  }

  if (!document) {
    return <div>Document not found.</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{document.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <Editor 
          documentId={id} 
          initialContent={document.content} 
          onSave={debouncedSave} 
        />
      </div>
    </div>
  );
}
