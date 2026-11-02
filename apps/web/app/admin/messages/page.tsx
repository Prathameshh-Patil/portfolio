import { Suspense } from "react";
import { MessageInbox } from "@/features/admin/MessageInbox";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense>
      <MessageInbox />
    </Suspense>
  );
}
