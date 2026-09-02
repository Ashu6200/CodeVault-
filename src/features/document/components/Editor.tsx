'use client';

import type { JSONContent } from '@tiptap/core';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Toolbar } from './Toolbar';
import Tabs from '../extensions/Tabs';
import Tab from '../extensions/Tab';

interface EditorProps {
  /** Serialised Tiptap JSON as stored in Document.content (a Text column). */
  initialContent?: string | null;
  /** Receives the serialised document, ready to persist. */
  onSave?: (content: string) => void;
}

function parseContent(raw?: string | null): JSONContent | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as JSONContent;
  } catch {
    // Older documents may hold plain text rather than serialised JSON.
    return undefined;
  }
}

export function Editor({ initialContent, onSave }: EditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Tabs,
      Tab,
      Placeholder.configure({
        placeholder: 'Start typing or type "/" for commands...',
        includeChildren: true,
      }),
    ],
    content: parseContent(initialContent),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();

      // Debounced save would be handled by a parent or a hook
      if (onSave) {
        onSave(JSON.stringify(json));
      }
    },
  });

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
