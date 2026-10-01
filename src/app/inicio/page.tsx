import { redirect } from "next/navigation";

/**
 * /inicio answered 404 and confused people who typed it. The portal's home
 * is "/" (P01, D-029), so this address just leads there.
 */
export default function InicioPage() {
  redirect("/");
}
