/*
Copyright © 2025 TALACATA.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export default ({ config }) => {
  return {
    ...config,
    name: "Carbon Track",
    slug: "carbon-track",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "carbon-track",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    android: {
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./credentials/google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.talacata.carbontrack",
    },
    ios: {
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || "./credentials/GoogleService-Info.plist",
      supportsTablet: true,
      bundleIdentifier: "com.talacata.carbontrack",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "Cette application a besoin d'accéder à la caméra pour scanner des codes-barres.",
      },
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-sqlite",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "b019f617-72d8-4641-9c67-a9d85e5ed59f",
      },
    },
    owner: "talacata",
    // EAS Update
    updates: {
      url: "https://u.expo.dev/b019f617-72d8-4641-9c67-a9d85e5ed59f",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  };
};