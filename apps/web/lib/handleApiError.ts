export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Auth errors
    if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("token"))
      return "Sesi kamu telah berakhir. Silakan login kembali.";

    if (msg.includes("403") || msg.includes("forbidden"))
      return "Kamu tidak memiliki akses ke fitur ini.";

    // Resource errors
    if (msg.includes("404") || msg.includes("not found"))
      return "Data yang dicari tidak ditemukan.";

    // Conflict
    if (msg.includes("409") || msg.includes("conflict"))
      return "Stok produk tidak mencukupi atau data sudah ada.";

    // Rate limit
    if (msg.includes("429") || msg.includes("too many"))
      return "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.";

    // Server errors
    if (msg.includes("503") || msg.includes("service unavailable"))
      return "Layanan pembayaran sedang tidak tersedia. Coba lagi nanti.";

    if (msg.includes("500") || msg.includes("internal server"))
      return "Terjadi kesalahan server. Tim kami sudah diberitahu.";

    // Network errors
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch"))
      return "Koneksi internet bermasalah. Periksa jaringan kamu.";

    // HitPay specific
    if (msg.includes("payment") || msg.includes("hitpay"))
      return "Gagal membuat link pembayaran. Silakan coba lagi.";

    // Shipping
    if (msg.includes("ongkir") || msg.includes("shipping"))
      return "Gagal mengambil biaya pengiriman. Coba pilih lokasi lain.";

    // Return original message kalau tidak match pattern apapun
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.";
}