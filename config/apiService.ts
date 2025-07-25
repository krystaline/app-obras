// services/apiService.ts
import {Platform} from 'react-native';
import {ApiResponse, ParteImprimirPDF} from "./types";

// Configuración de la API
const getBaseUrl = () => {
    if (__DEV__) {
        // En desarrollo
        if (Platform.OS === 'android') {
            return 'http://192.168.0.104:8082';
        } else if (Platform.OS === 'ios') {
            return 'http://10.0.2.104:8082';
        } else {
            return 'http://192.168.0.104:8082';
        }
    } else {
        // En producción
        return 'https://tu-api-produccion.com';
    }
};

const API_BASE_URL = getBaseUrl();


// Clase de servicio API
class ApiService {
    private readonly baseUrl: string;

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
                    error: `Error ${response.status}: ${response.statusText}`,
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

    async getLineasOferta(idOferta: number, accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest(`/api/lineas/${idOferta}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }


    // Crear un nuevo parte
    async createParte(parteData: ParteImprimirPDF, accessToken: string): Promise<ApiResponse<any>> {
        console.log('partepost', JSON.stringify(parteData));
        return this.makeRequest('/api/partes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parteData),
        });
    }

    async imprimirPDF(parteId: string, accessToken: string): Promise<ApiResponse<any>> {
        return this.makeRequest(`/api/pdf/${parteId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
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

    async getOfertas(accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest('/api/ofertas', { // todo he cambiado esto, antes era ofertas
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

    async getPartePdf(parteId: number, accessToken: string): Promise<ApiResponse<any>> {
        return this.makeRequest(`/api/partes/parte/${parteId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });
    }

    // Getter para obtener la URL base (útil para debugging)
    getBaseUrl(): string {
        return this.baseUrl;
    }
}

// Exportar una instancia singleton
export const apiService = new ApiService();

