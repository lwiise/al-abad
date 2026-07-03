import { redirect } from "next/navigation";

// The single settings form was split into per-page editors under /admin/pages.
export default function SettingsPage() {
  redirect("/admin/pages/home");
}
