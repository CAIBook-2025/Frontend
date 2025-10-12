import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function CallbackCheck() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        redirect('/auth/login?returnTo=/Callback-check');
    }

    const accessToken = session.tokenSet.accessToken;
    
    const res = await fetch('http://localhost:3003/api/users/check', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store",
    })
    const data = await res.json();

    if (data.exists) {
        redirect('/ProfileSSR');
    } else {
        redirect('/CompleteProfile');
    }

}
