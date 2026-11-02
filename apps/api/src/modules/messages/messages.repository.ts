import { count, desc, eq, type SQL } from "drizzle-orm";
import type { Db } from "../../db/client.js";
import { messages } from "../../db/schema.js";

export type MessageRow = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// Every SQL query about contact messages.
export interface MessagesRepository {
  create(data: NewMessage): Promise<number>;
  /** One page, newest first. `isRead` undefined means all messages. */
  list(opts: { page: number; limit: number; isRead?: boolean }): Promise<{ rows: MessageRow[]; total: number }>;
  /** @returns undefined if there is no such message */
  setRead(id: number, isRead: boolean): Promise<MessageRow | undefined>;
  /** @returns false if there was no such message */
  remove(id: number): Promise<boolean>;
  counts(): Promise<{ total: number; unread: number }>;
}

type WriteResult = [{ affectedRows: number }, unknown];

export function createMessagesRepository(db: Db): MessagesRepository {
  const countWhere = async (where?: SQL) => (await db.select({ total: count() }).from(messages).where(where))[0].total;

  return {
    create: async (data) => (await db.insert(messages).values(data).$returningId())[0].id,

    // Served by messages_inbox_idx (is_read, created_at, id) or messages_created_idx (created_at, id):
    // MySQL reads the first rows of the page straight from the index, with no sort.
    async list({ page, limit, isRead }) {
      const where = isRead === undefined ? undefined : eq(messages.isRead, isRead);
      const [rows, total] = await Promise.all([
        db
          .select()
          .from(messages)
          .where(where)
          .orderBy(desc(messages.createdAt), desc(messages.id))
          .limit(limit)
          .offset((page - 1) * limit),
        countWhere(where),
      ]);
      return { rows, total };
    },

    async setRead(id, isRead) {
      const [{ affectedRows }]: WriteResult = await db.update(messages).set({ isRead }).where(eq(messages.id, id));
      if (affectedRows === 0) return undefined;
      return (await db.select().from(messages).where(eq(messages.id, id)))[0];
    },

    async remove(id) {
      const [{ affectedRows }]: WriteResult = await db.delete(messages).where(eq(messages.id, id));
      return affectedRows > 0;
    },

    async counts() {
      const [total, unread] = await Promise.all([countWhere(), countWhere(eq(messages.isRead, false))]);
      return { total, unread };
    },
  };
}
