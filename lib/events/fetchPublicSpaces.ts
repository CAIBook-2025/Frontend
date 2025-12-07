// lib/events/fetchPublicSpaces.ts

import { PublicSpace } from "@/types/eventRequest";

export async function fetchPublicSpaces(
  accessToken: string | null
): Promise<PublicSpace[]> {
  if (!accessToken) {
    console.warn("fetchPublicSpaces called without access token");
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public-spaces`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch public spaces", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Filtrar solo los espacios disponibles
    const spaces = Array.isArray(data) ? data : [];
    return spaces.filter(
      (space: PublicSpace) => space.available === "AVAILABLE"
    );
  } catch (error) {
    console.error("Error fetching public spaces:", error);
    return [];
  }
}

// Función para obtener todos los espacios (incluyendo no disponibles)
export async function fetchAllPublicSpaces(
  accessToken: string | null
): Promise<PublicSpace[]> {
  if (!accessToken) {
    console.warn("fetchAllPublicSpaces called without access token");
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public-spaces`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch public spaces", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching public spaces:", error);
    return [];
  }
}

