"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { MENU_ADMIN } from "@/features/navegacion/config";

export function AdminBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/admin") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-primary">Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Encontrar a qué item principal corresponde
  let activeItem;
  for (const grupo of MENU_ADMIN) {
    for (const item of grupo.items) {
      if (item.url !== "/admin" && pathname.startsWith(item.url)) {
        activeItem = item;
        break;
      }
    }
    if (activeItem) break;
  }

  // Si estamos en un detalle (ej: /admin/ofertas/123)
  const segments = pathname.replace("/admin/", "").split("/");
  const isDetail = segments.length > 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/admin" />}>Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        {activeItem && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isDetail ? (
                <BreadcrumbLink render={<Link href={activeItem.url} />}>{activeItem.titulo}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-semibold text-primary">{activeItem.titulo}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        {isDetail && activeItem && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary">Detalle</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
