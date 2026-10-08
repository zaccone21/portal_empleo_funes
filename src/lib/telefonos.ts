export function normalizarTelefonoAR(raw: string | null | undefined): string | null {
  if (!raw) return null;
  
  // Quitar todo lo que no sea dígito
  let digits = raw.replace(/\D/g, "");
  
  // Quitar '54' inicial
  if (digits.startsWith("54")) {
    digits = digits.slice(2);
  }
  
  // Quitar '9' inicial SOLO si quedan 10 dígitos después
  if (digits.startsWith("9") && digits.length === 11) {
    digits = digits.slice(1);
  }
  
  // Quitar '0' inicial (por si escriben 0341)
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  
  if (digits.length === 10) {
    return digits;
  }
  
  return null;
}

export function formatearTelefonoAR(raw: string | null | undefined): string {
  if (!raw) return "-";
  
  const normalizado = normalizarTelefonoAR(raw);
  if (!normalizado) return raw;
  
  // Mostrar "341 271 9319"
  const area = normalizado.slice(0, 3);
  const pt1 = normalizado.slice(3, 6);
  const pt2 = normalizado.slice(6);
  
  // Asumimos código de área de 3 (Rosario/Funes), si es de 4 (ej 03413) o 2 (ej 011), 
  // esto formatea fijo a 3-3-4. El requerimiento dice: "341 271 9319" (código de área + número, agrupado).
  // Para Funes (341) esto funciona perfecto.
  return `${area} ${pt1} ${pt2}`;
}

export function enlaceWhatsApp(raw: string | null | undefined): string | null {
  const normalizado = normalizarTelefonoAR(raw);
  if (!normalizado) return null;
  return `https://wa.me/549${normalizado}`;
}

export function enlaceLlamada(raw: string | null | undefined): string {
  if (!raw) return "";
  const normalizado = normalizarTelefonoAR(raw);
  if (normalizado) return `tel:+54${normalizado}`;
  
  const digits = raw.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}
