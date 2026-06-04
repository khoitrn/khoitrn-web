import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTagline',
      title: 'Hero tagline',
      type: 'string',
      description: 'Small label above your name (e.g. "Student · Founder · Engineer")',
      initialValue: 'Student · Founder · Engineer',
    }),
    defineField({
      name: 'heroParagraph',
      title: 'Hero paragraph',
      type: 'text',
      rows: 3,
      description: 'The paragraph below your name in the hero',
      initialValue: 'I build things and think about building things — products, companies, and the ideas that hold them together.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
