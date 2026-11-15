import { CalendarDemo } from "~/components/home/calendar-demo";
import { InboxDemo } from "~/components/home/inbox-demo";
import { RevealDemo } from "~/components/home/reveal-demo";
import { SettingsDemo } from "~/components/home/settings-demo";
import { SignInDemo } from "~/components/home/sign-in-demo";
import { SnackbarDemo } from "~/components/home/snackbar-demo";
import { TabsDemo } from "~/components/home/tabs-demo";
import { TagsDemo } from "~/components/home/tags-demo";
import { UploadDemo } from "~/components/home/upload-demo";
import { Toaster } from "@/components/ui/toast";

const COLUMN = "contents xl:block [&>*]:mb-6 [&>*]:break-inside-avoid [&>*]:shadow-z2";

/**
 * Masonry of live, composed examples built from the real components. CSS
 * columns keep each card at its natural height. It overlaps the hero band.
 */
export function ComponentMosaic(): React.JSX.Element {
  return (
    <section aria-labelledby="examples-title" className="relative mx-auto -mt-28 max-w-[1280px] px-4 sm:-mt-32 sm:px-6">
      <h2 id="examples-title" className="sr-only">
        Live examples
      </h2>
      {/*
        Below xl the column groups use display: contents, so every card flows through CSS columns.
        At xl the three groups become explicit columns, which keeps their heights balanced.
      */}
      <div data-slot="mosaic" className="gap-6 md:columns-2 xl:grid xl:grid-cols-3 xl:items-start">
        <div className={COLUMN}>
          <SignInDemo />
          <RevealDemo />
          <TabsDemo />
        </div>
        <div className={COLUMN}>
          <InboxDemo />
          <CalendarDemo />
          <SnackbarDemo />
        </div>
        <div className={COLUMN}>
          <SettingsDemo />
          <TagsDemo />
          <UploadDemo />
        </div>
      </div>
      <Toaster />
    </section>
  );
}
