// services/apiService.ts
import {Platform} from 'react-native';

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


// Tipos TypeScript
export interface Oferta {
    idOferta: number,
    fecha: Date
    cliente: string
    idProyecto: string
    descripcion: string
    observaciones: string
    status: string
}

export interface LineaOferta {
    ocl_IdOferta: number | null;
    ocl_idlinea: number | null;
    ocl_revision: number | null;
    occ_SerieOferta: number | null;
    occ_revision: number | null;
    occ_idempresa: number | null;
    occ_añonum: number | null;
    occ_numoferta: number;
    occ_descrip: string | null;
    occ_idestado: number | null;
    occ_idproyecto: string | null;
    cd_idcliente: string | null;
    cd_Cliente: string | null;
    ocl_IdArticulo: string | null;
    ocl_Descrip: string | null;
    ocl_Cantidad: number | null;
    ocl_PesoNeto: number | null;
    ocl_NumBultos: number | null;
    ocl_UnidadesPres: number | null;
    ppcl_IdParte: number | null;
    ppcl_Capitulo: string | null; // Assuming it would be a string if not null
    ppcl_IdArticulo: string | null; // Assuming it would be a string if not null
    ppcl_DescripArticulo: string | null; // Assuming it would be a string if not null
    ppcl_cantidad: number | null;
    ppcl_UnidadMedida: string | null; // Assuming it would be a string if not null
    ppcl_Certificado: number;
    ppcc_observaciones: string | null;
}

export interface Cliente {
    ocl_IdOferta: number
    ocl_idLinea: number
    ocl_Descrip: string
    ocl_cantidad: number

}

export interface LineaEnviadaPost {
    id: number
    id_parte: number
    id_oferta: number
    descripcion: string
    unidades_totales: number
    medida: string
    unidades_puestas_hoy: number
    ya_certificado: number
}

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
    idOferta: number,
    idParte: number,
    pdf: any,
    signature: string
}

export interface ParteEnviadoPost {
    id_oferta: number,
    id_parte: number,
    // pdf: any,
    signature: string,
    lineas: LineaEnviadaPost[],
    comentarios: string,
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

    async getLineasOferta(idOferta: number, accessToken: string): Promise<ApiResponse<any[]>> {
        return this.makeRequest(`/api/lineas/${idOferta}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }


    // Crear un nuevo parte
    async createParte(parteData: ParteEnviadoPost, accessToken: string): Promise<ApiResponse<any>> {
        console.log('parteData', JSON.stringify(parteData));
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

    async getParte(accessToken: string, id: number): Promise<ApiResponse<any>> {
        return this.makeRequest(`/api/partes/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }

    // Getter para obtener la URL base (útil para debugging)
    getBaseUrl(): string {
        return this.baseUrl;
    }
}

// Exportar una instancia singleton
export const apiService = new ApiService();

