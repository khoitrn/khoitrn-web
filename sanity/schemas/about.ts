import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Large heading shown on the about page',
      initialValue: 'Student, founder, engineer.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Main bio paragraphs',
    }),
    defineField({
      name: 'currentItems',
      title: 'Currently',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Items shown in the "Currently" list',
    }),
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      initialValue: 'khoi@tamu.edu',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'About Page' }),
  },
});
