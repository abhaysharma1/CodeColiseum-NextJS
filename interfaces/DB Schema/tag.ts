/**
 * Tags System Schema Types
 * Generated from Prisma schema
 */

export interface Tag {
  id: string;
  name: string;
}

export interface ProblemTag {
  problemId: string;
  tagId: string;
}

// Extended types with relations
export interface TagWithRelations extends Tag {
  problems?: ProblemTag[];
}

export interface ProblemTagWithRelations extends ProblemTag {
  problem?: any;
  tag?: Tag;
}
