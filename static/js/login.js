const formLogin = document.getElementById("formLogin")
const tokenInput = document.getElementById("tokenKelas")
const validateTokenBtn = document.getElementById("validateTokenBtn")
const gambarWajah = document.getElementById("gambarWajah")
const cameraButton = document.getElementById("cameraButton")
const ulangiCamera = document.getElementById("ulangiCamera")
const preview = document.getElementById("preview")
const validateWajahBtn = document.getElementById("validateWajahBtn")
const gambarKelas = document.getElementById("gambarKelas")
const cameraButton2 = document.getElementById("cameraButton2")
const cameraButton3 = document.getElementById("cameraButton3")
const ulangiCamera2 = document.getElementById("ulangiCamera2")
const preview2 = document.getElementById("preview2")
const validateKelasBtn = document.getElementById("validateKelasBtn")
const validateQRBtn = document.getElementById("validateQRBtn")
const submitButton = document.getElementById("submitButton")
const overlay = document.getElementById("overlay")
const sectionWajah = document.getElementById("sectionWajah")
const sectionKelas = document.getElementById("sectionKelas")
const sectionSubmit = document.getElementById("sectionSubmit")
const reader = document.getElementById("reader")

const URL = "https://teachablemachine.withgoogle.com/models/Z8RRHRdOV/"
let model, maxPredictions

let isTokenValidated = false
let isWajahValidated = false
let isKelasValidated = false
let isQRValidated = false

function checkFormValidity() {
  if (
    isTokenValidated &&
    isWajahValidated &&
    isKelasValidated &&
    isQRValidated
  ) {
    submitButton.style.display = "block"
    submitButton.disabled = false
  } else {
    submitButton.disabled = true
  }
}

let validatedToken = null
async function validateToken() {
  const token = tokenInput.value
  overlay.style.display = "flex"
  const response = await fetch("/validate_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tokenKelas: token }),
  })

  const responseDataToken = await response.json()
  if (response.ok && responseDataToken.status === "valid") {
    alertToken(responseDataToken)
    validatedToken = token
    isTokenValidated = true
    // sectionWajah.style.display = "block"
    tokenInput.disabled = true
    validateTokenBtn.disabled = true
    cameraButton.disabled = false
    cameraButton.style.display = "block"
    ulangiCamera.disabled = false
    validateWajahBtn.disabled = false
    cameraButton2.disabled = true
    ulangiCamera2.disabled = true
    validateKelasBtn.disabled = true
  } else {
    alertToken(responseDataToken)
    isTokenValidated = false
    cameraButton.disabled = true
    ulangiCamera.disabled = true
    validateWajahBtn.disabled = true
    cameraButton2.disabled = true
    ulangiCamera2.disabled = true
    validateKelasBtn.disabled = true
  }
  checkFormValidity()
}
function alertToken(responseDataToken) {
  let message = responseDataToken.message
  let token = responseDataToken.token

  let alertTitle, alertIcon, alertText

  switch (message) {
    case "token valid":
      alertTitle = "Token Anda Valid"
      alertIcon = "success"
      alertText = `Token ${token} Valid, Mohon lanjutkan validasi gambar!`
      break
    case "token tidak valid":
      alertTitle = "Token Anda Tidak Valid"
      alertIcon = "error"
      alertText = `Token ${tokenInput.value} Tidak Valid, Mohon Ulangi!`
      break
    case "token kosong":
      alertTitle = "Tidak Ada Token Yang Di Input"
      alertIcon = "error"
      alertText = "Masukan Token Anda"
      break
    default:
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = "Terjadi kesalahan saat menyimpan data"
      break
  }
  Swal.fire({
    icon: alertIcon,
    title: alertTitle,
    text: alertText,
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      overlay.style.display = "none"
    }
  })
}

let validatedWajahFile = null
let validatedNIM = null
async function validateWajah() {
  const input = gambarWajah
  const file = input.files[0]

  overlay.style.display = "flex"
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/validate_image_wajah", {
    method: "POST",
    body: formData,
  })

  const responseDataWajah = await response.json()
  if (response.ok && responseDataWajah.status === "valid") {
    alertWajah(responseDataWajah)
    validatedWajahFile = file
    validatedNIM = responseDataWajah.nim
    isWajahValidated = true
    // sectionKelas.style.display = "block"
    tokenInput.disabled = true
    validateTokenBtn.disabled = true
    cameraButton.disabled = true
    cameraButton2.style.display = "block"
    ulangiCamera.disabled = true
    validateWajahBtn.disabled = true
    cameraButton2.disabled = false
    ulangiCamera2.disabled = false
    validateKelasBtn.disabled = false
  } else {
    alertWajah(responseDataWajah)

    isWajahValidated = false
    tokenInput.disabled = true
    validateTokenBtn.disabled = true
    cameraButton.disabled = false
    ulangiCamera.disabled = false
    validateWajahBtn.disabled = false
    cameraButton2.disabled = true
    ulangiCamera2.disabled = true
    validateKelasBtn.disabled = true
  }
  checkFormValidity()
}

function alertWajah(responseDataWajah) {
  let message = responseDataWajah.message
  let nim = responseDataWajah.nim

  let alertTitle, alertIcon, alertText

  switch (message) {
    case "Successful":
      alertTitle = "Wajah Valid!"
      alertIcon = "success"
      alertText = `Wajah anda terdaftar dengan nim: ${nim}!`
      break
    case "No file part":
      alertTitle = "File Gambar Tidak Ada!"
      alertIcon = "error"
      alertText = "Mohon ambil gambar terlebih dahulu!"
      break
    case "you are not registered yet":
      alertTitle = "Wajah Anda Belum Terdaftar!"
      alertIcon = "error"
      alertText = "Mohon lakukan registrasi wajah terlebih dahulu!"
      break
    case "More than 1 face detected":
      alertTitle = "Terdeteksi Lebih Dari 1 Wajah!"
      alertIcon = "error"
      alertText = "Mohon ambil gambar hanya 1 wajah saja!"
      break
    case "there is no one face detected":
      alertTitle = "Wajah Tidak Terdeteksi!"
      alertIcon = "error"
      alertText = "Wajah anda tidak terdeteksi, mohon ulangi!"
      break
    case "fake":
      alertTitle = "Terindikasi Palsu!"
      alertIcon = "error"
      alertText = "Mohon ulangi dengan wajah yang asli!"
      break
    case "Not registered in database":
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = "Wajah terdaftar tetapi tidak tersedia di database"
      break
    case "Invalid file type":
      alertTitle = "Format file tidak diizinkan!"
      alertIcon = "error"
      alertText = "Format gambar yang diizinkan adalah jpg, jpeg, png"
      break
    default:
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = message
      break
  }
  Swal.fire({
    icon: alertIcon,
    title: alertTitle,
    text: alertText,
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      overlay.style.display = "none"
    }
  })
}

let validatedKelasFile = null
async function validateKelas() {
  // Load the image model
  async function init() {
    const modelURL = URL + "model.json"
    const metadataURL = URL + "metadata.json"

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL)
    maxPredictions = model.getTotalClasses()
  }
  await init()

  const input = gambarKelas
  const file = input.files[0]
  overlay.style.display = "flex"

  if (file) {
    const reader = new FileReader()
    reader.onload = function (e) {
      const image = new Image()
      image.onload = async function () {
        predict(image)
      }
      image.src = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    alertKelas("No file part")
  }

  // Run the image through the model and display the prediction with highest probability
  async function predict(image) {
    const prediction = await model.predict(image)
    let topPrediction = {
      className: "",
      probability: 0,
    }
    for (let i = 0; i < maxPredictions; i++) {
      if (prediction[i].probability > topPrediction.probability) {
        topPrediction = {
          className: prediction[i].className,
          probability: Math.round(prediction[i].probability * 100),
        }
      }
    }

    // Display an alert with the prediction with highest probability
    if (topPrediction.className === "Classroom") {
      alertKelas("Classroom", topPrediction.probability)
      validatedKelasFile = file
      isKelasValidated = true
      cameraButton3.style.display = "block"
      tokenInput.disabled = true
      validateTokenBtn.disabled = true
      cameraButton.disabled = true
      ulangiCamera.disabled = true
      validateWajahBtn.disabled = true
      cameraButton2.disabled = true
      cameraButton3.disabled = false
      ulangiCamera2.disabled = true
      validateKelasBtn.disabled = true
    } else {
      alertKelas("Not A Classroom", topPrediction.probability)
      isKelasValidated = false
      tokenInput.disabled = true
      validateTokenBtn.disabled = true
      cameraButton.disabled = true
      ulangiCamera.disabled = true
      validateWajahBtn.disabled = true
      cameraButton2.disabled = false
      ulangiCamera2.disabled = false
      validateKelasBtn.disabled = false
    }
  }

  // const formData = new FormData()
  // formData.append("file", file)
  // const response = await fetch("/validate_image_kelas", {
  //   method: "POST",
  //   body: formData,
  // })
  // const responseDataKelas = await response.json()
  // if (response.ok && responseDataKelas.success === true) {
  //   alertKelas(responseDataKelas)
  // } else {
  //   alertKelas(responseDataKelas)
  // }

  checkFormValidity()

  function alertKelas(message, probability = null) {
    let alertTitle, alertIcon, alertText

    switch (message) {
      case "Classroom":
        alertTitle = "Ruang Kelas Terdeteksi!"
        alertIcon = "success"
        alertText = `Anda terdeteksi di ruang kelas, silahkan scan QR Kelas!`
        break
      case "Not A Classroom":
        alertTitle = "Ruang Kelas Tidak Terdeteksi!"
        alertIcon = "error"
        alertText = `${probability}% yakin gambar yang diinput bukan gambar ruang kelas`
        break
      case "Invalid file type":
        alertTitle = "Format file tidak diizinkan!"
        alertIcon = "error"
        alertText = "Format gambar yang diizinkan adalah jpg, jpeg, png"
        break
      case "No file part":
        alertTitle = "File Gambar Tidak Ada!"
        alertIcon = "error"
        alertText = "Mohon ambil gambar terlebih dahulu!"
        break
      default:
        alertTitle = "Error!"
        alertIcon = "error"
        alertText = message
        break
    }
    Swal.fire({
      icon: alertIcon,
      title: alertTitle,
      text: alertText,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        overlay.style.display = "none"
      }
    })
  }
}

let currentQRCode = null
let qrScannerRunning = false
let html5QrCode = null
function fetchCurrentQRCode() {
  fetch("/get_qr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: validatedToken }),
  })
    .then((response) => response.json())
    .then((data) => {
      currentQRCode = data.current_qr_code
      console.log("Fetched current QR code: ", currentQRCode)
    })
    .catch((error) => console.error("Error fetching current QR code:", error))
}
function startQRScanner() {
  if (qrScannerRunning) return

  html5QrCode = new Html5Qrcode("reader")

  html5QrCode
    .start(
      { facingMode: "environment" }, // Use rear camera
      {
        fps: 10,
        qrbox: 250,
      },
      onScanSuccess
    )
    .catch((err) => {
      console.log(`Unable to start scanning, error: ${err}`)
    })
  qrScannerRunning = true
}
function stopQRScanner() {
  // Stop the scanner
  html5QrCode
    .stop()
    .then(() => {
      console.log("QR Code scanning stopped.")
      qrScannerRunning = false
    })
    .catch((err) => {
      console.log(`Unable to stop scanning, error: ${err}`)
    })
}
function onScanSuccess(decodedText) {
  if (decodedText === currentQRCode) {
    QRAlert("QR code is valid!")
    isQRValidated = true
    reader.style.display = "none"
    cameraButton3.disabled = true
  } else {
    QRAlert("QR code expired!")
    startQRScanner()
  }
  checkFormValidity()
}
function QRAlert(message) {
  let alertTitle, alertIcon, alertText

  switch (message) {
    case "QR code expired!":
      alertTitle = "QR Code yang anda scan sudah expired/tidak valid!"
      alertIcon = "error"
      alertText = `Mohon scan kembali!`
      break
    case "QR code is valid!":
      alertTitle = "QR Code Valid!"
      alertIcon = "success"
      alertText = `silahkan submit untuk kehadiran anda!`
      break
    default:
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = message
      break
  }
  Swal.fire({
    icon: alertIcon,
    title: alertTitle,
    text: alertText,
    allowOutsideClick: false,
    didRender: () => {
      stopQRScanner()
    },
  }).then((result) => {
    if (result.isConfirmed) {
      overlay.style.display = "none"
    }
  })
}

function qrScanner() {
  reader.style.display = "block"

  // Call fetchCurrentQRCode every 15 seconds to ensure we have the latest QR code
  fetchCurrentQRCode()
  setInterval(fetchCurrentQRCode, 1000)
  startQRScanner()
}
cameraButton3.addEventListener("click", qrScanner)
validateTokenBtn.addEventListener("click", validateToken)
validateWajahBtn.addEventListener("click", validateWajah)
validateKelasBtn.addEventListener("click", validateKelas)
formLogin.addEventListener("submit", simpanData)

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
    validateWajahBtn.style.display = "block"
    const reader = new FileReader()
    reader.onload = function (e) {
      preview.src = e.target.result
      preview.style.display = "block"
    }
    reader.readAsDataURL(gambarWajah.files[0])
  }
})

cameraButton2.addEventListener("click", function () {
  gambarKelas.click()
})

ulangiCamera2.addEventListener("click", function () {
  gambarKelas.click()
})

gambarKelas.addEventListener("change", function () {
  if (gambarKelas.files && gambarKelas.files[0]) {
    cameraButton2.style.display = "none"
    ulangiCamera2.style.display = "block"
    validateKelasBtn.style.display = "block"
    const reader = new FileReader()
    reader.onload = function (e) {
      preview2.src = e.target.result
      preview2.style.display = "block"
    }
    reader.readAsDataURL(gambarKelas.files[0])
  }
})

async function simpanData(event) {
  event.preventDefault()

  console.log("Token:", validatedToken)
  console.log("Wajah:", validatedWajahFile)
  console.log("NIM:", validatedNIM)
  console.log("Kelas:", validatedKelasFile)
  console.log("qr:", isQRValidated)

  token = validatedToken
  wajah = validatedWajahFile
  kelas = validatedKelasFile
  nim = validatedNIM

  overlay.style.display = "flex"
  if (!token || !wajah || !kelas) {
    displayAlert("Token, wajah, dan kelas harus diisi.")
    return
  }
  const formData = new FormData(formLogin)
  formData.append("token", token)
  formData.append("gambarWajah", wajah)
  formData.append("gambarKelas", kelas)
  formData.append("nim", nim)

  const response = await fetch("/loginkelas", {
    method: "POST",
    body: formData,
  })

  const responseData = await response.json()
  try {
    if (response.ok && responseData.success) {
      displayAlert(responseData)
    } else {
      displayAlert(responseData.error_message || responseData)
    }
  } catch (error) {
    displayAlert("Terjadi kesalahan dalam mengirim permintaan")
    console.error("Error:", error)
  }
}

function displayAlert(responseData) {
  let message = responseData.message
  let nim = responseData.nim
  let token = responseData.token
  let name = responseData.name

  let alertTitle, alertIcon, alertText

  switch (message) {
    case "Missing required data":
      alertTitle = "Formulir Tidak Lengkap!"
      alertIcon = "error"
      alertText = "Mohon isi formulir dengan lengkap!"
      break
    case "Successful":
      alertTitle = "Login Berhasil"
      alertIcon = "success"
      alertText = `Selamat Datang ${name}(NIM: ${nim}) di kelas dengan token: ${token}!`
      break
    case "Invalid file type":
      alertTitle = "Format file tidak diizinkan!"
      alertIcon = "error"
      alertText = "Format gambar yang diizinkan adalah jpg, jpeg, png"
      break
    default:
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = message
      break
  }

  Swal.fire({
    icon: alertIcon,
    title: alertTitle,
    text: alertText,
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/table"
    }
  })
}
