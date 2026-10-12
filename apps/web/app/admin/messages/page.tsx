import { Suspense } from "react";
import { MessageInbox } from "@/components/admin/MessageInbox";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense>
      <MessageInbox />
    </Suspense>
  );
}
