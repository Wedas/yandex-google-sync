# yandex-google-sync
Сервис для синхронизации данных между Яндекс.Диск и Google Drive.
Сравнение выполняется только по именам файлов, не по хешам.
Для запуска:
- в файле frontend\src\app\services\yandex\yandex.service.ts прописать валидный client_id;
- в файле frontend\src\app\services\google\google.service.ts прописать client_id и client_secret;
- зайти в папку frontend, из командной строки выполнить npm install, ng serve. 
Сервис запустится на localhost:4200.
