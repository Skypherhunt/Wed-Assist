import { redirect } from "next/navigation";

// Public sign-ups aren't open yet — anyone reaching /signup (including by typing
// the URL directly) is sent to the "coming soon" gate.
export default function SignupPage() {
  redirect("/coming-soon");
}
