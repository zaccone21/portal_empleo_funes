"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type PropsEntrada = {
  children: ReactNode;
  className?: string;
  demora?: number;
  desplazamientoY?: number;
};

/**
 * Subtle entrance animation (fade + gentle upward glide) powered by `motion`.
 * Automatically respects `prefers-reduced-motion`.
 */
export function AnimarEntrada({
  children,
  className,
  demora = 0,
  desplazamientoY = 12,
}: PropsEntrada) {
  const reducir = useReducedMotion();

  if (reducir) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: desplazamientoY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.36,
        delay: demora,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list container that reveals its `<AnimarElemento>` children sequentially.
 */
export function AnimarGrupo({
  children,
  className,
  stagger = 0.055,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reducir = useReducedMotion();

  if (reducir) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="oculto"
      animate="visible"
      variants={{
        oculto: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: stagger },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual item inside an `<AnimarGrupo>`, with optional subtle hover lift.
 */
export function AnimarElemento({
  children,
  className,
  elevarAlPasar = false,
}: {
  children: ReactNode;
  className?: string;
  elevarAlPasar?: boolean;
}) {
  const reducir = useReducedMotion();

  if (reducir) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        oculto: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={elevarAlPasar ? { y: -3, transition: { duration: 0.18 } } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Collapsible container animated smoothly with `motion`.
 */
export function AnimarColapsable({
  abierto,
  children,
  className,
}: {
  abierto: boolean;
  children: ReactNode;
  className?: string;
}) {
  const reducir = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {abierto ? (
        <motion.div
          key="contenido-colapsable"
          initial={reducir ? { opacity: 1 } : { height: 0, opacity: 0 }}
          animate={reducir ? { opacity: 1 } : { height: "auto", opacity: 1 }}
          exit={reducir ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className={cn("overflow-hidden", className)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Gleaming/shimmering base block that sweeps a soft highlight across its shape.
 */
export function BloqueReluciente({ className }: { className?: string }) {
  const reducir = useReducedMotion();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/85",
        className,
      )}
    >
      {!reducir ? (
        <motion.div
          aria-hidden="true"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            repeat: Infinity,
            duration: 1.65,
            ease: "linear",
          }}
          className="pointer-events-none absolute inset-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-card/75 to-transparent"
        />
      ) : null}
    </div>
  );
}

/**
 * Gleaming skeleton that mirrors the exact leaf shape and internal structure of
 * a job offer card (`TarjetaOferta`) while loading.
 */
export function EsqueletoTarjetaOferta({ className }: { className?: string }) {
  const reducir = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex flex-col gap-3.5 overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/8",
        className,
      )}
    >
      {!reducir ? (
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-0 z-10 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-brand-mint/25 to-transparent"
        />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BloqueReluciente className="size-7 rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs bg-secondary/70" />
          <BloqueReluciente className="h-4 w-24 rounded-full" />
        </div>
        <BloqueReluciente className="h-5 w-20 rounded-full" />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <BloqueReluciente className="h-5 w-4/5 rounded-md" />
        <BloqueReluciente className="h-4 w-3/5 rounded-md" />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
        <BloqueReluciente className="h-4 w-28 rounded-md" />
        <BloqueReluciente className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Gleaming skeleton that mirrors the structure of the applicant's profile card (`VistaPerfilPostulante`).
 */
export function EsqueletoPerfilLaboral() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/8">
        <div className="flex items-center justify-between bg-brand-deep px-6 py-3.5">
          <BloqueReluciente className="h-4 w-36 bg-primary-foreground/20" />
          <BloqueReluciente className="h-6 w-40 rounded-full bg-primary-foreground/20" />
        </div>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2.5">
            <BloqueReluciente className="h-8 w-64 rounded-lg" />
            <div className="flex gap-4">
              <BloqueReluciente className="h-4 w-28" />
              <BloqueReluciente className="h-4 w-44" />
            </div>
          </div>
          <BloqueReluciente className="h-11 w-36 rounded-md" />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/8">
        <BloqueReluciente className="h-6 w-56 rounded-md" />
        <BloqueReluciente className="h-20 w-full rounded-xl" />
      </div>

      <div className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/8">
        <BloqueReluciente className="h-6 w-48 rounded-md" />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <BloqueReluciente className="h-12 w-full rounded-xl" />
          <BloqueReluciente className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
