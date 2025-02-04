function toggleKeyInput() {
    let functionType = document.getElementById("cryptoFunction").value;
    let keyInput = document.getElementById("encryptionKey");
    if (functionType === "AES-Encrypt" || functionType === "AES-Decrypt") {
        keyInput.disabled = false;
    } else {
        keyInput.disabled = true;
        keyInput.value = "";  
    }
}


async function processCryptoFunction() {
    let text = document.getElementById("inputText").value;
    let functionType = document.getElementById("cryptoFunction").value;
    let key = document.getElementById("encryptionKey").value;
    
    if (!text) {
        alert("Please enter text to process.");
        return;
    }
    
    if (functionType.startsWith("SHA")) {
        let encoder = new TextEncoder();
        let data = encoder.encode(text);
        let hashBuffer = await crypto.subtle.digest(functionType, data);
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        document.getElementById("output").innerText = "Hash: " + hashHex;
    } else if (functionType === "MD5") {
        document.getElementById("output").innerText = "MD5 is not supported in Web Crypto API. Use crypto-js library.";
    } else if (functionType === "AES-Encrypt") {
        if (!key) {
            alert("Please enter a key for encryption.");
            return;
        }
        let encrypted = await aesEncrypt(text, key);
        document.getElementById("output").innerText = "Encrypted: " + encrypted;
    } else if (functionType === "AES-Decrypt") {
        if (!key) {
            alert("Please enter a key for decryption.");
            return;
        }
        let decrypted = await aesDecrypt(text, key);
        document.getElementById("output").innerText = "Decrypted: " + decrypted;
    }
}

async function aesEncrypt(text, key) {
    let encoder = new TextEncoder();
    let keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(key.padEnd(16, ' ')), { name: "AES-CBC" }, false, ["encrypt"]);
    let iv = crypto.getRandomValues(new Uint8Array(16));
    let encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, keyMaterial, encoder.encode(text));
    return btoa(String.fromCharCode(...new Uint8Array(iv)) + String.fromCharCode(...new Uint8Array(encrypted)));
}

async function aesDecrypt(text, key) {
    try {
        let encoder = new TextEncoder();
        let keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(key.padEnd(16, ' ')), { name: "AES-CBC" }, false, ["decrypt"]);
        let rawData = atob(text);
        let iv = new Uint8Array([...rawData].slice(0, 16).map(c => c.charCodeAt(0)));
        let encryptedData = new Uint8Array([...rawData].slice(16).map(c => c.charCodeAt(0)));
        let decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, keyMaterial, encryptedData);
        return new TextDecoder().decode(decrypted);
    } catch {
        return "Decryption failed. Check your key.";
    }
}