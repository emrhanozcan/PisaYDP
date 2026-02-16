
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.role === "admin") {
        redirect("/admin");
    } else if (session.role === "branch_user") {
        redirect("/branch");
    } else if (session.role === "italy_staff") {
        redirect("/italy");
    } else if (session.role === "technical_support") {
        redirect("/technical");
    } else {
        redirect("/mentor");
    }
}
