# Obras Krystaline (app-obras)

Una aplicación móvil construida con **React Native** y **Expo** para gestionar partes de trabajo ("Partes"), ofertas y recursos para Krystaline. Esta aplicación permite a los operarios y gestores realizar un seguimiento de actividades, asignar trabajadores, gestionar materiales y controlar el uso de vehículos de manera eficiente.

## 🚀 Funcionalidades

*   **Autenticación de Usuario**: Inicio de sesión seguro integrado con Azure AD (vía `expo-auth-session` / `react-native-app-auth`).
*   **Panel de Control (Dashboard)**: Vista general de tareas, ofertas e incidencias.
*   **Partes de Trabajo**:
    *   Crear y editar partes de trabajo.
    *   Ver información detallada sobre ofertas y líneas asignadas.
    *   Seguimiento de estado (Pendiente, En Progreso, Completado).
*   **Gestión de Recursos**:
    *   **Trabajadores**: Asignar trabajadores a tareas específicas (`AsignarTrabajadoresScreen`).
    *   **Vehículos**: Seguimiento del uso de vehículos y desplazamientos (`CrearDesplazamientoScreen`).
    *   **Materiales**: Gestionar y agregar materiales a los partes de trabajo (`AgregarMaterialScreen`).
*   **Firmas Digitales**: Captura de firmas para validaciones (`react-native-signature-canvas`).
*   **Incidencias**: Reportar y realizar seguimiento de incidencias.


## 🛠 Stack Tecnológico

*   **Framework**: [React Native](https://reactnative.dev/) (v0.81.4) y [Expo](https://expo.dev/) (SDK 54)
*   **Lenguaje**: TypeScript
*   **Navegación**: React Navigation (Native Stack)
*   **Estado/Datos**: Uso de librerías nativas de llamadas HTTPS para interacción con API.
*   **Componentes UI**: Pantallas personalizadas usando componentes core de `react-native` más librerías como:
    *   `react-native-picker/picker`
    *   `react-native-datetimepicker`
    *   `react-native-select-dropdown`
*   **Utilidades**:
    *   `expo-secure-store` para almacenamiento seguro.
    *   `expo-image-picker` para capturar fotos.
    *   `fastlane` para automatización de despliegues.

## 📂 Estructura del Proyecto

```
app-obras/
├── App.tsx                 # Punto de entrada principal y configuración de Navegación
├── app.json                # Configuración de Expo
├── assets/                 # Imágenes y recursos estáticos
├── auth/                   # Lógica de autenticación
├── components/             # Componentes UI reutilizables
├── config/                 # Configuración y Tipos (types.ts)
├── screens/                # Pantallas de la aplicación
│   ├── LoginScreen.js
│   ├── MainScreen.tsx
│   ├── MenuScreen.tsx
│   ├── partesManoObra/     # Pantallas relacionadas con Mano de Obra
│   └── ...
└── package.json            # Dependencias y scripts
```

## 🏁 Comenzando

### Prerrequisitos

*   [Node.js](https://nodejs.org/) (se recomienda LTS)
*   La app [Expo Go](https://expo.dev/client) en tu dispositivo físico O un Emulador Android/iOS.

### Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone <repository-url>
    cd app-obras
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm start
    ```

4.  **Ejecutar en dispositivo/emulador**:
    *   **Android**: Presiona `a` en la terminal o ejecuta `npm run android`.
    *   **iOS**: Presiona `i` en la terminal o ejecuta `npm run ios` (solo macOS).
    *   **Web**: Presiona `w` en la terminal o ejecuta `npm run web`.
    *   **Dispositivo Físico**: Escanea el código QR mostrado en la terminal con la app Expo Go.

## 💻 Scripts

*   `npm start`: Iniciar servidor de desarrollo Expo.
*   `npm run android`: Ejecutar en emulador/dispositivo Android.
*   `npm run ios`: Ejecutar en simulador/dispositivo iOS.
*   `npm run web`: Ejecutar en navegador web.

## 📄 Licencia

Este proyecto es para **Uso Interno Exclusivamente**. Todos los derechos reservados.


## 👨🏻‍💻 Desarrollo 

El desarrollo de nuevas funcionalidades irá precedido por reuniones con los usuarios y/o jefes de equipo que requieran algo específico. Posteriormente se procederá a la implementación de la funcionalidad en el repositorio y se actualizará la aplicación compilada para los usuarios.