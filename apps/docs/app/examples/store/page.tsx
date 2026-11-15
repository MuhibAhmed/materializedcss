import type { Metadata } from "next";

import { StoreApp } from "~/components/store/store-app";

export const metadata: Metadata = {
  title: "Store example",
  description:
    "A complete ecommerce storefront built with materializedcss: navbar search, filters, product cards, quick view, cart and a multi-step checkout.",
};

export default function StoreExamplePage(): React.JSX.Element {
  return <StoreApp />;
}
