import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent AppRegistry.registerComponent('main', () => App) çağırır.
// Ayrıca uygulamayı Expo Go'da veya yerel bir yapıda yükleyip yüklemediğinizden
// bağımsız olarak ortamın uygun şekilde ayarlandığından emin olur.
registerRootComponent(App);
