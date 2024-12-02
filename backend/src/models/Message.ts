/**
  {
    senderId: string,
    content: string,
    Attachments: {
      url: string
    }[],
    createdAt: string
  }
 */
export const MessageSelect =
{
    senderId: true,
    content: true,
    Attachments: {
      select: {
        url: true
      }
    },
    createdAt: true
}