interface GooglePlace {
    displayName?: { text: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    businessStatus?: string;
}

export interface FormattedPlace {
    nome?: string;
    endereco?: string;
    nota?: number;
    total_avaliacoes?: number;
    telefone?: string;
    site?: string;
    status?: string;
}

export const searchGooglePlaces = async (termo: string, localizacao: string, limite: number = 60): Promise<FormattedPlace[]> => {
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!API_KEY) {
        throw new Error("API Key do Google não configurada. Configure VITE_GOOGLE_API_KEY no .env");
    }

    const url = "https://places.googleapis.com/v1/places:searchText";
    const fields = [
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.nationalPhoneNumber",
        "places.websiteUri",
        "places.businessStatus",
        "nextPageToken"
    ];

    const headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": fields.join(",")
    };

    let todosLocais: GooglePlace[] = [];
    let pageToken: string | undefined = undefined;
    const fullQuery = `${termo} em ${localizacao}`;

    while (todosLocais.length < limite) {
        const payload: any = {
            textQuery: fullQuery,
            languageCode: "pt-BR",
            maxResultCount: 20
        };

        if (pageToken) {
            payload.pageToken = pageToken;
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro API Google: ${errorText}`);
            }

            const data = await response.json();
            const novosLocais = data.places || [];
            todosLocais = [...todosLocais, ...novosLocais];

            pageToken = data.nextPageToken;

            if (!pageToken || todosLocais.length >= limite) {
                break;
            }

            // Pequena pausa para evitar rate limit
            await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            console.error("Erro na busca:", error);
            throw error;
        }
    }

    return todosLocais.slice(0, limite).map(place => ({
        nome: place.displayName?.text,
        endereco: place.formattedAddress,
        nota: place.rating,
        total_avaliacoes: place.userRatingCount,
        telefone: place.nationalPhoneNumber,
        site: place.websiteUri,
        status: place.businessStatus
    }));
};
