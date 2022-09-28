# dev-academy-2.0
Dev Academy optimized for Core Web Vitals and SEO

# Development
- Odkomentuj 8 linię w scripts/web.js, która zwraca return true. Ma to na celu przyspieszyć development, aby zaprzestać renderowaniu pluginem wszystkich zdjęć ponownie przy każdym browser syncu.
Ten kod to: 
hexo.extend.filter.register('after_generate', function () {
-->  return true; // uncomment this line during development
- Można również wyłączyć hexo-all-minifier 4 opcje css_minifier, js_minifier, html_minifier i ustawić na enabled: false każdą, aby również przyspieszyć minimalnie development z browser synciem.
  
# Styles
- Style dodajemy zgodnie z mobile first. Najpierw stylujemy od 360 przesuwając sie ku górze. Stylowanie po innych breakpointach powyżej 767px odbywa się w pliku css/desktop.scss, który dołączony jest do strony w momencie kiedy rozdzielczość urządzenia ma min 768px.
- Każda nowa sekcja, czy komponent to powinien być nowy plik w .scss, aby zachować spójność, czytelność i porządek kodu.

# Related post
- Każdy post powinien posiadać unikalne pole id. Aby dodać powiązany post, dodajemy jego id w polu relatedPost.

# Authors
- Pole **authors_specs** to dostępne specjalizacje, które nadawane są autorom w ich polu **specs**. Dzięki temu polu również generowany jest filter na stronie autorów.
- Przykład dodania nowego autora:
```
authors_specs: [nodejs, angular]
authors:
    "Bartosz Pietrucha":
        slug: bartosz-pietrucha
        desc: This is bartosz pietrucha description. This is bartosz pietrucha description. This is bartosz pietrucha description. This is bartosz pietrucha description. This is bartosz pietrucha description.
        specs: [nodejs, angular]
        image: /img/bartosz-pietrucha.jpg
        motto: I very much believe in learning through my own experience.
        joined: 05 April 2022 (ISO FORMAT)
        academies:
          fta: true
          wsa: true
        socials:
          site: https://www.linkedin.com/in/bpietrucha/
          linkedin: https://www.linkedin.com/in/bpietrucha/
          twitter: https://www.linkedin.com/in/bpietrucha/
          github: https://www.linkedin.com/in/bpietrucha/
```

# Banery
- Pole **banners** pozwala na włączenie poszczególnych banerów, posiadające już określone wysokości i szerokości, których nie powinno się modyfikować bez RWD.
  - **top_banner**: true | false. Wyświetla baner nad nawigacją. 150px (15rem) height na mobile i 50px (5rem) na desktopie. Klasa dodawana do body: *b-header-top*
  - **article_side_banner**: true | false. Wyświetla boczny baner przy każdym z poście. 300px (30rem) height i 250px (35rem) width na desktopie przy min-width: 1390px. Niżej nie wyświetlany. Klasa dodawana do body: *b-article-sidebar*". Możliwość konfiguracji we frontmatterze pod każdym postem:
    - bannerHeader: string - Wyświetla główny nagłówek.
    - bannerSubheader: string - Wyświetla kolejny nagłówek w banerze.
    - bannerUrl: string (url) - Adres url (hiperłącze), które jest przyczepione do linku.