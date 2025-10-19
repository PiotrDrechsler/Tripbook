-- Seed data for trips table
-- Purpose: Populate database with sample trip data for development and testing

-- Insert 11 sample trips with varied data
INSERT INTO public.trips (id, user_id, name, description, map_url, trip_date, created_at, updated_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '00000000-0000-0000-0000-000000000000',
    'Weekend w Tatrach',
    'Piękna wycieczka górska z noclegiem w schronisku Morskie Oko. Planujemy wejść na Rysy jeśli pogoda pozwoli.',
    'https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&ri=24942816&ri=137907847&x=19.8235480&y=49.2532112&z=13',
    '2025-11-15',
    '2025-10-01 10:30:00+00',
    '2025-10-01 10:30:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '00000000-0000-0000-0000-000000000000',
    'Wycieczka rowerowa po Krakowie',
    'Zwiedzanie Krakowa na rowerze - Wawel, Kazimierz, Nowa Huta. Około 30 km tras rowerowych.',
    'https://mapy.com/pl/zakladni?x=19.9449799&y=50.0646501&z=13',
    '2025-10-25',
    '2025-10-02 14:15:00+00',
    '2025-10-05 09:20:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '00000000-0000-0000-0000-000000000000',
    'Bieszczady - szlak główny',
    'Trekking przez Połoninę Wetlińską i Tarnicę. 5-dniowa wyprawa z namiotem.',
    'https://mapy.com/pl/zakladni?x=22.5167&y=49.1000&z=11',
    '2025-12-01',
    '2025-10-03 08:00:00+00',
    '2025-10-03 08:00:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    '00000000-0000-0000-0000-000000000000',
    'Karkonosze zimą',
    'Zimowa wycieczka na Śnieżkę. Rakiety śnieżne, ciepłe ubrania i termos z herbatą obowiązkowo!',
    'https://mapy.com/pl/zakladni?x=15.7393&y=50.7361&z=12',
    '2026-01-20',
    '2025-10-04 11:45:00+00',
    '2025-10-04 11:45:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    '00000000-0000-0000-0000-000000000000',
    'Mazury kajakiem',
    'Spływ kajakowy przez Mazury - Krutynia, 4 dni. Biwak nad jeziorem każdego wieczoru.',
    'https://mapy.com/pl/zakladni?x=21.3600&y=53.7600&z=10',
    '2025-07-10',
    '2025-10-05 16:20:00+00',
    '2025-10-06 12:30:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    '00000000-0000-0000-0000-000000000000',
    'Puszcza Białowieska',
    'Zwiedzanie Puszczy Białowieskiej - szukamy żubrów! Nocleg w Białowieży.',
    'https://mapy.com/pl/zakladni?x=23.8466&y=52.7018&z=11',
    '2025-09-05',
    '2025-10-06 09:10:00+00',
    '2025-10-06 09:10:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440007',
    '00000000-0000-0000-0000-000000000000',
    'Góry Stołowe',
    'Błędne Skały i Szczeliniec Wielki. Jednodniowa wycieczka z Kudowy-Zdroju.',
    'https://mapy.com/pl/zakladni?x=16.3486&y=50.4866&z=13',
    '2025-08-12',
    '2025-10-07 13:40:00+00',
    '2025-10-08 10:15:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440008',
    '00000000-0000-0000-0000-000000000000',
    'Zakopane - Dolina Kościeliska',
    'Spacer do Doliny Kościeliskiej. Łatwa trasa, idealna na rodzinną wycieczkę.',
    'https://mapy.com/pl/zakladni?x=19.8974&y=49.2748&z=14',
    NULL,
    '2025-10-08 15:00:00+00',
    '2025-10-08 15:00:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440009',
    '00000000-0000-0000-0000-000000000000',
    'Trójmiasto rowerem',
    'Gdańsk - Sopot - Gdynia. Trasa rowerowa wzdłuż morza, około 40 km.',
    'https://mapy.com/pl/zakladni?x=18.6466&y=54.5189&z=11',
    '2025-06-20',
    '2025-10-09 08:30:00+00',
    '2025-10-09 08:30:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440010',
    '00000000-0000-0000-0000-000000000000',
    'Pieniny - spływ Dunajcem',
    'Spływ przełomem Dunajca + Trzy Korony. Klasyka polskich gór!',
    'https://mapy.com/pl/zakladni?x=20.4167&y=49.4167&z=13',
    '2025-05-15',
    '2025-10-10 10:00:00+00',
    '2025-10-10 10:00:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '00000000-0000-0000-0000-000000000000',
    'Roztocze - szlak rowerowy',
    'Roztoczański Park Narodowy. Rowerem przez lasy bukowe i sosnowe, 80 km tras.',
    'https://mapy.com/pl/zakladni?x=23.1000&y=50.5833&z=11',
    '2025-09-28',
    '2025-10-11 14:20:00+00',
    '2025-10-11 14:20:00+00'
  );

