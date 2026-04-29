import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({
      name: 'category',
      type: 'string',
      options: { list: ['Essay', 'Founder', 'Engineering', 'Project'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 2 }),
    defineField({ name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }, { type: 'code' }] }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
});
