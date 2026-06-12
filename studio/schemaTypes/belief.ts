import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'belief',
  title: 'Belief',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'One-liner', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'order', type: 'number', title: 'Order', description: '1 = first, 2 = second, etc.', validation: r => r.required().integer().min(1) }),
    defineField({
      name: 'body',
      title: 'Full reflection',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The extended personal reflection shown on the individual belief page.',
    }),
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare({ title, order }) {
      return { title, subtitle: `${String(order).padStart(2, '0')}` };
    },
  },
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
});
