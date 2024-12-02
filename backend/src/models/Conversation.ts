/**
{
  id: string;
  name: string;
  type: string;
  Participants: {
    Users: {
      id: string;
      username: string;
    }[];
  };
  Messages: {
    senderId: string;
    content: string;
    Attachments: {
      url: string;
    }[];
    createdAt: string;
  }
}
 */

import { Prisma } from "@prisma/client";

export const ConversationSelect = 
{
  id: true,
  name: true,
  type: true,
  Participants: {
    select: {
      Users: {
        select: {
          id: true,
          username: true
        }
      }
    }
  },
  Messages: {
    select: {
      senderId: true,
      content: true,
      Attachments: {
        select: {
          url: true
        }
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.asc
    }
  }
}