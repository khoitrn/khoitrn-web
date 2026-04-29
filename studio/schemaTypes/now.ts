import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'now',
  title: 'Now Page',
  type: 'document',
  fields: [
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'updatedAt', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
  preview: {
    prepare: () => ({ title: 'Now Page' }),
  },
});
