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
    ocl_tipoUnidad : string | null;
    ppcl_Certificado: number;
    ppcc_observaciones: string | null;
}

export interface LineaPedidoPDF {
    id: number;
    capitulo: number;
    idArticulo: string;
    id_parte: number;
    id_oferta: number;
    descripcion: string;
    unidades_totales: number;
    ya_certificado: number;
    unidades_puestas_hoy: number;
    medida: string;
    cantidad: number;
}

export interface ParteImprimirPDF {
    nParte: number;
    proyecto: string;
    oferta: string;
    jefe_equipo: string;
    telefono: string;
    fecha: string; // o Date si manejas la conversión en el frontend
    contacto_obra: string;
    comentarios?: string;
    lineas: LineaPedidoPDF[]; // O LineaPedidoPost[] si es lo que envías
    firma: string; // Base64
    idoferta: number;

    pdf: string | null;

}


export interface LineaOfertaResponse {
    ocl_IdOferta?: number; // Puede ser nulo o indefinido en algunos contextos
    ocl_idlinea: number;
    ocl_revision?: number;
    occ_SerieOferta?: string;
    occ_revision?: number;
    occ_idempresa?: number;
    occ_añonum?: number;
    occ_numoferta?: number;
    occ_descrip?: string;
    occ_idestado?: number;
    occ_idproyecto?: string;
    cd_idcliente?: number;
    cd_Cliente?: string;
    ocl_IdArticulo?: string;
    ocl_Descrip?: string;
    ocl_Cantidad?: number;
    ocl_PesoNeto?: number;
    ocl_NumBultos?: number;
    ocl_UnidadesPres?: string | number; // ¡Cambiado a string | number!
    ppcl_IdParte?: number | null; // Puede ser nulo si no tiene parte
    ppcl_Capitulo?: number | null;
    ppcl_IdArticulo?: string | null;
    ppcl_DescripArticulo?: string | null;
    ppcl_cantidad?: number | null;
    ppcl_UnidadMedida?: string | null;
    ppcl_Certificado?: number | null;
    ppcc_observaciones?: string | null;
}

// Para enviar una línea individual en el array 'lineas' del ParteImprimirPDF
export interface LineaPartePost {
    id: number; // ocl_idlinea
    id_parte: number;
    id_oferta: number; // ocl_IdOferta
    descripcion: string; // ocl_Descrip
    medida: string; // ¡Cambiado a string | number!
    unidades_puestas_hoy: number;
    unidades_totales: number; // ocl_Cantidad
    ya_certificado: number; // ppcl_Certificado
    capitulo?: number | null; // ppcl_Capitulo
    idArticulo?: string; // ocl_IdArticulo
}

// Para las líneas que se reciben al obtener un PDF existente (ParteImprimirPDF.lineas)
export interface LineaPartePDF {
    id: number; // ID de la línea del parte
    DescripArticulo: string; // Descripción de la línea
    cantidad: number; // Unidades puestas en el parte
    UnidadMedida: string; // Unidad de medida (ej: "m", "kg", "unidades")
}


// Para el objeto Parte completo que se recibe del backend al pedir un PDF existente
export interface ParteResponsePDF {
    nParte: number;
    oferta: string; // Descripción de la oferta
    idOferta: number; // ID de la oferta
    proyecto: string; // ID del proyecto
    fecha: string; // Formato "YYYY-MM-DD"
    jefe_equipo: string;
    telefono: string;
    contacto_obra: string;
    comentarios: string | null;
    firma: string; // Base64 de la firma
    lineas: LineaPartePDF[];
    pdf: string | null;
}

// Para las ofertas
export interface Oferta { // Coincide con Oferta en backend
    idOferta: number;
    fecha?: string; // La API te devuelve fecha como string 'YYYY-MM-DD'
    cliente?: string;
    idProyecto: string;
    descripcion?: string;
    observaciones?: string;
    status: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}


export interface Worker {
    id: string;
    display_name: string;
    email: string;
    type: string;
    selected: boolean;
}

export interface WorkerParte {
    idParte: number;
    idTrabajador: string;
    nombreTrabajador: string
}