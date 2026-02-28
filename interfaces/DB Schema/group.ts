/**
 * Student Groups Schema Types
 * Generated from Prisma schema
 */

export interface Group {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  noOfMembers: number;
  createdAt: Date;
  joinByLink: boolean;
  type: string;
  aiEnabled: boolean;
  aiMaxMessages: number;
  aiMaxTokens: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  studentId: string;
  addedAt: Date;
}

// Extended types with relations
export interface GroupWithRelations extends Group {
  creator?: any;
  members?: GroupMember[];
  examGroups?: any[];
}

export interface GroupMemberWithRelations extends GroupMember {
  group?: Group;
  student?: any;
}
