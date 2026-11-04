import { defineType, defineField } from 'sanity';

const stringList = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{ type: 'string' }],
    description,
  });

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Large heading',
      initialValue: 'Khoi Tran',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Used as the page description for search and link previews. Not shown on the page.',
      initialValue: 'Applied AI Fellow, Center for Applied Entrepreneurship and Innovation',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      description: 'Shown under the name. Capitalization is shown exactly as typed.',
      initialValue: 'Know all the theories, master all the techniques, but as you touch a human soul, be just another human soul.',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote attribution',
      type: 'string',
      initialValue: 'attributed to Carl Jung',
    }),
    defineField({
      name: 'body',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Bio paragraphs, one block per paragraph. Capitalization is shown exactly as typed.',
    }),
    stringList('affiliations', 'Affiliations', 'One affiliation per row, in display order'),
    stringList('expertise', 'Expertise', 'Sidebar list, in display order'),
    stringList('centersAndPrograms', 'Centers & Programs', 'Sidebar list, in display order'),
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      initialValue: 'khoi@tamu.edu',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. Replaces the default headshot at the top of the sidebar.',
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'About Page' }),
  },
});
