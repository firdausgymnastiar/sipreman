const formGenerate = document.getElementById("formGenerate")
const overlay = document.getElementById("overlay")

function generateRandomNumber() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000)
  console.log("Angka acak: " + randomNumber)
  document.getElementById("randomNumberDisplay").value = randomNumber
}

async function sendToServer() {
  const formData = new FormData(formGenerate)
  overlay.style.display = "flex"

  try {
    const response = await fetch("/generatetoken", {
      method: "POST",
      body: formData,
    })
    const responseData = await response.json()

    if (response.ok && responseData.success) {
      displayAlert(responseData)
      overlay.style.display = "none"
    } else {
      displayAlert(responseData.error_message || responseData)
      overlay.style.display = "none"
    }
  } catch (error) {
    console.error("Error:", error)
    displayAlert("Terjadi kesalahan dalam mengirim permintaan")
    overlay.style.display = "none"
  }
}

formGenerate.addEventListener("submit", function (event) {
  event.preventDefault()
  sendToServer()
})

function displayAlert(responseData) {
  const { message, token } = responseData
  let alertTitle, alertIcon, alertText

  switch (message) {
    case "successfull":
      alertTitle = "Kelas Berhasil Dibuat!"
      alertIcon = "success"
      alertText = `Token kelas anda adalah: <strong id="token">${token}</strong> <button id="copy-btn" type="button" class="btn btn-success btn-sm">Copy</button>`
      alertConfirm = false
      break
    case "token is existing":
      alertTitle = "Token Sudah Ada!"
      alertIcon = "error"
      alertText = "Maaf token sudah ada, mohon generate ulang!"
      alertConfirm = true
      break
    case "form kosong":
      alertTitle = "Formulir tidak lengkap!"
      alertIcon = "error"
      alertText = "Mohon isi formulir dengan lengkap!"
      alertConfirm = true
      break
    default:
      alertTitle = "Error!"
      alertIcon = "error"
      alertText = message
      alertConfirm = true
      break
  }

  Swal.fire({
    icon: alertIcon,
    title: alertTitle,
    html: alertText,
    allowOutsideClick: false,
    showConfirmButton: alertConfirm,
    didRender: () => {
      const copyButton = document.getElementById("copy-btn")
      if (copyButton) {
        copyButton.addEventListener("click", () => copyTokenToClipboard(token))
      }
    },
  })
}

function copyTokenToClipboard(token) {
  const textarea = document.createElement("textarea")
  textarea.value = token
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)

  Swal.fire({
    icon: "success",
    title: "Copied!",
    text: "Token telah disalin ke clipboard. Silakan akttifkan presensi kelas!",
    allowOutsideClick: false,
    showConfirmButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/activate"
    }
  })
}
