const formRegister = document.getElementById("formRegister")
const gambarWajah = document.getElementById("gambarWajah")
const cameraButton = document.getElementById("cameraButton")
const ulangiCamera = document.getElementById("ulangiCamera")
const preview = document.getElementById("preview")
const overlay = document.getElementById("overlay")

async function sendToServer() {
  const formData = new FormData(formRegister)

  overlay.style.display = "flex"

  const response = await fetch("/registerwajah", {
    method: "POST",
    body: formData,
  })
  const responseData = await response.json()
  try {
    if (response.ok && responseData.success) {
      displayAlert(responseData)
      overlay.style.display = "none"
    } else {
      displayAlert(responseData.error_message || responseData)
      overlay.style.display = "none"
    }
  } catch (error) {
    displayAlert("Terjadi kesalahan dalam mengirim permintaan")
    console.error("Error:", error)
    overlay.style.display = "none"
  }
}

formRegister.addEventListener("submit", function (event) {
  event.preventDefault()
  sendToServer()
})

cameraButton.addEventListener("click", function () {
  gambarWajah.click()
})
ulangiCamera.addEventListener("click", function () {
  gambarWajah.click()
})
gambarWajah.addEventListener("change", function () {
  if (gambarWajah.files && gambarWajah.files[0]) {
    cameraButton.style.display = "none"
    ulangiCamera.style.display = "block"
    const reader = new FileReader()
    reader.onload = function (e) {
      preview.src = e.target.result
    }
    reader.readAsDataURL(gambarWajah.files[0])
  }
})

function displayAlert(responseData) {
  let message = responseData.message
  let nim = responseData.nim
  let alertTitle, alertIcon, alertText

  switch (message) {
    case "No file part":
      alertTitle = "File Gambar Tidak Ada!"
      alertIcon = "error"
      alertText = "Mohon ambil gambar terlebih dahulu!"
      alertCancel = true
      alertConfirm = false
      break
    case "More than 1 face detected":
      alertTitle = "Terdeteksi Lebih Dari 1 Wajah!"
      alertIcon = "error"
      alertText = "Mohon ambil gambar hanya 1 wajah saja!"
      alertCancel = true
      alertConfirm = false
      break
    case "there is no one face detected":
      alertTitle = "Wajah Tidak Terdeteksi!"
      alertIcon = "error"
      alertText = "Wajah anda tidak terdeteksi, mohon ulangi!"
      alertCancel = true
      alertConfirm = false
      break
    case "No selected file":
      alertTitle = "Gambar Tidak Dipilih!"
      alertIcon = "error"
      alertText = "Mohon pilih gambar terlebih dahulu!"
      alertCancel = true
      alertConfirm = false
      break
    case "Invalid file type":
      alertTitle = "Format file tidak diizinkan!"
      alertIcon = "error"
      alertText = "Format gambar yang diizinkan adalah jpg, jpeg, png"
      alertCancel = true
      alertConfirm = false
      break
    case "Missing required data":
      alertTitle = "Formulir Tidak Lengkap!"
      alertIcon = "error"
      alertText = "Mohon isi formulir dengan lengkap!"
      alertCancel = true
      alertConfirm = false
      break
    case "Not found in database":
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = "Wajah terdaftar tetapi tidak tersedia di database"
      alertCancel = true
      alertConfirm = false
      break
    case "successful":
      alertTitle = "Data Berhasil Disimpan!"
      alertIcon = "success"
      alertText = `Wajah anda telah disimpan dengan nim: ${nim}. Masuk kelas untuk catat kehadiranmu!`
      alertCancel = false
      alertConfirm = true
      break
    case "nim already registered":
      alertTitle = "NIM Anda Telah Terdaftar!"
      alertIcon = "error"
      alertText = `NIM anda telah terdaftar. Mohon ulangi!`
      alertCancel = true
      alertConfirm = false
      break
    case "already registered":
      alertTitle = "Wajah Anda Telah Terdaftar!"
      alertIcon = "error"
      alertText = `Wajah anda telah terdaftar dengan NIM: ${nim}. Mohon ulangi!`
      alertCancel = true
      alertConfirm = false
      break
    case "fake":
      alertTitle = "Terindikasi Palsu!"
      alertIcon = "error"
      alertText = "Mohon ulangi dengan wajah yang asli!"
      alertCancel = true
      alertConfirm = false
      break
    default:
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = message
      alertCancel = true
      alertConfirm = false
  }

  Swal.fire({
    icon: alertIcon,
    title: alertTitle,
    text: alertText,
    allowOutsideClick: false,
    showDenyButton: alertCancel,
    showConfirmButton: alertConfirm,
    denyButtonText: "Try Again",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/login"
    }
  })
}
