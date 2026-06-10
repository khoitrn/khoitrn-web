import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'talk',
  title: 'Talk',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'event', title: 'Event / Conference', type: 'string', validation: r => r.required() }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'year', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'description',
      title: 'Brief description',
      description: 'One or two sentences shown on the talks listing.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Full write-up',
      description: 'Longer notes about the talk — what you covered, why it mattered, what you learned.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'mediaUrl',
      title: 'Media URL',
      description: 'YouTube, Vimeo, Twitter, or any link. Clicking from the site goes directly to this URL.',
      type: 'url',
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      description: 'Leave blank to auto-pull from YouTube.',
      options: { hotspot: true },
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'event' },
  },
  orderings: [{ title: 'Year, newest', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] }],
});
