"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collection,
  CollectionAvatar,
  CollectionHeader,
  CollectionItem,
  CollectionSecondary,
  CollectionTitle,
} from "@/components/ui/collection";

interface Message {
  from: string;
  avatar: string;
  subject: string;
  unread: number;
}

const MESSAGES: Message[] = [
  { from: "Ada Lovelace", avatar: "/images/avatars/ada.svg", subject: "Notes on the Analytical Engine", unread: 3 },
  { from: "Alan Turing", avatar: "/images/avatars/alan.svg", subject: "Re: On computable numbers", unread: 1 },
  { from: "Grace Hopper", avatar: "/images/avatars/grace.svg", subject: "Found the bug (an actual moth)", unread: 0 },
  { from: "Linus Torvalds", avatar: "/images/avatars/linus.svg", subject: "[PATCH v3] Fix scheduler latency", unread: 2 },
];

/** Avatar collection with "new" badges that clear when the inbox is marked read. */
export function InboxDemo(): React.JSX.Element {
  const [unread, setUnread] = React.useState<number[]>(() => MESSAGES.map((message) => message.unread));
  const total = unread.reduce((sum, count) => sum + count, 0);
  const headingId = React.useId();

  return (
    <Collection aria-labelledby={headingId} className="bg-surface shadow-z1">
      <CollectionHeader className="flex flex-wrap items-center justify-between gap-2 py-3">
        <h3 id={headingId} className="text-2xl font-light">
          Inbox
        </h3>
        <Button variant="flat" color="secondary" size="sm" disabled={total === 0} onClick={() => setUnread(MESSAGES.map(() => 0))}>
          Mark all read
        </Button>
      </CollectionHeader>
      {MESSAGES.map((message, index) => {
        const count = unread[index] ?? 0;
        return (
          <CollectionItem key={message.from} avatar className="min-h-[72px] pr-24">
            <CollectionAvatar asChild>
              <img src={message.avatar} alt="" width={42} height={42} />
            </CollectionAvatar>
            <CollectionTitle className={count > 0 ? "font-medium" : undefined}>{message.from}</CollectionTitle>
            <p className="truncate text-sm text-muted-foreground">{message.subject}</p>
            {count > 0 ? (
              <CollectionSecondary>
                <Badge variant="new">{count}</Badge>
              </CollectionSecondary>
            ) : null}
          </CollectionItem>
        );
      })}
    </Collection>
  );
}
