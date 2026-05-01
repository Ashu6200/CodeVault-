'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { useSocket } from '@/lib/socket';

interface EditorProps {
  documentId: string;
  initialContent?: any;
  onSave?: (content: any) => void;
}

export function Editor({ documentId, initialContent, onSave }: EditorProps) {
  const { socket } = useSocket();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start typing or type "/" for commands...',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      
      // Realtime emit
      if (socket) {
        socket.emit('document:update', {
          documentId,
          content: json,
        });
      }

      // Debounced save would be handled by a parent or a hook
      if (onSave) {
        onSave(json);
      }
    },
  });

  // Listen for realtime updates from others
  useEffect(() => {
    if (!socket || !editor) return;

    const handleUpdate = (data: { documentId: string; content: any }) => {
      if (data.documentId === documentId) {
        // Only update if content is different to avoid cursor jumping
        // In a full production app, you'd use Yjs for CRDT-based collaboration
        const currentContent = JSON.stringify(editor.getJSON());
        const newContent = JSON.stringify(data.content);
        
        if (currentContent !== newContent) {
          editor.commands.setContent(data.content, { emitUpdate: false });
        }
      }
    };

    socket.on('document:update', handleUpdate);

    return () => {
      socket.off('document:update', handleUpdate);
    };
  }, [socket, editor, documentId]);

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background overflow-hidden">
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <EditorContent editor={editor} className="prose prose-neutral dark:prose-invert max-w-none min-h-[500px] outline-none" />
        </div>
      </div>
    </div>
  );
}
