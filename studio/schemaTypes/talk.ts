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
    defineField({
      name: 'date',
      title: 'Talk date',
      description: 'When you gave the talk. Controls the order on the site (newest first) and the year shown.',
      type: 'date',
      options: { dateFormat: 'MMMM D, YYYY' },
      validation: r => r.required(),
    }),
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
  ],
  preview: {
    select: { title: 'title', subtitle: 'event', date: 'date' },
    prepare({ title, subtitle, date }) {
      const year = date ? new Date(date).getFullYear() : '';
      return { title, subtitle: [subtitle, year].filter(Boolean).join(' · ') };
    },
  },
  orderings: [{ title: 'Date, newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
});
