"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronLeft, CreditCard, Loader2, Lock, LogOut, Play } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import {
  createUserSubscription,
  listPlans,
  listUserSubscriptions,
  type ApiPlan,
  type ApiSubscription,
} from "@/lib/subscriptions-api"

interface SubscriptionScreenProps {
  onReady: () => void
}

type CheckoutStep = "plan" | "payment" | "confirm"

interface PaymentForm {
  name: string
  email: string
  cardNumber: string
  expiry: string
  cvc: string
  postalCode: string
}

const emptyPayment: PaymentForm = {
  name: "",
  email: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  postalCode: "",
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

function formatCardNumber(value: string) {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function detectCardBrand(cardNumber: string) {
  const digits = onlyDigits(cardNumber)
  if (digits.startsWith("4")) return "Visa"
  if (/^5[1-5]/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "American Express"
  return "Card"
}

function isPaymentValid(payment: PaymentForm) {
  return (
    payment.name.trim().length >= 2 &&
    payment.email.includes("@") &&
    onlyDigits(payment.cardNumber).length >= 12 &&
    /^\d{2}\/\d{2}$/.test(payment.expiry) &&
    onlyDigits(payment.cvc).length >= 3 &&
    payment.postalCode.trim().length >= 3
  )
}

export function SubscriptionScreen({ onReady }: SubscriptionScreenProps) {
  const { signOut } = useAuth()
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [step, setStep] = useState<CheckoutStep>("plan")
  const [payment, setPayment] = useState<PaymentForm>(emptyPayment)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadSubscriptionState = async () => {
      try {
        const [availablePlans, subscriptions] = await Promise.all([listPlans(), listUserSubscriptions()])
        if (!mounted) return

        const activeSubscription = subscriptions[0] ?? null
        setPlans(availablePlans)
        setSubscription(activeSubscription)
        setSelectedPlanId(activeSubscription?.plan.id ?? availablePlans[1]?.id ?? availablePlans[0]?.id ?? null)

        if (activeSubscription) {
          onReady()
        }
      } catch (caught) {
        if (!mounted) return
        setError(caught instanceof Error ? caught.message : "Could not load subscription plans.")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadSubscriptionState()
    return () => {
      mounted = false
    }
  }, [onReady])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  )

  const cardBrand = useMemo(() => detectCardBrand(payment.cardNumber), [payment.cardNumber])
  const cardLast4 = onlyDigits(payment.cardNumber).slice(-4)
  const canContinue = step === "plan" ? Boolean(selectedPlan) : isPaymentValid(payment)

  const handleNext = () => {
    setError(null)
    if (step === "plan") {
      setStep("payment")
      return
    }
    if (step === "payment") {
      if (!isPaymentValid(payment)) {
        setError("Complete the payment details before continuing.")
        return
      }
      setStep("confirm")
    }
  }

  const handleConfirm = async () => {
    if (!selectedPlan || !isPaymentValid(payment)) return

    setIsSubmitting(true)
    setError(null)
    try {
      const created = await createUserSubscription(selectedPlan.id, {
        payment_provider: "simulated",
        payment_brand: cardBrand,
        payment_last4: cardLast4,
        billing_email: payment.email.trim(),
      })
      setSubscription(created)
      onReady()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not activate the subscription.")
      setIsSubmitting(false)
    }
  }

  if (isLoading || subscription) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking subscription...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-5 md:px-12">
        <div className="text-2xl font-bold tracking-tight text-primary">STREAMFLIX</div>
        <button
          onClick={() => void signOut()}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col px-4 py-10 md:px-8 md:py-14">
        <CheckoutHeader step={step} />

        {step === "plan" && (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={plan.id === selectedPlanId}
                onSelect={() => setSelectedPlanId(plan.id)}
              />
            ))}
          </div>
        )}

        {step === "payment" && (
          <PaymentStep
            plan={selectedPlan}
            payment={payment}
            cardBrand={cardBrand}
            onChange={setPayment}
          />
        )}

        {step === "confirm" && selectedPlan && (
          <ConfirmStep plan={selectedPlan} payment={payment} cardBrand={cardBrand} cardLast4={cardLast4} />
        )}

        {error && (
          <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => setStep(step === "confirm" ? "payment" : "plan")}
            disabled={step === "plan" || isSubmitting}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={step === "confirm" ? handleConfirm : handleNext}
            disabled={!canContinue || isSubmitting}
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {step === "confirm" ? "Activate membership" : "Continue"}
          </button>
        </div>
      </section>
    </main>
  )
}

function CheckoutHeader({ step }: { step: CheckoutStep }) {
  const stepNumber = step === "plan" ? 1 : step === "payment" ? 2 : 3
  const title =
    step === "plan"
      ? "Choose your plan."
      : step === "payment"
        ? "Add a payment method."
        : "Confirm your membership."
  const copy =
    step === "plan"
      ? "Pick the plan that fits your account before profiles are created."
      : step === "payment"
        ? "This is a simulated checkout. No real card is charged."
        : "Review your plan and payment summary before activation."

  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Step {stepNumber} of 3</p>
      <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">{copy}</p>
    </div>
  )
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: ApiPlan
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex min-h-72 flex-col rounded-lg border p-5 text-left transition ${
        isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border bg-card hover:border-muted-foreground"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{plan.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{plan.code.toUpperCase()}</p>
        </div>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
          }`}
        >
          {isSelected && <Check className="h-4 w-4" />}
        </span>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">${plan.monthly_price}</span>
        <span className="text-muted-foreground"> / month</span>
      </div>

      <div className="mt-auto space-y-3 text-sm">
        <Feature>{plan.max_profiles} profiles</Feature>
        <Feature>{plan.max_concurrent_streams} concurrent screens</Feature>
        <Feature>Full movie catalog</Feature>
      </div>
    </button>
  )
}

function PaymentStep({
  plan,
  payment,
  cardBrand,
  onChange,
}: {
  plan: ApiPlan | null
  payment: PaymentForm
  cardBrand: string
  onChange: (payment: PaymentForm) => void
}) {
  const update = (field: keyof PaymentForm, value: string) => onChange({ ...payment, [field]: value })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Payment details</h2>
            <p className="text-sm text-muted-foreground">Use any test-like card number for this simulation.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name on card" value={payment.name} onChange={(value) => update("name", value)} />
          <Field label="Billing email" type="email" value={payment.email} onChange={(value) => update("email", value)} />
          <Field
            label={`Card number (${cardBrand})`}
            value={payment.cardNumber}
            onChange={(value) => update("cardNumber", formatCardNumber(value))}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            className="md:col-span-2"
          />
          <Field label="Expiration" value={payment.expiry} onChange={(value) => update("expiry", formatExpiry(value))} placeholder="MM/YY" inputMode="numeric" />
          <Field label="Security code" value={payment.cvc} onChange={(value) => update("cvc", onlyDigits(value).slice(0, 4))} placeholder="123" inputMode="numeric" />
          <Field label="Postal code" value={payment.postalCode} onChange={(value) => update("postalCode", value.slice(0, 12))} />
        </div>
      </div>

      <Summary plan={plan} cardBrand={cardBrand} cardLast4={onlyDigits(payment.cardNumber).slice(-4)} />
    </div>
  )
}

function ConfirmStep({
  plan,
  payment,
  cardBrand,
  cardLast4,
}: {
  plan: ApiPlan
  payment: PaymentForm
  cardBrand: string
  cardLast4: string
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-xl font-semibold">Ready to start watching</h2>
        <div className="space-y-4 text-sm">
          <ReviewRow label="Plan" value={`${plan.name} - $${plan.monthly_price}/month`} />
          <ReviewRow label="Billing email" value={payment.email} />
          <ReviewRow label="Payment" value={`${cardBrand} ending in ${cardLast4}`} />
          <ReviewRow label="Status after confirmation" value="Active" />
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 text-primary" />
          This checkout is simulated. Only the provider, card brand, last 4 digits, and billing email are stored.
        </div>
      </div>

      <Summary plan={plan} cardBrand={cardBrand} cardLast4={cardLast4} />
    </div>
  )
}

function Summary({
  plan,
  cardBrand,
  cardLast4,
}: {
  plan: ApiPlan | null
  cardBrand: string
  cardLast4: string
}) {
  return (
    <aside className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
      {plan ? (
        <div className="space-y-4 text-sm">
          <ReviewRow label="Plan" value={plan.name} />
          <ReviewRow label="Monthly price" value={`$${plan.monthly_price}`} />
          <ReviewRow label="Profiles" value={String(plan.max_profiles)} />
          <ReviewRow label="Screens" value={String(plan.max_concurrent_streams)} />
          <ReviewRow label="Payment" value={cardLast4 ? `${cardBrand} ending ${cardLast4}` : "Not added yet"} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Choose a plan to see the summary.</p>
      )}
    </aside>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  inputMode?: "numeric"
  className?: string
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-11 w-full rounded-md border border-border bg-muted/30 px-3 text-foreground outline-none transition focus:border-primary"
      />
    </label>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="h-4 w-4 text-primary" />
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
