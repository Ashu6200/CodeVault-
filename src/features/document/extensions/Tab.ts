import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Tab node — a child of the `tabs` node.
 * Each tab contains arbitrary block content (paragraphs, headings, tables, etc.).
 * Visibility is controlled by the parent Tabs NodeView via the `active-tab` CSS class.
 */
const Tab = Node.create({
  name: 'tab',

  // Not in 'block' group — only valid inside tabs content expression ("tab+")
  content: 'block+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      title: {
        default: 'Tab 1',
        parseHTML: (element) => element.getAttribute('data-title') || 'Tab 1',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="tab"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'tab',
        class: 'tiptap-tab',
      }),
      0,
    ];
  },
});

export default Tab;
