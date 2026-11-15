"use client";

import * as React from "react";

import { type BannerSpec, bannerImage } from "~/components/store/art";
import type { CategoryId } from "~/components/store/data";
import { Button } from "@/components/ui/button";
import { Collection, CollectionItem, CollectionSecondary, CollectionTitle } from "@/components/ui/collection";
import { Divider } from "@/components/ui/divider";
import { MaterialIcon } from "@/components/ui/icons";
import { Materialbox } from "@/components/ui/materialbox";
import { Parallax } from "@/components/ui/parallax";
import { Pushpin } from "@/components/ui/pushpin";
import { Slider, SliderCaption, SliderItem } from "@/components/ui/slider";
import { TableOfContents, type TableOfContentsItem } from "@/components/ui/table-of-contents";
import { Blockquote, FlowText, Heading, Lead, Muted } from "@/components/ui/typography";

interface Promo {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  category: CategoryId | "all";
  sale?: boolean;
  banner: BannerSpec;
}

const PROMOS: Promo[] = [
  {
    id: "sneakers",
    eyebrow: "Spring drop",
    title: "Run lighter this season",
    text: "New colorways of the Trail Runner, now 20% off.",
    cta: "Shop apparel",
    category: "apparel",
    banner: {
      from: "#c62828",
      to: "#ef5350",
      items: [
        { kind: "sneaker", hex: "#fafafa", x: 640, y: 80, scale: 1.25 },
        { kind: "tee", hex: "#26a69a", x: 870, y: 40, scale: 0.9 },
      ],
    },
  },
  {
    id: "audio",
    eyebrow: "Sound week",
    title: "Hear every detail",
    text: "Noise cancelling headphones and speakers from $49.",
    cta: "Shop audio",
    category: "audio",
    banner: {
      from: "#00695c",
      to: "#26a69a",
      items: [
        { kind: "headphones", hex: "#263238", x: 650, y: 70, scale: 1.2 },
        { kind: "speaker", hex: "#ffb300", x: 880, y: 120, scale: 0.85 },
      ],
    },
  },
  {
    id: "home",
    eyebrow: "Home edit",
    title: "Make room for calm",
    text: "Lamps, planters and mugs for slower mornings.",
    cta: "Shop home",
    category: "home",
    banner: {
      from: "#4527a0",
      to: "#7e57c2",
      items: [
        { kind: "lamp", hex: "#ffca28", x: 640, y: 50, scale: 1.1 },
        { kind: "plant", hex: "#e64a19", x: 860, y: 90, scale: 0.95 },
        { kind: "mug", hex: "#eceff1", x: 990, y: 210, scale: 0.55 },
      ],
    },
  },
];

/** Full-width promotional slider at the top of the store. */
export function HeroSlider({ onShop }: { onShop: (category: CategoryId | "all") => void }): React.JSX.Element {
  return (
    <Slider aria-label="Promotions" height="clamp(280px, 40vw, 440px)" interval={7000}>
      {PROMOS.map((promo) => (
        <SliderItem key={promo.id}>
          <img src={bannerImage(promo.banner)} alt="" />
          {/* Scrim keeps the caption readable when the artwork sits behind it on phones. */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent sm:from-black/30" />
          <SliderCaption align="left" className="left-[6%] top-[14%] w-[88%] sm:left-[8%] sm:w-[55%] lg:left-[10%]">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.2em] text-white/85 sm:text-sm">{promo.eyebrow}</p>
            <h2 className="mt-1 text-[1.75rem] font-light leading-tight sm:text-[2.6rem] lg:text-[3.2rem]">{promo.title}</h2>
            <p className="mt-2 max-w-[27rem] text-sm font-light text-white/90 sm:text-lg">{promo.text}</p>
            <Button
              className="mt-4 bg-white text-md-grey-900 hover:bg-md-grey-100 sm:mt-6"
              onClick={() => onShop(promo.category)}
            >
              {promo.cta}
            </Button>
          </SliderCaption>
        </SliderItem>
      ))}
    </Slider>
  );
}

const PERKS = [
  { icon: "local_shipping", title: "Free shipping", text: "On orders over $75" },
  { icon: "autorenew", title: "30-day returns", text: "No questions asked" },
  { icon: "verified_user", title: "2-year warranty", text: "On every product" },
  { icon: "support_agent", title: "Real humans", text: "Chat 8am to 8pm" },
] as const;

/** Row of store perks under the hero. */
export function PerksStrip(): React.JSX.Element {
  return (
    <ul className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-4 py-6 sm:px-6 lg:grid-cols-4">
      {PERKS.map((perk) => (
        <li key={perk.title} className="flex items-center gap-3 px-2 py-2 sm:px-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/25 dark:text-md-red-200">
            <MaterialIcon name={perk.icon} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium sm:text-base">{perk.title}</span>
            <span className="block text-xs text-muted-foreground sm:text-sm">{perk.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const LOOKS = [
  { src: "/images/landscapes/alpine.svg", alt: "Snowy alpine peaks", caption: "Alpine: the Ridge 28 backpack above the tree line." },
  { src: "/images/landscapes/desert.svg", alt: "Desert dunes at noon", caption: "Desert: Aviator sunglasses and an Insulated Bottle." },
  { src: "/images/landscapes/ocean.svg", alt: "Calm ocean at midday", caption: "Coast: the Pocket Speaker goes everywhere." },
  { src: "/images/landscapes/forest.svg", alt: "Pine forest in the morning", caption: "Forest: Trail Runner 2 on soft ground." },
] as const;

/** Lookbook gallery: Materialbox images that zoom to fill the screen. */
export function Lookbook(): React.JSX.Element {
  return (
    <section aria-labelledby="lookbook-title" className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <Heading level={2} size="h4" spacing="none" id="lookbook-title" className="font-light">
            Lookbook
          </Heading>
          <Muted className="mt-1">Tap a photo to zoom. Gear photographed where it belongs.</Muted>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {LOOKS.map((look) => (
          <Materialbox
            key={look.src}
            src={look.src}
            alt={look.alt}
            caption={look.caption}
            width={1200}
            height={800}
            className="w-full"
            triggerClassName="shadow-z1 transition-shadow hover:shadow-z3"
          />
        ))}
      </div>
    </section>
  );
}

/** Parallax banner for the newsletter / membership pitch. */
export function MemberBanner({ onJoin }: { onJoin: () => void }): React.JSX.Element {
  return (
    <Parallax src="/images/landscapes/night.svg" height={380} speed={0.5} className="w-full">
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-black/40 px-6 text-center text-white">
        <p className="m-0 text-xs font-medium uppercase tracking-[0.25em] text-white/80">Paper Plane Club</p>
        <Heading level={2} size="h3" spacing="none" className="font-light text-white">
          Members get 10% off, always
        </Heading>
        <p className="m-0 max-w-md text-base font-light text-white/90 sm:text-lg">
          Early access to drops, free express shipping and birthday surprises.
        </p>
        <Button color="primary" size="lg" className="mt-2" onClick={onJoin}>
          Join for free
        </Button>
      </div>
    </Parallax>
  );
}

const CARE_SECTIONS = [
  {
    id: "care-shipping",
    title: "Shipping",
    body: [
      "Orders placed before 2pm ship the same day from our Lisbon studio. Standard delivery takes 3 to 5 business days; express takes 1 to 2.",
      "Shipping is free on orders over $75. You can pick a delivery date and a time slot at checkout.",
    ],
  },
  {
    id: "care-returns",
    title: "Returns",
    body: [
      "Changed your mind? Send anything back within 30 days, unworn and in its original box, and we refund you in full.",
      "Print a return label from your account, or drop it off at any partner locker.",
    ],
  },
  {
    id: "care-warranty",
    title: "Warranty",
    body: [
      "Every product carries a two-year warranty against defects. Electronics get a free battery replacement in year two.",
    ],
  },
  {
    id: "care-payment",
    title: "Payment",
    body: [
      "We accept all major cards, PayPal and bank transfer. Card details are never stored on our servers.",
    ],
  },
] as const;

const CARE_ITEMS: TableOfContentsItem[] = CARE_SECTIONS.map(({ id, title }) => ({ id, label: title }));

/** Customer care: an article with a pinned table of contents and contact options. */
export function CustomerCare({ onChat }: { onChat: () => void }): React.JSX.Element {
  return (
    <section id="care" aria-labelledby="care-title" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-14 sm:px-6">
      <Heading level={2} size="h4" spacing="none" id="care-title" className="font-light">
        Customer care
      </Heading>
      <Lead className="mt-2 max-w-2xl">Everything you need to know about getting your order, and sending it back.</Lead>
      <div className="mt-8 grid gap-8 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr_320px]">
        <aside className="max-md:hidden">
          <Pushpin top={96}>
            <TableOfContents items={CARE_ITEMS} scrollOffset={96} aria-label="Customer care contents" />
          </Pushpin>
        </aside>
        <article className="min-w-0 space-y-10">
          {CARE_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24">
              <h3 id={`${section.id}-title`} className="text-xl font-normal">
                {section.title}
              </h3>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="m-0 mt-3 leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <Blockquote>
            <FlowText as="div">The Ridge 28 has been up three volcanoes and through two airports. Still looks new.</FlowText>
            <footer className="mt-2 text-sm text-muted-foreground">Grace H., verified buyer</footer>
          </Blockquote>
        </article>
        <div className="md:col-span-2 lg:col-span-1">
          <Collection className="m-0">
            <CollectionItem>
              <MaterialIcon name="chat" className="text-secondary" />
              <span className="min-w-0 flex-1">
                <CollectionTitle>Live chat</CollectionTitle>
                <span className="block text-sm text-muted-foreground">Average reply in 2 minutes</span>
              </span>
              <CollectionSecondary>
                <button
                  type="button"
                  onClick={onChat}
                  aria-label="Start live chat"
                  className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-surface-hover focus-visible:focus-ring"
                >
                  <MaterialIcon name="arrow_forward" />
                </button>
              </CollectionSecondary>
            </CollectionItem>
            <CollectionItem>
              <MaterialIcon name="mail" className="text-secondary" />
              <span className="min-w-0 flex-1">
                <CollectionTitle>Email</CollectionTitle>
                <span className="block text-sm text-muted-foreground">hello@paperplane.example</span>
              </span>
            </CollectionItem>
            <CollectionItem>
              <MaterialIcon name="call" className="text-secondary" />
              <span className="min-w-0 flex-1">
                <CollectionTitle>Phone</CollectionTitle>
                <span className="block text-sm text-muted-foreground">+351 21 000 0000, weekdays</span>
              </span>
            </CollectionItem>
          </Collection>
          <Divider className="my-6" />
          <Muted>Studio hours: Monday to Saturday, 10am to 7pm. Rua das Flores 28, Lisbon.</Muted>
        </div>
      </div>
    </section>
  );
}
