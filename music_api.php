// nano /var/www/html/music_api.php   (Файл music_api.php (создайте его в /var/www/html/))

// php /var/www/html/music_api.php (Должен вывести JSON.)

<?php
header('Content-Type: application/json');

$stylesConfig = [
    [
        'name_ru' => 'Мои эксперименты',
        'name_en' => 'My Experiments',
        'cover' => 'assets/Pictures/Experimental.jpg',
        'folder' => 'assets/Music/Experemental/',
        'desc_ru' => 'Экспериментальные треки, поиск звука',
        'desc_en' => 'Experimental tracks, sound search'
    ],
    [
        'name_ru' => 'Sacred de Lacrua',
        'name_en' => 'Sacred de Lacrua',
        'cover' => 'assets/Pictures/SDLDj.jpg',
        'folder' => 'assets/Music/Sacreddelacrua/',
        'desc_ru' => 'Транс, дрим, прогрессив',
        'desc_en' => 'Trance, Dream, Progressive'
    ],
    [
        'name_ru' => 'SDL Rap',
        'name_en' => 'SDL Rap',
        'cover' => 'assets/Pictures/SDLRap2.jpg',
        'folder' => 'assets/Music/SDLRap/',
        'desc_ru' => 'Рэп-проекты и коллаборации',
        'desc_en' => 'Rap projects and collaborations'
    ],
    [
        'name_ru' => 'Rock',
        'name_en' => 'Rock',
        'cover' => 'assets/Pictures/SDLRock.jpg',
        'folder' => 'assets/Music/SDLRock/',
        'desc_ru' => 'Рок-эксперименты',
        'desc_en' => 'Rock experiments'
    ],
    [
        'name_ru' => 'Trackzone',
        'name_en' => 'Trackzone',
        'cover' => 'assets/Pictures/Trackzone.jpg',
        'folder' => 'assets/Music/Trackzone and Co/',
        'desc_ru' => 'Совместные работы',
        'desc_en' => 'Collaborative works'
    ],
    [
        'name_ru' => 'English voice track',
        'name_en' => 'English voice track',
        'cover' => 'assets/Pictures/Engsongs.jpg',
        'folder' => 'assets/Music/EngSong/',
        'desc_ru' => 'Треки на английском',
        'desc_en' => 'English tracks'
    ]
];

$result = [];
foreach ($stylesConfig as $style) {
    $files = glob($style['folder'] . '*.mp3');
    sort($files);
    $tracks = array_map('basename', $files);
    $result[] = [
        'name_ru' => $style['name_ru'],
        'name_en' => $style['name_en'],
        'cover' => $style['cover'],
        'folder' => $style['folder'],
        'desc_ru' => $style['desc_ru'],
        'desc_en' => $style['desc_en'],
        'tracks' => $tracks
    ];
}
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);