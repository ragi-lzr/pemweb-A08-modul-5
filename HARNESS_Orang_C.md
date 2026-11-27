ini balasan dari orang B:

Next step
Kita minta Izhar/Orang C melanjutkan pembuatan komponen UI sesuai HARNESS_Orang_C.md, lalu commit dan push ke branch admin.

Kamu bisa kirim pesan ini ke Izhar:
Utility dan hook C sudah masuk branch admin, dan build berhasil. Dari struktur file yang aku cek, komponen UI ApplicationDetail, StatusTransition, Checklist, ActivityLogList, InterviewPrep, StatsCards, dan OfferComparator belum terlihat. Bisa lanjut kerjakan komponen-komponen tersebut sesuai harness C, lalu push ke branch admin? Tolong sertakan prop/interface yang dipakai tiap komponen supaya aku bisa integrasikan ke App.tsx sebagai Orang B.

Yang aku lakukan:

Mengubah Pixel Labs dan CloudWorks menjadi status OFFER.

Mengisi data dummy:

Pixel Labs: salary Rp6.000.000, work mode HYBRID, skill match 67% (2 dari 3 skill).

CloudWorks: salary Rp4.500.000, work mode Hybrid, skill match 33% (1 dari 3 skill).

Membuka tab Bandingkan Offer dan membandingkan kedua lamaran.

Hasil yang muncul:

Perhitungan gaji sudah benar:

Pixel Labs: 50/50

CloudWorks: 37.5/50

Perhitungan skill match juga sudah benar:

Pixel Labs: 16.75/25

CloudWorks: 8.25/25

CloudWorks berhasil mendapat total skor 64.5.

Tapi Pixel Labs menghasilkan NaN / 25 pada bagian Mode Kerja, sehingga total skornya juga NaN.

Dari hasil ini, aku menduga ada masalah pada mapping workMode di src/utils/offerScore.ts, kemungkinan karena nilai HYBRID (uppercase) tidak cocok dengan mapping Hybrid (capitalized).

Boleh tolong cek dan fix logic scoring work mode di offerScore.ts supaya nilai mode kerja konsisten/case-insensitive? Setelah diperbaiki, tolong push fix-nya ke branch admin ya.