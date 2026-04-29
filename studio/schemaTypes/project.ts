import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'description', type: 'text', rows: 2 }),
    defineField({
      name: 'category',
      type: 'string',
      options: { list: ['Product', 'Engineering', 'Startup', 'Design'] },
    }),
    defineField({ name: 'year', type: 'string' }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'url', type: 'url' }),
    defineField({ name: 'technologies', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'year', media: 'coverImage' },
  },
});
