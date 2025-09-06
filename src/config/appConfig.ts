interface AppConfig {
  API_URL: string;
}

export const appConfig: AppConfig = (window as any).__APP_CONFIG__;
