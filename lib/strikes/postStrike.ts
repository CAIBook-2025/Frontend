import { StrikeType } from "@/types/strike";

interface PostStrikeData {
    student_email: string;
    type: string;
    description: string;
    date?: string;
    admin_email: string;
}

export async function postStrike(accessToken: string, data: PostStrikeData) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strikes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 409) {
            throw new Error(errorData.error || 'Ya existe un strike similar');
        }

        throw new Error(errorData.error || 'No se pudo crear el strike');
    }

    return response.json();
}
