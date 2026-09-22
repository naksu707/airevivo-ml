'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Menu, UserRound, Wind, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { NAV_LINKS } from '@/lib/auth-session'

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const links = user ? NAV_LINKS[user.role] : NAV_LINKS.VISITANTE

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wind className="size-5" aria-hidden />
          </span>
          <span className="flex items-center gap-1.5 leading-none">
            <span className="font-display text-base font-semibold tracking-tight">
              Aire<span className="text-primary">Vivo</span>
            </span>
            <span className="hidden text-[10px] text-muted-foreground sm:inline">Valle del Cauca · ML</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link href="/profile" className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <UserRound className="size-4 text-primary" aria-hidden />
                <span className="max-w-[180px] truncate">{user.name}</span>
              </Link>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={logout}>
                <LogOut className="size-3.5" aria-hidden />
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Button render={<Link href="/login" />} nativeButton={false} size="sm" className="rounded-lg">
              Iniciar sesión
            </Button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border/70 bg-background lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((link) => {
              const active =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
            <li className="pt-1">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex flex-1 items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
                    <UserRound className="size-4 text-primary" aria-hidden />
                    <span className="truncate">{user.name}</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => { logout(); setOpen(false) }}
                  >
                    <LogOut className="size-4" aria-hidden />
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <Button
                  render={<Link href="/login" onClick={() => setOpen(false)} />}
                  nativeButton={false}
                  className="w-full rounded-lg"
                >
                  Iniciar sesión
                </Button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
