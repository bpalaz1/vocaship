import { redirect } from "next/navigation";

export default function ShopRedirectPage() {
  redirect("/games?tab=shop");
}
