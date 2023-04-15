# websecurity-academy-2.0
Websecurity Academy optimized for Core Web Vitals and SEO

# Styles
- Style dodajemy zgodnie z mobile first. Najpierw stylujemy od 360 przesuwając sie ku górze. Stylowanie po innych breakpointach powyżej 767px odbywa się w pliku css/desktop.scss, który dołączony jest do strony w momencie kiedy rozdzielczość urządzenia ma min 768px.
- Każda nowa sekcja, czy komponent to powinien być nowy plik w .scss, aby zachować spójność, czytelność i porządek kodu.

# JS
- Aby zaktywować sekcję Schedule, wystarczy ustawić zmienną IS_SCHEDULE na true w index.ts.

# Source
- Wszystkie pliki z src/public są kopiowane podczas uruchomienia builda do dista.

# Themes
- src/assets/scss/themes zawiera themy, które można zmodyfikować, lub stworzyć nowy, a potem zaimportować w _variables.scss.

# Development
- npm run dev

# Build
- npm run build