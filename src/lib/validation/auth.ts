import { z } from "zod";

import { roleSchema } from "./role";

/*
 * Validation for the access flow (P02, P08, P13; D-020).
 *
 * There are two kinds of schemas:
 * - API schemas (ingresoSchema, registroSchema, ...): the body each
 *   /api/auth/* endpoint accepts. The forms validate with them before sending,
 *   and the Route Handlers validate again on the server (AGENTS §7).
 * - Form schemas (formulario*Schema): the API schema plus fields that exist
 *   only on screen, such as "Repetí la contraseña". They never reach the server.
 *
 * Messages are short, in voseo, and are shown next to their field (RNF3).
 */

/**
 * Minimum password length (D-020). Supabase Auth must be configured with the
 * same value (Authentication → Providers → Email → Minimum password length);
 * otherwise a password accepted here would be rejected by Supabase.
 */
export const PASSWORD_MIN_LENGTH = 8;

/** Supabase Auth hashes passwords with bcrypt, which rejects more than 72 characters. */
export const PASSWORD_MAX_LENGTH = 72;

export type NivelFuerzaContrasena = "vacia" | "debil" | "regular" | "segura";

export type EvaluacionFuerzaContrasena = {
  nivel: NivelFuerzaContrasena;
  etiqueta: "" | "Débil" | "Regular" | "Segura";
  motivoDebil?: string;
  barrasActivas: 0 | 1 | 2 | 3;
  requisitos: {
    longitud: boolean;
    minuscula: boolean;
    mayuscula: boolean;
    numero: boolean;
    simbolo: boolean;
  };
};

const PALABRAS_DEBILES = [
  "contrasena",
  "password",
  "clave",
  "secreto",
  "admin",
  "usuario",
  "qwerty",
  "asdf",
  "zxcv",
  "funes",
  "empleo",
  "portal",
  "prueba",
  "ejemplo",
];

const SECUENCIAS_DEBILES = [
  "012",
  "123",
  "234",
  "345",
  "456",
  "567",
  "678",
  "789",
  "890",
  "987",
  "654",
  "321",
  "210",
  "abc",
];

function detectarPatronPredecible(password: string): boolean {
  const normalizada = password
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (PALABRAS_DEBILES.some((palabra) => normalizada.includes(palabra))) {
    return true;
  }
  if (SECUENCIAS_DEBILES.some((secuencia) => normalizada.includes(secuencia))) {
    return true;
  }
  // 3 or more identical characters in a row (e.g. "aaa", "111")
  if (/(.)\1\1/.test(normalizada)) {
    return true;
  }
  return false;
}

/**
 * Evaluates password strength for the non-blocking visual indicator in
 * registration and password reset forms (Débil / Regular / Segura).
 *
 * - Unicode letters (`ñ`, `á`, `é`...) count as lowercase/uppercase letters,
 *   never as special symbols (`[^\p{L}\p{N}\s]`).
 * - Predictable words ("contraseña", "password", "clave", "admin"...) or
 *   sequences ("123", "abc", "111") downgrade the password to "Débil".
 * - Reaching "Segura" requires all 5 criteria (8+ chars, lowercase, uppercase,
 *   digit, and a true special symbol) without predictable patterns.
 */
export function evaluarFuerzaContrasena(password: string): EvaluacionFuerzaContrasena {
  if (!password) {
    return {
      nivel: "vacia",
      etiqueta: "",
      barrasActivas: 0,
      requisitos: {
        longitud: false,
        minuscula: false,
        mayuscula: false,
        numero: false,
        simbolo: false,
      },
    };
  }

  const longitud = password.length >= PASSWORD_MIN_LENGTH;
  const minuscula = /\p{Ll}/u.test(password);
  const mayuscula = /\p{Lu}/u.test(password);
  const numero = /[0-9]/.test(password);
  const simbolo = /[^\p{L}\p{N}\s]/u.test(password);

  const cumpleTodos = longitud && minuscula && mayuscula && numero && simbolo;
  const puntos = [longitud, minuscula, mayuscula, numero, simbolo].filter(Boolean).length;
  const esPredecible = detectarPatronPredecible(password);

  if (esPredecible) {
    return {
      nivel: "debil",
      etiqueta: "Débil",
      motivoDebil: "Evitá palabras comunes (como «contraseña») o secuencias («123»).",
      barrasActivas: 1,
      requisitos: { longitud, minuscula, mayuscula, numero, simbolo },
    };
  }

  if (cumpleTodos) {
    return {
      nivel: "segura",
      etiqueta: "Segura",
      barrasActivas: 3,
      requisitos: { longitud, minuscula, mayuscula, numero, simbolo },
    };
  }

  if (longitud && puntos >= 3) {
    return {
      nivel: "regular",
      etiqueta: "Regular",
      barrasActivas: 2,
      requisitos: { longitud, minuscula, mayuscula, numero, simbolo },
    };
  }

  return {
    nivel: "debil",
    etiqueta: "Débil",
    barrasActivas: 1,
    requisitos: { longitud, minuscula, mayuscula, numero, simbolo },
  };
}

/**
 * Email: trims spaces first (phone keyboards and autocomplete often add a
 * trailing one), then requires a non-empty value, then a valid format. The pipe
 * only checks the format when the value is not empty, so an empty field shows
 * "Ingresá tu email" instead of "email inválido".
 */
export const emailSchema = z
  .string({ error: "Ingresá tu email" })
  .trim()
  .min(1, "Ingresá tu email")
  .pipe(z.email("Revisá el email: tiene que ser como nombre@correo.com"));

/**
 * Password when logging in: only required. Its length is not checked because
 * admin accounts are created by hand (RF1.1.4) and may predate the rule; the
 * server decides whether the password is right.
 */
const passwordIngresoSchema = z
  .string({ error: "Ingresá tu contraseña" })
  .min(1, "Ingresá tu contraseña");

/**
 * Password when creating one (registration and new password): length only,
 * with no uppercase, number or symbol rules, which confuse users with little
 * digital experience (D-020).
 */
const passwordNuevaSchema = z
  .string({ error: "Ingresá una contraseña" })
  .min(
    PASSWORD_MIN_LENGTH,
    `La contraseña tiene que tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `La contraseña puede tener hasta ${PASSWORD_MAX_LENGTH} caracteres`,
  );

/**
 * Roles someone can register with. Admin accounts are never created from the
 * registration form (RF1.1.4, D-011); the database trigger also turns any
 * other value into 'postulante', so this is the first of two barriers.
 */
export const rolRegistrableSchema = roleSchema.exclude(["admin"], {
  error: "Tipo de cuenta inválido",
});

export type RolRegistrable = z.infer<typeof rolRegistrableSchema>;

/**
 * Identifier when logging in: accepts a valid email (`nombre@correo.com`),
 * a 7- or 8-digit DNI (with or without dots), or an 11-digit CUIT/CUIL
 * (with or without hyphens/dots).
 */
export const identificadorAccesoSchema = z
  .string({ error: "Ingresá tu email, DNI o CUIT" })
  .trim()
  .min(1, "Ingresá tu email, DNI o CUIT")
  .refine(
    (valor) => {
      if (valor.includes("@")) {
        return z.email().safeParse(valor).success;
      }
      const soloDigitos = valor.replace(/\D/g, "");
      const soloCaracteresPermitidos = /^[0-9.\-\s]+$/.test(valor);
      return (
        soloCaracteresPermitidos &&
        (soloDigitos.length === 7 || soloDigitos.length === 8 || soloDigitos.length === 11)
      );
    },
    {
      error: "Ingresá un email válido, tu DNI (7 u 8 números) o el CUIT (11 números)",
    },
  );

/** Body of POST /api/auth/ingreso. */
export const ingresoSchema = z.object({
  email: identificadorAccesoSchema,
  password: passwordIngresoSchema,
});

export const dniSchema = z
  .string({ error: "Ingresá tu DNI" })
  .trim()
  .min(1, "Ingresá tu DNI")
  .regex(/^[0-9]{7,8}$/, "El DNI tiene que tener 7 u 8 números, sin puntos");

export const cuitSchema = z
  .string({ error: "Ingresá el CUIT de tu empresa" })
  .trim()
  .min(1, "Ingresá el CUIT de tu empresa")
  .regex(/^[0-9]{2}-?[0-9]{8}-?[0-9]$/, "CUIT inválido (ej: 30-12345678-9)")
  .transform((val) => {
    const nums = val.replace(/\D/g, "");
    return `${nums.slice(0, 2)}-${nums.slice(2, 10)}-${nums.slice(10, 11)}`;
  });

/**
 * Consent to the privacy notice (/privacidad): required to create an account.
 * The server checks it too and stores the moment in the account's metadata.
 */
export const aceptaPrivacidadSchema = z.literal(true, {
  error: "Para crear tu cuenta tenés que aceptar cómo usamos tus datos",
});

/** Body of POST /api/auth/registro. Discriminates between applicant (needs DNI) and company (needs CUIT). */
export const registroPostulanteSchema = z.object({
  role: z.literal("postulante"),
  email: emailSchema,
  password: passwordNuevaSchema,
  dni: dniSchema,
  aceptaPrivacidad: aceptaPrivacidadSchema,
});

export const registroEmpresaSchema = z.object({
  role: z.literal("empresa"),
  email: emailSchema,
  password: passwordNuevaSchema,
  cuit: cuitSchema,
  aceptaPrivacidad: aceptaPrivacidadSchema,
});

export const registroSchema = z.discriminatedUnion("role", [
  registroPostulanteSchema,
  registroEmpresaSchema,
]);

/** Body of POST /api/auth/recuperar-contrasena. */
export const recuperarContrasenaSchema = z.object({
  email: emailSchema,
});

/** Body of POST /api/auth/verificar-codigo (6-digit OTP PIN from confirmation email). */
export const verificarCodigoEmailSchema = z.object({
  email: emailSchema,
  codigo: z
    .string({ error: "Ingresá el código de 6 dígitos" })
    .trim()
    .regex(/^[0-9]{6}$/, "El código tiene que tener 6 números"),
});

/** Body of POST /api/auth/reenviar-confirmacion. */
export const reenviarConfirmacionSchema = z.object({
  email: emailSchema,
});

/** Body of PATCH /api/auth/contrasena (the user arrives with the session opened by the email link). */
export const nuevaContrasenaSchema = z.object({
  password: passwordNuevaSchema,
});

const repetirPasswordSchema = z.string({ error: "Repetí la contraseña" }).min(1, "Repetí la contraseña");

/**
 * Checks that both password fields match. The issue is attached to
 * "repetirPassword" so the message shows under the second field. Zod runs this
 * only after every field is valid on its own, so the user fixes one thing at a
 * time.
 */
function coincidenLasContrasenas(datos: { password: string; repetirPassword: string }) {
  return datos.password === datos.repetirPassword;
}

const errorNoCoinciden = {
  path: ["repetirPassword"],
  error: "Las contraseñas no coinciden",
};

/** Registration form (P02, P08): the API fields, plus the repeated password. */
export const formularioRegistroSchema = z
  .intersection(
    registroSchema,
    z.object({ repetirPassword: repetirPasswordSchema })
  )
  .refine(coincidenLasContrasenas, errorNoCoinciden);

/** New password form: the API field plus the repeated password. */
export const formularioNuevaContrasenaSchema = nuevaContrasenaSchema
  .extend({ repetirPassword: repetirPasswordSchema })
  .refine(coincidenLasContrasenas, errorNoCoinciden);

/**
 * Answer of POST /api/auth/ingreso and PATCH /api/auth/contrasena: where to go
 * next. The server decides it from the role stored in `profiles`, never from
 * anything the browser sends (/ofertas, /empresa or /admin). Only internal
 * paths are accepted ("/..." but not "//..."), so a bad answer cannot send the
 * user to another site.
 */
export const respuestaConDestinoSchema = z.object({
  destino: z.string().regex(/^\/(?!\/)/, "Destino inválido"),
});

/**
 * Answer of POST /api/auth/registro (D-034): null when the account has to be
 * activated from the email; the role's home when Supabase logged the person
 * in right away (email confirmation off, handy in development).
 */
export const respuestaRegistroSchema = z.object({
  destino: z.string().regex(/^\/(?!\/)/, "Destino inválido").nullable(),
});

/**
 * Answer of GET /api/auth/sesion (D-028): who is logged in, or null. "Nobody"
 * is a normal answer (200), not an error: public screens ask it too.
 * Only the role and the email; the role comes from `profiles`, never from
 * anything the user can edit (AGENTS §7).
 */
export const respuestaSesionSchema = z.object({
  usuario: z
    .object({
      rol: roleSchema,
      email: z.string(),
    })
    .nullable(),
});

export type UsuarioSesion = NonNullable<z.infer<typeof respuestaSesionSchema>["usuario"]>;

export type DatosIngreso = z.infer<typeof ingresoSchema>;
export type DatosRegistro = z.infer<typeof registroSchema>;
export type DatosRecuperarContrasena = z.infer<typeof recuperarContrasenaSchema>;
export type DatosNuevaContrasena = z.infer<typeof nuevaContrasenaSchema>;
export type DatosVerificarCodigoEmail = z.infer<typeof verificarCodigoEmailSchema>;
export type DatosReenviarConfirmacion = z.infer<typeof reenviarConfirmacionSchema>;
