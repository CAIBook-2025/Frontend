import { Strike } from "@/types/strike";

export async function getStrikes(accessToken: string): Promise<Strike[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strikes`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch strikes");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching strikes:", error);
        return [];
    }
}
