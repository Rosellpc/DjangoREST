const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_AVATAR_LENGTH = 262144

export async function prepareProfileAvatar(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Selecciona una foto JPG, PNG o WebP.")
  }
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("La foto debe pesar menos de 5 MB.")
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("No pudimos leer esta imagen. Prueba con otra foto.")
  })
  try {
    const canvas = document.createElement("canvas")
    const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height))
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("No pudimos preparar la foto en este navegador.")
    context.fillStyle = "#18181b"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const result = canvas.toDataURL("image/jpeg", 0.85)
    if (result.length > MAX_AVATAR_LENGTH) throw new Error("La foto es demasiado grande. Prueba con otra imagen.")
    return result
  } finally {
    bitmap.close()
  }
}
