"use client";

import * as React from "react";

import { productImage } from "~/components/store/art";
import { SHIPPING_METHODS, type ShippingMethodId, formatMoney } from "~/components/store/data";
import { shippingFor, useCartLines, useStore } from "~/components/store/store-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChipsInput, type ChipsInputChip } from "@/components/ui/chips-input";
import { Datepicker } from "@/components/ui/datepicker";
import { FileInput } from "@/components/ui/file-input";
import { MaterialIcon } from "@/components/ui/icons";
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Preloader } from "@/components/ui/preloader";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect, Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField } from "@/components/ui/text-field";
import { Timepicker } from "@/components/ui/timepicker";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const STEPS = [
  { id: "shipping", label: "Shipping", icon: "home" },
  { id: "delivery", label: "Delivery", icon: "local_shipping" },
  { id: "payment", label: "Payment", icon: "credit_card" },
  { id: "review", label: "Review", icon: "fact_check" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

const COUNTRIES = [
  { value: "PT", label: "Portugal" },
  { value: "ES", label: "Spain" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
] as const;

const PREFERENCES = [
  { value: "door", label: "Leave at the door" },
  { value: "call", label: "Call on arrival" },
  { value: "neighbour", label: "Leave with a neighbour" },
  { value: "eco", label: "Plastic-free packaging" },
];

const GIFT_TAGS = ["Birthday", "Anniversary", "Thank you", "Congrats", "Just because", "Holiday"];

interface CheckoutForm {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  saveAddress: boolean;
  method: ShippingMethodId;
  date: Date | null;
  time: string | null;
  preferences: string[];
  notes: string;
  gift: boolean;
  giftMessage: string;
  giftTags: ChipsInputChip[];
  giftCard: File[];
  payment: "card" | "paypal" | "transfer";
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  terms: boolean;
}

const INITIAL: CheckoutForm = {
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
  country: "PT",
  saveAddress: true,
  method: "standard",
  date: null,
  time: null,
  preferences: [],
  notes: "",
  gift: false,
  giftMessage: "",
  giftTags: [],
  giftCard: [],
  payment: "card",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  terms: false,
};

type Errors = Partial<Record<keyof CheckoutForm, string>>;

function validate(step: StepId, form: CheckoutForm): Errors {
  const errors: Errors = {};
  if (step === "shipping") {
    if (!form.name.trim()) errors.name = "Enter your full name";
    if (!form.email.trim()) errors.email = "Enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email, like ada@example.com";
    if (!form.address.trim()) errors.address = "Enter a street address";
    if (!form.city.trim()) errors.city = "Enter a city";
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(form.zip.trim())) errors.zip = "Enter a valid postal code";
  }
  if (step === "delivery" && form.method !== "pickup" && !form.date) {
    errors.date = "Choose a delivery date";
  }
  if (step === "payment" && form.payment === "card") {
    if (!form.cardName.trim()) errors.cardName = "Enter the name on the card";
    if (form.cardNumber.replace(/\D/g, "").length < 15) errors.cardNumber = "Enter a 16-digit card number";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) errors.expiry = "Use MM/YY";
    if (!/^\d{3,4}$/.test(form.cvc)) errors.cvc = "3 or 4 digits";
  }
  if (step === "review" && !form.terms) errors.terms = "Please accept the terms to place your order";
  return errors;
}

function tomorrow(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
}

/** Multi-step checkout in a fixed-footer modal. */
export function Checkout(): React.JSX.Element {
  const { checkoutOpen, setCheckoutOpen } = useStore();
  return (
    <Modal open={checkoutOpen} onOpenChange={setCheckoutOpen}>
      <ModalContent
        variant="fixed-footer"
        data-testid="checkout"
        className="top-[3%] h-[94%] w-[96%] sm:top-[5%] sm:h-[90%] sm:w-[90%] lg:w-[min(880px,80%)]"
        onInteractOutside={(event) => {
          // Pickers and select popups are portaled outside the modal; never close the checkout for those.
          const target = event.target as Element | null;
          if (target?.closest("[data-radix-popper-content-wrapper], [role=dialog], [role=listbox]")) event.preventDefault();
        }}
      >
        {checkoutOpen ? <CheckoutFlow onClose={() => setCheckoutOpen(false)} /> : null}
      </ModalContent>
    </Modal>
  );
}

function CheckoutFlow({ onClose }: { onClose: () => void }): React.JSX.Element {
  const { subtotal, clear, count } = useStore();
  const lines = useCartLines();
  const [form, setForm] = React.useState<CheckoutForm>(INITIAL);
  const [step, setStep] = React.useState<StepId>("shipping");
  const [reached, setReached] = React.useState(0);
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<"idle" | "processing" | "done">("idle");
  const [orderNumber, setOrderNumber] = React.useState("");
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const minDate = React.useMemo(tomorrow, []);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const method = SHIPPING_METHODS.find((m) => m.id === form.method) ?? SHIPPING_METHODS[0];
  const shipping = shippingFor(subtotal, method);
  const tax = Math.round(subtotal * 0.06 * 100) / 100;
  const total = subtotal + shipping + tax;

  const set = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]): void => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const focusFirstError = (): void => {
    requestAnimationFrame(() => {
      bodyRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    });
  };

  const goTo = (next: StepId): void => {
    setStep(next);
    bodyRef.current?.scrollTo({ top: 0 });
  };

  const next = (): void => {
    const found = validate(step, form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError();
      return;
    }
    if (step === "review") {
      placeOrder();
      return;
    }
    const nextIndex = stepIndex + 1;
    setReached((r) => Math.max(r, nextIndex));
    const target = STEPS[nextIndex];
    if (target) goTo(target.id);
  };

  const placeOrder = (): void => {
    setStatus("processing");
    window.setTimeout(() => {
      setOrderNumber(`PP-${Math.floor(100000 + Math.random() * 900000)}`);
      setStatus("done");
      toast({ content: "Order placed. A confirmation is on its way to your inbox.", duration: 6000 });
    }, 1400);
  };

  if (status === "done") {
    return (
      <>
        <ModalHeader className="sr-only">
          <ModalTitle>Order confirmed</ModalTitle>
          <ModalDescription>Thank you for your order.</ModalDescription>
        </ModalHeader>
        <ModalBody className="flex flex-col items-center justify-center gap-3 text-center">
          <span className="inline-flex size-24 animate-md-scale-in items-center justify-center rounded-full bg-success text-white shadow-z2">
            <MaterialIcon name="check" size={56} />
          </span>
          <h2 className="m-0 mt-2 text-[2rem] font-light">Thank you, {form.name.split(" ")[0] || "friend"}!</h2>
          <p className="m-0 max-w-md text-muted-foreground">
            Order <strong className="font-medium text-foreground">{orderNumber}</strong> is confirmed. We sent the receipt to{" "}
            {form.email || "your inbox"}.
          </p>
          <p className="m-0 text-sm text-muted-foreground">
            {form.method === "pickup"
              ? "Pick it up tomorrow at the Lisbon studio."
              : form.date
                ? `Arriving ${form.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${form.time ? ` around ${form.time}` : ""}.`
                : "Arriving soon."}
          </p>
        </ModalBody>
        <ModalFooter className="px-4">
          <Button
            color="primary"
            onClick={() => {
              clear();
              onClose();
            }}
          >
            Continue shopping
          </Button>
        </ModalFooter>
      </>
    );
  }

  return (
    <>
      <ModalHeader className="gap-0 px-0 pt-0">
        <div className="flex items-center gap-3 px-4 pb-1 pt-4 sm:px-6">
          <MaterialIcon name="lock" className="text-success" />
          <div className="min-w-0 flex-1">
            <ModalTitle className="text-2xl">Checkout</ModalTitle>
            <ModalDescription className="text-sm">
              {count} {count === 1 ? "item" : "items"} · {formatMoney(total)}
            </ModalDescription>
          </div>
          <Button variant="flat" size="sm" onClick={onClose} aria-label="Close checkout" className="-mr-2">
            <MaterialIcon name="close" />
          </Button>
        </div>
        <Progress
          value={((stepIndex + 1) / STEPS.length) * 100}
          label="Checkout progress"
          valueText={`Step ${stepIndex + 1} of ${STEPS.length}: ${STEPS[stepIndex]?.label ?? ""}`}
          className="mt-2"
        />
      </ModalHeader>

      <Tabs
        value={step}
        onValueChange={(value) => goTo(value as StepId)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList aria-label="Checkout steps" className="shrink-0 bg-surface-2 shadow-[inset_0_-1px_0_var(--border)]">
          {STEPS.map((s, index) => (
            <TabsTrigger key={s.id} value={s.id} disabled={index > reached} className="gap-1.5 px-3 sm:px-6">
              <MaterialIcon name={index < reached && index !== stepIndex ? "check_circle" : s.icon} size={18} className="max-sm:hidden" />
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ModalBody ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-6">
          <TabsContent value="shipping" className="outline-none">
            <div className="grid gap-x-6 sm:grid-cols-2">
              <TextField
                label="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
                error={errors.name}
                prefix={<MaterialIcon name="person" />}
                className="sm:col-span-2"
              />
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                error={errors.email}
                helperText="For your receipt and tracking link"
                prefix={<MaterialIcon name="mail" />}
                className="sm:col-span-2"
              />
              <TextField
                label="Street address"
                autoComplete="street-address"
                value={form.address}
                onChange={(event) => set("address", event.target.value)}
                error={errors.address}
                prefix={<MaterialIcon name="home" />}
                className="sm:col-span-2"
              />
              <TextField
                label="City"
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) => set("city", event.target.value)}
                error={errors.city}
              />
              <TextField
                label="Postal code"
                autoComplete="postal-code"
                value={form.zip}
                onChange={(event) => set("zip", event.target.value)}
                error={errors.zip}
              />
              <Select label="Country" value={form.country} onValueChange={(value) => set("country", value)}>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex items-center pt-4 sm:pt-8">
                <Checkbox
                  label="Save this address for next time"
                  checked={form.saveAddress}
                  onCheckedChange={(checked) => set("saveAddress", checked === true)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="outline-none">
            <h3 className="m-0 mt-4 text-base font-medium" id="method-label">
              Shipping method
            </h3>
            <RadioGroup
              aria-labelledby="method-label"
              value={form.method}
              onValueChange={(value) => set("method", value as ShippingMethodId)}
              className="mt-3 grid gap-3 sm:grid-cols-3"
            >
              {SHIPPING_METHODS.map((m) => {
                const price = shippingFor(subtotal, m);
                return (
                  <RadioGroupItem
                    key={m.id}
                    value={m.id}
                    label={m.label}
                    description={
                      <>
                        {m.detail}
                        <span className="mt-1 block font-medium text-foreground">{price === 0 ? "Free" : formatMoney(price)}</span>
                      </>
                    }
                    containerClassName="rounded-ui border border-border p-3 transition-colors has-[[data-state=checked]]:border-secondary has-[[data-state=checked]]:bg-secondary/8"
                  />
                );
              })}
            </RadioGroup>

            <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
              <Datepicker
                label={form.method === "pickup" ? "Pickup date (optional)" : "Delivery date"}
                value={form.date}
                onValueChange={(value) => set("date", value)}
                minDate={minDate}
                disableWeekends
                autoClose
                locale="en-US"
                helperText={errors.date ?? "Weekdays only, from tomorrow"}
                aria-invalid={errors.date ? true : undefined}
                className="max-w-none"
              />
              <Timepicker
                label="Time slot"
                value={form.time}
                onValueChange={(value) => set("time", value)}
                locale="en-US"
                step={30}
                minTime="08:00"
                maxTime="20:00"
                helperText="Between 8am and 8pm, 30-minute slots"
                className="max-w-none"
              />
              <MultiSelect
                label="Delivery preferences"
                options={PREFERENCES}
                value={form.preferences}
                onValueChange={(value) => set("preferences", value)}
                placeholder="No preference"
                display="chips"
                className="sm:col-span-2"
              />
              <Textarea
                label="Notes for the courier"
                value={form.notes}
                onChange={(event) => set("notes", event.target.value)}
                maxLength={200}
                showCount
                autoResize
                className="sm:col-span-2"
              />
            </div>

            <div className="mt-4 rounded-ui border border-border p-4">
              <Switch
                label="This order is a gift"
                description="Hide prices and add a card"
                checked={form.gift}
                onCheckedChange={(checked) => set("gift", checked)}
              />
              {form.gift ? (
                <div className="mt-2 grid animate-md-fade-in gap-x-6 sm:grid-cols-2">
                  <TextField
                    label="Gift message"
                    value={form.giftMessage}
                    onChange={(event) => set("giftMessage", event.target.value)}
                    maxLength={80}
                    showCount
                    className="sm:col-span-2"
                  />
                  <FileInput
                    label="Gift card image"
                    accept="image/*"
                    helperText="Optional. PNG or JPG, printed on the card"
                    onFilesChange={(files) => set("giftCard", files)}
                    clearable
                    buttonLabel={
                      <>
                        <MaterialIcon name="image" />
                        Image
                      </>
                    }
                  />
                  <ChipsInput
                    label="Gift tags"
                    value={form.giftTags}
                    onValueChange={(value) => set("giftTags", value)}
                    suggestions={GIFT_TAGS}
                    limit={4}
                    placeholder="Add a tag"
                    secondaryPlaceholder="+ tag"
                    helperText="Up to 4, press Enter to add"
                  />
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="outline-none">
            <h3 className="m-0 mt-4 text-base font-medium" id="payment-label">
              Payment method
            </h3>
            <RadioGroup
              aria-labelledby="payment-label"
              orientation="horizontal"
              value={form.payment}
              onValueChange={(value) => set("payment", value as CheckoutForm["payment"])}
              className="mt-3 flex flex-wrap gap-x-8 gap-y-3"
            >
              <RadioGroupItem value="card" label="Card" />
              <RadioGroupItem value="paypal" label="PayPal" />
              <RadioGroupItem value="transfer" label="Bank transfer" />
            </RadioGroup>
            {form.payment === "card" ? (
              <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
                <TextField
                  label="Name on card"
                  autoComplete="cc-name"
                  value={form.cardName}
                  onChange={(event) => set("cardName", event.target.value)}
                  error={errors.cardName}
                  className="sm:col-span-2"
                />
                <TextField
                  label="Card number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={form.cardNumber}
                  onChange={(event) =>
                    set(
                      "cardNumber",
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(\d{4})(?=\d)/g, "$1 "),
                    )
                  }
                  error={errors.cardNumber}
                  helperText="Demo only. Try 4242 4242 4242 4242"
                  prefix={<MaterialIcon name="credit_card" />}
                  className="sm:col-span-2"
                />
                <TextField
                  label="Expiry (MM/YY)"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={form.expiry}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                    set("expiry", digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                  }}
                  error={errors.expiry}
                />
                <TextField
                  label="CVC"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={form.cvc}
                  onChange={(event) => set("cvc", event.target.value.replace(/\D/g, "").slice(0, 4))}
                  error={errors.cvc}
                />
              </div>
            ) : (
              <p className="mt-6 flex items-start gap-3 rounded-ui bg-surface-hover p-4 text-sm">
                <MaterialIcon name="info" className="text-secondary" />
                {form.payment === "paypal"
                  ? "You will be sent to PayPal to approve the payment after you place the order."
                  : "We will email you our bank details. Your order ships once the transfer arrives."}
              </p>
            )}
          </TabsContent>

          <TabsContent value="review" className="outline-none">
            <Table striped className="mt-4 text-sm" responsive>
              <TableCaption className="sr-only">Order summary</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.key}>
                    <TableCell>
                      <span className="flex items-center gap-3">
                        <img
                          src={productImage(line.product.kind, line.color.hex)}
                          alt=""
                          className="size-10 shrink-0 rounded-ui object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block">{line.product.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {line.color.name}
                            {line.size ? ` · ${line.size}` : ""}
                          </span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{line.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(line.lineTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Subtotal</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>Shipping ({method.label})</TableCell>
                  <TableCell className="text-right tabular-nums">{shipping === 0 ? "Free" : formatMoney(shipping)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>Tax (6%)</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(tax)}</TableCell>
                </TableRow>
                <TableRow className="text-base font-medium">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right tabular-nums" data-testid="order-total">
                    {formatMoney(total)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Ship to</dt>
                <dd className="m-0 mt-1">
                  {form.name}
                  <br />
                  {form.address}, {form.zip} {form.city}
                  <br />
                  {COUNTRIES.find((c) => c.value === form.country)?.label}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="m-0 mt-1">
                  {method.label}
                  {form.date ? `, ${form.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                  {form.time ? ` at ${form.time}` : ""}
                  {form.gift ? (
                    <span className="block text-muted-foreground">
                      Gift{form.giftTags.length ? `: ${form.giftTags.map((t) => (typeof t === "string" ? t : t.tag)).join(", ")}` : ""}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="m-0 mt-1">
                  {form.payment === "card"
                    ? `Card ending ${form.cardNumber.replace(/\D/g, "").slice(-4)}`
                    : form.payment === "paypal"
                      ? "PayPal"
                      : "Bank transfer"}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <Checkbox
                label="I agree to the terms of sale and the returns policy"
                checked={form.terms}
                onCheckedChange={(checked) => set("terms", checked === true)}
                aria-invalid={errors.terms ? true : undefined}
                aria-describedby={errors.terms ? "terms-error" : undefined}
              />
              {errors.terms ? (
                <p id="terms-error" role="alert" className="m-0 mt-1 pl-[35px] text-sm text-error">
                  {errors.terms}
                </p>
              ) : null}
            </div>
          </TabsContent>
        </ModalBody>
      </Tabs>

      <ModalFooter className="h-auto min-h-14 justify-between px-4 py-2">
        <span className="text-sm text-muted-foreground max-[400px]:hidden">
          Total <strong className="text-base font-medium tabular-nums text-foreground">{formatMoney(total)}</strong>
        </span>
        <span className="flex gap-2 max-[400px]:w-full max-[400px]:justify-between">
          <Button variant="flat" disabled={stepIndex === 0 || status === "processing"} onClick={() => goTo(STEPS[stepIndex - 1]?.id ?? "shipping")}>
            Back
          </Button>
          <Button color="primary" onClick={next} disabled={status === "processing" || lines.length === 0}>
            {status === "processing" ? (
              <>
                <Preloader size="sm" color="currentColor" label="Placing order" className="size-5" />
                Processing
              </>
            ) : step === "review" ? (
              `Place order`
            ) : (
              "Continue"
            )}
          </Button>
        </span>
      </ModalFooter>
    </>
  );
}
