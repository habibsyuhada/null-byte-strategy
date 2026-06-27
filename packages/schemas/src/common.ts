import { z } from 'zod';

/**
 * Base schema that all content schemas must extend.
 * Ensures every content object carries a schemaVersion for migration support.
 */
export const SchemaVersioned = z.object({
  schemaVersion: z.number(),
});

export type SchemaVersioned = z.infer<typeof SchemaVersioned>;