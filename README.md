# Last Frame Screenshot

Program Node.js sederhana untuk mengambil screenshot dari bagian akhir setiap video
di folder `input/`, lalu menyimpannya sebagai `.png` di folder `output/`.

## Persyaratan

1. **Node.js** (versi berapa pun yang cukup modern, v14+ aman).
2. **ffmpeg** harus terinstall dan bisa dipanggil dari terminal (ada di PATH).
   - Cek dengan menjalankan: `ffmpeg -version`
   - Windows: download dari https://ffmpeg.org/download.html lalu tambahkan ke PATH
   - macOS: `brew install ffmpeg`
   - Linux (Debian/Ubuntu): `sudo apt install ffmpeg`

## Cara pakai

1. Taruh semua file video yang ingin diproses ke dalam folder `input/`.
   Format yang didukung: mp4, mov, mkv, avi, webm, flv, wmv, m4v, mpg, mpeg.
2. Jalankan program:
   ```bash
   node index.js
   ```
   atau
   ```bash
   npm start
   ```
3. Hasil screenshot akan muncul di folder `output/` dengan nama yang sama
   dengan file videonya, contoh: `input/liburan.mp4` -> `output/liburan.png`.

## Catatan

- Program mengambil frame dari sekitar 0.5 detik sebelum akhir video
  (bisa diubah lewat variabel `SEEK_FROM_END` di `index.js`) agar tetap aman
  untuk video yang sangat pendek dan tidak kena frame kosong/hitam di ujung.
- Jika sebuah video gagal diproses, program akan tetap lanjut ke video
  berikutnya dan menampilkan pesan error di terminal.
