import type { Metadata } from "next";

import { DocHeader } from "~/components/docs/doc-parts";

export const metadata: Metadata = { title: "Introduction" };

// Placeholder: written in full once the component set is complete.
export default function IntroductionPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader title="Introduction" description="Materialize's Material Design components, rebuilt for React 19 and Tailwind CSS v4." />
    </article>
  );
}
