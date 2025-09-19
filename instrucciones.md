# Instrucciones app

### Compilar app Android
1. darle al play | gradlew app:assembleRelease
2. Para reiniciar las configuraciones
3. f


    manifestPlaceholders = [appAuthRedirectScheme: 'com.krystaline.appobras'] // Or your custom scheme


### Compilar app en iOS
1. cd ios | pod install
2. desde xcode --> product --> build 
3. product --> archive (creo que buildea otra vez)
   1. seleccionar "distribute"
   2. testflight & release
   3. pasar la app .ipa al iphone conectado