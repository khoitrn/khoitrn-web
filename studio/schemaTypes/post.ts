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
      options: { list: ['Travel', 'Reflection', 'Tech', 'Entrepreneurship', 'Leadership', 'Essay'] },
      validation: r => r.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Tiếng Việt', value: 'vi' },
        ],
        layout: 'radio',
      },
      initialValue: 'en',
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 2 }),
    defineField({ name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }, { type: 'code' }] }),
    defineField({
      name: 'footerLabel',
      title: 'Footer section label',
      type: 'string',
      description: 'Label shown above the takeaways section (e.g. "things i learned today", "what i took away"). Leave blank to hide the section.',
    }),
    defineField({
      name: 'takeaways',
      title: 'Takeaways',
      description: 'Optional footer section — fun facts, lessons learned, key insights, or anything worth highlighting separately from the main post.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string', description: 'Short bold label (optional)' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'heading', subtitle: 'body' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
});
