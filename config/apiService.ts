// services/apiService.ts
import {Platform} from 'react-native';
import {ApiResponse, ParteImprimirPDF, Worker} from "./types";
import {ParteMOEnviar} from "../screens/partesManoObra/NewParteMOScreen";

// Configuración de la API
const getBaseUrl = () => {
    if (__DEV__) {
        // En desarrollo
        if (Platform.OS === 'android') {
            return 'http://10.0.2.114:8082';
        } else if (Platform.OS === 'ios') {
            console.log("ESTOY EN IOS")
            return 'http://10.0.2.114:8082';
        } else {
            return 'http://192.168.0.114:8082';
        }
    } else {
        // En producción
        return 'http://85.50.122.98:8082';
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
                console.error(error)
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

    async getMateriales(accessToken: string): Promise<ApiResponse<any>>{
        return this.makeRequest('/api/materiales', {
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

    async getWorkers(accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest('/api/workers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
    }

    async assignWorkers(accessToken: string, parteId: number, workers: Worker[]): Promise<ApiResponse<any[]>> {
        return this.makeRequest(`/api/partes/${parteId}/workers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(workers),
        })
    }

    async getWorkersParte(accessToken: string, parteId: number): Promise<ApiResponse<any[]>> {
        return this.makeRequest(`/api/partes/${parteId}/workers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
    }

    async createParteMO(accessToken: string, data: ParteMOEnviar): Promise<ApiResponse<any>> {
        console.log(data)
        return this.makeRequest(`/api/partesMO/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data),
        })
    }

    // partes mano de obra
    async getPartesMO(idOferta: number, accessToken: string): Promise<ApiResponse<any[]>> {
        console.log(idOferta)
        return this.makeRequest(`/api/partesMO/${idOferta}`, {
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
        console.log("ESTOY CONECTADO?? ", API_BASE_URL)
        return this.makeRequest('/api/ofertas', { // todo he cambiado esto, antes era ofertas
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


    async getImages(accessToken: string, idOferta: number): Promise<ApiResponse<any>> {
        // This endpoint now returns an object like { "images": ["image1.jpg", "image2.jpg"] }
        return this.makeRequest(`/api/oferta/imagenes/${idOferta}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }


    async postImage(accessToken: string, formdata: any): Promise<ApiResponse<any>> {
        console.log("pimpam")
        return this.makeRequest(`/api/imagen`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formdata,
        });
    }
}

// Exportar una instancia singleton
export const apiService = new ApiService();

