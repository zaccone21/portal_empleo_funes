import type { Metadata } from "next";
import Link from "next/link";
import { EyeOffIcon, FileLockIcon, HandshakeIcon, MailIcon, ScaleIcon, UserRoundCheckIcon, type LucideIcon } from "lucide-react";

import { Seccion } from "@/components/marca/Seccion";
import { AnimarElemento, AnimarGrupo } from "@/components/marca/animaciones";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Privacidad y uso de tus datos" };

const DATOS: { dato: string; paraQue: string }[] = [
  { dato: "Email y contraseña", paraQue: "Que solo vos puedas entrar a tu cuenta, y avisarte por correo de tus citas y cursos." },
  { dato: "DNI", paraQue: "Identificarte y evitar cuentas repetidas. Solo lo ve la Oficina." },
  { dato: "Nombre, apellido, teléfono y dirección", paraQue: "Que la Oficina te pueda llamar o escribir. La dirección sirve para ofrecerte trabajo cerca de tu casa y no se muestra a las empresas." },
  { dato: "Rubros y experiencia", paraQue: "Mostrarte ofertas que se parecen a lo que sabés hacer." },
  { dato: "Tu CV (PDF o imagen PNG)", paraQue: "Que la Oficina lo revise y, si tu perfil encaja, se lo presente a la empresa." },
  { dato: "Datos de la empresa (CUIT, razón social y contacto)", paraQue: "Que la Oficina verifique a la empresa antes de que publique ofertas." },
];

const QUIEN_VE: { quien: string; ve: string; Icono: LucideIcon }[] = [
  { quien: "Vos", ve: "Todos tus datos, siempre. Podés corregirlos cuando quieras desde «Mi perfil».", Icono: UserRoundCheckIcon },
  { quien: "La Oficina de Empleo", ve: "Tu perfil completo y tu CV, para ayudarte y evaluar tus postulaciones.", Icono: HandshakeIcon },
  { quien: "Una empresa", ve: "Solo si la Oficina te presentó a una de sus ofertas: tu nombre, teléfono, email, rubros y CV. Nunca tu DNI ni tu dirección.", Icono: FileLockIcon },
  { quien: "Cualquier visitante", ve: "Nada de tus datos. Las ofertas son públicas, las personas no.", Icono: EyeOffIcon },
];

/**
 * Privacy notice (Ley 25.326): which personal data the portal asks for and why,
 * who sees each one, what is never done, how long it is kept and how to
 * exercise the rights of access, correction and deletion. Plain language on
 * purpose: it is linked from the registration forms and from the footer.
 */
export default function PrivacidadPage() {
  return (
    <Seccion
      titulo="Privacidad y uso de tus datos"
      bajada="Qué datos te pedimos, para qué los usamos y quién puede verlos. En palabras simples."
    >
      <div className="flex flex-col gap-10">
        <section aria-labelledby="privacidad-datos" className="flex flex-col gap-4">
          <h2 id="privacidad-datos" className="font-heading text-2xl font-semibold">
            Qué datos pedimos y para qué
          </h2>
          <dl className="grid gap-3 md:grid-cols-2">
            {DATOS.map(({ dato, paraQue }) => (
              <div key={dato} className="flex flex-col gap-1 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5">
                <dt className="font-heading text-base font-semibold text-foreground">{dato}</dt>
                <dd className="text-base text-muted-foreground">{paraQue}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="privacidad-quien" className="flex flex-col gap-4">
          <h2 id="privacidad-quien" className="font-heading text-2xl font-semibold">
            Quién puede ver tus datos
          </h2>
          <AnimarGrupo className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {QUIEN_VE.map(({ quien, ve, Icono }) => (
              <AnimarElemento key={quien}>
                <div className="flex h-full flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5">
                  <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-secondary text-primary">
                    <Icono className="size-5" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold">{quien}</h3>
                  <p className="text-base text-muted-foreground">{ve}</p>
                </div>
              </AnimarElemento>
            ))}
          </AnimarGrupo>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="privacidad-nunca" className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/5">
            <h2 id="privacidad-nunca" className="font-heading text-xl font-semibold">Lo que nunca hacemos</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-base text-muted-foreground">
              <li>No vendemos ni regalamos tus datos.</li>
              <li>No los publicamos en el sitio.</li>
              <li>No los usamos para publicidad.</li>
              <li>No pedimos fotos de perfil.</li>
              <li>Tu CV nunca queda en un enlace público: se abre con un enlace que dura pocos minutos.</li>
            </ul>
          </section>

          <section aria-labelledby="privacidad-correos" className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/5">
            <h2 id="privacidad-correos" className="inline-flex items-center gap-2 font-heading text-xl font-semibold">
              <MailIcon aria-hidden="true" className="size-5 text-primary" />
              Qué correos te mandamos
            </h2>
            <p className="text-base text-muted-foreground">
              Solo los que tienen que ver con tu cuenta: activarla, recuperar la contraseña, confirmar una pre-entrevista y avisarte de un curso que la Oficina te asignó. No mandamos propaganda.
            </p>
          </section>
        </div>

        <section aria-labelledby="privacidad-derechos" className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-brand-deep p-6 text-primary-foreground sm:p-8">
          <h2 id="privacidad-derechos" className="inline-flex items-center gap-2 font-heading text-2xl font-semibold">
            <ScaleIcon aria-hidden="true" className="size-6 text-brand-mint" />
            Tus derechos
          </h2>
          <p className="max-w-3xl text-base text-primary-foreground/85">
            Según la Ley Nacional N.° 25.326 de Protección de los Datos Personales, podés pedir ver, corregir, actualizar o borrar tus datos cuando quieras. Podés corregir la mayoría vos mismo desde «Mi perfil». Para pedir que borremos tu cuenta, acercate a la Oficina de Empleo (Av. Santa Fe 1689, lunes a viernes de 7 a 13 hs).
          </p>
          <p className="max-w-3xl text-sm text-primary-foreground/70">
            La Agencia de Acceso a la Información Pública es el organismo que atiende los reclamos por el incumplimiento de esta ley.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/ayuda" className={cn(buttonVariants({ size: "lg" }), "bg-brand-mint text-brand-deep hover:bg-brand-mint/90")}>
              Ir a la ayuda
            </Link>
            <Link
              href="/postulante/registrarse"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground")}
            >
              Crear mi cuenta
            </Link>
          </div>
        </section>
      </div>
    </Seccion>
  );
}
