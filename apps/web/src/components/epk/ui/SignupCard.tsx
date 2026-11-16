import { useId, useState, type FormEvent } from 'react'
import type { Signup } from '../../../content/schema'

type SignupCardProps = {
  signup: Signup
  className?: string
}

/**
 * Dark "join the list" card. Demo only: the email is never sent or stored,
 * submitting just swaps the form for the success message.
 */
export function SignupCard({ signup, className }: SignupCardProps) {
  const inputId = useId()
  const [done, setDone] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.currentTarget.reset()
    setDone(true)
  }

  return (
    <section className={`rounded-3xl bg-brand-secondary px-6 py-12 text-center text-brand-accent shadow-xl sm:px-12 ${className ?? ''}`}>
      <h2 className="font-script text-[40px] leading-tight sm:text-[52px]">{signup.title}</h2>
      {signup.text && <p className="mx-auto mt-3 max-w-xl text-brand-accent/85">{signup.text}</p>}
      {done ? (
        <p aria-live="polite" className="mt-7 font-semibold text-brand-primary" role="status">{signup.successMessage}</p>
      ) : (
        <form className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor={inputId}>Email address</label>
          <input
            autoComplete="email"
            className="min-h-12 flex-1 rounded-full border border-transparent bg-brand-accent px-5 text-brand-secondary placeholder:text-brand-secondary/55 focus:border-brand-primary focus:outline-none"
            id={inputId}
            placeholder={signup.placeholder}
            required
            type="email"
          />
          <button className="min-h-12 rounded-full bg-brand-primary px-7 font-semibold text-brand-secondary transition-colors hover:bg-brand-secondary-light" type="submit">
            {signup.buttonLabel}
          </button>
        </form>
      )}
    </section>
  )
}
