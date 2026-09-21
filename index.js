const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const INPUT_DIR = path.join(__dirname, "input");
const OUTPUT_DIR = path.join(__dirname, "output");

// Ekstensi video yang akan diproses
const VIDEO_EXTENSIONS = [
  ".mp4", ".mov", ".mkv", ".avi", ".webm",
  ".flv", ".wmv", ".m4v", ".mpg", ".mpeg",
];

// Seberapa jauh dari akhir video kita mengambil frame (dalam detik).
// Nilai kecil (misal 0.5 - 1 detik) supaya aman untuk video yang sangat pendek
// dan tetap dapat frame yang mendekati akhir.
const SEEK_FROM_END = 0.5;

function ensureDirs() {
  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function getVideoFiles() {
  return fs
    .readdirSync(INPUT_DIR)
    .filter((file) => VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map((file) => path.join(INPUT_DIR, file));
}

/**
 * Menjalankan ffmpeg untuk mengambil 1 frame dari mendekati akhir video.
 * Strategi: -sseof -N artinya "seek ke N detik sebelum akhir file",
 * lalu ambil frame pertama setelah titik itu. Ini jauh lebih cepat &
 * lebih akurat daripada mencoba menghitung durasi total lebih dulu.
 */
function extractLastFrame(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y", // timpa file output jika sudah ada
      "-sseof", `-${SEEK_FROM_END}`, // mundur X detik dari akhir file
      "-i", inputPath,
      "-fps_mode", "passthrough",
      "-q:v", "2", // kualitas tinggi
      "-update", "1", // output 1 gambar saja
      "-frames:v", "1",
      outputPath,
    ];

    const ffmpeg = spawn("ffmpeg", args);

    let stderr = "";
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpeg.on("error", (err) => {
      // Biasanya berarti ffmpeg tidak ditemukan di PATH
      reject(new Error(`Gagal menjalankan ffmpeg: ${err.message}`));
    });

    ffmpeg.on("close", (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve();
      } else {
        reject(new Error(`ffmpeg keluar dengan kode ${code}\n${stderr}`));
      }
    });
  });
}

async function main() {
  ensureDirs();

  const videos = getVideoFiles();

  if (videos.length === 0) {
    console.log(`Tidak ada file video ditemukan di: ${INPUT_DIR}`);
    console.log(`Ekstensi yang didukung: ${VIDEO_EXTENSIONS.join(", ")}`);
    return;
  }

  console.log(`Ditemukan ${videos.length} video. Memproses...\n`);

  let success = 0;
  let failed = 0;

  for (const videoPath of videos) {
    const baseName = path.basename(videoPath, path.extname(videoPath));
    const outputPath = path.join(OUTPUT_DIR, `${baseName}.png`);

    process.stdout.write(`- ${path.basename(videoPath)} ... `);

    try {
      await extractLastFrame(videoPath, outputPath);
      console.log(`OK -> output/${baseName}.png`);
      success++;
    } catch (err) {
      console.log("GAGAL");
      console.error(`  Penyebab: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nSelesai. Berhasil: ${success}, Gagal: ${failed}`);
}

main().catch((err) => {
  console.error("Terjadi error tak terduga:", err);
  process.exit(1);
});
