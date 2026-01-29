# Obras Krystaline (app-obras)

A mobile application built with **React Native** and **Expo** for managing work orders ("Partes"), offers, and resources for Krystaline. This app allows operators and managers to track activities, assign workers, manage materials, and handle vehicle usage efficiently.

## 🚀 Features

*   **User Authentication**: Secure login integrated with Azure AD (likely via `expo-auth-session` / `react-native-app-auth`).
*   **Dashboard**: Overview of tasks, offers, and incidents.
*   **Work Orders (Partes)**:
    *   Create and edit work orders.
    *   View detailed information about assigned offers and lines.
    *   Track status (Pending, In Progress, Completed).
*   **Resource Management**:
    *   **Workers**: Assign workers to specific tasks (`AsignarTrabajadoresScreen`).
    *   **Vehicles**: Track vehicle usage and displacements (`CrearDesplazamientoScreen`).
    *   **Materials**: Manage and add materials to work orders (`AgregarMaterialScreen`).
*   **Digital Signatures**: Capture signatures for validations (`react-native-signature-canvas`).
*   **Incidents**: Report and track incidents.
*   **Offline Capable**: (Implied by nature of field work apps, though backend sync is key).

## 🛠 Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/) (v0.81.4) & [Expo](https://expo.dev/) (SDK 54)
*   **Language**: TypeScript
*   **Navigation**: React Navigation (Native Stack)
*   **State/Data**: Axios for API interaction.
*   **UI Components**: Custom screens using `react-native` core components plus libraries like:
    *   `react-native-picker/picker`
    *   `react-native-datetimepicker`
    *   `react-native-select-dropdown`
*   **Utilities**:
    *   `expo-secure-store` for secure storage.
    *   `expo-image-picker` for capturing photos.
    *   `fastlane` for deployment automation.

## 📂 Project Structure

```
app-obras/
├── App.tsx                 # Main entry point and Navigation setup
├── app.json                # Expo configuration
├── assets/                 # Images and static assets
├── auth/                   # Authentication logic
├── components/             # Reusable UI components
├── config/                 # Configuration and Types (types.ts)
├── screens/                # Application Screens
│   ├── LoginScreen.js
│   ├── MainScreen.tsx
│   ├── MenuScreen.tsx
│   ├── partesManoObra/     # Screens related to Labor/Work Parts
│   └── ...
└── package.json            # Dependencies and scripts
```

## 🏁 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS recommended)
*   [Expo Go](https://expo.dev/client) app on your physical device OR Android/iOS Emulator.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd app-obras
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**:
    ```bash
    npm start
    ```

4.  **Run on device/emulator**:
    *   **Android**: Press `a` in the terminal or run `npm run android`.
    *   **iOS**: Press `i` in the terminal or run `npm run ios` (macOS only).
    *   **Web**: Press `w` in the terminal or run `npm run web`.
    *   **Physical Device**: Scan the QR code displayed in the terminal with the Expo Go app.

## 📱 Scripts

*   `npm start`: Start Expo development server.
*   `npm run android`: Run on Android emulator/device.
*   `npm run ios`: Run on iOS simulator/device.
*   `npm run web`: Run on web browser.

## 📄 License

This project is for **Internal Use Only**. All rights reserved.
