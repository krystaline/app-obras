// services/apiService.ts
import {Platform} from 'react-native';

// Configuración de la API
const getBaseUrl = () => {
    if (__DEV__) {
        // En desarrollo
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8082'; // Para emulador Android
        } else if (Platform.OS === 'ios') {
            return 'http://192.168.0.104:8082'; // Para simulador iOS
        } else {
            return 'http://192.168.0.104:8082'; // Reemplaza XXX con tu IP local
        }
    } else {
        // En producción
        return 'https://tu-api-produccion.com';
    }
};

const API_BASE_URL = getBaseUrl();


// Tipos TypeScript
export interface TeamManager {
    id: string
    name: string
}

export interface Contact {
    id: string
    title: string
    signature: string
    phone: number
}

export interface Actividad {
    id: number,
    name: string,
    cantidad: number,
    unidad: string
}

export interface Proyecto {
    id: string
    title: string
    contact: Contact
    teamManager: TeamManager
    createdAt: string

}

export interface ParteData {
    id: number
    project: Proyecto;
    parteDate: string;
    teamManager: TeamManager;
    actividades: Actividad[]
    status: "active" | "pending" | "completed"
    signature : string
    comments: string

}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Clase de servicio API
class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const
            url = `${this.baseUrl}${endpoint}`;

        try {
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
                // Timeout de 10 segundos
                // signal: AbortSignal.timeout(10000),
            });


            if (!response.ok) {
                const errorText = await response.text();


                return {
                    success: false,
                    error: `
Error $
{
    response.status
}
: $
{
    response.statusText
}
`,
                    message: errorText || 'Error en la petición'
                };
            }

            const data = await response.json();

            return {
                success: true,
                data: data
            };

        } catch (error: any) {

            let errorMessage = 'Error de conexión';

            if (error.name === 'TimeoutError') {
                errorMessage = 'Timeout: La petición tardó demasiado';
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Sin conexión a internet o servidor no disponible';
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Servidor no disponible (verifica que esté ejecutándose)';
            }

            return {
                success: false,
                error: errorMessage,
                message: error.message
            };
        }
    }

    async getLastPartId(accessToken: string): Promise<ApiResponse<any>> {
        return this.makeRequest('/api/partes/lastId', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }

    // Crear un nuevo parte
    async createParte(parteData: ParteData, accessToken: string): Promise<ApiResponse<any>> {
        console.log('parteData', parteData);
        return this.makeRequest('/api/partes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parteData),
        });
    }

    // Obtener lista de partes
    async getPartes(accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest('/api/partes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }


    async getProyectos(accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest('/api/proyectos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }

    async getContactos(accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest('/api/contacts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }

    async getParte(accessToken: string, id: number): Promise<ApiResponse<any>> {
        return this.makeRequest(`/api/partes/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }

    /*
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.makeRequest('/api/health', {
                method: 'GET',
            });
            return response.success;
        } catch {
            return false;
        }
    }
*/

    // Getter para obtener la URL base (útil para debugging)
    getBaseUrl(): string {
        return this.baseUrl;
    }
}

// Exportar una instancia singleton
export const apiService = new ApiService();

