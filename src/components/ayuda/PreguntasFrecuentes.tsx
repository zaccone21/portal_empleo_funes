"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import type { PreguntaFrecuente } from "./contenido";

/**
 * Frequent questions of the help screen (P20), as an accordion: the questions
 * fit on one phone screen and each answer opens in place, without leaving
 * the page. Text at 16px like the rest of the portal (RNF3).
 */
export function PreguntasFrecuentes({ preguntas }: { preguntas: PreguntaFrecuente[] }) {
  return (
    <section
      aria-labelledby="preguntas-titulo"
      className="flex flex-col gap-2 rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-md bg-card p-5 ring-1 ring-foreground/5"
    >
      <h2 id="preguntas-titulo" className="text-2xl font-semibold">
        Preguntas frecuentes
      </h2>
      <Accordion>
        {preguntas.map(({ pregunta, respuesta }) => (
          <AccordionItem key={pregunta} value={pregunta}>
            <AccordionTrigger className="min-h-11 gap-3 text-base font-semibold hover:no-underline hover:text-primary">
              {pregunta}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              <p>{respuesta}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
