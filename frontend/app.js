const socket = io('http://localhost:5000'); // Change if your backend is hosted elsewhere

// Encryption using AES-256-CBC
function encrypt(text, key) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const algo = { name: "AES-CBC", iv };
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const rawKey = hexToBytes(key);

  return window.crypto.subtle.importKey("raw", rawKey, algo, false, ["encrypt"])
    .then(cryptoKey => crypto.subtle.encrypt(algo, cryptoKey, data))
    .then(encrypted => ({
      iv: bufferToHex(iv),
      content: bufferToHex(new Uint8Array(encrypted))
    }));
}

function sendEncrypted() {
  const message = document.getElementById("plainText").value.trim();
  const key = document.getElementById("key").value.trim();

  if (!message || key.length !== 64) {
    alert("Please enter a message and valid 256-bit key (64 hex characters).");
    return;
  }

  encrypt(message, key).then(encryptedData => {
    socket.emit("send_encrypted", { message: encryptedData, key });
    document.getElementById("plainText").value = "";
  });
}

// Decryption handled by backend; frontend only displays
socket.on("receive_encrypted", ({ message }) => {
  const li = document.createElement("li");
  li.textContent = JSON.stringify(message);
  document.getElementById("messages").appendChild(li);
});

// Helpers
function bufferToHex(buffer) {
  return [...buffer].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
