import { describe, expect, test } from "vitest";

import { CV_TAMANO_MAXIMO_BYTES, formatearTamano, validarArchivoCv } from "./cv";

function archivo(contenido: BlobPart, nombre = "cv.pdf", type = "application/pdf") {
  return new File([contenido], nombre, { type });
}

describe("validarArchivoCv", () => {
  test("accepts a real PDF", async () => {
    expect(await validarArchivoCv(archivo("%PDF-1.7 contenido"))).toBeNull();
  });

  test("rejects an empty file", async () => {
    expect(await validarArchivoCv(archivo(""))).toMatch(/vacío/);
  });

  test("rejects a file over the size limit", async () => {
    const grande = new Uint8Array(CV_TAMANO_MAXIMO_BYTES + 1);
    grande.set([0x25, 0x50, 0x44, 0x46, 0x2d]);

    expect(await validarArchivoCv(archivo(grande))).toMatch(/pesa más de 5 MB/);
  });

  test("rejects a file that is not declared as PDF", async () => {
    expect(await validarArchivoCv(archivo("%PDF-1.7", "foto.jpg", "image/jpeg"))).toBe(
      "Tiene que ser un archivo PDF.",
    );
  });

  test("rejects a renamed file whose content is not a PDF (magic bytes)", async () => {
    expect(await validarArchivoCv(archivo("ÿØÿ foto", "cv.pdf"))).toMatch(/no es un PDF válido/);
  });

  test("accepts a .pdf with no MIME type when the content is a PDF", async () => {
    expect(await validarArchivoCv(archivo("%PDF-1.4", "cv.pdf", ""))).toBeNull();
  });
});

describe("formatearTamano", () => {
  test("uses KB under a megabyte and MB above", () => {
    expect(formatearTamano(245760)).toBe("240 KB");
    expect(formatearTamano(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatearTamano(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });
});
