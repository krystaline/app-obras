# Instrucciones app

### Compilar app Android
1. darle al play | gradlew app:assembleRelease
2. Para reiniciar las configuraciones
3. poner esto si no va


    manifestPlaceholders = [appAuthRedirectScheme: 'com.krystaline.appobras'] // Or your custom scheme


### Compilar app en iOS
1. npx expo prebuild --clean -p ios 
2. cd ios | pod install
3. desde xcode --> product --> build 
4. product --> archive (creo que buildea otra vez)
   1. seleccionar "distribute"
   2. testflight & release
   3. pasar la app .ipa al iphone conectado